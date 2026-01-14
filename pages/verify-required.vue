<template>
<div class="min-h-screen bg-black flex items-center justify-center">
  <div class="bg-[#05070c] border border-white/10 rounded-xl p-10 max-w-md text-center">
    <h2 class="text-white text-2xl font-bold mb-4">
      Verify your email
    </h2>

    <p class="text-gray-400 mb-6">
      We've sent a verification link to <br>
      <span class="text-indigo-400 font-semibold">{{ auth.unverifiedUser?.email }}</span>
    </p>

    <button @click="resend"
      class="bg-indigo-500 w-full py-3 rounded-lg font-bold text-black">
      Resend verification email
    </button>
  </div>
</div>
</template>

<script setup>
const auth = useAuth()
const { sendConfirmAccountEmail } = useEmaiApi()

onMounted(() => {
    resend()
})

const resend = async () => {
  if (!auth.value.unverifiedUser) return
  await sendConfirmAccountEmail(
    auth.value.unverifiedUser.id,
    auth.value.unverifiedUser.email,
    auth.value.unverifiedUser.username,
    auth.value.unverifiedUser.walletAddress
  )
}
</script>
