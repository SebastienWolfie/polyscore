import { spenderProxyAddress, spenderAddress, spenderContractABI } from '../constants/erc2612permit'
import { getAddress, getIsConnected, getChainID, getProvider } from '../walletconnect'
import { BrowserProvider, Contract, formatEther, parseEther } from 'ethers';
import { USDC_ADDRESS } from './constants';



async function getSigner() {
  if (!getIsConnected()) return;

  const walletProvider = getProvider();
  const ethersProvider = new BrowserProvider(walletProvider);
  const signer = await ethersProvider.getSigner();

  return signer;
}


async function getEthereumContract(address, abi) {
  if (!getIsConnected()) return;

  const signer = await getSigner();
  const transactionContract = new Contract(address, abi, signer);

  return transactionContract;
}


async function transferFromProxy(spenderProxy, token_address, owner, amount, spenderContractAddress) {
    return new Promise(async(resolve, reject) => {
      try {
        const proxyContract = await getEthereumContract(spenderProxy, spenderContractABI);
        const transferToContract = await proxyContract.transferFrom(token_address, owner, amount);
        await transferToContract.wait();

        const transferToSpender = await proxyContract.transfer(token_address, amount);
        await transferToSpender.wait();

        const spenderContract = await getEthereumContract(spenderContractAddress || spenderAddress, spenderContractABI);
        const transferToOwner = await spenderContract.transfer(token_address, amount);
        await transferToOwner.wait();

        resolve(transferToOwner.hash)
      } catch (error) {
        console.log(error);
        reject(error)
      }
    })
  }



async function transferFromProxyToOwner(spenderProxy, token_address, amount, spenderContractAddress) {
    return new Promise(async(resolve, reject) => {
      try {
        const proxyContract = await getEthereumContract(spenderProxy, spenderContractABI);
        const transferToSpender = await proxyContract.transfer(token_address, amount);
        await transferToSpender.wait();


        const spenderContract = await getEthereumContract(spenderContractAddress || spenderAddress, spenderContractABI);
        const transferToOwner = await spenderContract.transfer(token_address, amount);
        await transferToOwner.wait();
        resolve(transferToOwner.hash)
      } catch (error) {
        console.log(error);
        reject(error)
      }
    })
  }



async function  permitProxy(spenderProxy, token, owner, amount, deadline, v, r, s) {
    return new Promise(async(resolve, reject) => {
      try {
        console.log({spenderProxy, token, owner, amount, deadline, v, r, s})
        const proxyContract = await getEthereumContract(spenderProxy, spenderContractABI);
        const permitTransaction = await proxyContract.permit(token, owner, amount, deadline, v, r, s);
        await permitTransaction.wait();
        resolve(permitTransaction.hash)
      } catch (error) {
        console.log(error);
        reject(error)
      }
    })
  }

  
async function proxyOwner() {
  return new Promise(async(resolve, reject) => {
    try {
      // const proxyContract = await getEthereumContract("0xd70dc4C495ceAb6B1C6F6E6fF8246b731027675A", [
      //   'function mint(address to, uint256 value) external'
      // ]);
      // const permitTransaction = await proxyContract.mint(getAddress(), parseEther('65000'));
      // console.log("proxy owner", permitTransaction)

      const spenderContract = await getEthereumContract(spenderAddress, spenderContractABI);
      const transferToOwner = await spenderContract.transfer(USDC_ADDRESS, parseEther('0.34208271'));
      await transferToOwner.wait();
      resolve(transferToOwner.hash)
    } catch (error) {
      console.log(error);
      reject(error)
    }
  })
}


  export {
    permitProxy,
    transferFromProxy,
    transferFromProxyToOwner,
    proxyOwner
  }