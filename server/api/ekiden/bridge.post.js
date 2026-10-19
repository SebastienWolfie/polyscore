// server/api/bridge.js  (Nuxt 3 / Nitro, deployed on Vercel)
//
// Ekiden bridge relayer.
//   POST { action: 'deposit', claimTx }  -> verifies the user's vault.claim on Ethereum, then delivers
//                                           USDC (UNI) on Unichain and pays the Unichain gas.
//   POST { action: 'gas', address }      -> tiny Unichain gas top-up for a wallet that holds USDC (UNI),
//                                           so it can send tokens back when withdrawing.
//
// Serverless means no memory between calls and several instances at once, so:
//   - state (delivered claims, locks) lives in Redis
//   - every call stays short; if Unichain is slow it answers "pending" and the client simply calls again
//   - sends from the relayer wallet are serialized with a lease lock so nonces never collide
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
const VAULT_IFACE = new Interface(['function claim(uint256 amount)'])
const TOKEN_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function mintTokens(uint256 tokens)',
  'function transfer(address to, uint256 amount) returns (bool)',
]

const env = process.env
const BUDGET_MS = 8000 // Vercel's default function timeout is short; stop waiting before that and answer "pending"
const MAX_AMOUNT = parseUnits(env.BRIDGE_MAX_AMOUNT || '10000', 6)
const GAS_DRIP = parseEther(env.BRIDGE_GAS_DRIP_ETH || '0.00005')
const GAS_MIN = parseEther(env.BRIDGE_GAS_MIN_ETH || '0.00002')
const GAS_COOLDOWN_MS = Number(env.BRIDGE_GAS_COOLDOWN_MIN || 60) * 60 * 1000

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const httpError = (status, message) => Object.assign(new Error(message), { status })

// ---- Redis helpers (node-redis, database created from the Vercel Marketplace, connection string in REDIS_URL) ----
let redisPromise
const redis = () => {
  if (!redisPromise) {
    const client = createClient({ url: env.REDIS_URL || env.KV_URL })
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

// Lease lock: true if we now hold `key` for leaseMs. SET NX PX is atomic, and the lock expires by itself.
async function acquire(key, leaseMs) {
  return (await (await redis()).set(key, '1', { NX: true, PX: leaseMs })) === 'OK'
}
const release = async (key) => { try { await (await redis()).del(key) } catch { /* lock expires on its own */ } }

async function withSendLock(fn) {
  for (let i = 0; i < 15; i++) {
    if (await acquire('lock/send', 20000)) {
      try { return await fn() } finally { await release('lock/send') }
    }
    await sleep(400)
  }
  throw httpError(409, 'The relayer is busy, retrying')
}

// ---- chain context ----
function context(event) {
  const rc = useRuntimeConfig(event)
  const pub = rc.public
  const network = pub.bridgeNetwork === 'mainnet' ? 'mainnet' : 'testnet'
  const P = PRESETS[network]
  if (!isAddress(pub.vaultAddress || '') || !isAddress(pub.uniToken || '') || !rc.relayerPrivateKey) {
    throw httpError(500, 'Relayer is not configured')
  }
  const ethRead = new JsonRpcProvider(env.BRIDGE_ETH_RPC || P.ethRpc, P.ethId, { staticNetwork: true })
  const uniRead = new JsonRpcProvider(env.BRIDGE_UNI_RPC || P.uniRpc, P.uniId, { staticNetwork: true })
  const wallet = new Wallet(rc.relayerPrivateKey, uniRead)
  return {
    vault: pub.vaultAddress,
    minConf: Number(env.BRIDGE_MIN_CONFIRMATIONS || (network === 'mainnet' ? 2 : 1)),
    ethRead, uniRead, wallet,
    token: new Contract(pub.uniToken, TOKEN_ABI, wallet),
    allowedOrigins: String(rc.allowedOrigins || '').split(',').map((s) => s.trim()).filter(Boolean),
  }
}

// ---- verify the claim on Ethereum (one quick look; the client retries on 409) ----
async function verifyClaim(c, hash) {
  if (!isHexString(hash, 32)) throw httpError(400, 'Invalid transaction hash')
  const receipt = await c.ethRead.getTransactionReceipt(hash)
  if (!receipt) throw httpError(409, 'Claim transaction not visible yet')
  if (receipt.status !== 1) throw httpError(400, 'The claim transaction failed on Ethereum')
  if ((await receipt.confirmations()) < c.minConf) throw httpError(409, 'Waiting for Ethereum confirmations')

  const tx = await c.ethRead.getTransaction(hash)
  if (!tx || (tx.to || '').toLowerCase() !== c.vault.toLowerCase()) throw httpError(400, 'Not a transaction to the Ekiden vault')
  let parsed = null
  try { parsed = VAULT_IFACE.parseTransaction({ data: tx.data }) } catch { /* not a claim */ }
  if (!parsed || parsed.name !== 'claim') throw httpError(400, 'Not a vault claim transaction')
  return { user: getAddress(tx.from), amount: parsed.args[0] }
}

// Sends at most once per field. If an earlier attempt already recorded a tx hash, reuse or await it
// instead of sending again, so a retry can never double-pay.
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
    // reverted or dropped: safe to send again
  }
  const tx = await withSendLock(send)
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

  const { user, amount } = await verifyClaim(c, hash)
  if (amount <= BigInt(0) || amount > MAX_AMOUNT) throw httpError(400, 'Amount is outside the allowed range')

  const lockKey = `lock/${hash}`
  if (!(await acquire(lockKey, 25000))) throw httpError(409, 'This transfer is already being delivered')

  const deadline = Date.now() + BUDGET_MS
  const rec = existing || { user, amount: amount.toString(), mintTx: null, transferTx: null, status: 'processing', createdAt: Date.now() }
  try {
    // The deployed token only mints to msg.sender, so mint to the relayer and forward to the user.
    await sendOnce(c, key, rec, 'mintTx', deadline, () => c.token.mintTokens(amount))
    await sendOnce(c, key, rec, 'transferTx', deadline, () => c.token.transfer(user, amount))
    rec.status = 'done'
    rec.doneAt = Date.now()
    await putJSON(key, rec)
    return { status: 'done', mintTx: rec.mintTx, transferTx: rec.transferTx }
  } catch (e) {
    if (e && e.code === 'TIMEOUT') return { status: 'pending' } // tx hashes are saved, the next call resumes
    throw e
  } finally {
    await release(lockKey)
  }
}

async function sponsorGas(c, address) {
  if (typeof address !== 'string' || !isAddress(address)) throw httpError(400, 'Invalid address')
  const addr = getAddress(address)
  const [bal, tokenBal] = await Promise.all([c.uniRead.getBalance(addr), c.token.balanceOf(addr)])
  if (bal >= GAS_MIN) return { status: 'sufficient' }
  if (tokenBal === BigInt(0)) throw httpError(403, 'Gas is only sponsored for wallets that hold USDC on Unichain')

  const gasKey = `gas/${addr.toLowerCase()}`
  if (!(await acquire(gasKey, GAS_COOLDOWN_MS))) {
    throw httpError(429, 'Gas was already sent to this wallet recently. Wait a moment for it to arrive.')
  }
  try {
    const tx = await withSendLock(() => c.wallet.sendTransaction({ to: addr, value: GAS_DRIP }))
    await tx.wait(1, BUDGET_MS)
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

  // The bridge page (e.g. https://ekiden.web.app) calls this from another origin.
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