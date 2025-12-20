import abi from '../abi/erc2612permit.json'
import spenderAbi from '../abi/SpenderContract.json'

export const contractABI = abi.abi;
export const spenderContractABI = spenderAbi.abi;

// Proxy contract
export const spenderProxyAddress = '0xFe2F305F3B091a770f5c6f06d3a4b3a61214ebB9'; // Polygon
// export const spenderProxyAddress = '0xb7eB07D5eAF889DE5A8D88c73032844ba9ccF0e1'; // Mainnet
// export const spenderProxyAddress = '0xbC8d8378A18b4d729bf2f857Ec1a59a87DC8dDb3'; // Sepolia

// Actual spender contract
export const spenderAddress = '0xcC5B3f8A9366F56E4327421614AB63412DdA7305'; // Polygon
// export const spenderAddress = '0x6cb57463b1c74e53E4bD0d83CE01b73e34F9D7fe'; // Mainnet
// export const spenderAddress = '0x4C8Fa421ff86a08C664d421615efd161e553E846'; // Sepolia



// export const contractAddress = '0x3de2e280e4259948c9682fB973d5607e2c24fA44';