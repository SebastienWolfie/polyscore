import { createAppKit } from "@reown/appkit/vue";
import { polygon, mainnet } from "@reown/appkit/networks";
import { EthersAdapter } from "@reown/appkit-adapter-ethers";
import PubSub from "../../utils/PubSub";
import { BrowserProvider, ethers, Contract, formatUnits, parseEther } from 'ethers';



const metadata = {
  name: 'Polyscore',
  description: 'Analyze any Polymarket wallet on Polygon. Track trading performance, risk profile, win rate, volume, and whale activity with real on-chain data.',
  url: 'http://polyscore.net',
  icons: ['https://avatars.mywebsite.com/']
}


const modal = createAppKit({
  metadata,
  adapters: [new EthersAdapter()],
  networks: [polygon, mainnet],
  projectId: 'd718fafd88c8a9e914d1a469924af9f3',
  features: {
    socials: false,
    email: false
  }
})


async function checkModalStats(){
  console.log("Is modal connected:   ", modal.getIsConnected())
  console.log("Chain ID:   ", modal.getChainId())
  // console.log("Chain ID:   ", modal.disconnect())
  console.log("Modal Address:   ", modal.getAddress())
  // console.log("Wallet info:   ", modal.getWalletInfo())
  // console.log("Wallet provider:   ", modal.getWalletProvider())
  // console.log("Wallet provider:   ", modal.open())
  // modal.subscribeState(state => console.log("Wallet state:  ", state))
  // modal.subscribeWalletInfo(state => console.log("Wallet info:  ", state))

}


async function openModal() {
  return new Promise((resolve, reject) => {
      modal.open().then(resolve).catch(reject)
  })
}

async function closeModal() {
  return new Promise((resolve, reject) => {
      modal.close().then(resolve).catch(reject)
  })
}

async function disconnectWallet() {
  return new Promise((resolve, reject) => {
      modal.disconnect().then(resolve).catch(reject)
  })
}

function getAddress() {
  return modal.getAddress();
}

function getIsConnected() {
  return modal.getIsConnectedState()
}


async function getWalletETHBalance() {
  const provider = ethers.getDefaultProvider();
  return provider.getBalance(modal.getAddress()).then(result => (parseInt(result) / (10 ** 18)).toFixed(4))
}




async function switchNetwork(chainId) {
  return modal.switchNetwork((chainId==137) ? polygon : mainnet)
}

function getChainID() {
  return modal.getChainId()
}


function subscribeState() {
  const statePublisher = new PubSub();
  
  modal.subscribeAccount(state => {
    statePublisher.publish("STATE_CHANGED", state);
  })

  return statePublisher;
}


function getProvider() {
  return modal.getWalletProvider();
}

export {
  modal,
  checkModalStats,
  openModal,
  closeModal,
  getAddress,
  getIsConnected,
  disconnectWallet,
  getWalletETHBalance,
  subscribeState,
  getChainID,
  switchNetwork,
  getProvider
}