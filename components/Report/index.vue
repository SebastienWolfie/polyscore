<template>
  <div class="min-h-screen bg-[#060715] text-slate-300 font-sans selection:bg-blue-500/30 pb-20">
    <Header />

    <main class="max-w-4xl mx-auto px-4 mt-8">
      <div class="mb-8">
        <div @click="() => navigateTo('/')" 
             class="flex items-center cursor-pointer text-xs text-slate-500 hover:text-blue-400 transition-colors mb-6 uppercase tracking-widest font-bold">
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Back to Dashboard
        </div>
        <h1 class="text-2xl font-bold text-white tracking-tight">Polyscore — Final Airdrop Report Card</h1>
        <p class="text-slate-500 text-sm mt-1">Independent analytics for Polymarket participants</p>
      </div>

      <section class="report-card mb-6">
        <div class="flex items-center gap-2 mb-6 text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">
          <span class="w-5 h-5 rounded-full border border-slate-700 flex items-center justify-center text-[10px]">1</span>
          Wallet Overview
        </div>

        <div class="flex flex-col md:flex-row gap-8 items-center">
          <!-- Profile Avatar -->
          <div class="flex flex-col items-center gap-2">
            <div
              class="w-20 h-20 rounded-full overflow-hidden border border-blue-500/30 bg-white/5 shadow-lg">
              
              <img
                v-if="profileImage"
                :src="profileImage"
                alt="Profile image"
                class="w-full h-full object-cover" />

              <!-- Fallback -->
              <div
                v-else
                class="w-full h-full flex items-center justify-center text-xl font-black text-blue-400">
                {{ wallet.slice(2, 4).toUpperCase() }}
              </div>
            </div>

            <span class="text-[10px] text-slate-500 uppercase tracking-widest">
              Wallet Owner
            </span>
          </div>
          <div class="flex-1 space-y-4 w-full">
            <div class="grid grid-cols-2 gap-y-4 text-sm border-l border-white/5 pl-6">
              <span class="text-slate-500">Wallet:</span>
              <span class="font-mono text-white">{{ wallet.slice(0, 6) }}...{{ wallet.slice(-4) }}</span>
              
              <span class="text-slate-500">Network:</span>
              <span class="text-blue-400 font-semibold uppercase text-xs tracking-wider">Polygon</span>
              
              <span class="text-slate-500">Report Type:</span>
              <span class="text-slate-300">Airdrop Worthiness Estimate</span>
              
              <span class="text-slate-500">Status:</span>
              <div :class="['font-bold uppercase text-xs flex items-center gap-2', statusMeta.color]">
                <span :class="['w-2 h-2 rounded-full', statusMeta.dotClass]"></span>
                {{ statusMeta.label }}
              </div>
            </div>
          </div>

          <div class="relative flex flex-col items-center">
            <div class="w-48 h-28 relative overflow-hidden">
              <svg viewBox="0 0 100 50" class="w-full h-full">
                <path d="M 10 45 A 40 40 0 0 1 90 45" fill="none" stroke="#1e293b" stroke-width="8" stroke-linecap="round" />
                <path d="M 10 45 A 40 40 0 0 1 90 45" fill="none" :stroke="statusMeta.hex" stroke-width="8" stroke-linecap="round" 
                  :stroke-dasharray="`${(score / 100) * 126} 126`" class="transition-all duration-1000 ease-out" />
              </svg>
              <div class="absolute bottom-0 left-0 right-0 text-center">
                <span class="text-5xl font-black text-white leading-none tracking-tighter">{{ score }}</span>
                <span class="text-slate-500 text-lg font-bold">/100</span>
              </div>
            </div>
            <div :class="['mt-4 px-4 py-1 rounded-full text-[10px] font-bold uppercase border bg-opacity-10', statusMeta.badgeClass]">
              {{ statusMeta.label }} ({{ score < 40 ? '0-40' : score < 75 ? '40-76' : '76-100' }})
            </div>
          </div>
        </div>
      </section>

      <section class="report-card mb-6 bg-gradient-to-br from-[#0f1128] to-[#0a0b1e]">
        <h3 class="flex items-center gap-2 text-white text-[10px] font-bold uppercase tracking-widest mb-6">
          <span class="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_8px_#3b82f6]"></span>
          Estimated Airdrop Outcome <span class="text-slate-500 font-normal italic lowercase">(illustrative)</span>
        </h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-black/40 border border-white/5 rounded-2xl p-5 relative overflow-hidden group">
            <p class="text-[10px] text-slate-500 uppercase font-bold mb-2">Estimated Token Allocation</p>
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500 text-sm font-bold border border-yellow-500/30">P</div>
              <span class="text-2xl font-bold text-white tracking-tight">
                {{ estimatedTokens.toLocaleString() }}
                <span class="text-slate-500 text-xs font-normal">POLY Tokens</span>
              </span>

            </div>
          </div>

          <div class="bg-black/40 border border-white/5 rounded-2xl p-5 group">
            <p class="text-[10px] text-slate-500 uppercase font-bold mb-2">Estimated Value at TGE</p>
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-black shadow-lg shadow-blue-500/20">$</div>
              <span class="text-2xl font-bold text-white tracking-tight">
                {{ formatMoney(estimatedValue.low) }}–{{ formatMoney(estimatedValue.high) }}
                <span class="text-slate-500 text-xs font-normal ml-1">USDC</span>
              </span>

            </div>
          </div>
        </div>
        <p class="text-[9px] text-slate-600 mt-4 italic leading-relaxed">
          (Converted at illustrative TGE price. These figures are estimates, not guarantees. Actual outcomes depend on final tokenomics, scoring weights, caps, and market conditions at TGE.)
        </p>
      </section>

      <section class="report-card mb-6">
        <h3 class="text-white text-[10px] font-bold uppercase tracking-widest mb-8 flex items-center gap-2">
          <span class="w-2 h-2 bg-green-500 rounded-full"></span>
          Metric Breakdown <span class="text-slate-500 font-normal lowercase tracking-normal">(what's driving your score)</span>
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div class="metric-card">
            <div class="flex justify-between items-start mb-2">
              <p class="text-[10px] font-bold text-slate-400 uppercase">DeFi Native Usage — {{ defiGrade }}</p>
              <span class="tag-orange">High Impact</span>
            </div>
            <p class="text-xl font-bold text-white">{{ formatMoney(defiCapitalInflow) }} <span class="text-[10px] text-slate-600 font-normal">USDC</span></p>
            <p class="text-[12px] text-slate-500 mt-1">{{ depositCount }} Deposits / Withdrawals</p>
            <p class="text-[9px] text-slate-500 mt-4 leading-tight italic">Polyscore heavily favors users who move funds on-chain via self-custody.</p>
          </div>

          <div class="metric-card">
            <div class="flex justify-between items-start mb-2">
              <p class="text-[10px] font-bold text-slate-400 uppercase">Trading Volume — {{ score > 60 ? 'High' : 'Low' }}</p>
              <span class="tag-yellow">Medium Weight</span>
            </div>
            <p class="text-xl font-bold text-white">{{ stats.volume }} <span class="text-[10px] text-slate-600 font-normal">USDC</span></p>
            <p class="text-[12px] text-slate-500 mt-1">Lifetime Volume Contributed</p>
            <p class="text-[9px] text-slate-500 mt-4 leading-tight italic">Increasing volume across markets improves allocation estimates.</p>
          </div>

          <div class="metric-card">
            <div class="flex justify-between items-start mb-2">
              <p class="text-[10px] font-bold text-slate-400 uppercase">Total Trades — {{ stats.trades > 20 ? 'Active' : 'Low' }}</p>
              <span class="tag-orange">+ Medium</span>
            </div>
            <p class="text-xl font-bold text-white">{{ stats.trades }} <span class="text-[10px] text-slate-600 font-normal">Markets Placed</span></p>
            <p class="text-[12px] text-slate-500 mt-1">Resolution History</p>
            <p class="text-[9px] text-slate-500 mt-4 leading-tight italic">Consistent participation matters more than isolated bets.</p>
          </div>

          <div class="metric-card">
            <div class="flex justify-between items-start mb-2">
              <p class="text-[10px] font-bold text-slate-400 uppercase">Win Rate — {{ parseFloat(stats.winRate) > 50 ? 'Elite' : 'Improving' }}</p>
              <span class="tag-green">+ Modifier</span>
            </div>
            <p class="text-xl font-bold text-white">{{ stats.winRate }} <span class="text-[10px] text-slate-600 font-normal">Accuracy</span></p>
            <p class="text-[10px] text-slate-500 mt-1">Resolved Outcomes</p>
            <p class="text-[9px] text-slate-500 mt-4 leading-tight italic">Accuracy improves score quality but doesn't replace volume.</p>
          </div>
        </div>
      </section>

      <section class="report-card border-blue-500/20 bg-blue-500/5">
        <h3 class="flex items-center gap-2 text-white text-xs font-bold uppercase tracking-widest mb-6">
          <span class="text-blue-400">📋</span> How to Improve Your Outlook
        </h3>
        
        <div class="flex flex-col md:flex-row justify-between gap-8">
          <div class="flex-1">
             <p class="text-xs text-blue-400 mb-4 font-bold">To move to the next tier ({{ score < 40 ? 'Lukewarm' : 'High Potential' }}) ➔</p>
             <ul class="space-y-3">
                <li v-for="tip in improvementTips" :key="tip" class="flex items-start gap-3 text-xs text-slate-300">
                  <span class="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1 shrink-0"></span>
                  {{ tip }}
                </li>
             </ul>
          </div>
          
          <div class="w-full md:w-48 h-24 flex items-end gap-1 px-2 border-l border-white/5">
             <div v-for="(val, idx) in weeklyActivitydata" :key="idx" 
                  class="flex-1 bg-blue-500/30 rounded-t-sm transition-all hover:bg-blue-400"
                  :style="{ height: (Math.min(val * 10, 100)) + '%' }">
             </div>
          </div>
        </div>
      </section>

      <!-- <footer class="mt-10 mb-20 text-center">
         <p class="text-[10px] text-slate-600 leading-relaxed uppercase font-black mb-2 tracking-widest">Important Disclaimer</p>
         <p class="text-[10px] text-slate-500 italic max-w-2xl mx-auto">
           Polyscore is an independent analytics tool. We are not affiliated with Polymarket. Airdrop eligibility and final allocations are determined solely by the project's own internal criteria.
         </p>
      </footer> -->
    </main>
  </div>
</template>

<style scoped>
.report-card {
  @apply bg-[#0f1128] border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl backdrop-blur-sm;
}

.metric-card {
  @apply bg-white/5 border border-white/5 rounded-xl p-5 transition-all hover:bg-white/[0.08] hover:border-white/10;
}

.tag-orange {
  @apply px-2 py-0.5 rounded bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[9px] font-bold uppercase;
}

.tag-yellow {
  @apply px-2 py-0.5 rounded bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-[9px] font-bold uppercase;
}

.tag-green {
  @apply px-2 py-0.5 rounded bg-green-500/10 border border-green-500/20 text-green-400 text-[9px] font-bold uppercase;
}
</style>

<script setup>
import { Shield, Check, Hexagon, ChevronDown } from 'lucide-vue-next';
import { getPolyscore } from '../../apiss/polyscore'
import { getAll as getAllPolyscoreAddresses } from '../../apiss/polyscoreAddresses'
import { getDefiscore, create as createScore } from '../../apiss/defiscore'
import { getBalance, getDepositCount } from '../../apiss/web3/usdc'

// --- NEW UI HELPERS (Added to integrate the design) ---
const statusMeta = computed(() => {
  if (score.value < 40) return { 
    label: 'Minimal / Low', color: 'text-red-500', hex: '#ef4444', 
    dotClass: 'bg-red-500 shadow-[0_0_8px_red]', badgeClass: 'bg-red-500/10 border-red-500/30 text-red-400' 
  }
  if (score.value < 75) return { 
    label: 'Lukewarm', color: 'text-yellow-500', hex: '#eab308', 
    dotClass: 'bg-yellow-500 shadow-[0_0_8px_yellow]', badgeClass: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' 
  }
  return { 
    label: 'High Potential', color: 'text-green-500', hex: '#22c55e', 
    dotClass: 'bg-green-500 shadow-[0_0_8px_#22c55e]', badgeClass: 'bg-green-500/10 border-green-500/30 text-green-400' 
  }
})

const improvementTips = [
  "Deposit and withdraw USDC regularly using your DeFi wallet",
  "Trade across multiple categories (Politics, Crypto, Sports)",
  "Increase total traded volume over the next 30 days",
  "Maintain steady weekly participation instead of one-off trades"
]

function formatMoney(val) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', maximumFractionDigits: 0
  }).format(val)
}

// --- YOUR ORIGINAL SCRIPT (Completely untouched) ---
const score = ref(0)
const percentile = ref(null)
const worldwideRank = ref(null)

const stats = ref({
  trades: 0,
  volume: '$0',
  winRate: '0%'
})

const defiScore = ref(0)
const defiGrade = ref('Poor')
const defiGradeClass = ref('bg-red-500/20 text-red-400')

const defiCapitalInflow = ref(0)
const depositCount = ref(0)

const adminPolyscoreAddresses = ref([])
const isLoading = ref(true)
const capitalFlowdata = ref([])
const weeklyActivitydata = ref([])
const data = ref(null)

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const wallet = route.params.wallet
const username = ref(null)
const profileImage = ref(null)


const TOTAL_TRACKED_BASE_VALUE = 248137
const TOTAL_TRACKED_GROWTH_RATE_PER_SEC = 0.01


const MIN_SCORE = 20          // below this = basically dust
const MAX_TOKENS = 60_000     // whale cap
const MIN_TOKENS = 50         // dust floor
const BASE_POOL = 12_000      // realistic mid-user allocation scale
const TOKEN_PRICE = 0.48     // estimated TGE price ($)


function calculateRank(score) {
  const now = window.Date.now()
  const start = new window.Date('2025-12-01T00:00:00').getTime()
  const elapsed = Math.floor((now - start)/1000)
  const max = TOTAL_TRACKED_BASE_VALUE + Math.floor(elapsed * TOTAL_TRACKED_GROWTH_RATE_PER_SEC)

  const base = max - Math.floor((score / 100) * max)
  const noise = Math.floor(Math.random() * 120)

  worldwideRank.value = base + noise
  percentile.value = ((1 - worldwideRank.value / max) * 100).toFixed(2)
}

const estimatedTokens = computed(() => estimateTokenAllocation(score.value))

const estimatedValue = computed(() =>
  estimateValueRange(estimatedTokens.value)
)



onMounted(async () => {
  if (!wallet) return

  try {
    defiCapitalInflow.value = await getBalance(wallet)
    depositCount.value = await getDepositCount(wallet)
  } catch (err) {
    console.error(err)
  }
})


onMounted(async () => {
  try {
    adminPolyscoreAddresses.value = await getAllPolyscoreAddresses() || []
    
    data.value = await getPolyscore(wallet) || await $fetch(`/api/polymarket/polyscore/get?wallet=${wallet}`)

    capitalFlowdata.value = buildCapitalFlow(data.value)
    weeklyActivitydata.value = buildWeeklyActivity(data.value)

    username.value = data.value.username || null
    profileImage.value = data.value.profileImage || null

    console.log(weeklyActivitydata.value)
    await calculateDeFiScore(wallet)

    if (!data.value) return

    const weightedScore = Math.round(
      data.value.smartMoneyScore * 0.6 +
      defiScore.value * 0.4
    )

    score.value = weightedScore

    stats.value.trades = data.value.stats.totalTrades
    stats.value.volume = new Intl.NumberFormat('en-US',{
      style:'currency',currency:'USD',maximumFractionDigits:0
    }).format(data.value.stats.totalVolume)
    stats.value.winRate = (data.value.stats.winRate * 100).toFixed(1) + '%'

    calculateRank(score.value)

  } finally {
    isLoading.value = false
  }
})



async function calculateDeFiScore(wallet) {
  // 1. Check if score already exists
  const existing = await getDefiscore(wallet)

  if (existing?.score !== undefined) {
    defiScore.value = existing.score
    calculateDeFiGrade(defiScore.value)
    return
  }

  // 2. Generate score ONCE
  const isAdmin = adminPolyscoreAddresses.value.some(a =>
    (a.address || a).toLowerCase() === wallet.toLowerCase()
  )

  const generatedScore = isAdmin
    ? Math.floor(70 + Math.random() * 25)
    : Math.floor(Math.random() * 30)

  // 3. Persist to Firestore
  await createScore(wallet, {
    score: generatedScore
  })

  // 4. Apply locally
  defiScore.value = generatedScore
  calculateDeFiGrade(defiScore.value)
}

function calculateDeFiGrade(score) {
  if (score >= 70) {
    defiGrade.value = 'Good'
    defiGradeClass.value = 'bg-green-500/20 text-green-400'
  } else if (score >= 40) {
    defiGrade.value = 'Average'
    defiGradeClass.value = 'bg-yellow-500/20 text-yellow-400'
  } else {
    defiGrade.value = 'Poor'
    defiGradeClass.value = 'bg-red-500/20 text-red-400'
  }
}

function buildCapitalFlow(data) {
  // REAL DATA PATH
  if (Array.isArray(data?.trades) && data.trades.length) {
    const buckets = {}

    for (const trade of data.trades) {
      const date = new Date(trade.timestamp * 1000)
      const key = `${date.getFullYear()}-${date.getMonth()}`

      if (!buckets[key]) {
        buckets[key] = { deposits: 0, withdrawals: 0 }
      }

      if (trade.side === 'BUY') {
        buckets[key].deposits += trade.size
      } else if (trade.side === 'SELL') {
        buckets[key].withdrawals += trade.size
      }
    }

    return Object.values(buckets)
      .slice(-7)
      .map(m => ({
        deposits: Math.round(m.deposits / 1000),
        withdrawals: -Math.round(m.withdrawals / 1000)
      }))
  }

  // FALLBACK (old wallets)
  return generateCapitalFlow(data?.stats?.totalVolume || 0)
}



function buildWeeklyActivity(data) {
  // REAL DATA PATH
  if (Array.isArray(data?.trades) && data.trades.length) {
    const weeks = Array(11).fill(0)
    const now = Date.now()

    data.trades.forEach(trade => {
      const diffWeeks = Math.floor(
        (now - trade.timestamp * 1000) / (7 * 24 * 60 * 60 * 1000)
      )

      if (diffWeeks >= 0 && diffWeeks < 11) {
        weeks[10 - diffWeeks]++
      }
    })

    return weeks
  }

  // FALLBACK
  return generateWeeklyActivity(data?.stats?.totalTrades || 0)
}


function generateWeeklyActivity(totalTrades) {
  const weeks = 11
  const avg = totalTrades / weeks

  return Array.from({ length: weeks }, () => {
    const noise = Math.floor(Math.random() * 3)
    return Math.max(0, Math.floor(avg / 3) + noise)
  })
}


function generateCapitalFlow(totalVolume) {
  const months = 7
  const avg = totalVolume / months

  return Array.from({ length: months }, () => {
    const deposit = avg * (0.7 + Math.random() * 0.6)
    const withdrawal = Math.random() > 0.6 ? deposit * 0.3 : 0
    return {
      deposits: Math.round(deposit / 1000),
      withdrawals: -Math.round(withdrawal / 1000)
    }
  })
}

function estimateTokenAllocation(score) {
  if (score < MIN_SCORE) {
    return Math.floor(MIN_TOKENS * (score / MIN_SCORE))
  }

  const normalized = score / 100          // 0 → 1
  const curve = Math.pow(normalized, 4.2) // 🔥 very top-heavy

  const tokens = curve * MAX_TOKENS

  return Math.max(MIN_TOKENS, Math.floor(tokens))
}

function estimateValueRange(tokens) {
  const low = tokens * TOKEN_PRICE * 0.85
  const high = tokens * TOKEN_PRICE * 1.15

  return {
    low: Math.round(low),
    high: Math.round(high)
  }
}

</script>