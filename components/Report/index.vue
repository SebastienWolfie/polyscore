<template>
  <div class="min-h-screen bg-[#0a0b1e] text-white font-sans selection:bg-blue-500 selection:text-white pb-10">
    
    <nav class="flex justify-between items-center px-6 py-4 border-b border-white/10 bg-[#0a0b1e]/90 backdrop-blur-sm sticky top-0 z-50">
      <div class="flex items-center gap-2">
        <div class="w-6 h-6 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-sm"></div>
        <span class="text-xl font-bold tracking-tight">PolyScore</span>
      </div>
      <div class="text-lg font-semibold text-gray-200">Full On-Chain Report</div>
      <div class="flex items-center gap-4 text-gray-400 text-sm">
        <span class="font-mono">0x92fd...7b3A</span>
        <button class="flex items-center gap-1 hover:text-white transition-colors">
          <Hexagon :size="16" />
          Logout
        </button>
      </div>
    </nav>

    <main class="max-w-5xl mx-auto px-4 mt-8 space-y-6">
      
      <p class="text-center text-gray-500 text-xs uppercase tracking-wider mb-8">
        Independent analytics for Polymarket participants
      </p>

      <div class="text-center space-y-4 mb-10">
        <h2 class="text-gray-400 uppercase tracking-[0.2em] text-sm font-semibold">POLYSCORE</h2>
        <div class="flex items-baseline justify-center gap-1">
          <span class="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-blue-200 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">
            88.2
          </span>
          <span class="text-3xl text-gray-500">/100</span>
        </div>
        <p class="text-gray-400 text-sm">Top 2.4% of all Polymarket wallets</p>
        
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
            <span class="text-4xl font-bold text-white">61.7%</span>
            <span class="text-xs text-gray-400 mt-1">143 Markets Resolved</span>
          </div>
        </div>

        <div class="card">
          <div class="flex justify-between items-start mb-2">
            <span class="text-sm text-gray-300 font-medium">Market Volume Contribution</span>
            <span class="text-gray-500 cursor-pointer">⋮</span>
          </div>
          <div class="flex flex-col items-center justify-center h-24">
            <span class="text-4xl font-bold text-white">$134,920</span>
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
              <span class="text-4xl font-bold text-white">$46,200</span>
              <span class="text-sm text-gray-400">USDC</span>
            </div>
            <span class="text-xs text-gray-400 mt-1">21 Deposits</span>
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
               <span class="text-5xl font-bold text-white">82</span>
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
                <g v-for="(item, index) in weeklyActivityData" :key="index">
                   <rect 
                     :x="index * 10" 
                     :y="item.value > 0 ? 25 - (item.value * 5) : 25" 
                     width="6" 
                     :height="Math.abs(item.value * 5)" 
                     :fill="item.value > 0 ? '#4ade80' : '#f87171'" 
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

               <g v-for="(item, index) in capitalFlowData" :key="index">
                  <rect 
                     v-if="item.deposits > 0"
                     :x="index * (100 / capitalFlowData.length) + 0.5" 
                     :y="25 - (item.deposits * 2)" 
                     :width="(100 / capitalFlowData.length) - 1" 
                     :height="item.deposits * 2" 
                     fill="#4ade80" 
                     rx="0.5"
                  />
                  <rect 
                     v-if="item.withdrawals < 0"
                     :x="index * (100 / capitalFlowData.length) + 0.5" 
                     :y="25" 
                     :width="(100 / capitalFlowData.length) - 1" 
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
                <div class="bg-green-500 rounded-full p-0.5">
                   <Check :size="14" class="text-black stroke-[3]" />
                </div>
                <h3 class="text-lg font-semibold text-white">Airdrop Eligibility Status</h3>
             </div>

             <div class="flex flex-col gap-3 items-start">
                <div v-for="text in eligibilityItems" :key="text" class="flex items-center gap-3">
                   <Check :size="16" class="text-green-500" />
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

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const wallet = route.params.wallet


// Data for "Active Across 11 Weeks"
const weeklyActivityData = [
  { value: 3 }, { value: 5 }, { value: -2 }, { value: 4 }, 
  { value: -3 }, { value: 1 }, { value: -1 }, { value: 2 }, 
  { value: -2 }, { value: 4 }, { value: -2 }
];

// Data for "Capital Flow Analysis"
const capitalFlowData = [
  { deposits: 4, withdrawals: -2 }, { deposits: 8, withdrawals: 0 },
  { deposits: 3, withdrawals: -4 }, { deposits: 6, withdrawals: -2 },
  { deposits: 3, withdrawals: -1 }, { deposits: 7, withdrawals: -3 },
  { deposits: 9, withdrawals: 0 }, { deposits: 4, withdrawals: -1 },
  { deposits: 5, withdrawals: 0 }, { deposits: 2, withdrawals: -2 },
  { deposits: 0, withdrawals: -3 }, { deposits: 5, withdrawals: -3 },
  { deposits: 6, withdrawals: -2 }, { deposits: 2, withdrawals: -1 },
  { deposits: 5, withdrawals: -4 }, { deposits: 3, withdrawals: -3 },
  { deposits: 4, withdrawals: 0 }, { deposits: 2, withdrawals: -2 },
  { deposits: 7, withdrawals: -1 }, { deposits: 4, withdrawals: -3 },
  { deposits: 3, withdrawals: 0 }, { deposits: 6, withdrawals: 0 },
  { deposits: 7, withdrawals: -1 }, { deposits: 2, withdrawals: 0 },
  { deposits: 5, withdrawals: 0 }, { deposits: 2, withdrawals: 0 },
  { deposits: 7, withdrawals: -1 }, { deposits: 5, withdrawals: 0 },
];

const eligibilityItems = [
  "Strong Prediction Accuracy",
  "Significant DeFi Wallet Inflows",
  "Consistent On-Chain Activity",
  "Volume Contribution"
];
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