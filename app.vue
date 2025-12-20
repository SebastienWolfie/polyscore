<template>
  <div>
    <NuxtPage />
  </div>
</template>

<script setup>

useHead({
  title: "Polyscore",
  link: [{ rel: 'icon', type: 'image/png', href: '/images/logo.svg' }],
  meta: [{ name: 'description', content: 'Analyze any Polymarket wallet on Polygon. Track trading performance, risk profile, win rate, volume, and whale activity with real on-chain data.' }]
});

</script>