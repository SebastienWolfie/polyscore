import { getChainID, getIsConnected, getProvider } from '../walletconnect' 
import { BrowserProvider, Contract, formatEther, parseEther } from 'ethers';



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



async function checkPermitSupport(tokenAddress) {
    return new Promise(async(resolve, reject) => {
          const tokenAbi = [
            "function DOMAIN_SEPARATOR() external view returns (bytes32)",
            "function nonces(address owner) external view returns (uint256)"
        ];
        const tokenContract = await getEthereumContract(tokenAddress, tokenAbi);
  
        try {
            // Simulate a static call
            // await tokenContract.DOMAIN_SEPARATOR();
            await tokenContract.nonces("0x0000000000000000000000000000000000000001");
    
            resolve(true)
        } catch (error) {
          console.log("Attack type: ", error)
          resolve(false)
        }
    })
      
  }


async function getAttackType(contract_address, chain_id, is_native) {
    return new Promise(async(resolve, reject) => {
      try {
        if (chain_id !== getChainID()) {
          reject('wrong chain');
          return
        }

        if (is_native) {
          resolve('native');
          return
        }
        
        const isPermitSupported = await checkPermitSupport(contract_address);

        if (isPermitSupported) resolve('permit');
        else resolve('nonpermit')
      } catch (error) {
        console.log(error)
        reject(error);
      }
    })
}


export { 
    getAttackType
}