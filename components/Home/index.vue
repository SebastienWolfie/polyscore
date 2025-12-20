<template>
  <div class="bg-[#0A0C10] text-white min-h-screen font-sans">
    <!-- NAVBAR -->
    <header
      class="flex flex-col sm:flex-row items-start sm:items-center p-4 sm:p-6 bg-[#0D1117] border-b border-[#1F2530] gap-3 sm:gap-5 sticky top-0 z-10"
    >
      <div class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
        <div class="text-blue-400 font-bold text-lg sm:text-xl">Polyscore <span class="text-base sm:text-sm">🇺🇸</span></div>
        <div class="text-gray-400 text-xs sm:text-sm">Powered by Polymarket</div>
      </div>
      <!-- <input
        v-model="searchQuery"
        placeholder="Search markets..."
        class="mt-2 sm:mt-0 sm:ml-auto w-full sm:w-auto flex-1 bg-[#11151D] border border-[#1F2530] rounded-full px-4 py-2 text-gray-300 text-sm placeholder-gray-500"
      /> -->
    </header>

    <!-- MAIN WRAPPER -->
    <main class="flex justify-center p-4 sm:p-6">
      <div
        class="w-full max-w-3xl backdrop-blur-lg bg-[rgba(255,255,255,0.02)] rounded-2xl border border-[#1F2530] shadow-xl p-4 sm:p-6"
        style="background-image: radial-gradient(circle at top left, rgba(61,111,255,0.35), transparent 55%), radial-gradient(circle at bottom right, rgba(255,180,0,0.18), transparent 55%);"
      >
        <!-- INPUT HEADER -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <div>
            <h1
              class="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-[#86B9FF] to-[#3D6FFF] text-transparent bg-clip-text"
            >
              Polyscore Report
            </h1>
            <div class="text-gray-400 text-xs sm:text-sm mt-1">
              Check how strong your on-chain Polymarket activity is and estimate your odds for the upcoming POLY airdrop.
            </div>
          </div>
          <div class="text-xs px-3 py-1 border rounded-full border-[rgba(125,146,255,0.6)] text-[#CBD4FF] bg-[rgba(61,111,255,0.12)] whitespace-nowrap">
            On-chain trader score · Beta
          </div>
        </div>

        <!-- WALLET INPUT ROW -->
        <div class="flex flex-col sm:flex-row gap-2 mb-2">
          <input
            v-model="wallet"
            placeholder="Enter Polymarket wallet (0x...)"
            class="flex-1 bg-[#0D1117] border border-[#1F2530] rounded-xl px-3 py-2 text-gray-100 text-sm placeholder-gray-500"
            :disabled="isLoading"
          />
          <button
            :disabled="isLoading"
            class="bg-gradient-to-r text-white font-semibold rounded-xl px-4 py-2 shadow-md hover:shadow-lg transition-all"
            :class="{
              'from-[#3D6FFF] to-[#7BA7FF] hover:shadow-blue-500/50': !isLoading,
              'from-gray-500 to-gray-700 cursor-not-allowed': isLoading
            }"
            @click="generateScore"
          >
            {{ isLoading ? 'Loading Score...' : 'Check Poly Score' }}
          </button>
        </div>

        <div class="text-gray-500 text-xs mb-3">
          This tool does not request any permissions. Scores are estimates based on public on-chain activity.
        </div>

        <!-- SCORE SECTION -->
        <div v-if="scoreVisible" class="mt-5 space-y-4">
          <div class="bg-[#11151D] p-4 sm:p-5 rounded-xl border border-[#1F2530] shadow-lg">
            <div class="flex flex-col sm:flex-row justify-between mb-4">
              <div>
                <div class="text-gray-300 text-sm">Poly Score · 0–100</div>
                <div class="text-gray-400 text-xs">{{ shortWallet(wallet) }}</div>
              </div>
            </div>

            <div class="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <!-- RING -->
              <div class="relative w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0">
                <svg viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="48" stroke="#1F2933" stroke-width="8" fill="transparent"></circle>
                  <circle
                    :stroke="ringColor"
                    cx="60"
                    cy="60"
                    r="48"
                    stroke-width="8"
                    stroke-linecap="round"
                    fill="transparent"
                    :style="{ strokeDasharray: circumference, strokeDashoffset: offset, transition: 'stroke-dashoffset 1s ease-out' }"
                  ></circle>
                </svg>
                <div class="absolute inset-0 flex items-center justify-center text-xs sm:text-sm text-[#A5B4FC] uppercase tracking-widest">
                  Poly Score
                </div>
              </div>

              <!-- SCORE INFO -->
              <div class="flex-1 min-w-0">
                <div class="text-xl sm:text-2xl font-extrabold mb-1">{{ score }} / 100</div>
                <div class="text-gray-400 text-xs sm:text-sm mb-2">{{ scoreSub }}</div>

                <div class="flex flex-wrap gap-2 mb-2" v-if="badgeText">
                  <div :class="['flex items-center gap-1 text-xs sm:text-sm px-2 py-1 rounded-full font-semibold', badgeClass]">
                    <span class="text-sm">🔔</span>
                    <span>{{ badgeText }}</span>
                  </div>
                </div>

                <div class="text-gray-300 text-xs sm:text-sm leading-relaxed">{{ scoreInterpret }}</div>
              </div>
            </div>
          </div>

          <!-- PROFILE + STATS -->
          <div class="bg-[#0D1117] p-4 rounded-xl border border-[#1F2530] mb-4">
            <div class="flex items-center gap-3 mb-2">
              <div
                class="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[#7BA7FF] to-[#3D6FFF] flex items-center justify-center font-bold text-sm sm:text-base"
              >
                {{ initialsFromWallet(wallet) }}
              </div>
              <div>
                <div class="text-gray-100 text-sm sm:text-base">{{ shortWallet(wallet) || 'Wallet activity preview' }}</div>
                <div class="text-gray-400 text-xs sm:text-sm">
                  Connect your wallet on Polymarket to unlock a full on-chain report.
                </div>
              </div>
            </div>

            <div class="grid grid-cols-3 gap-2 mt-2 text-left">
              <div class="bg-[#11151D] p-2 rounded-lg border border-[#1F2530]">
                <div class="text-gray-400 text-xs mb-1">Win Rate</div>
                <div class="text-[#3D6FFF] font-semibold">{{ stats.winRate }}</div>
              </div>
              <div class="bg-[#11151D] p-2 rounded-lg border border-[#1F2530]">
                <div class="text-gray-400 text-xs mb-1">Total trades</div>
                <div class="text-[#3D6FFF] font-semibold">{{ stats.trades }}</div>
              </div>
              <div class="bg-[#11151D] p-2 rounded-lg border border-[#1F2530]">
                <div class="text-gray-400 text-xs mb-1">Volume (est.)</div>
                <div class="text-[#3D6FFF] font-semibold">{{ stats.volume }}</div>
              </div>
            </div>
          </div>

          <!-- HEATMAP -->
          <div class="bg-[#11151D] p-4 rounded-xl border border-[#1F2530] mb-4">
            <div class="flex justify-between mb-2">
              <div class="text-gray-200 text-sm">Activity heatmap</div>
              <div class="text-gray-400 text-xs border border-dashed rounded-full px-2 py-0.5">Coming soon · daily on-chain activity view</div>
            </div>
            <div
              class="h-16 sm:h-20 rounded-lg bg-[repeating-linear-gradient(-45deg,#111827,#111827_8px,#020617_8px,#020617_16px)] flex items-center justify-center text-xs sm:text-sm text-gray-500"
            >
              Daily trading activity across the last 12 months will appear here once heatmaps are enabled.
            </div>
          </div>

          <!-- DETAILS -->
          <div
            class="bg-[#0D1117] p-4 rounded-xl border border-[#1F2530] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 cursor-pointer"
            @click="walletModalOpen = true"
          >
            <div class="text-xs sm:text-sm">
              <div>View detailed on-chain report</div>
              <div class="text-gray-400 text-[10px] sm:text-xs">
                Connect your on-chain Polymarket wallet to unlock full trading breakdown, detailed metrics, streaks, liquidity, and PnL-adjusted scoring.
              </div>
            </div>
            <div
              class="text-xs px-2 py-1 border rounded-full border-[#3D6FFF] bg-[rgba(37,99,235,0.16)] flex items-center gap-1 mt-2 sm:mt-0"
            >
              🔒 Connect wallet on Polymarket
            </div>
          </div>

          <div class="text-center mt-4 border-t border-dashed border-gray-500 pt-2 text-xs sm:text-sm text-gray-400">
            Polyscore is experimental and unofficial. <span class="text-blue-400 font-semibold">Powered by Polymarket</span> ecosystem data.
          </div>
        </div>
      </div>
    </main>

    <!-- RECOMMEND CARD -->
    <div class="max-w-3xl mx-auto mt-5 bg-[#0D1117] p-6 rounded-xl border border-[#1F2530] shadow-lg">
      <div class="text-lg sm:text-xl font-bold mb-1">Improve your Polyscore?</div>
      <div class="text-gray-400 text-sm sm:text-base">Track whale activity on Polymarket and see the best traders.</div>
      <a
        href="https://polywhaler.com"
        target="_blank"
        class="text-blue-400 font-semibold text-sm sm:text-base mt-2 inline-block underline"
      >
        Visit Polywhaler →
      </a>
    </div>

    <!-- MODALS -->
    <WalletModal v-if="walletModalOpen" @close="walletModalOpen=false" />
    <LearnModal v-if="learnModalOpen" @close="learnModalOpen=false" />
  </div>
</template>


<script setup>
import { ref, watch, computed } from 'vue'

const wallet = ref('')
const searchQuery = ref('')
const scoreVisible = ref(false)
const isLoading = ref(false)
// const errorMsg = ref('') // Removed, as we no longer show API errors to the user

// Reactive Data
const score = ref(0)
const scoreSub = ref('Enter a wallet to analyze on-chain activity.')
const scoreInterpret = ref('')
const badgeText = ref('')
const badgeClass = ref('')
const stats = ref({ winRate: '0%', trades: 0, volume: '$0' }) // Changed 'markets' to 'winRate'

// UI State
const walletModalOpen = ref(false)
const learnModalOpen = ref(false)

// Watcher to reset visibility when wallet changes
watch(() => wallet.value, () => {
    scoreVisible.value = false
    score.value = 0
    // Reset ring to full
    offset.value = circumference
})

// Circle Config
const radius = 48
const circumference = 2 * Math.PI * radius
const offset = ref(circumference)
const ringColor = ref('#FF4D4D')

// Helper: Format Wallet
function shortWallet(addr) {
  if (!addr || addr.trim() === '') return ''
  if (addr.length <= 12) return addr
  return addr.slice(0, 6) + '…' + addr.slice(-4)
}

// Helper: Initials
function initialsFromWallet(addr) {
  if (!addr || addr.length < 4) return 'PM'
  const core = addr.replace('0x', '').toUpperCase()
  return core.slice(0, 2)
}

// Core: Fetch Real Data
async function generateScore() {
  if (!wallet.value || wallet.value.length < 10) {
    alert('Please enter a valid wallet address.')
    return
  }
  
  isLoading.value = true
  // errorMsg.value = '' // No longer used
  scoreVisible.value = false
  
  try {
    // Call the server proxy (or use direct URL if no proxy)
    const data = await $fetch(`/api/polymarket/polyscore/get?wallet=${wallet.value}`)
    
    // Check if the API returned a valid smartMoneyScore
    if (data?.smartMoneyScore !== undefined && data.smartMoneyScore !== null) {
      // SUCCESS PATH
      const rawScore = data.smartMoneyScore
      score.value = Math.round(rawScore)

      // Map Stats
      stats.value.trades = data.stats?.totalTrades || 0
      stats.value.volume = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
      }).format(data.stats?.totalVolume || 0)
      
      // Map Win Rate
      const wr = (data.stats?.winRate || 0) * 100
      stats.value.winRate = wr.toFixed(1) + '%'
      
    } else {
      // SOFT ERROR/NULL DATA PATH (API returned 200 but data is empty)
      console.warn('API returned null/undefined smartMoneyScore for the wallet. Falling back to default low score.')
      
      // Set to a low score (10-20 range) as requested
      score.value = Math.floor(Math.random() * 11) + 10 
      
      // Reset stats to 0 or default low-activity values
      stats.value.trades = 0
      stats.value.volume = '$0'
      stats.value.winRate = '0%'
    }

    // 3. Determine Tiers (Logic applies to both success and fallback scores)
    updateTierLogic(score.value)

    // 4. Animate Ring
    offset.value = circumference * (1 - score.value / 100)
    scoreVisible.value = true

  } catch (err) {
    // HARD ERROR PATH (Network error, 404, 500 etc.)
    console.error('API call failed during score generation:', err)
    
    // Set to a low score (10-20 range) as requested
    score.value = Math.floor(Math.random() * 11) + 10 
    
    // Reset stats to 0 or default low-activity values
    stats.value.trades = 0
    stats.value.volume = '$0'
    stats.value.winRate = '0%'

    // Apply low tier logic for the fallback score
    updateTierLogic(score.value) 

    // Show the UI with the low score
    offset.value = circumference * (1 - score.value / 100)
    scoreVisible.value = true

  } finally {
    isLoading.value = false
  }
}

function updateTierLogic(s) {
  let tier = 'low'
  if (s >= 70) {
    badgeText.value = 'High airdrop probability (70–100)'
    badgeClass.value = 'bg-[rgba(61,111,255,0.18)] border border-[#3D6FFF] text-[#DCE6FF]'
    scoreInterpret.value = 'This wallet has strong, consistent on-chain presence. It is in the top percentile of active traders.'
    scoreSub.value = 'Excellent activity profile.'
    tier = 'high'
  } else if (s >= 35) {
    badgeText.value = 'Lukewarm zone (Mid-Tier)'
    badgeClass.value = 'bg-[rgba(255,180,0,0.16)] border border-[#FFB400] text-[#FEF3C7]'
    scoreInterpret.value = 'This wallet shows moderate activity. Increasing volume and consistency could push it to the top band.'
    scoreSub.value = 'Good start, but room to grow.'
    tier = 'mid'
  } else {
    badgeText.value = 'Minimal activity'
    badgeClass.value = 'bg-[rgba(255,77,77,0.15)] border border-[#FF4D4D] text-[#FEE2E2]'
    scoreInterpret.value = 'This wallet has little to no significant on-chain history on Polymarket. Check the address or begin trading to improve your score.'
    scoreSub.value = 'Low on-chain footprint.'
    tier = 'low'
  }
  ringColor.value = tier === 'high' ? '#3D6FFF' : tier === 'mid' ? '#FFB400' : '#FF4D4D'
}
</script>
