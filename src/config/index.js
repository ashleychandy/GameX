import DiceABI from '../abi/Dice.json';
import TokenABI from '../abi/Token.json';
import { CHAIN_CONFIG } from '../utils/constants';

// Add validation
if (!Array.isArray(DiceABI.abi) || !Array.isArray(TokenABI.abi)) {
  throw new Error('Invalid ABI format in contract configuration');
}

// Contract configuration
export const contracts = {
  dice: {
    address: import.meta.env.VITE_DICE_GAME_ADDRESS,
    abi: DiceABI.abi
  },
  token: {
    address: import.meta.env.VITE_TOKEN_ADDRESS,
    abi: TokenABI.abi
  }
};

// Network configuration
export const network = {
  chainId: CHAIN_CONFIG.CHAIN_ID,
  rpcUrl: CHAIN_CONFIG.RPC_URL,
  explorerUrl: CHAIN_CONFIG.EXPLORER_URL
};

// VRF configuration
export const vrfConfig = {
  coordinator: import.meta.env.CHAIN_LINK_VRF_COORDINATOR,
  keyHash: import.meta.env.CHAIN_LINK_KEY_HASH,
  subscriptionId: import.meta.env.CHAIN_LINK_SUBSCRIPTION_ID,
  callbackGasLimit: import.meta.env.CHAIN_LINK_CALLBACKGASLIMIT,
  requestConfirmations: import.meta.env.CHAIN_LINK_REQUESTCONFIRMATIONS,
  numWords: import.meta.env.CHAIN_LINK_NUMWORDS
};

// Environment configuration
export const env = {
  // Network
  CHAIN_ID: import.meta.env.VITE_CHAIN_ID || '11155111',
  RPC_URL: import.meta.env.SEPOLIA_TESTNET_RPC,
  EXPLORER_URL: import.meta.env.VITE_EXPLORER_URL,
  
  // Feature flags
  ENABLE_TESTNET_FAUCET: true,
  
  // Game settings
  MIN_BET: '1',
  MAX_BET: '1000',
  PAYOUT_MULTIPLIER: '6'
};

// Theme configuration
export const theme = {
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '24px',
    full: '9999px'
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem'
  },
  transition: {
    default: '0.2s ease-in-out',
    fast: '0.1s ease-in-out',
    slow: '0.3s ease-in-out'
  }
}; 