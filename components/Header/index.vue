<template>
  <!-- NAVBAR -->
  <header
    class="flex flex-col sm:flex-row items-start sm:items-center justify-between
           p-4 sm:p-6 bg-[#0D1117] border-b border-[#1F2530]
           gap-3 sm:gap-5 sticky top-0 z-10"
  >
    <!-- Brand -->
    <div class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
      <div class="text-blue-400 font-semibold text-lg sm:text-xl tracking-tight">
        Polyscore <span class="text-base sm:text-sm">🇺🇸</span>
      </div>
      <div class="text-gray-400 text-xs sm:text-sm">
        Powered by Polymarket
      </div>
    </div>

    <!-- Actions -->
    <div class="flex items-center gap-3 w-full sm:w-auto sm:ml-auto">
      <!-- Logged OUT -->
      <template v-if="!auth.user">
        <button
          @click="() => $emit('showLogin')"
          class="flex-1 sm:flex-none text-xs px-3 py-2 rounded-full
                 border border-[#3D6FFF]/60 text-[#7BA7FF]
                 hover:border-[#3D6FFF] hover:text-[#9DB7FF]
                 transition"
        >
          Sign In
        </button>

        <button
          @click="() => $emit('showSignup')"
          class="flex-1 sm:flex-none text-xs px-3 py-2 rounded-full
                 bg-[#3D6FFF] text-white
                 hover:bg-[#4A7BFF]
                 transition"
        >
          Sign Up
        </button>
      </template>

      <!-- Logged IN -->
      <template v-else>
        <!-- View Full Report (Classy CTA) -->
        <button
          @click="handlePrimaryAction"
          class="flex-1 sm:flex-none text-xs sm:text-sm px-4 py-2 rounded-full
                border border-[#1F3B8A] text-[#9DB7FF]
                bg-transparent
                hover:bg-[#111B3A]
                hover:border-[#3D6FFF]
                flex items-center
                transition-colors duration-200"
        >
          <ArrowLeft v-if="isReportPage" class="w-4 h-4 mr-1" />
          <FileText v-else class="w-4 h-4 mr-1" />

          {{ isReportPage ? 'Back to Home' : 'View Full Report' }}
        </button>


        <!-- User -->
        <div class="flex items-center gap-2 text-xs text-gray-400">
          <span class="hidden sm:inline max-w-[160px] truncate">
            {{ auth.user.email }}
          </span>
          <button
            @click="logout"
            class="text-red-400 hover:text-red-300 transition"
          >
            Logout
          </button>
        </div>
      </template>
    </div>
  </header>
</template>



<script setup>
import logout from '../../apiss/logout'
import { ArrowLeft, FileText } from 'lucide-vue-next'

const auth = useAuth()
const searchQuery = ref('')

const route = useRoute()
const router = useRouter()

const isReportPage = computed(() => {
  // adjust if your route name/path differs
  return route.name === 'report-wallet' || route.path.includes('/report')
})

function handlePrimaryAction() {
  if (isReportPage.value) {
    router.push('/')
  } else {
    viewFullReport()
  }
}


const viewFullReport = () => {
  const result = auth.value.user;
    if (!result.emailVerified) {
      auth.value.user = null
      auth.value.unverifiedUser = result
      return navigateTo("/verify-required")
    }
    navigateTo(`/report/${auth.value.user.walletAddress}`)

}

</script>