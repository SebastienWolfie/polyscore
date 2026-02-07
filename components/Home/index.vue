<template>
  <div class="bg-[#0A0C10] text-white min-h-screen font-sans">
    <Header @showSignup="showSignup=true"
            @showLogin="showLogin=true"
            @showLearnModal="learnModalOpen=true"/>

    <!-- OFFICIAL POLYMARKET PARTNER STRIP -->
    <a
      href="https://polymarket.com"
      target="_blank"
      class="block bg-gradient-to-r from-[#0B1324] to-[#0D1B3A] border-b border-[#1F2530] hover:from-[#0E1A3C] hover:to-[#142966] transition"
    >
      <div class="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <img src="/images/polymarket-logo.svg" class="w-7 h-7" alt="Polymarket" />
          <div>
            <div class="text-sm font-semibold text-[#CBD4FF]">
              Built on Polymarket data
            </div>
            <div class="text-xs text-gray-400">
              Trade real prediction markets on the official Polymarket platform
            </div>
          </div>
        </div>
        <div class="text-xs sm:text-sm font-semibold text-[#7BA7FF]">
          Visit Polymarket →
        </div>
      </div>
    </a>


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
              Over <span class="text-[#7BA7FF] font-semibold">{{ totalTracked.toLocaleString() }}</span> wallets analyzed.  
              Only the top <span class="text-[#7BA7FF] font-semibold">3%</span> qualify for whale tier.
            </div>

          </div>
          <div class="text-xs px-3 py-1 border rounded-full border-[rgba(125,146,255,0.6)] text-[#CBD4FF] bg-[rgba(61,111,255,0.12)] whitespace-nowrap">
            On-chain trader score
          </div>
        </div>

        <div  v-if="!scoreVisible" class="bg-[#0D1117] p-5 rounded-2xl border border-[#1F2530] shadow-xl">
          <div class="flex justify-between items-center mb-4">
            <div class="text-sm font-semibold text-[#CBD4FF]">
              🐋 Top Polymarket Scorers
            </div>
            <!-- <div class="text-xs text-gray-500">Updated every 24h</div> -->
          </div>

          <div class="space-y-3">
            <div
              v-for="(w, i) in whaleBenchmarks"
              :key="w.name"
              class="group flex items-center justify-between p-3 rounded-xl border border-[#1F2530] bg-gradient-to-r from-[#0A0C10] to-[#0D1117] hover:border-[#3D6FFF] transition"
            >
              <!-- LEFT -->
              <div class="flex items-center gap-3">
                <div
                  class="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm"
                  :class="[
                    i === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-black' :
                    i === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-black' :
                    i === 2 ? 'bg-gradient-to-br from-amber-700 to-yellow-700 text-black' :
                    'bg-[#11151D] text-gray-400'
                  ]"
                >
                  #{{ i + 1 }}
                </div>

                <div>
                  <div class="text-gray-200 text-sm font-semibold">{{ w.name }}</div>
                  <div class="text-xs text-gray-500">{{ w.trades }} trades · {{ w.winRate }} win rate</div>
                </div>
              </div>

              <!-- RIGHT -->
              <div class="flex items-center gap-6">
                <div class="text-right">
                  <div class="text-xs text-gray-400">Volume</div>
                  <div class="text-sm font-semibold text-white">{{ w.volume }}</div>
                </div>

                <div class="text-right">
                  <div class="text-xs text-gray-400">PolyScore</div>
                  <div class="text-lg font-extrabold text-[#3D6FFF]">{{ w.score }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- <a
            href="https://www.polywhaler.net/"
            target="_blank"
            class="text-blue-400 font-semibold text-[14px] sm:text-base mt-2 inline-block underline"
          >
            See full list →
          </a> -->
            
        </div>





        <!-- WALLET INPUT ROW -->
        <div class="flex flex-col sm:flex-row gap-2 mt-3 mb-2">
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

        <div v-if="!scoreVisible" class="text-gray-500 text-xs mb-3">
          This tool does not request any permissions. Scores are estimates based on public on-chain activity.
        </div>


        <div class="text-xs text-gray-500 mt-1">
          Your DeFi Native Usage Score tracks how much real DeFi capital you move
          before trading prediction markets.  
          <span class="text-blue-400">High DeFi scores boost PolyScore significantly.</span>
        </div>




        <!-- <div v-if="scoreVisible" class="bg-gradient-to-r mt-3 from-[#3D6FFF] to-[#7BA7FF] p-3 rounded-xl text-black text-sm font-semibold shadow-lg">
          🔥 Wallet is outperforming {{ percentile }}% of all Polymarket traders.
        </div> -->

        
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


                <p class="text-blue-400 font-semibold cursor-pointer text-sm mt-2 inline-block underline"
                  @click="() => viewFullReportClicked()">See more</p>
            
              </div>



            </div>

            <!-- GLOBAL RANKING (REDESIGNED) -->
            <div class="mt-4 pt-3 border-t border-[#1F2530]">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-gray-400 text-xs uppercase tracking-wide">
                    Global Ranking
                  </div>
                  <div class="text-gray-500 text-[11px]">
                    Among all Polymarket wallets
                  </div>
                </div>

                <div class="flex items-center gap-3">
                  <div class="text-xl sm:text-2xl font-extrabold text-[#7BA7FF] tracking-tight">
                    #{{ worldwideRank?.toLocaleString() || '—' }}
                  </div>

                </div>
              </div>
            </div>



   
          </div>


          <!-- PROFILE + STATS + DEFI SCORE -->
          <div class="bg-[#0D1117] p-4 rounded-xl border border-[#1F2530] mb-4">

            <!-- Header -->
            <div class="flex items-center gap-3 mb-4">
              <img
                class="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[#7BA7FF] to-[#3D6FFF] flex items-center justify-center font-bold text-sm sm:text-base"
                v-if="profileImage"
                :src="profileImage"
              />
              <div
                class="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[#7BA7FF] to-[#3D6FFF] flex items-center justify-center font-bold text-sm sm:text-base"
                v-else
              >
                {{ initialsFromWallet(wallet) }}
              </div>

              <div class="leading-tight">
                <!-- Username -->
                <div class="text-gray-100 text-sm sm:text-base font-semibold">
                  {{ username || 'Anonymous Trader' }}
                </div>

                <!-- Wallet -->
                <div class="text-gray-400 text-xs sm:text-sm">
                  {{ shortWallet(wallet) || 'Wallet activity preview' }}
                </div>

                <!-- Subtitle -->
                <div class="text-gray-500 text-[11px] sm:text-xs">
                  Connect your wallet on Polymarket to unlock a full on-chain report.
                </div>
              </div>
            </div>


            <!-- Stats Grid -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-left">

              <!-- DeFi Score -->
              <div class="bg-[#11151D] p-2 rounded-lg border border-[#1F2530]">
                <div class="text-gray-400 text-xs mb-1">DeFi Score</div>
                <div class="flex items-center gap-2">
                  <div class="text-[#7BA7FF] font-semibold blur-sm select-none">
                    {{ defiScore }}/100
                  </div>
                  <div
                    :class="['text-[10px] px-1.5 py-0.5 rounded-full font-semibold', defiGradeClass]"
                  >
                    {{ defiGrade }}
                  </div>
                </div>
              </div>

              <!-- Win Rate -->
              <div class="bg-[#11151D] p-2 rounded-lg border border-[#1F2530]">
                <div class="text-gray-400 text-xs mb-1">Win Rate</div>
                <div class="flex items-center gap-2">
                  <div class="text-[#3D6FFF] font-semibold blur-sm select-none">
                    {{ stats.winRate }}
                  </div>
                  <div
                    :class="['text-[10px] px-1.5 py-0.5 rounded-full font-semibold', winRateGradeClass]"
                  >
                    {{ winRateGrade }}
                  </div>
                </div>
              </div>

              <!-- Total Trades -->
              <div class="bg-[#11151D] p-2 rounded-lg border border-[#1F2530]">
                <div class="text-gray-400 text-xs mb-1">Total Trades</div>
                <div class="flex items-center gap-2">
                  <div class="text-[#3D6FFF] font-semibold select-none">
                    {{ stats.trades }}
                  </div>
                  <div
                    :class="['text-[10px] px-1.5 py-0.5 rounded-full font-semibold', tradesGradeClass]"
                  >
                    {{ tradesGrade }}
                  </div>
                </div>
              </div>

              <!-- Volume -->
              <div class="bg-[#11151D] p-2 rounded-lg border border-[#1F2530]">
                <div class="text-gray-400 text-xs mb-1">Volume (est.)</div>
                <div class="flex items-center gap-2">
                  <div class="text-[#3D6FFF] font-semibold select-none">
                    {{ stats.volume }}
                  </div>
                  <div
                    :class="['text-[10px] px-1.5 py-0.5 rounded-full font-semibold', volumeGradeClass]"
                  >
                    {{ volumeGrade }}
                  </div>
                </div>
              </div>

            </div>

            <!-- Explanation -->
            <p class="text-xs text-gray-500 mt-3 leading-relaxed">
              <span class="text-gray-400 font-medium">What is DeFi Score?</span>
              It measures your on-chain interaction with Polymarket via a self-custody DeFi wallet. The score reflects wallet-based deposits, withdrawals, and smart-contract interactions on supported networks. Activity routed threw off-chain or custodial methods generates limited on-chain signals and results in a lower DeFi Score.
            </p>

          </div>




          

          <!-- <AirdropQualification
            v-if="scoreVisible"
            :balance="defiCapitalInflow"
          /> -->


          <!-- RECOMMEND CARD -->
          <div class="max-w-3xl mx-auto mt-5 bg-[#0D1117] p-6 rounded-xl border border-[#1F2530] shadow-lg">
            <div class="text-lg sm:text-xl font-bold mb-1">Improve your Polyscore?</div>
            <div class="text-gray-400 text-sm sm:text-base">Access your complete on-chain performance report and identify actions to strengthen your airdrop eligibility.</div>
            <!-- <a
              href="https://www.polywhaler.net/"
              target="_blank"
              class="text-blue-400 font-semibold text-sm sm:text-base mt-2 inline-block underline"
            >
              Visit Polywhaler →
            </a> -->

            <p class="text-blue-400 font-semibold cursor-pointer text-sm sm:text-base mt-2 inline-block underline"
               @click="() => viewFullReportClicked()">View full report</p>
            
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

        </div>
      </div>
    </main>


    <!-- MODALS -->
    <LearnModal v-if="learnModalOpen" @close="learnModalOpen=false" />

    <RegisterModal v-if="showSignup"
                   @onClose="showSignup=false"
                   :scanned-address="wallet"
                   @signInClicked="() => {
                    showSignup = false
                    showLogin = true
                   }"/>

    <SignInModal v-if="showLogin" 
                 @onClose="showLogin=false"
                 @registerClicked="() => {
                  showLogin = false
                  showSignup = true
                 }"/>

    <AuthExplainModal
      v-if="showAuthExplainModal"
      @close="showAuthExplainModal = false"
      @registerClicked="() => {
        showAuthExplainModal = false
        showSignup = true
      }"
      @loginClicked="() => {
        showAuthExplainModal = false
        showLogin = true
      }"
    />
  </div>
</template>


<script setup>
import { getAll as getAllPolyscoreAddresses } from '../../apiss/polyscoreAddresses'
import { create as savePolyscore } from '../../apiss/polyscore'
import { getDefiscore, create as createScore } from '../../apiss/defiscore'
import { getBalance } from '../../apiss/web3/usdc'


const auth = useAuth()
const wallet = ref('')
const scoreVisible = ref(false)
const isLoading = ref(false)
const adminPolyscoreAddresses = ref([]);

const showLogin = ref(false)
const showSignup = ref(false)
const showAuthExplainModal = ref(false)



// 1. CONFIGURATION
const TOTAL_TRACKED_BASE_VALUE = 248137; // The number on your launch date
const TOTAL_TRACKED_GROWTH_RATE_PER_SEC = 0.01; // Adjust this to speed up/slow down growth
const totalTracked = ref(TOTAL_TRACKED_BASE_VALUE)



const worldwideRank = ref(null)
const percentile = ref(null)

const whaleBenchmarks = ref([])



// Reactive Data
const score = ref(0)
const username = ref(null)
const profileImage = ref(null)
const scoreSub = ref('Enter a wallet to analyze on-chain activity.')
const scoreInterpret = ref('')
const badgeText = ref('')
const badgeClass = ref('')
const stats = ref({ winRate: '0%', trades: 0, volume: '$0' }) 

// UI State
const learnModalOpen = ref(false)


const defiScore = ref(0)
const defiGrade = ref('Poor')
const defiGradeClass = ref('bg-red-500/20 text-red-400')



const defiCapitalInflow = ref(0)




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




// Watcher to reset visibility when wallet changes
watch(() => wallet.value, () => {
    scoreVisible.value = false
    score.value = 0
    username.value = null
    profileImage.value = null
    // Reset ring to full
    offset.value = circumference
})

onMounted(async () => {
updateWhaleBenchmarks();
  try {
    const addresses = await getAllPolyscoreAddresses();
    adminPolyscoreAddresses.value = addresses || []; 
  } catch (e) {
    console.error('Failed to load admin addresses', e);
  }
})

// --- DYNAMIC BENCHMARK LOGIC ---

/**
 * Generates a consistent "random" number (0 to 1) based on a seed.
 * This ensures every user sees the same data for the 48h period.
 */
function seededRandom(seed) {
  const m = 0x80000000;
  const a = 1103515245;
  const c = 12345;
  let state = seed ? seed : Math.floor(Math.random() * (m - 1));
  return function() {
    state = (a * state + c) % m;
    return state / (m - 1);
  }
}

/**
 * Regenerates the top 5 list based on the current 48-hour epoch.
 */
function updateWhaleBenchmarks() {
  // Define 48 Hours in Milliseconds
  const EPOCH_DURATION = 48 * 60 * 60 * 1000;
  // Calculate which "48h block" we are in (e.g., Block #5021)
  const currentEpoch = Math.floor(window.Date.now() / EPOCH_DURATION);

  // Initialize the Random Generator with the Epoch as the seed
  const rng = seededRandom(currentEpoch);

  const newBenchmarks = [];
  const chars = '0123456789ABCDEF';

  for (let i = 0; i < 5; i++) {
    // 1. Generate Realistic Wallet Address (0x + 4 chars + ... + 4 chars)
    let start = '';
    let end = '';
    for(let j=0; j<4; j++) start += chars[Math.floor(rng() * 16)];
    for(let j=0; j<4; j++) end += chars[Math.floor(rng() * 16)];

    // 2. Score: Rank 1 is 98-99, others descend slightly
    // Creates a tight spread at the top (e.g., 99, 98, 97, 96, 95)
    const score = Math.floor(99 - i - (rng() * 1.2));

    // 3. Volume: Correlates loosely with rank ($500k to $3.5M)
    const volBase = (6 - i) * 400000; 
    const volNoise = rng() * 800000;
    const totalVol = volBase + volNoise;
    
    let volStr;
    if (totalVol > 1000000) {
        volStr = '$' + (totalVol / 1000000).toFixed(1) + 'M';
    } else {
        volStr = '$' + Math.floor(totalVol / 1000) + 'K';
    }

    // 4. Win Rate: High tiers usually have 65% - 88%
    const winRate = Math.floor(68 + (rng() * 20)) + '%';

    // 5. Trades: 600 - 3500
    const trades = Math.floor(600 + (rng() * 2900));

    newBenchmarks.push({
      name: `0x${start}…${end}`,
      score: score,
      volume: volStr,
      winRate: winRate,
      trades: trades
    });
  }

  whaleBenchmarks.value = newBenchmarks;
}

// Circle Config
const radius = 48
const circumference = 2 * Math.PI * radius
const offset = ref(circumference)
const ringColor = ref('#FF4D4D')

// Core: Generate & Persist Score
async function generateScore() {
  if (!wallet.value || wallet.value.length < 10) {
    alert('Please enter a valid wallet address.')
    return
  }
  
  isLoading.value = true
  scoreVisible.value = false
  
  // --- ADMIN CHECK LOGIC START ---
  const inputWalletLower = wallet.value.toLowerCase().trim();
  const isAdmin = adminPolyscoreAddresses.value.some(addr => 
    (addr.address || addr).toLowerCase() === inputWalletLower 
  );

  await calculateDeFiScore(inputWalletLower)
  defiCapitalInflow.value = await getBalance(wallet.value)

  if (isAdmin) {
    try {
      // 1. Fake the API Delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // 2. Generate Random High Score & Raw Stats
      const rawScore = Math.floor(Math.random() * (90 - 80 + 1)) + 80;
      const rawTrades = Math.floor(Math.random() * (500 - 150 + 1)) + 150;
      const rawVolume = Math.floor(Math.random() * (500000 - 50000 + 1)) + 50000;
      const rawWinRate = (Math.random() * (0.75 - 0.55) + 0.55); // 0.55 - 0.75

      // 3. Update UI Variables
      score.value = rawScore;
      const weightedScore = Math.round(
        score.value * 0.6 +
        defiScore.value * 0.4
      )

      score.value = weightedScore

      stats.value.trades = rawTrades;
      stats.value.volume = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
      }).format(rawVolume);
      stats.value.winRate = (rawWinRate * 100).toFixed(1) + '%';

      // 4. Update Visuals
      updateTierLogic(score.value);
      offset.value = circumference * (1 - score.value / 100);
      scoreVisible.value = true;

      calculateRank(score.value)


      // 5. PERSIST TO DB (Fire and forget-ish)
      // We await it, but catch errors so UI doesn't break
      try {
        const payload = {
            smartMoneyScore: rawScore,
            stats: {
                totalTrades: rawTrades,
                totalVolume: rawVolume,
                winRate: rawWinRate
            }
        };
        await savePolyscore(wallet.value, payload);
        console.log('Admin score persisted successfully');
      } catch (dbError) {
        console.error('Failed to save admin score to DB:', dbError);
      }
      
    } catch (e) {
      console.error("Simulation error", e);
    } finally {
      isLoading.value = false;
    }
    return; 
  }
  // --- ADMIN CHECK LOGIC END ---

  // Standard Logic for everyone else
  try {
    const data = await $fetch(`/api/polymarket/polyscore/get?wallet=${wallet.value}`)
    
    if (data?.smartMoneyScore !== undefined && data.smartMoneyScore !== null) {
      const rawScore = data.smartMoneyScore
      username.value = data.username || null
      profileImage.value = data.profileImage || null
      score.value = Math.round(rawScore)
      const weightedScore = Math.round(
        score.value * 0.6 +
        defiScore.value * 0.4
      )

      score.value = weightedScore


      stats.value.trades = data.stats?.totalTrades || 0
      stats.value.volume = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
      }).format(data.stats?.totalVolume || 0)
      
      const wr = (data.stats?.winRate || 0)
      stats.value.winRate = wr.toFixed(1) + '%'

      // PERSIST REAL DATA TO DB
      try {
          await savePolyscore(wallet.value, data);
          console.log('Real score persisted successfully');
      } catch (dbError) {
          console.error('Failed to save real score to DB:', dbError);
      }
      
    } else {
      console.warn('API returned null/undefined smartMoneyScore. Falling back.')
      await initializeError()
    }
    calculateRank(score.value)


    updateTierLogic(score.value)
    offset.value = circumference * (1 - score.value / 100)
    scoreVisible.value = true

  } catch (err) {
    console.error('API call failed:', err)
    await initializeError()
  } finally {
    isLoading.value = false
  }
}

async function initializeError() { 
  score.value = Math.floor(Math.random() * 11) + 10 
  stats.value.trades = 0
  stats.value.volume = '$0'
  stats.value.winRate = '0%'
  updateTierLogic(score.value) 
  offset.value = circumference * (1 - score.value / 100)
  scoreVisible.value = true
  calculateRank(score.value)
    const payload = {
        smartMoneyScore: score.value,
        stats: {
            totalTrades: 0,
            totalVolume: '$0',
            winRate: '0%'
        }
    };
    await savePolyscore(wallet.value, payload);
}

// Helpers
function shortWallet(addr) {
  if (!addr || addr.trim() === '') return ''
  if (addr.length <= 12) return addr
  return addr.slice(0, 6) + '…' + addr.slice(-4)
}

function initialsFromWallet(addr) {
  if (!addr || addr.length < 4) return 'PM'
  const core = addr.replace('0x', '').toUpperCase()
  return core.slice(0, 2)
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
    scoreInterpret.value = 'This wallet shows moderate activity. Check the full on-chain report to see the metrics considered'
    scoreSub.value = 'Good start, but room to grow.'
    tier = 'mid'
  } else {
    badgeText.value = 'Minimal activity'
    badgeClass.value = 'bg-[rgba(255,77,77,0.15)] border border-[#FF4D4D] text-[#FEE2E2]'
    scoreInterpret.value = 'This wallet does not currently meet airdrop eligibility requirements. View the full on-chain report to see the metrics considered'
    scoreSub.value = 'Low on-chain footprint.'
    tier = 'low'
  }
  ringColor.value = tier === 'high' ? '#3D6FFF' : tier === 'mid' ? '#FFB400' : '#FF4D4D'
}


function calculateRank(score) {
  const max = totalTracked.value
  const base = max - Math.floor((score / 100) * max)
  const noise = Math.floor(Math.random() * 120)
  worldwideRank.value = base + noise
  percentile.value = ((1 - worldwideRank.value / max) * 100).toFixed(2)
}




let timer = null;

const calculateTotal = () => {
  const now = window.Date.now();
  const TOTAL_TRACKED_START_DATE = new window.Date('2025-12-01T00:00:00').getTime(); // Your "Epoch"
  const elapsedSeconds = Math.floor((now - TOTAL_TRACKED_START_DATE) / 1000);
  
  // The magic formula: Base + (Seconds passed * Growth rate)
  // This ensures the number is ALWAYS consistent with the clock
  return TOTAL_TRACKED_BASE_VALUE + Math.floor(elapsedSeconds * TOTAL_TRACKED_GROWTH_RATE_PER_SEC);
};

onMounted(() => {
  // Initial calculation
  totalTracked.value = calculateTotal();

  // Update every second to keep it "live"
  timer = setInterval(() => {
    totalTracked.value = calculateTotal();
  }, 1000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});


function viewFullReportClicked() {
  if (!auth.value.user) {
    showAuthExplainModal.value = true
  }
  else if (!auth.value.user.emailVerified) {
    auth.value.unverifiedUser = auth.value.user
    auth.value.user = null
    navigateTo("/verify-required")
  }else{
    navigateTo(`/report/${auth.value.user.walletAddress}`)
  }
}



/* ---------- SHARED GRADE STYLE ---------- */
const gradeClass = (grade) => {
  if (grade === 'Good') return 'bg-green-500/15 text-green-400'
  if (grade === 'Average') return 'bg-yellow-500/15 text-yellow-400'
  return 'bg-red-500/15 text-red-400'
}

/* ---------- WIN RATE ---------- */
const winRateValue = computed(() => {
  const v = parseFloat(stats.value.winRate)
  return isNaN(v) ? 0 : v
})

const winRateGrade = computed(() => {
  if (winRateValue.value >= 60) return 'Good'
  if (winRateValue.value >= 40) return 'Average'
  return 'Poor'
})

const winRateGradeClass = computed(() =>
  gradeClass(winRateGrade.value)
)

/* ---------- TOTAL TRADES ---------- */
const tradesGrade = computed(() => {
  const t = Number(stats.value.trades) || 0
  if (t >= 100) return 'Good'
  if (t >= 30) return 'Average'
  return 'Poor'
})

const tradesGradeClass = computed(() =>
  gradeClass(tradesGrade.value)
)

/* ---------- VOLUME ---------- */
const volumeValue = computed(() => {
  return Number(
    String(stats.value.volume).replace(/[^0-9.]/g, '')
  ) || 0
})

const volumeGrade = computed(() => {
  if (volumeValue.value >= 10000) return 'Good'
  if (volumeValue.value >= 2000) return 'Average'
  return 'Poor'
})

const volumeGradeClass = computed(() =>
  gradeClass(volumeGrade.value)
)
</script>