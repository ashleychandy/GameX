import { ethers } from 'ethers';

// Environment variable validation with fallbacks
const getEnvVar = (name, fallback = '') => {
  const value = import.meta.env[name];
  return value ? value.trim() : fallback;
};

// Contract Addresses
export const CONTRACTS = {
  DICE: getEnvVar('VITE_DICE_GAME_ADDRESS'),
  TOKEN: getEnvVar('VITE_TOKEN_ADDRESS')
};

// Chain Configuration
export const CHAIN_CONFIG = {
  CHAIN_ID: parseInt(getEnvVar('VITE_CHAIN_ID', '11155111')),
  RPC_URL: getEnvVar('SEPOLIA_TESTNET_RPC'),
  EXPLORER_URL: getEnvVar('VITE_EXPLORER_URL')
};

// Chainlink VRF Configuration
export const VRF_CONFIG = {
  COORDINATOR: getEnvVar('CHAIN_LINK_VRF_COORDINATOR'),
  KEY_HASH: getEnvVar('CHAIN_LINK_KEY_HASH'),
  SUBSCRIPTION_ID: getEnvVar('CHAIN_LINK_SUBSCRIPTION_ID'),
  CALLBACK_GAS_LIMIT: parseInt(getEnvVar('CHAIN_LINK_CALLBACKGASLIMIT', '200000')),
  REQUEST_CONFIRMATIONS: parseInt(getEnvVar('CHAIN_LINK_REQUESTCONFIRMATIONS', '3')),
  NUM_WORDS: parseInt(getEnvVar('CHAIN_LINK_NUMWORDS', '1'))
};

// Game States - matching contract enum
export const GAME_STATES = {
  PENDING: 'PENDING',
  STARTED: 'STARTED',
  COMPLETED_WIN: 'COMPLETED_WIN',
  COMPLETED_LOSS: 'COMPLETED_LOSS',
  CANCELLED: 'CANCELLED',
  READY_TO_RESOLVE: 'READY_TO_RESOLVE',
  WAITING_FOR_RESULT: 'WAITING_FOR_RESULT',
  WON: 'WON',
  LOST: 'LOST'
};

// Game Configuration
export const GAME_CONFIG = {
  MIN_NUMBER: 1,
  MAX_NUMBER: 6,
  MIN_BET: ethers.parseEther('1'),    // 1 TOKEN
  MAX_BET: ethers.parseEther('1000'), // 1000 TOKEN
  PAYOUT_MULTIPLIER: 6
};

// Error Messages
export const ERROR_MESSAGES = {
  INVALID_BET_AMOUNT: 'Bet amount must be between 1 and 1000 DICE',
  INVALID_NUMBER: 'Chosen number must be between 1 and 6',
  GAME_IN_PROGRESS: 'Player has an active game',
  INSUFFICIENT_BALANCE: 'Insufficient token balance',
  INSUFFICIENT_ALLOWANCE: 'Insufficient token allowance',
  NO_ACTIVE_GAME: 'No active game to resolve',
  NOT_READY_TO_RESOLVE: 'Game is not ready to be resolved'
};

// Contract Events
export const EVENTS = {
  GAME_STARTED: 'GameStarted',
  GAME_COMPLETED: 'GameCompleted',
  RANDOM_WORDS_FULFILLED: 'RandomWordsFulfilled'
};

// Time Constants
export const TIME = {
  POLL_INTERVAL: 10000      // Poll for game updates every 10 seconds
};

// Error Codes
export const ERROR_CODES = {
  USER_REJECTED: 4001,      // MetaMask Tx Signature: User denied transaction signature
  NETWORK_ERROR: -32603,    // Internal JSON-RPC error
  CHAIN_MISMATCH: 4902,     // Chain/network mismatch
  TIMEOUT: -32008,          // Request timeout
  INSUFFICIENT_FUNDS: -32000, // Insufficient funds for gas * price + value
  NONCE_TOO_LOW: -32003,    // Nonce too low
  CONTRACT_ERROR: -32016     // Contract execution error
};

// Network Configuration
export const SUPPORTED_CHAIN_ID = 11155111; // Sepolia testnet

// Network Configurations
export const NETWORKS = {
  [SUPPORTED_CHAIN_ID]: {  // Using SUPPORTED_CHAIN_ID as key
    chainId: SUPPORTED_CHAIN_ID,
    name: 'Sepolia Test Network',
    currency: {
      name: 'Sepolia ETH',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: ['https://rpc.sepolia.org'],
    blockExplorerUrls: ['https://sepolia.etherscan.io']
  },
  MAINNET: {
    chainId: 1,
    name: 'Ethereum Mainnet',
    currency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: ['https://mainnet.infura.io/v3/YOUR-PROJECT-ID'],
    blockExplorerUrls: ['https://etherscan.io']
  }
};

// Default Network
export const DEFAULT_NETWORK = NETWORKS[SUPPORTED_CHAIN_ID];

// Chain IDs
export const CHAIN_IDS = {
  SEPOLIA: SUPPORTED_CHAIN_ID,
  MAINNET: 1
};