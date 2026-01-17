<!-- components/AuthExplainModal.vue -->
<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center">
    <!-- Backdrop -->
    <div
      class="absolute inset-0 bg-black/70"
      @click="$emit('close')"
    />

    <!-- Modal -->
    <div
      class="relative w-full max-w-md mx-4 rounded-xl bg-[#0D1117]
             border border-[#1F2530] shadow-2xl p-6"
    >
      <!-- Header -->
      <h3 class="text-xl font-bold text-white mb-2">
        Unlock Your Full Polyscore 🔍
      </h3>

      <p class="text-gray-400 text-sm mb-4">
        Create an account to access your complete on-chain intelligence report,
        including capital inflows, deposit activity, whale tracking, and
        advanced Polymarket metrics.
      </p>

      <!-- Feature list -->
      <ul class="space-y-2 text-sm text-gray-300 mb-6">
        <li>• DeFi capital inflow analysis</li>
        <li>• USDC deposit frequency & volume</li>
        <li>• Whale wallet tracking</li>
        <li>• Historical Polyscore breakdown</li>
      </ul>

      <!-- Actions -->
      <div class="flex flex-col gap-3">
        <button
          class="w-full text-center px-4 py-3 rounded-lg
                 bg-blue-600 hover:bg-blue-500 transition
                 text-white font-semibold"
          @click="() => $emit('registerClicked')"
        >
          Sign up & View Report
        </button>

        <button
          class="w-full text-center px-4 py-3 rounded-lg
                 border border-[#1F2530] hover:bg-white/5 transition
                 text-gray-300 font-semibold"
          @click="() => $emit('loginClicked')"
        >
          Already have an account? Sign in
        </button>
      </div>

      <!-- Close -->
      <button
        @click="$emit('close')"
        class="absolute top-3 right-3 text-gray-400 hover:text-white"
      >
        ✕
      </button>
    </div>
  </div>
</template>
