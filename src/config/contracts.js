import DiceABI from '../abis/Dice.json';
import TokenABI from '../abis/Token.json';

export const contractConfig = {
  dice: {
    address: import.meta.env.VITE_DICE_CONTRACT_ADDRESS,
    abi: DiceABI.abi
  },
  token: {
    address: import.meta.env.VITE_TOKEN_CONTRACT_ADDRESS,
    abi: TokenABI.abi
  }
};

export const networkConfig = {
  chainId: import.meta.env.VITE_CHAIN_ID || '11155111',
  rpcUrl: import.meta.env.VITE_RPC_URL || 'https://rpc.sepolia.org',
  blockExplorer: import.meta.env.VITE_BLOCK_EXPLORER || 'https://sepolia.etherscan.io',
  networkName: 'Sepolia Test Network'
}; 