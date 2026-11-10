// server/api/bridge.post.js  (Nuxt 3 / Nitro): the ONLY server file.
// Actions:
//   deposit : Ethereum -> Unichain. The user sent USDC straight to the vault (plain transfer).
//             Reads that transfer, mints + delivers USDC (UNI) and credits the receiving address.
//   gas     : sponsors a little Unichain gas for wallets that hold USDC (UNI)
//   approve : Unichain -> Ethereum. Verifies the Unichain lock, takes the amount off the
//             sender's credit, and signs the vault withdrawal
//   credit  : how much an address can still withdraw (its deposits minus its withdrawals)
// Both deposit and approve accept an optional `recipient` (a different receiving address).
// It is only honoured when the original sender signed it (see config/bridge.config.js).
// All settings come from runtimeConfig (nuxt.config.js).
import { defineEventHandler, readBody, handleCors, setResponseStatus } from 'h3'
import { createClient } from 'redis'
import {
  JsonRpcProvider, Wallet, Contract, Interface, ZeroAddress, verifyMessage,
  parseEther, parseUnits, formatUnits, isAddress, isHexString, getAddress,
} from 'ethers'
import { MIN_BRIDGE_USD, deliveryMessage, payoutMessage } from '../../../config/bridge.config.js'

const PRESETS = {
  mainnet: { ethId: 1, ethUsdc: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', ethRpc: 'https://ethereum-rpc.publicnode.com', uniId: 130, uniRpc: 'https://mainnet.unichain.org' },
  testnet: { ethId: 11155111, ethUsdc: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', ethRpc: 'https://ethereum-sepolia-rpc.publicnode.com', uniId: 1301, uniRpc: 'https://sepolia.unichain.org' },
}

const TOKEN_IFACE = new Interface(['event Transfer(address indexed from, address indexed to, uint256 value)'])
const TOKEN_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function mintTokens(uint256 tokens)',
  'function transfer(address to, uint256 amount) returns (bool)',
]
const VAULT_ABI = [
  'function refUsed(bytes32) view returns (bool)',
  'function paused() view returns (bool)',
]
const WITHDRAW_TYPES = {
  Withdraw: [
    { name: 'recipient', type: 'address' },
    { name: 'amount', type: 'uint256' },
    { name: 'ref', type: 'bytes32' },
    { name: 'deadline', type: 'uint256' },
  ],
}
const APPROVAL_WINDOW_S = 30 * 60

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const httpError = (status, message) => Object.assign(new Error(message), { status })

// ---- Redis (url comes from runtimeConfig; connection is reused) ----
let redisPromise
const redis = () => {
  if (!redisPromise) {
    const url = useRuntimeConfig().redisUrl
    if (!url) throw httpError(500, 'Redis is not configured')
    const client = createClient({ url })
    client.on('error', (e) => console.error('redis error', e))
    redisPromise = client.connect().then(() => client).catch((e) => { redisPromise = null; throw e })
  }
  return redisPromise
}
const getJSON = async (key) => {
  const v = await (await redis()).get(key)
  return v ? JSON.parse(v) : null
}
const putJSON = async (key, value) => (await redis()).set(key, JSON.stringify(value))
const acquire = async (key, leaseMs) => (await (await redis()).set(key, '1', { NX: true, PX: leaseMs })) === 'OK'
const release = async (key) => { try { await (await redis()).del(key) } catch { } }

// ---- Credit ledger (per address, in USDC base units) ----
// Credit follows the address that RECEIVED the USDC (UNI) on Unichain. An address can only
// withdraw what it was credited, so the vault can never be drained by someone who did not
// deposit. Both scripts run atomically inside Redis.
const creditKey = (addr) => `credit/${addr.toLowerCase()}`
const CREDIT_ONCE = `
if redis.call('SET', KEYS[1], '1', 'NX') then
  redis.call('INCRBY', KEYS[2], ARGV[1])
  return 1
end
return 0`
const DEBIT = `
local c = tonumber(redis.call('GET', KEYS[1]) or '0')
local a = tonumber(ARGV[1])
if c >= a then
  redis.call('DECRBY', KEYS[1], a)
  return 1
end
return 0`
// Adds credit once per deposit tx (the guard key makes a repeat do nothing).
const creditOnce = async (guardKey, addr, amount) =>
  (await (await redis()).eval(CREDIT_ONCE, { keys: [guardKey, creditKey(addr)], arguments: [amount.toString()] })) === 1
const debit = async (addr, amount) =>
  (await (await redis()).eval(DEBIT, { keys: [creditKey(addr)], arguments: [amount.toString()] })) === 1
const creditOf = async (addr) => BigInt((await (await redis()).get(creditKey(addr))) || '0')

// ---- Nonce handling: public RPCs sit behind load balancers, so 'pending' can lag ----
const NONCE_TTL_S = 120
const isNonceError = (e) =>
  e && (e.code === 'NONCE_EXPIRED' || e.code === 'REPLACEMENT_UNDERPRICED' || /nonce too low/i.test(e.message || ''))

async function withSendLock(c, fn) {
  const nonceKey = `nonce/${c.chainId}/${c.wallet.address.toLowerCase()}`
  for (let i = 0; i < 15; i++) {
    if (await acquire('lock/send', 20000)) {
      try {
        const r = await redis()
        for (let attempt = 0; attempt < 3; attempt++) {
          const chainNonce = await c.uniRead.getTransactionCount(c.wallet.address, 'pending')
          const stored = Number(await r.get(nonceKey)) || 0
          const nonce = Math.max(chainNonce, stored)
          try {
            const tx = await fn({ nonce })
            await r.set(nonceKey, String(nonce + 1), { EX: NONCE_TTL_S })
            return tx
          } catch (e) {
            if (!isNonceError(e)) throw e
            await r.set(nonceKey, String(nonce + 1), { EX: NONCE_TTL_S })
            await sleep(500)
          }
        }
        throw httpError(409, 'Nonce conflict, retrying')
      } finally { await release('lock/send') }
    }
    await sleep(400)
  }
  throw httpError(409, 'The relayer is busy, retrying')
}

// ---- Everything the handlers need, from runtimeConfig ----
function context(event) {
  const rc = useRuntimeConfig(event)
  const pub = rc.public
  const b = rc.bridge || {}
  const network = pub.bridgeNetwork === 'mainnet' ? 'mainnet' : 'testnet'
  const P = PRESETS[network]

  if (!isAddress(pub.vaultAddress || '') || !isAddress(pub.uniToken || '') || !rc.relayerPrivateKey || !rc.approverPrivateKey) {
    throw httpError(500, 'Relayer is not configured')
  }

  const ethRead = new JsonRpcProvider(b.ethRpc || P.ethRpc, P.ethId, { staticNetwork: true })
  const uniRead = new JsonRpcProvider(b.uniRpc || P.uniRpc, P.uniId, { staticNetwork: true })
  const wallet = new Wallet(rc.relayerPrivateKey, uniRead)

  return {
    vault: pub.vaultAddress,
    tokenAddr: pub.uniToken,
    ethUsdc: isAddress(pub.ethUsdc || '') ? pub.ethUsdc : P.ethUsdc,
    minConf: Number(b.minConfirmations || (network === 'mainnet' ? 2 : 1)),
    budgetMs: Number(b.budgetMs || 8000),
    minAmount: parseUnits(String(MIN_BRIDGE_USD), 6),
    maxAmount: parseUnits(String(b.maxAmount || '80000'), 6),
    gasDrip: parseEther(String(b.gasDripEth || '0.00005')),
    gasMin: parseEther(String(b.gasMinEth || '0.00002')),
    gasCooldownMs: Number(b.gasCooldownMin || 60) * 60 * 1000,
    chainId: P.uniId,
    ethRead, uniRead, wallet,
    token: new Contract(pub.uniToken, TOKEN_ABI, wallet),
    vaultRead: new Contract(pub.vaultAddress, VAULT_ABI, ethRead),
    approver: new Wallet(rc.approverPrivateKey), // only ever signs withdrawal approvals
    domain: { name: 'UniBridgeVault', version: '1', chainId: P.ethId, verifyingContract: pub.vaultAddress },
    allowedOrigins: String(rc.allowedOrigins || '').split(',').map((s) => s.trim()).filter(Boolean),
  }
}

// Who gets the funds. Default is the sender. A different address is accepted only if
// the sender signed it, so nobody who merely sees the transaction can redirect the money.
function resolveRecipient(c, sender, recipient, authSig, makeMessage) {
  if (recipient == null || recipient === '') return sender
  if (typeof recipient !== 'string' || !isAddress(recipient)) throw httpError(400, 'Invalid receiving address')
  const to = getAddress(recipient)
  if (to === sender) return sender
  const blocked = [ZeroAddress, c.tokenAddr, c.vault].map((a) => a.toLowerCase())
  if (blocked.includes(to.toLowerCase())) throw httpError(400, 'This address cannot receive funds')
  let signer = null
  try { signer = verifyMessage(makeMessage(to), String(authSig)) } catch { /* bad signature */ }
  if (signer !== sender) throw httpError(400, 'The receiving address was not authorised by the sender')
  return to
}

// ---------------- Ethereum -> Unichain ----------------
// A deposit is a plain USDC transfer to the vault. Read it from the receipt: the USDC
// contract's Transfer(from, vault, value) events. The sender is `from`, so only the sender
// can ever be credited, whoever presents the transaction hash.
async function verifyDeposit(c, hash) {
  if (!isHexString(hash, 32)) throw httpError(400, 'Invalid transaction hash')
  const receipt = await c.ethRead.getTransactionReceipt(hash)
  if (!receipt) throw httpError(409, 'Deposit transaction not visible yet')
  if (receipt.status !== 1) throw httpError(400, 'The deposit transaction failed on Ethereum')
  if ((await receipt.confirmations()) < c.minConf) throw httpError(409, 'Waiting for Ethereum confirmations')

  let user = null
  let amount = BigInt(0)
  for (const log of receipt.logs) {
    if (log.address.toLowerCase() !== c.ethUsdc.toLowerCase()) continue
    let parsed
    try { parsed = TOKEN_IFACE.parseLog({ topics: log.topics, data: log.data }) } catch { continue }
    if (!parsed || parsed.name !== 'Transfer') continue
    if (parsed.args.to.toLowerCase() !== c.vault.toLowerCase()) continue
    if (parsed.args.from.toLowerCase() === c.vault.toLowerCase()) continue
    const who = getAddress(parsed.args.from)
    if (user && user !== who) throw httpError(400, 'Transaction sends USDC to the vault from several wallets')
    user = who
    amount += parsed.args.value // sum every transfer in the tx so none is left uncredited
  }
  if (!user || amount === BigInt(0)) throw httpError(400, 'No USDC transfer to the vault found in this transaction')
  return { user, amount }
}

async function sendOnce(c, key, rec, field, deadline, send) {
  const remaining = () => Math.max(500, deadline - Date.now())
  const prior = rec[field]
  if (prior) {
    const r = await c.uniRead.getTransactionReceipt(prior)
    if (r && r.status === 1) return prior
    if (!r) {
      const pending = await c.uniRead.getTransaction(prior)
      if (pending) { await pending.wait(1, remaining()); return prior }
    }
  }
  const tx = await withSendLock(c, send)
  rec[field] = tx.hash
  await putJSON(key, rec)
  await tx.wait(1, remaining())
  return tx.hash
}

async function deposit(c, claimTx, recipient, authSig) {
  if (typeof claimTx !== 'string') throw httpError(400, 'claimTx is required')
  const hash = claimTx.toLowerCase()
  const key = `deposit/${hash}`

  const existing = await getJSON(key)
  if (existing && existing.status === 'done') {
    return { status: 'done', mintTx: existing.mintTx, transferTx: existing.transferTx, to: existing.to || existing.user }
  }

  const { user, amount } = await verifyDeposit(c, hash)
  // The $1 minimum is enforced by the site; here anything positive up to the max is delivered
  // so a small direct transfer is never left stuck.
  if (amount > c.maxAmount) throw httpError(400, 'Amount is above the maximum')
  if (await c.vaultRead.paused()) throw httpError(503, 'The bridge is paused')

  const lockKey = `lock/${hash}`
  if (!(await acquire(lockKey, 25000))) throw httpError(409, 'This transfer is already being delivered')

  // Once a delivery has started, its destination is fixed.
  const to = existing?.to || resolveRecipient(c, user, recipient, authSig, (r) => deliveryMessage(hash, r))
  const deadline = Date.now() + c.budgetMs
  const rec = existing || { user, to, amount: amount.toString(), mintTx: null, transferTx: null, status: 'processing', createdAt: Date.now() }
  rec.to = rec.to || to
  try {
    await sendOnce(c, key, rec, 'mintTx', deadline, (o) => c.token.mintTokens(amount, o))
    await sendOnce(c, key, rec, 'transferTx', deadline, (o) => c.token.transfer(rec.to, amount, o))
    // Credit exactly once per deposit tx: this is what the receiving address may withdraw later.
    await creditOnce(`credited/${hash}`, rec.to, amount)
    rec.status = 'done'
    rec.doneAt = Date.now()
    await putJSON(key, rec)
    return { status: 'done', mintTx: rec.mintTx, transferTx: rec.transferTx, to: rec.to }
  } catch (e) {
    if (e && e.code === 'TIMEOUT') return { status: 'pending' }
    throw e
  } finally {
    await release(lockKey)
  }
}

async function sponsorGas(c, address) {
  if (typeof address !== 'string' || !isAddress(address)) throw httpError(400, 'Invalid address')
  const addr = getAddress(address)
  const [bal, tokenBal] = await Promise.all([c.uniRead.getBalance(addr), c.token.balanceOf(addr)])
  if (bal >= c.gasMin) return { status: 'sufficient' }
  if (tokenBal === BigInt(0)) throw httpError(403, 'Gas is only sponsored for wallets that hold USDC on Unichain')

  const gasKey = `gas/${addr.toLowerCase()}`
  if (!(await acquire(gasKey, c.gasCooldownMs))) throw httpError(429, 'Gas was already sent to this wallet recently.')
  try {
    const tx = await withSendLock(c, (o) => c.wallet.sendTransaction({ to: addr, value: c.gasDrip, ...o }))
    await tx.wait(1, c.budgetMs)
    return { status: 'sent', hash: tx.hash }
  } catch (e) {
    await release(gasKey)
    throw e
  }
}

// ---------------- Unichain -> Ethereum ----------------
// The user's lock = Unichain token sent to the token contract itself.
async function verifyLock(c, hash) {
  if (!isHexString(hash, 32)) throw httpError(400, 'Invalid transaction hash')
  const receipt = await c.uniRead.getTransactionReceipt(hash)
  if (!receipt) throw httpError(409, 'Lock transaction not visible yet')
  if (receipt.status !== 1) throw httpError(400, 'The Unichain transaction failed')
  if ((await receipt.confirmations()) < 1) throw httpError(409, 'Waiting for Unichain confirmations')

  let user = null
  let amount = BigInt(0)
  for (const log of receipt.logs) {
    if (log.address.toLowerCase() !== c.tokenAddr.toLowerCase()) continue
    let parsed
    try { parsed = TOKEN_IFACE.parseLog({ topics: log.topics, data: log.data }) } catch { continue }
    if (!parsed || parsed.name !== 'Transfer') continue
    if (parsed.args.to.toLowerCase() !== c.tokenAddr.toLowerCase()) continue
    const from = getAddress(parsed.args.from)
    if (user && user !== from) throw httpError(400, 'Transaction locks tokens from several wallets')
    user = from
    amount += parsed.args.value
  }
  if (!user || amount === BigInt(0)) throw httpError(400, 'No lock transfer found in this transaction')
  return { user, amount }
}

// How much this address can still withdraw (USDC base units, as a string).
async function creditAction(address) {
  if (typeof address !== 'string' || !isAddress(address)) throw httpError(400, 'Invalid address')
  return { available: (await creditOf(getAddress(address))).toString() }
}

// Signs the approval that UniBridgeVault.withdraw() checks.
async function approveWithdrawal(c, lockTx, recipient, authSig) {
  if (typeof lockTx !== 'string') throw httpError(400, 'lockTx is required')
  const hash = lockTx.toLowerCase()
  const { user, amount } = await verifyLock(c, hash)
  if (amount < c.minAmount || amount > c.maxAmount) throw httpError(400, 'Amount is outside the allowed range')

  const ref = hash // bytes32: the Unichain lock tx hash, unique per lock
  if (await c.vaultRead.refUsed(ref)) return { status: 'claimed' }

  const to = resolveRecipient(c, user, recipient, authSig, (r) => payoutMessage(hash, r))

  // Only what this address deposited can be withdrawn. The first approval of a lock takes the
  // amount off its credit; asking again for the same lock (retry) does not charge twice.
  const approvedKey = `approved/${hash}`
  const prior = await getJSON(approvedKey)
  if (prior && prior.status === 'pending') throw httpError(409, 'Approval is being prepared, retrying')
  if (!prior) {
    if (!(await (await redis()).set(approvedKey, JSON.stringify({ status: 'pending' }), { NX: true, EX: 60 }))) {
      throw httpError(409, 'Approval is being prepared, retrying')
    }
    if (!(await debit(user, amount))) {
      await release(approvedKey)
      const left = await creditOf(user)
      throw httpError(403, `This wallet can only withdraw what it deposited. Available: ${formatUnits(left, 6)} USDC.`)
    }
    await putJSON(approvedKey, { status: 'ok', user, amount: amount.toString(), at: Date.now() })
  }

  const deadline = Math.floor(Date.now() / 1000) + APPROVAL_WINDOW_S
  const signature = await c.approver.signTypedData(c.domain, WITHDRAW_TYPES, { recipient: to, amount, ref, deadline })
  return { status: 'approved', recipient: to, amount: amount.toString(), ref, deadline, signature }
}

export default defineEventHandler(async (event) => {
  let c
  try {
    c = context(event)
  } catch (e) {
    setResponseStatus(event, e.status || 500)
    return { error: e.message }
  }

  if (handleCors(event, {
    origin: c.allowedOrigins.length ? c.allowedOrigins : '*',
    methods: ['POST', 'OPTIONS'],
    allowHeaders: ['Content-Type'],
    preflight: { statusCode: 204 },
  })) return null

  if (event.method !== 'POST') {
    setResponseStatus(event, 405)
    return { error: 'POST only' }
  }

  try {
    const body = (await readBody(event)) || {}
    if (body.action === 'deposit') return await deposit(c, body.claimTx, body.recipient, body.authSig)
    if (body.action === 'gas') return await sponsorGas(c, body.address)
    if (body.action === 'credit') return await creditAction(body.address)
    if (body.action === 'approve') return await approveWithdrawal(c, body.lockTx, body.recipient, body.authSig)
    setResponseStatus(event, 400)
    return { error: 'Unknown action' }
  } catch (e) {
    const status = e.status || 500
    if (status === 500) console.error('bridge relay failed', e)
    setResponseStatus(event, status)
    return { error: status === 500 ? 'Something went wrong, please use "Finish transfer" to retry.' : e.message }
  }
})