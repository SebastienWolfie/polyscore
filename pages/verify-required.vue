<template>
  <div class="min-h-screen bg-[#0A0C10] flex items-center justify-center px-4">
    <div
      class="w-full max-w-md bg-[#0D1117] border border-[#1F2530] rounded-2xl p-6 sm:p-8 shadow-xl"
    >
      <!-- HEADER -->
      <div class="text-center mb-6">
        <div
          class="mx-auto w-12 h-12 rounded-full bg-[rgba(61,111,255,0.12)] border border-[#3D6FFF] flex items-center justify-center mb-4"
        >
          📩
        </div>

        <h2 class="text-xl sm:text-2xl font-bold text-white">
          Verify your email address
        </h2>

        <p class="text-gray-400 text-sm mt-2 leading-relaxed">
          To access your full Polyscore report and on-chain analytics, please
          verify the email associated with your account.
          <span class="block mt-1 text-gray-300">
            If you don’t see the email, please check your spam or junk folder.
          </span>
        </p>

      </div>

      <!-- EMAIL INFO -->
      <div
        class="bg-[#11151D] border border-[#1F2530] rounded-xl p-4 text-center mb-6"
      >
        <div class="text-xs text-gray-400 mb-1">Verification email will be sent to</div>
        <div class="text-sm font-semibold text-[#7BA7FF] break-all">
          {{ auth.unverifiedUser?.email }}
        </div>
      </div>

      <!-- ACTIONS -->
      <div class="space-y-3">
        <!-- SEND BUTTON -->
        <button
          @click="resend"
          :disabled="isSending"
          class="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all"
          :class="isSending
            ? 'bg-[#1F2530] text-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-[#3D6FFF] to-[#7BA7FF] text-white hover:shadow-lg hover:shadow-blue-500/30'"
        >
          <span
            v-if="isSending"
            class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
          ></span>

          <span>
            {{ isSending ? 'Sending verification email…' : 'Send verification email' }}
          </span>
        </button>

        <!-- STATUS MESSAGE -->
        <p v-if="sent" class="text-xs text-center text-green-400">
          Verification email sent successfully. Please check your inbox.
        </p>

        <!-- LOGOUT -->
        <button
          @click="logoutClicked"
          :disabled="isLoggingOut"
          class="w-full rounded-xl px-4 py-3 text-sm font-semibold border border-[#1F2530] bg-[#11151D] text-gray-300 hover:text-white hover:border-[#3D6FFF] transition"
        >
          {{ isLoggingOut ? 'Logging out…' : 'Logout' }}
        </button>
      </div>

      <!-- FOOTER -->
      <div class="mt-6 text-center text-[11px] text-gray-500 leading-relaxed">
        Didn’t receive the email? Check your spam folder or resend the verification.
        <br />
        Email verification is required to unlock advanced analytics and airdrop eligibility.
      </div>
    </div>
  </div>
</template>

<script setup>
import logout from '../apiss/logout'

const auth = useAuth()
const { sendConfirmAccountEmail } = useEmaiApi()

const isSending = ref(false)
const isLoggingOut = ref(false)
const sent = ref(false)

async function resend() {
  if (!auth.value?.unverifiedUser || isSending.value) return

  try {
    isSending.value = true
    sent.value = false

    await sendConfirmAccountEmail(
      auth.value.unverifiedUser.id,
      auth.value.unverifiedUser.email,
      auth.value.unverifiedUser.username,
      auth.value.unverifiedUser.walletAddress
    )

    sent.value = true
  } catch (e) {
    console.error(e)
  } finally {
    isSending.value = false
  }
}

async function logoutClicked() {
  if (isLoggingOut.value) return
  isLoggingOut.value = true

  await logout()
  navigateTo('/')
}
</script>
