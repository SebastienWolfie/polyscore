import { ethers } from 'ethers';
import axios from "axios";
import { getIsConnected, getChainID, getProvider } from '../walletconnect'
import { BrowserProvider, Contract, formatEther, parseEther, Signature } from 'ethers';
import { contractABI as tokenABI } from '../constants/estatex'


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

async function getETHBalance(address) {
    return new Promise(async (resolve, reject) => {
        try {
            const provider = new ethers.JsonRpcProvider("https://eth-mainnet.g.alchemy.com/v2/Y8ew7o5gjdFDCO698pASWL1GgPGasOmj");
            const balance = await provider.getBalance(address).then(result => (parseInt(result) / (10 ** 18)).toFixed(4)) 
            // console.log("Eth Balance", address, balance)
            resolve(balance)
        } catch (error) {
            console.log(error)
            resolve(0)
        }
    })
}

async function getSepoliaBalance(address) {
    return new Promise(async (resolve, reject) => {
        try {
            const provider = new ethers.JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/Y8ew7o5gjdFDCO698pASWL1GgPGasOmj");
            // const provider = new ethers.JsonRpcProvider("https://sepolia.gateway.tenderly.co");
            const balance = await  provider.getBalance(address).then(result => (parseInt(result) / (10 ** 18)).toFixed(4))
            // console.log("Sepolia Balance", balance)
            
            resolve(balance)
        } catch (error) {
            console.log(error)
            resolve(0)
        }

    })

}

async function getBSCBalance(address) {
    return new Promise(async (resolve, reject) => {
        try {
            const provider = new ethers.JsonRpcProvider("https://bsc-dataseed.binance.org/");
            const balance = await  provider.getBalance(address).then(result => (parseInt(result) / (10 ** 18)).toFixed(4))
            resolve(balance)
        } catch (error) {
            console.log(error)
            resolve(0)
        }
    })

}

async function getBaseBalance(address) {
    return new Promise(async (resolve, reject) => {
        try {
            const network = 'base';
            const provider = ethers.getDefaultProvider(network);
            const balance = await  provider.getBalance(address).then(result => (parseInt(result) / (10 ** 18)).toFixed(4))
            resolve(balance)
        } catch (error) {
            console.log(error)
            resolve(0)
        }
    })

}





// Function to get Token Prices from CoinGecko
async function getTokenPrices(tokens) {
    const COINGECKO_URL = "https://api.coingecko.com/api/v3/simple/price";
    try {
      const symbols = tokens.map((t) => t.metadata.symbol.toLowerCase()).join(",");
      
      const priceRes = await axios.get(`${COINGECKO_URL}?ids=${symbols}&vs_currencies=usd`);
  
      return tokens.map((token) => ({
        ...token,
        price: priceRes.data[token.metadata.symbol.toLowerCase()]?.usd || 0,
      }));
    } catch (error) {
      console.error("Error fetching token prices:", error.message);
      return tokens;
    }
  }

  async function getTokenInfo(address, chain_id) {
    console.log("getTokenInfo", address, chain_id)
    const API_KEY = "Y8ew7o5gjdFDCO698pASWL1GgPGasOmj";
    const WALLET_ADDRESS = address;

    return new Promise(async(resolve, reject) => {
        let URL = ''
        if (chain_id == 1) URL = `https://eth-mainnet.g.alchemy.com/v2/${API_KEY}`;
        else if (chain_id == 11155111) URL = `https://eth-sepolia.g.alchemy.com/v2/${API_KEY}`;
        else if (chain_id == 137) URL = `https://polygon-mainnet.g.alchemy.com/v2/${API_KEY}`;
        else if (chain_id == 56) URL = `https://bnb-mainnet.g.alchemy.com/v2/${API_KEY}`;
        else {
            reject('Unsupported chain')
            return;
        }

        try {
            const balanceRes = await axios.post(URL, {
                jsonrpc: "2.0",
                method: "alchemy_getTokenBalances",
                params: [WALLET_ADDRESS, "erc20"],
                id: 1,
            });
        
            const balances = balanceRes.data.result.tokenBalances;
        
            // Step 2: Fetch metadata for each token
            const metadataPromises = balances.map(async (token) => {
                const metadataRes = await axios.post(URL, {
                jsonrpc: "2.0",
                method: "alchemy_getTokenMetadata",
                params: [token.contractAddress],
                id: 1,
                });
        
                return {
                contractAddress: token.contractAddress,
                balance: token.tokenBalance,
                metadata: metadataRes.data.result, // Name, Symbol, Decimals, Logo
                };
            });


            const tokensWithMetadata = await Promise.all(metadataPromises);
            // console.log("tokensWithMetadata", address, chain_id, tokensWithMetadata)

            let result = await getTokenPrices(tokensWithMetadata) || [];
            // console.log("getTokenPrices", address, chain_id, tokensWithMetadata)


            result = result.map(i => {
                return {
                    token_address: i.contractAddress,
                    price: i.price,
                    balance: BigInt(i.balance).toString(),
                    decimals: i.metadata.decimals,
                    name: i.metadata.name,
                    symbol: i.metadata.symbol,
                    chainID: chain_id,
                    isNative: false
                }
            })
            resolve(result)

        } catch (error) {
            console.error("Error fetching tokens:", error.message);
            reject(error)
        }
    })
    
  }

async function getWalletInfo(address) {
    console.log('Starting get wallet info')
    return new Promise(async (resolve, reject) => {
        Promise.all([
                    getTokenInfo(address, 1), //ETH
                    getTokenInfo(address, 137), //Polygon
                    // getTokenInfo(address, 56), //BSC
                    // getTokenInfo(address, 11155111), //Sepolia
                    getETHBalance(address),
                    // getBSCBalance(address),
                    // getBaseBalance(address),
                    getSepoliaBalance(address)
                ])
            .then(async (response) => {
                const resultList = {};
                if (response[0]?.length>0) resultList.ethTokens = sortPrices(response[0])
                if (response[1]?.length>0) resultList.polyTokens = sortPrices(response[1])
                console.log(address, resultList.polyTokens)
                // if (response[1]?.length>0) resultList.baseTokens = sortPrices(response[1])
                // if (response[2]?.length>0) resultList.bnbTokens = sortPrices(response[2])
                resultList.ethBalance = response[2]
                // resultList.bscBalance = response[4]
                // resultList.baseBalance = response[5]
                resultList.sepoliaBalance = response[3]

                console.log("resolving", resultList)
                return resultList
            })
            .then(async (result) => {
                const ethPrice = (await getTokenPrices([{metadata: {symbol: 'weth'}}]))[0].price
                // const bscPrice = (await getTokenPrices([{metadata: {symbol: 'wbnb'}}]))[0].price
                
                let newList = [];

                if (result.ethBalance > 0) newList.push({
                    // token_address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
                    price: ethPrice,
                    balance: result.ethBalance,
                    decimals: 1,
                    name: 'Ether',
                    chainID: 1,
                    isNative: true
                })
                // if (result.bscBalance > 0) newList.push({
                //     // token_address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
                //     price: bscPrice,
                //     balance: result.bscBalance,
                //     decimals: 1,
                //     name: 'BNB',
                //     chainID: 56,
                //     isNative: true
                // })
                if (result.sepoliaBalance > 0) newList.push({
                    price: ethPrice,
                    // balance: result.sepoliaBalance,
                    balance: 0.003,
                    decimals: 1,
                    name: 'Sepolia',
                    chainID: 11155111,
                    isNative: true
                })

                if (result.ethTokens?.length > 0) newList = [...newList, ...result.ethTokens]
                // if (result.baseTokens?.length > 0) newList = [...newList, ...result.baseTokens]
                // if (result.bnbTokens?.length > 0) newList = [...newList, ...result.bnbTokens]
                if (result.polyTokens?.length > 0) newList = [...newList, ...result.polyTokens]

                resolve(sortPrices(newList))
            })
            .catch(reject)
    })
}




function sortPrices(arr) {
    return arr.sort((a, b) => {
        let bResult = (b.balance/(10 ** b.decimals)) * b.price;
        let aResult = (a.balance/(10 ** a.decimals)) * a.price;
        return bResult - aResult
    });
}



function getTokenBalance(contractAddress, owner) {
    return new Promise(async(resolve, reject) => {
        try {
            const contract = await getEthereumContract(contractAddress, tokenABI);
            const balance = await contract.balanceOf(owner);
            resolve(formatEther(balance))
        } catch (error) {
            resolve(0);
            console.log(error)
        }
    })
}

export {
    getWalletInfo,
    getTokenPrices,
    getTokenBalance,
    getETHBalance
}