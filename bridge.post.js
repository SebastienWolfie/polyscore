// server/api/bridge.post.js  (Nuxt 3 / Nitro, deployed on Vercel)
// All settings come from runtimeConfig (nuxt.config.js) - no process.env here.
import { defineEventHandler, readBody, handleCors, setResponseStatus } from 'h3'
import { createClient } from 'redis'
import {
  JsonRpcProvider, Wallet, Contract, Interface,
  parseEther, parseUnits, isAddress, isHexString, getAddress,
} from 'ethers'

const PRESETS = {
  mainnet: { ethId: 1, ethRpc: 'https://ethereum-rpc.publicnode.com', uniId: 130, uniRpc: 'https://mainnet.unichain.org' },
  testnet: { ethId: 11155111, ethRpc: 'https://ethereum-sepolia-rpc.publicnode.com', uniId: 1301, uniRpc: 'https://sepolia.unichain.org' },
}

// EkidenVault.sol emits Deposited(user, amount) only after pulling the USDC and crediting
// the depositor in the same transaction (deposit / depositWithPermit).
const VAULT_IFACE = new Interface([
  'event Deposited(address indexed user, uint256 amount)'
])
const TOKEN_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function mintTokens(uint256 tokens)',
  'function transfer(address to, uint256 amount) returns (bool)',
]

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const httpError = (status, message) => Object.assign(new Error(message), { status })

// ---- Redis (url is injected from config on first use) ----
let redisPromise
let redisUrl
const redis = () => {
  if (!redisPromise) {
    const client = createClient({ url: redisUrl })
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

async function acquire(key, leaseMs) {
  return (await (await redis()).set(key, '1', { NX: true, PX: leaseMs })) === 'OK'
}
const release = async (key) => { try { await (await redis()).del(key) } catch { } }

// Public RPCs sit behind load balancers, so 'pending' nonce can come from a lagging node.
// We keep our own next-nonce in Redis (short TTL so a dropped tx can't leave a permanent gap)
// and use whichever is higher: chain vs. our counter.
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
            // node said this nonce is used: skip past it and retry
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

// ---- Build everything the handlers need from runtimeConfig ----
function context(event) {
  const rc = useRuntimeConfig(event)
  const pub = rc.public
  const b = rc.bridge || {}

  const network = pub.bridgeNetwork === 'mainnet' ? 'mainnet' : 'testnet'
  const P = PRESETS[network]

  if (!isAddress(pub.vaultAddress || '') || !isAddress(pub.uniToken || '') || !rc.relayerPrivateKey) {
    throw httpError(500, 'Relayer is not configured')
  }
  if (!rc.redisUrl) throw httpError(500, 'Redis is not configured')
  redisUrl = rc.redisUrl

  const ethRead = new JsonRpcProvider(b.ethRpc || P.ethRpc, P.ethId, { staticNetwork: true })
  const uniRead = new JsonRpcProvider(b.uniRpc || P.uniRpc, P.uniId, { staticNetwork: true })
  const wallet = new Wallet(rc.relayerPrivateKey, uniRead)

  return {
    vault: pub.vaultAddress,
    minConf: Number(b.minConfirmations || (network === 'mainnet' ? 2 : 1)),
    budgetMs: Number(b.budgetMs || 8000),
    maxAmount: parseUnits(String(b.maxAmount || '10000'), 6),
    gasDrip: parseEther(String(b.gasDripEth || '0.00005')),
    gasMin: parseEther(String(b.gasMinEth || '0.00002')),
    gasCooldownMs: Number(b.gasCooldownMin || 60) * 60 * 1000,
    chainId: P.uniId,
    ethRead, uniRead, wallet,
    token: new Contract(pub.uniToken, TOKEN_ABI, wallet),
    allowedOrigins: String(rc.allowedOrigins || '').split(',').map((s) => s.trim()).filter(Boolean),
  }
}

// Verify the transaction receipt and parse the Deposited event
async function verifyDeposit(c, hash) {
  if (!isHexString(hash, 32)) throw httpError(400, 'Invalid transaction hash')
  const receipt = await c.ethRead.getTransactionReceipt(hash)
  if (!receipt) throw httpError(409, 'Deposit transaction not visible yet')
  if (receipt.status !== 1) throw httpError(400, 'The deposit transaction failed on Ethereum')
  if ((await receipt.confirmations()) < c.minConf) throw httpError(409, 'Waiting for Ethereum confirmations')

  let user = null
  let amount = null

  for (const log of receipt.logs) {
    try {
      const parsed = VAULT_IFACE.parseLog({ topics: log.topics, data: log.data })
      if (parsed && parsed.name === 'Deposited') {
        if (log.address.toLowerCase() === c.vault.toLowerCase()) {
          user = getAddress(parsed.args.user)
          amount = parsed.args.amount
          break
        }
      }
    } catch {
      // Skip non-matching logs
    }
  }

  if (!user || amount === null) {
    throw httpError(400, 'No valid Deposited event found in transaction receipt')
  }

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

async function deposit(c, claimTx) {
  if (typeof claimTx !== 'string') throw httpError(400, 'claimTx is required')
  const hash = claimTx.toLowerCase()
  const key = `deposit/${hash}`

  const existing = await getJSON(key)
  if (existing && existing.status === 'done') {
    return { status: 'done', mintTx: existing.mintTx, transferTx: existing.transferTx }
  }

  const { user, amount } = await verifyDeposit(c, hash)
  if (amount <= BigInt(0) || amount > c.maxAmount) throw httpError(400, 'Amount is outside the allowed range')

  const lockKey = `lock/${hash}`
  if (!(await acquire(lockKey, 25000))) throw httpError(409, 'This transfer is already being delivered')

  const deadline = Date.now() + c.budgetMs
  const rec = existing || { user, amount: amount.toString(), mintTx: null, transferTx: null, status: 'processing', createdAt: Date.now() }
  try {
    await sendOnce(c, key, rec, 'mintTx', deadline, (o) => c.token.mintTokens(amount, o))
    await sendOnce(c, key, rec, 'transferTx', deadline, (o) => c.token.transfer(user, amount, o))
    rec.status = 'done'
    rec.doneAt = Date.now()
    await putJSON(key, rec)
    return { status: 'done', mintTx: rec.mintTx, transferTx: rec.transferTx }
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
  if (!(await acquire(gasKey, c.gasCooldownMs))) {
    throw httpError(429, 'Gas was already sent to this wallet recently.')
  }
  try {
    const tx = await withSendLock(c, (o) => c.wallet.sendTransaction({ to: addr, value: c.gasDrip, ...o }))
    await tx.wait(1, c.budgetMs)
    return { status: 'sent', hash: tx.hash }
  } catch (e) {
    await release(gasKey)
    throw e
  }
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
    origin: c.allowedOrigins,
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
    if (body.action === 'deposit') return await deposit(c, body.claimTx)
    if (body.action === 'gas') return await sponsorGas(c, body.address)
    setResponseStatus(event, 400)
    return { error: 'Unknown action' }
  } catch (e) {
    const status = e.status || 500
    if (status === 500) console.error('bridge relay failed', e)
    setResponseStatus(event, status)
    return { error: status === 500 ? 'Delivery failed, please use "Finish transfer" to retry.' : e.message }
  }
})