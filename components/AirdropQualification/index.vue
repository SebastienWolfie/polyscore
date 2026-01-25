<template>
  <div class="bg-[#0D1117] p-5 rounded-xl border border-[#1F2530] shadow-lg mt-6">
    <!-- HEADER -->
    <div class="mb-4">
      <div class="text-lg font-bold text-white">
        Polymarket Airdrop volume
      </div>
      <p class="text-xs sm:text-sm text-gray-400 mt-1">
        Airdrop volume is based on sustained on-chain activity. Using the platform regularly matters more than just wins.
      </p>
    </div>

    <!-- USER STATUS -->
    <div class="bg-[#11151D] p-4 rounded-lg border border-[#1F2530] mb-4">
      <div class="flex justify-between items-center">
        <div>
          <div class="text-xs text-gray-400">Your DeFi volume (USDC)</div>
          <div class="text-2xl font-extrabold text-[#7BA7FF]">
            ${{ formatMoney(balance) }}
          </div>
        </div>

        <div
          class="px-3 py-1 rounded-full text-xs font-semibold"
          :class="tier.badgeClass"
        >
          {{ tier.label }}
        </div>
      </div>

      <p class="text-xs text-gray-400 mt-2">
        {{ tier.description }}
      </p>
    </div>

    <!-- QUALIFICATION TABLE -->
    <div class="overflow-hidden rounded-lg border border-[#1F2530]">
      <table class="w-full text-xs sm:text-sm">
        <thead class="bg-[#0A0C10] text-gray-400">
          <tr>
            <th class="text-left px-3 py-2">USDC Volume</th>
            <th class="text-left px-3 py-2">volume Tier</th>
            <th class="text-left px-3 py-2">Assessment</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in tiers"
            :key="row.label"
            class="border-t border-[#1F2530]"
          >
            <td class="px-3 py-2 text-gray-300">{{ row.range }}</td>
            <td class="px-3 py-2 font-semibold text-gray-200">
              {{ row.label }}
            </td>
            <td class="px-3 py-2 text-gray-400">
              {{ row.tableDescription }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ACTIONABLE GUIDANCE -->
    <div class="mt-4 text-xs sm:text-sm text-gray-400">
      <span class="text-[#7BA7FF] font-semibold">How to improve volume:</span>
      Deposit and withdraw USDC regularly through vour DeFi wallet to increase vour DeFi Volume and improve your airdrop eligibility
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  balance: {
    type: Number,
    required: true
  }
})

const tiers = [
  {
    min: 50000,
    label: 'Strong DeFi volume',
    range: '≥ $50,000',
    badgeClass: 'bg-green-500/10 text-green-400',
    description:
      'Wallets in this range demonstrate strong DeFi capital commitment and are well positioned for potential airdrop inclusion.',
    tableDescription:
      'High likelihood if activity is sustained over time.'
  },
  {
    min: 25000,
    label: 'Moderate DeFi volume',
    range: '$25,000 – $50,000',
    badgeClass: 'bg-blue-500/10 text-blue-400',
    description:
      'Shows meaningful DeFi usage. Additional balance growth or consistency may improve volume.',
    tableDescription:
      'Reasonable chance with continued activity.'
  },
  {
    min: 10000,
    label: 'Emerging DeFi volume',
    range: '$10,000 – $25,000',
    badgeClass: 'bg-yellow-500/10 text-yellow-400',
    description:
      'Early-stage qualification. Increased capital or longer holding periods are recommended.',
    tableDescription:
      'Borderline volume; improvement recommended.'
  },
  {
    min: 0,
    label: 'Low DeFi volume',
    range: '< $10,000',
    badgeClass: 'bg-red-500/10 text-red-400',
    description:
      'Current DeFi exposure is limited. Increasing capital and usage is required to qualify.',
    tableDescription:
      'Unlikely under current conditions.'
  }
]

const tier = computed(() => {
  return tiers.find(t => props.balance >= t.min)
})

const formattedBalance = computed(() =>
  new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0
  }).format(props.balance)
)
</script>
