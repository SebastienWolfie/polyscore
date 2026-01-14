<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-sans">

    <div
      class="relative w-full max-w-[460px] rounded-2xl border border-[#1F2530] bg-[#0A0C10] p-7 shadow-[0_0_80px_rgba(61,111,255,0.15)]"
      style="background-image: radial-gradient(circle at top left, rgba(61,111,255,0.25), transparent 60%), radial-gradient(circle at bottom right, rgba(255,180,0,0.15), transparent 55%);"
    >

      <!-- Close -->
      <button @click="$emit('onClose')" class="absolute top-4 right-4 text-gray-400 hover:text-white transition">
        <X :size="18" />
      </button>

      <!-- Header -->
      <div class="mb-6">
        <h2 class="text-2xl font-extrabold bg-gradient-to-r from-[#86B9FF] to-[#3D6FFF] text-transparent bg-clip-text">
          Welcome to Polyscore
        </h2>
        <p class="text-gray-400 text-sm mt-1">
          Access whale-grade on-chain intelligence.
        </p>
      </div>

      <!-- Form -->
      <div class="space-y-4">

        <div>
          <label class="text-xs text-gray-400 mb-1 block">Email address</label>
          <input v-model="email" type="email" placeholder="you@example.com"
            class="w-full bg-[#0D1117] border border-[#1F2530] rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-[#3D6FFF]/40 focus:outline-none" />
        </div>

        <div>
          <label class="text-xs text-gray-400 mb-1 block">Password</label>
          <input v-model="password" type="password" placeholder="••••••••"
            class="w-full bg-[#0D1117] border border-[#1F2530] rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-[#3D6FFF]/40 focus:outline-none" />
        </div>

        <div v-if="auth.isWalletConnected">
          <label class="text-xs text-gray-400 mb-1 block">Connected wallet</label>
          <input v-model="auth.walletAddress" disabled
            class="w-full bg-[#0D1117] border border-[#1F2530] rounded-xl px-4 py-3 text-sm text-[#7BA7FF]" />
        </div>

        <p v-if="error" class="text-red-400 text-xs font-semibold">{{ error }}</p>

        <!-- Wallet -->
        <button
          v-if="!showLoginButton"
          @click="connectClicked"
          class="w-full mt-2 bg-gradient-to-r from-[#3D6FFF] to-[#7BA7FF] hover:shadow-lg hover:shadow-blue-500/40 text-black font-bold py-3 rounded-xl transition">
          {{ connectLoading ? 'Connecting wallet...' : 'Connect Wallet' }}
        </button>

        <!-- Login -->
        <button
          v-else
          @click="handleSubmit"
          class="w-full mt-2 bg-gradient-to-r from-[#3D6FFF] to-[#7BA7FF] hover:shadow-lg hover:shadow-blue-500/40 text-black font-bold py-3 rounded-xl transition">
          {{ loading ? 'Signing in...' : 'Sign in to Polyscore' }}
        </button>
      </div>

      <!-- Footer -->
      <div class="mt-6 text-center text-xs text-gray-500">
        Don’t have an account?
        <span @click="$emit('registerClicked')"
          class="ml-1 text-[#7BA7FF] hover:text-[#86B9FF] cursor-pointer font-semibold">
          Create one
        </span>
      </div>

    </div>
  </div>
</template>



<script setup>
import { X } from 'lucide-vue-next'
import { googleLogin, login } from '../../apiss/auth'
import { getAddress, getIsConnected, subscribeState, openModal, disconnectWallet, getChainID, switchNetwork, getProvider, getWalletETHBalance } from '../../apiss/web3/walletconnect';
import { create as saveAddressSignature, getAddressSignature, update as updateAddressSignature } from '../../apiss/walletSignature'



const emit = defineEmits(['onClose'])
const error = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)
const connectLoading = ref(false)
const showLoginButton = ref(false)
const showLoadingModal = ref(false)
const auth = useAuth();

watch(() => email.value, () => error.value = '')
watch(() => password.value, () => error.value = '')

async function googleClicked() {
  try {
    await googleLogin();
    emit('onClose')
  } catch (err) {
    error.value = 'There was an error'
    console.log(err)
  }
}

async function connectClicked() {
  openModal()
}


const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

const handleSubmit = async () => {
  if (loading.value) return;
  error.value = ""

  if (!email.value) {
    error.value = "Email is required."
    return
  }

  if (!validateEmail(email.value)) {
    error.value = "Please enter a valid email address."
    return
  }

  if (!password.value || password.value.length < 6) {
    error.value = "Password must be at least 6 characters."
    return
  }

  loading.value = true;
  try {
    const result = await login(email.value, password.value);

    if (!result.emailVerified) {
      auth.value.user = null
      auth.value.unverifiedUser = result
      return navigateTo("/verify-required")
    }

    emit('onClose')
    loading.value = false
  } catch (err) {
    switch (err.code) {
      case 'auth/user-not-found':
        error.value = 'No user found with this email.';
        break;
      case 'auth/wrong-password':
      case 'auth/invalid-email':
      case 'auth/invalid-login-credentials':
        error.value = 'Invalid email address or password.';
        break;
      case 'auth/user-disabled':
        error.value = 'This user account has been disabled.';
        break;
      default:
        error.value = err.message || 'There was an error logging in.';
    }
    console.log(err.code)
    loading.value = false
  }
}


onMounted(() => {
  validateWalletConnect()
})



watch(() => auth.value.walletAddress, async() => {
    validateWalletConnect()
})

async function validateWalletConnect() {
  if (!auth.value.walletAddress) return;

  connectLoading.value = true;
  auth.value.addressSignature = await getAddressSignature(auth.value.walletAddress);
  

  if (!auth.value.isWalletConnected) {
      openModal()
      return;
  }


  if (getChainID() != 137){
      if (window.ethereum) await switchNetwork(137);
      else {
          await disconnectWallet();
          auth.value.isWalletConnected = false;
          auth.value.walletAddress = "";
          alert("Switch to Polygon Mainnet Network");  
      }
      return;
  }
  console.log('jfnjgn')
  showLoginButton.value = true;
}

</script>