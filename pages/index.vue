<template>
  <div>
    <Home />
  </div>
</template>

<script setup>
    import { getAddress, getIsConnected, subscribeState, openModal, disconnectWallet, getChainID, switchNetwork, getProvider, getWalletETHBalance } from '../../apiss/web3/walletconnect';
    import { create as saveAddressSignature, getAddressSignature, update as updateAddressSignature } from '../../apiss/walletSignature'

    const isOpen = ref(false)
    const props = defineProps(['page'])
    const auth = useAuth();

    onMounted(async() => {
        auth.value.isWalletConnected = getIsConnected();
        auth.value.walletAddress = getAddress();
        if (getAddress()) auth.value.addressSignature = await getAddressSignature(getAddress());
        listenToWalletStateChange()
    })

    function listenToWalletStateChange() {
        subscribeState()?.on('STATE_CHANGED', async events => {
            auth.value.isWalletConnected = getIsConnected();
            auth.value.walletAddress = getAddress();
          if (getAddress()) auth.value.addressSignature = await getAddressSignature(getAddress());
        });
    }
  
useHead({
  title: "Polyscore",
  link: [{ rel: 'icon', type: 'image/png', href: '/images/logo.svg' }],
  meta: [{ name: 'description', content: 'Analyze any Polymarket wallet on Polygon. Track trading performance, risk profile, win rate, volume, and whale activity with real on-chain data.' }]
});
</script>
