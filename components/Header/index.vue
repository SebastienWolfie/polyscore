<template>
      <!-- NAVBAR -->
    <header
      class="flex flex-col sm:flex-row items-start justify-between sm:items-center p-4 sm:p-6 bg-[#0D1117] border-b border-[#1F2530] gap-3 sm:gap-5 sticky top-0 z-10"
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


      <!-- <p class="text-blue-400 cursor-pointer" @click="() => $emit("showLearnModal")">Learn more</p> -->

      <div v-if="!auth.user" class="flex gap-3">
        <button @click="() => $emit('showLogin')" class="text-xs px-3 py-1 rounded-full border border-[#3D6FFF] text-[#7BA7FF]">
          Sign In
        </button>
        <button @click="() => $emit('showSignup')" class="text-xs px-3 py-1 rounded-full bg-[#3D6FFF] text-white">
          Sign Up
        </button>
      </div>

      <div v-else class="flex items-center gap-3 text-xs text-gray-400">
        <span>{{ auth.user.email }}</span>
        <button @click="logout" class="text-red-400">Logout</button>
      </div>

    </header>
</template>

<script setup>
import logout from '../../apiss/logout'

const auth = useAuth()
const searchQuery = ref('')
</script>