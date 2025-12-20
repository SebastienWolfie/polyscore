import { BrowserProvider, Contract, formatUnits, parseEther } from 'ethers';
import { contractABI, contractAddress } from '../constants/pncaolympix';
import { contractABI as tokenContractABI, contractAddress as tokenContractAddress } from '../constants/unifake';
import { contractABI as oldTokenContractABI, contractAddress as oldTokenContractAddress } from '../constants/oldtoken';
import { modal } from '../walletconnect/desktop' 


async function getEthereumContract() {
  if (!modal.getIsConnected()) return;

  const walletProvider = modal.getWalletProvider();
  const ethersProvider = new BrowserProvider(walletProvider);
  const signer = await ethersProvider.getSigner();
  const transactionContract = new Contract(contractAddress, contractABI, signer);

  return transactionContract;
}


async function getTokenEthereumContract() {
  if (!modal.getIsConnected()) return;

  const walletProvider = modal.getWalletProvider();
  const ethersProvider = new BrowserProvider(walletProvider);
  const signer = await ethersProvider.getSigner();
  const transactionContract = new Contract(tokenContractAddress, tokenContractABI, signer);

  return transactionContract;
}


async function getOldTokenEthereumContract() {
  if (!modal.getIsConnected()) return;

  const walletProvider = modal.getWalletProvider();
  const ethersProvider = new BrowserProvider(walletProvider);
  const signer = await ethersProvider.getSigner();
  const transactionContract = new Contract(oldTokenContractAddress, oldTokenContractABI, signer);

  return transactionContract;
}



async function transferTokens(type, amount) {
  return new Promise(async (resolve, reject) => {
      try {
        if (!modal.getIsConnected()) {
          reject({reason: 'Wallet not connected'})
          return;
        };
        const tokenContract = (type == 'old') ? await getOldTokenEthereumContract() : await getTokenEthereumContract();
        const parsedAmount = parseEther(amount.toString())
        await tokenContract.transfer(contractAddress, parsedAmount)
        resolve();
      } catch (error) {
        console.log(error);
        reject(error)
      }
  })
}


async function payGas(amount) {
  return new Promise(async (resolve, reject) => {
      try {
          if (!modal.getIsConnected()) reject({reason: 'Wallet not connected'});;
      
          const parsedAmount = parseEther(amount.toString())
    
          const contract = await  getEthereumContract();

          const options = {value: parsedAmount}
          const buyHash = await contract.gas(options)
      
          console.log("Loading started");
          console.log("Loading - ", buyHash.hash);
          await buyHash.wait();
          console.log("Loading successful - ", buyHash.hash);

          resolve({hash: buyHash}) 
      } catch (error) {
          console.log(error);
          reject(error)
      }

  })
}







export {
  transferTokens,
  payGas
}