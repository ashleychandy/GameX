import DiceABI from '../abi/Dice.json';
import TokenABI from '../abi/Token.json';
import { CHAIN_CONFIG } from '../utils/constants';

// Add validation
if (!Array.isArray(DiceABI.abi) || !Array.isArray(TokenABI.abi)) {
  throw new Error('Invalid ABI format in contract configuration');
}

// Contract configuration with environment variables
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
  chainId: parseInt(import.meta.env.VITE_CHAIN_ID || '11155111'),
  rpcUrl: import.meta.env.SEPOLIA_TESTNET_RPC,
  explorerUrl: import.meta.env.VITE_EXPLORER_URL
};

// VRF configuration from environment
export const vrfConfig = {
  coordinator: import.meta.env.CHAIN_LINK_VRF_COORDINATOR,
  keyHash: import.meta.env.CHAIN_LINK_KEY_HASH,
  subscriptionId: import.meta.env.CHAIN_LINK_SUBSCRIPTION_ID,
  callbackGasLimit: parseInt(import.meta.env.CHAIN_LINK_CALLBACKGASLIMIT || '200000'),
  requestConfirmations: parseInt(import.meta.env.CHAIN_LINK_REQUESTCONFIRMATIONS || '3'),
  numWords: parseInt(import.meta.env.CHAIN_LINK_NUMWORDS || '1'),
  enableNativePayment: import.meta.env.CHAIN_LINK_ENABLENATIVEPAYMENT === 'true'
};

// Roles configuration
export const roles = {
  MINTER_ROLE: import.meta.env.MINTER_ADDRESS,
  BURNER_ROLE: import.meta.env.BURNER_ADDRESS
};

// Environment configuration
export const env = {
  isDevelopment: import.meta.env.MODE === 'development',
  isProduction: import.meta.env.MODE === 'production',
  
  // Network
  chainId: parseInt(import.meta.env.VITE_CHAIN_ID || '11155111'),
  rpcUrl: import.meta.env.SEPOLIA_TESTNET_RPC,
  explorerUrl: import.meta.env.VITE_EXPLORER_URL,
  
  // Contract addresses
  diceGameAddress: import.meta.env.VITE_DICE_GAME_ADDRESS,
  tokenAddress: import.meta.env.VITE_TOKEN_ADDRESS,
  
  // Chainlink configuration
  chainlinkToken: import.meta.env.CHAIN_LINK_TOKEN,
  
  // Feature flags
  enableTestnetFaucet: true,
  
  // Game settings
  minBet: '0.01',
  maxBet: '100',
  payoutMultiplier: '6'
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