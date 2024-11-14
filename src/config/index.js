// Network Configuration
export const NETWORK_CONFIG = {
  chainId: import.meta.env.VITE_CHAIN_ID || '11155111', // Sepolia testnet
  rpcUrl: import.meta.env.VITE_SEPOLIA_RPC,
  name: 'Sepolia',
  explorer: 'https://sepolia.etherscan.io',
  nativeCurrency: {
    name: 'Sepolia ETH',
    symbol: 'ETH',
    decimals: 18
  }
};

// Contract Addresses
export const CONTRACT_ADDRESSES = {
  token: import.meta.env.VITE_TOKEN_ADDRESS,
  diceGame: import.meta.env.VITE_DICE_GAME_ADDRESS
};

// Game States
export const GAME_STATES = {
  IDLE: 'IDLE',
  WAITING_FOR_APPROVAL: 'WAITING_FOR_APPROVAL',
  PLACING_BET: 'PLACING_BET',
  WAITING_FOR_RESULT: 'WAITING_FOR_RESULT',
  COMPLETED: 'COMPLETED',
  ERROR: 'ERROR'
};

// Game Configuration
export const GAME_CONFIG = {
  minBet: '0.1',
  maxBet: '1000',
  multiplier: 6,
  numbers: [1, 2, 3, 4, 5, 6],
  chainLink: {
    callbackGasLimit: 2500000,
    requestConfirmations: 3,
    numWords: 1
  }
};

// Validation Messages
export const MESSAGES = {
  errors: {
    WALLET_NOT_CONNECTED: 'Please connect your wallet first',
    INVALID_AMOUNT: 'Please enter a valid bet amount',
    INVALID_NUMBER: 'Please select a number',
    GAME_IN_PROGRESS: 'A game is already in progress',
    INSUFFICIENT_BALANCE: 'Insufficient balance',
    NETWORK_ERROR: 'Network error occurred',
    TRANSACTION_FAILED: 'Transaction failed'
  },
  success: {
    BET_PLACED: 'Bet placed successfully!',
    GAME_WON: 'Congratulations! You won!',
    GAME_COMPLETED: 'Game completed'
  }
};

// Environment validation
const validateEnv = () => {
  const required = [
    'VITE_SEPOLIA_RPC',
    'VITE_CHAIN_ID',
    'VITE_TOKEN_ADDRESS',
    'VITE_DICE_GAME_ADDRESS'
  ];
  
  const missing = required.filter(key => !import.meta.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required env variables: ${missing.join(', ')}`);
  }
};

// Run validation in development
if (import.meta.env.DEV) {
  validateEnv();
}

// Export consolidated config
export const config = {
  network: NETWORK_CONFIG,
  contracts: CONTRACT_ADDRESSES,
  game: GAME_CONFIG,
  messages: MESSAGES
};

// ... rest of the code remains the same 