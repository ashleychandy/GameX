import { ethers } from 'ethers';

// Environment variable validation with fallbacks
const getEnvVar = (name, fallback = '') => {
  const value = import.meta.env[name];
  return value ? value.trim() : fallback;
};

// Chain IDs
export const SUPPORTED_CHAIN_ID = 11155111; // Sepolia Testnet
export const FORMATTED_CHAIN_ID = `0x${Number(SUPPORTED_CHAIN_ID).toString(16)}`;

// Network configuration
export const SUPPORTED_NETWORKS = {
  SEPOLIA: {
    chainId: FORMATTED_CHAIN_ID,
    name: 'Sepolia Test Network',
    currency: {
      name: 'Sepolia ETH',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: [getEnvVar('SEPOLIA_TESTNET_RPC', 'https://rpc.sepolia.org')],
    blockExplorerUrls: [getEnvVar('VITE_EXPLORER_URL', 'https://sepolia.etherscan.io')]
  }
};

export const DEFAULT_NETWORK = SUPPORTED_NETWORKS.SEPOLIA;

// Chain Configuration for wallet
export const CHAIN_CONFIG = {
  [SUPPORTED_CHAIN_ID]: {
    chainId: FORMATTED_CHAIN_ID,
    chainName: SUPPORTED_NETWORKS.SEPOLIA.name,
    nativeCurrency: SUPPORTED_NETWORKS.SEPOLIA.currency,
    rpcUrls: SUPPORTED_NETWORKS.SEPOLIA.rpcUrls,
    blockExplorerUrls: SUPPORTED_NETWORKS.SEPOLIA.blockExplorerUrls
  }
};

// Contract Addresses
export const DICE_ADDRESS = getEnvVar('VITE_DICE_GAME_ADDRESS');
export const TOKEN_ADDRESS = getEnvVar('VITE_TOKEN_ADDRESS');
export const ROULETTE_ADDRESS = getEnvVar('VITE_ROULETTE_ADDRESS');

// Contract Roles
export const ROLES = {
  DEFAULT_ADMIN_ROLE: '0x0000000000000000000000000000000000000000000000000000000000000000',
  MINTER_ROLE: '0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6',
  BURNER_ROLE: '0x3c11d16cbaffd01df69ce1c404f6340ee057498f5f00246190ea54220576a848'
};

// Game Configuration
export const GAME_CONFIG = {
  MIN_BET: '1',
  MAX_BET: '1000',
  PAYOUT_MULTIPLIER: '6',
  MAX_NUMBER: '6'
};

// Game States
export const GAME_STATES = {
  PENDING: 0,
  WAITING_FOR_RANDOM: 1,
  READY_TO_RESOLVE: 2,
  COMPLETED: 3
};

// Storage Keys
export const STORAGE_KEYS = {
  GAME_HISTORY: 'game_history',
  USER_SETTINGS: 'user_settings'
};

// Error Messages
export const ERROR_MESSAGES = {
  NO_WALLET: 'Please connect your wallet',
  NO_CONTRACT: 'Contract not initialized',
  INSUFFICIENT_BALANCE: 'Insufficient balance',
  INVALID_AMOUNT: 'Invalid bet amount',
  NETWORK_ERROR: 'Network error occurred',
  TRANSACTION_FAILED: 'Transaction failed'
};

// Event Names
export const EVENTS = {
  GAME_STARTED: 'GameStarted',
  GAME_COMPLETED: 'GameCompleted',
  RANDOM_REQUESTED: 'RandomWordsRequested',
  RANDOM_FULFILLED: 'RandomWordsFulfilled'
};

// Token Configuration
export const TOKEN_CONFIG = {
  NAME: 'GAMEX Token',
  SYMBOL: 'GAMEX',
  DECIMALS: 18
};

// Explorer URL
export const EXPLORER_URL = getEnvVar('VITE_EXPLORER_URL', 'https://sepolia.etherscan.io');