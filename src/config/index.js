import DiceABI from '../abi/Dice.json';
import TokenABI from '../abi/Token.json';

const validateEnvVar = (name, value, required = false) => {
  if (!value && required) {
    console.warn(`Missing environment variable: ${name}, using fallback value`);
  }
  return value || '';
};

// Network configurations
export const SUPPORTED_NETWORKS = {
  SEPOLIA: {
    chainId: 11155111,
    name: 'Sepolia',
    rpcUrls: [
      validateEnvVar('SEPOLIA_TESTNET_RPC', import.meta.env.SEPOLIA_TESTNET_RPC),
      'https://eth-sepolia.g.alchemy.com/v2/tha8qgVwehSf9EJLAT_qDNfbiFL7lGP5'
    ],
    blockExplorer: validateEnvVar('VITE_EXPLORER_URL', import.meta.env.VITE_EXPLORER_URL),
  }
};

// Contract configuration
export const contracts = {
  dice: {
    address: validateEnvVar('VITE_DICE_GAME_ADDRESS', import.meta.env.VITE_DICE_GAME_ADDRESS),
    abi: DiceABI.abi,
  },
  token: {
    address: validateEnvVar('VITE_TOKEN_ADDRESS', import.meta.env.VITE_TOKEN_ADDRESS),
    abi: TokenABI.abi,
  },
};

// VRF Configuration
export const vrfConfig = {
  coordinator: validateEnvVar('CHAIN_LINK_VRF_COORDINATOR', import.meta.env.CHAIN_LINK_VRF_COORDINATOR),
  keyHash: validateEnvVar('CHAIN_LINK_KEY_HASH', import.meta.env.CHAIN_LINK_KEY_HASH),
  subscriptionId: validateEnvVar('CHAIN_LINK_SUBSCRIPTION_ID', import.meta.env.CHAIN_LINK_SUBSCRIPTION_ID),
  callbackGasLimit: parseInt(validateEnvVar('CHAIN_LINK_CALLBACKGASLIMIT', import.meta.env.CHAIN_LINK_CALLBACKGASLIMIT)),
  requestConfirmations: parseInt(validateEnvVar('CHAIN_LINK_REQUESTCONFIRMATIONS', import.meta.env.CHAIN_LINK_REQUESTCONFIRMATIONS)),
  numWords: parseInt(validateEnvVar('CHAIN_LINK_NUMWORDS', import.meta.env.CHAIN_LINK_NUMWORDS)),
};

// Game Configuration
export const gameConfig = {
  minBet: validateEnvVar('VITE_MIN_BET', import.meta.env.VITE_MIN_BET) || '0.01',
  maxBet: validateEnvVar('VITE_MAX_BET', import.meta.env.VITE_MAX_BET) || '1',
  defaultHouseEdge: validateEnvVar('VITE_HOUSE_EDGE', import.meta.env.VITE_HOUSE_EDGE) || '5',
  pollingInterval: 5000, // 5 seconds
  transactionTimeout: 30000, // 30 seconds
};