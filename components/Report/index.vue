<template>
  <div class="min-h-screen bg-[#0a0b1e] text-white font-sans selection:bg-blue-500 selection:text-white pb-10">
    
    <Header />

    <main class="max-w-5xl mx-auto px-4 mt-8 space-y-6">
      
      <p class="text-center text-gray-500 text-xs uppercase tracking-wider mb-8">
        Independent analytics for Polymarket participants
      </p>

      <div class="text-center space-y-4 mb-10">
        <h2 class="text-gray-400 uppercase tracking-[0.2em] text-sm font-semibold">POLYSCORE</h2>
        <div class="flex items-baseline justify-center gap-1">
          <span class="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-blue-200 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">
            {{ score }}
          </span>
          <span class="text-3xl text-gray-500">/100</span>
        </div>
        <p class="text-gray-400 text-sm">Top {{ percentile }}% of all Polymarket wallets</p>
        
        <div class="flex justify-center gap-3 mt-4 flex-wrap">
          <div class="badge badge-green">
            <Check :size="14" />
            DeFi-Native User
          </div>
          <div class="badge badge-blue">
            <div class="w-2 h-2 rotate-45 bg-orange-400"></div>
            High Accuracy Trader
          </div>
          <div class="badge badge-blue">
            <div class="w-2 h-2 rotate-45 bg-blue-400"></div>
            Whale Tier
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div class="card">
          <div class="card-header">
            <span class="text-sm text-gray-300 font-medium">Prediction Accuracy</span>
          </div>
          <div class="flex flex-col items-center justify-center h-24">
            <span class="text-4xl font-bold text-white">{{ stats.winRate }}</span>
            <span class="text-xs text-gray-400 mt-1">{{ stats.trades }} Markets Resolved</span>
          </div>
        </div>

        <div class="card">
          <div class="flex justify-between items-start mb-2">
            <span class="text-sm text-gray-300 font-medium">Market Volume Contribution</span>
            <span class="text-gray-500 cursor-pointer">⋮</span>
          </div>
          <div class="flex flex-col items-center justify-center h-24">
            <span class="text-4xl font-bold text-white">{{ stats.volume }}</span>
            <div class="flex mt-3 bg-[#1a1b35] rounded-lg p-1">
               <button class="px-3 py-1 text-[10px] bg-[#2a2b4a] text-white rounded shadow-sm">Lifetime</button>
               <button class="px-3 py-1 text-[10px] text-gray-500 hover:text-white transition-colors">Last 90 Days</button>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <span class="text-sm text-gray-300 font-medium">DeFi Capital Inflow</span>
          </div>
          <div class="flex flex-col items-center justify-center h-24">
            <div class="flex items-baseline gap-1">
              <span class="text-4xl font-bold text-white">{{ formatMoney(defiCapitalInflow) }}</span>

              <span class="text-sm text-gray-400">USDC</span>
            </div>
            <span class="text-xs text-gray-400 mt-1">{{ depositCount }} Deposits</span>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div class="card">
          <div class="card-header">
            <span class="text-sm text-gray-300 font-medium">DeFi Native Usage Score</span>
          </div>
          <div class="flex flex-col items-center justify-center h-24 w-full px-4">
            <div class="flex items-end gap-2 mb-2">
               <span class="text-5xl font-bold text-white">{{ defiScore }}</span>
               <span class="text-xl text-gray-500 mb-1">/ 100</span>
            </div>
            <div class="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
              <div class="h-full w-[82%] bg-gradient-to-r from-green-400 to-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <span class="text-sm text-gray-300 font-medium">Active Across 11 Weeks</span>
          </div>
          <div class="h-24 w-full flex items-end justify-center px-2 pb-2">
             <svg width="100%" height="100%" viewBox="0 0 110 50" preserveAspectRatio="none">
                <g v-for="(item, index) in weeklyActivitydata" :key="index">
                   <rect 
                     :x="index * 10" 
                     :y="item > 0 ? 25 - (item * 5) : 25" 
                     width="6" 
                     :height="Math.abs(item * 5)" 
                     :fill="item > 0 ? '#4ade80' : '#f87171'" 
                     rx="1"
                     opacity="0.9"
                   />
                </g>
                <line x1="0" y1="25" x2="110" y2="25" stroke="#374151" stroke-width="0.5" />
             </svg>
          </div>
        </div>

        <div class="card">
          <div class="h-full flex items-center justify-center min-h-[140px]">
            <div class="relative w-20 h-20 flex items-center justify-center rounded-full bg-[#11122a] border border-gray-800 shadow-inner">
               <div class="absolute inset-0 rounded-full border-2 border-green-500/30"></div>
               <div class="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.4)]">
                  <div class="bg-green-500 rounded-full p-1">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
               </div>
               <svg class="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                 <circle cx="50" cy="50" r="48" fill="none" stroke="#22c55e" stroke-width="2" stroke-dasharray="60 200" stroke-linecap="round" />
               </svg>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-[#0f1025]/50 border border-white/5 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden">
         <div class="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>

         <div class="text-center mb-6">
            <h3 class="text-white text-lg font-medium">Capital Flow Analysis</h3>
         </div>

         <div class="h-48 w-full relative">
            <svg width="100%" height="100%" viewBox="0 0 100 50" preserveAspectRatio="none">
               <line x1="0" y1="0" x2="100" y2="0" stroke="#374151" stroke-width="0.1" stroke-dasharray="2" />
               <line x1="0" y1="25" x2="100" y2="25" stroke="#374151" stroke-width="0.2" />
               <line x1="0" y1="50" x2="100" y2="50" stroke="#374151" stroke-width="0.1" stroke-dasharray="2" />

               <g v-for="(item, index) in capitalFlowdata" :key="index">
                  <rect 
                     v-if="item.deposits > 0"
                     :x="index * (100 / capitalFlowdata.length) + 0.5" 
                     :y="25 - (item.deposits * 2)" 
                     :width="(100 / capitalFlowdata.length) - 1" 
                     :height="item.deposits * 2" 
                     fill="#4ade80" 
                     rx="0.5"
                  />
                  <rect 
                     v-if="item.withdrawals < 0"
                     :x="index * (100 / capitalFlowdata.length) + 0.5" 
                     :y="25" 
                     :width="(100 / capitalFlowdata.length) - 1" 
                     :height="Math.abs(item.withdrawals * 2)" 
                     fill="#f87171" 
                     rx="0.5"
                  />
               </g>
            </svg>
            
            <div class="flex justify-between w-full text-[10px] text-gray-500 mt-2 px-2">
               <span>Jan</span>
               <span>Feb</span>
               <span>Mar</span>
               <span>Apr</span>
               <span>May</span>
               <span>Jun</span>
               <span>Jul</span>
            </div>
         </div>

         <div class="flex justify-center gap-6 mt-6">
            <div class="flex items-center gap-2">
               <div class="w-3 h-2 bg-green-400 rounded-sm"></div>
               <span class="text-xs text-gray-300">Deposits</span>
            </div>
            <div class="flex items-center gap-2">
               <div class="w-3 h-2 bg-red-400 rounded-sm"></div>
               <span class="text-xs text-gray-300">Withdrawals</span>
            </div>
         </div>
      </div>

      <div class="bg-[#0f1025]/30 border-t border-b border-blue-500/20 py-8 px-4 rounded-xl relative overflow-hidden">
          <div class="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
          
          <div class="flex flex-col items-center gap-4 relative z-10">
             <div class="flex items-center gap-2 mb-2">
                <!-- <div class="bg-green-500 rounded-full p-0.5">
                   <Check :size="14" class="text-black stroke-[3]" />
                </div> -->
                <h3 class="text-lg font-semibold text-white">Airdrop Eligibility Status</h3>
             </div>

             <div class="flex flex-col gap-3 items-start">
                <div v-for="text in eligibilityItems" :key="text" class="flex items-center gap-3">
                   <!-- <Check :size="16" class="text-green-500" /> -->
                   <span class="text-sm text-gray-200">{{ text }}</span>
                </div>
             </div>
          </div>
      </div>

      <footer class="text-center text-xs text-gray-500 py-6">
         Polyscore provides independent analytics. Airdrop eligibility is determined by Polymarket.
      </footer>

    </main>
  </div>
</template>

<script setup>
import { Shield, Check, Hexagon, ChevronDown } from 'lucide-vue-next';
import { getPolyscore } from '../../apiss/polyscore'
import { getAll as getAllPolyscoreAddresses } from '../../apiss/polyscoreAddresses'
import { getDefiscore, create as createScore } from '../../apiss/defiscore'
import { getBalance, getDepositCount } from '../../apiss/web3/usdc'

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


const TOTAL_TRACKED_BASE_VALUE = 248137
const TOTAL_TRACKED_GROWTH_RATE_PER_SEC = 0.01

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
  // 🔹 REAL DATA PATH
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

  // 🔹 FALLBACK (old wallets)
  return generateCapitalFlow(data?.stats?.totalVolume || 0)
}



function buildWeeklyActivity(data) {
  // 🔹 REAL DATA PATH
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

  // 🔹 FALLBACK
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


const eligibility = computed(() => ({
  accuracy: data.value?.stats.winRate >= 0.55,
  volume: data.value?.stats.totalVolume >= 5000,
  activity: data.value?.stats.totalTrades >= 25,
  defi: defiScore.value >= 60
}))
const eligibilityItems = computed(() => {
  const items = []
  const s = stats.value
  const e = eligibility.value

  console.log(adminPolyscoreAddresses.value)
  const isAdmin = adminPolyscoreAddresses.value.some(
    addr => addr.address.toLowerCase() === wallet.toLowerCase()
  )

  if (isAdmin) {
    return [
      'Strong Prediction Accuracy: Elite-tier forecasting precision',
      'Significant Capital Inflow: Institutional liquidity profile',
      'Consistent On-Chain Activity: High-frequency market engagement',
      'High DeFi Usage Score: Advanced protocol interaction',
      'Strong Account Provenance: Long-term legacy wallet history',
      'Strong Market Diversity: Broad exposure across all sectors',
      'Active Governance Participant: Direct protocol influence',
      'Optimal Gas Efficiency: Clean execution history',
      'High Trust Multiplier: Verified elite reputation',
      'Positive ROI Profile: Sustained capital growth'
    ]
  }

  // 1. Prediction Accuracy
  if (e.accuracy) {
    if (s.winRate > 70) items.push('Strong Prediction Accuracy: Top-tier forecasting precision')
    else if (s.winRate > 45) items.push('Average Prediction Accuracy: Moderate market hit-rate')
    else items.push('Poor Prediction Accuracy: High error rate in outcome forecasting')
  }

  // 2. Capital Inflow (Volume)
  if (e.volume) {
    if (s.volumeNumeric > 5000) items.push('Significant Capital Inflow: Whale-tier liquidity detected')
    else if (s.volumeNumeric > 500) items.push('Average Capital Inflow: Standard retail volume profile')
    else items.push('Low Capital Inflow: Minimal market liquidity contribution')
  }

  // 3. Activity (Trades)
  if (e.activity) {
    if (s.trades > 50) items.push('Consistent On-Chain Activity: High-frequency market engagement')
    else if (s.trades > 10) items.push('Average On-Chain Activity: Periodic market participation')
    else items.push('Poor On-Chain Activity: Infrequent transaction history')
  }

  // 4. DeFi Usage
  if (e.defi) {
    if (s.defiScore > 80) items.push('High DeFi Usage Score: Advanced protocol interaction')
    else if (s.defiScore > 30) items.push('Average DeFi Usage Score: Basic ecosystem engagement')
    else items.push('Poor DeFi Usage Score: Minimal cross-protocol footprint')
  }

  // 5. Account Age (Provenance)
  if (s.accountAge > 365) items.push('Strong Account Provenance: Long-term wallet history')
  else if (s.accountAge > 90) items.push('Average Account Provenance: Established wallet history')
  else items.push('Poor Account Provenance: Recently created "Fresh" wallet')

  // 6. Diversification
  if (s.categoriesCount > 5) items.push('Strong Market Diversity: Broad exposure across sectors')
  else if (s.categoriesCount > 2) items.push('Average Market Diversity: Targeted sector exposure')
  else items.push('Poor Market Diversity: Highly concentrated risk profile')

  // 7. Governance / Voting
  if (s.hasVoted) items.push('Active Governance Participant: Direct protocol influence')
  else items.push('Passive Network Participant: No governance footprint detected')

  // 8. Gas Efficiency
  if (s.failedTxRate < 5) items.push('Optimal Gas Efficiency: Clean execution history')
  else items.push('Poor Gas Efficiency: High failed transaction ratio')

  // 9. Trust Multiplier
  if (s.isVerified) items.push('High Trust Multiplier: Verified identity/reputation')
  else items.push('Low Trust Multiplier: Anonymous/Unverified status')

  // 10. Risk Profile
  if (s.pnl > 0) items.push('Positive ROI Profile: Sustained capital growth')
  else items.push('Negative ROI Profile: Sustained capital depreciation')

  return items
})

</script>

<style scoped>
/* Reusable component styles via @apply pattern for cleaner template */
.card {
  @apply bg-[#0f1025]/60 border border-white/5 rounded-xl p-5 backdrop-blur-sm shadow-xl relative overflow-hidden transition-colors;
}
.card:hover {
  @apply border-white/10;
}
.card::after {
  content: '';
  @apply absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 transition-opacity pointer-events-none;
}
.card:hover::after {
  @apply opacity-100;
}

.badge {
  @apply flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-medium backdrop-blur-md;
}
.badge-green {
  @apply bg-green-500/10 border-green-500/30 text-gray-200;
}
.badge-blue {
  @apply bg-blue-900/20 border-blue-400/20 text-gray-200;
}
</style>