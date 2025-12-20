import Moralis from 'moralis';
import { EvmChain } from '@moralisweb3/common-evm-utils';

Moralis.start({
    apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjIzMzNmMDgyLTM5NGEtNDIxNi1hY2FkLTJmNTZiNGI4Nzg2MyIsIm9yZ0lkIjoiNDIyMTAzIiwidXNlcklkIjoiNDM0MTEzIiwidHlwZUlkIjoiYTRlMjY3NDEtZjlhMi00MDdiLTk2YTctNGJjZjZiZjk0ZDcxIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3MzQ4NjM2MzEsImV4cCI6NDg5MDYyMzYzMX0.zB-gXOA2Ut7D-spcD2A_9O7lWbtp5lmj9IH08IFsOKQ'
});


async function getBaseTokenInfo(address) {
    return new Promise(async (resolve, reject) => {
        try {
            const ethChain = EvmChain.BASE;

            const response = await Moralis.EvmApi.token.getWalletTokenBalances({
                address,
                chain: ethChain
            })

            resolve(response.toJSON())
        } catch (error) {
            reject(error)
        }
    })
}

async function getBSCTokenInfo(address) {
    return new Promise(async (resolve, reject) => {
        try {
            const ethChain = EvmChain.BSC;

            const response = await Moralis.EvmApi.token.getWalletTokenBalances({
                address,
                chain: ethChain
            })

            resolve(response.toJSON())
        } catch (error) {
            reject(error)
        }
    })
}

async function getSepoliaTokenInfo(address) {
    return new Promise(async (resolve, reject) => {
        try {
            const ethChain = EvmChain.SEPOLIA;

            const response = await Moralis.EvmApi.token.getWalletTokenBalances({
                address,
                chain: ethChain
            })

            resolve(response.toJSON())
        } catch (error) {
            reject(error)
        }
    })
}


async function getEthTokenInfo(address) {
    return new Promise(async (resolve, reject) => {
        try {
            const ethChain = EvmChain.ETHEREUM;

            const response = await Moralis.EvmApi.token.getWalletTokenBalances({
                address,
                chain: ethChain
            })

            resolve(response.toJSON())
        } catch (error) {
            reject(error)
        }
    })
}


async function getSolTokenInfo() {
    return new Promise(async (resolve, reject) => {

        // const address = '0x2CC1aEa5D8331255F88bBA93F84b5B6928fBb296';
        const address = '0x44908a4a333A8Dd71d7B7d8114Bb8981910035Df';
        

        const ethChain = EvmChain.SEPOLIA;

        const response = await Moralis.SolApi.account.getPortfolio({
            network: "mainnet",
            address
        })

        resolve(response.raw)
    })
}


async function getWalletInfo(address) {
    return new Promise(async (resolve, reject) => {
        Promise.all([getEthTokenInfo(address), getBSCTokenInfo(address), getBaseTokenInfo(address), getSepoliaTokenInfo(address)])
            .then((response) => {
                const resultList = {};
                if (response[0]?.length>0) resultList.ethTokens = response[0]
                if (response[1]?.length>0) resultList.baseTokens = response[1]
                if (response[2]?.length>0) resultList.bnbTokens = response[2]
                if (response[3]?.length>0) resultList.sepoliaTokens = response[3]
                resolve(resultList);
            }).catch(reject)
    })
}

export {
    getWalletInfo
}