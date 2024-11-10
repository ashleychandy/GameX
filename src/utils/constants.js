import { ethers } from "ethers";

// Environment variable validation with fallbacks
const getEnvVar = (name, fallback = "") => {
  const value = import.meta.env[name];
  return value ? value.trim() : fallback;
};

// Contract Addresses
export const CONTRACTS = {
  DICE: getEnvVar("VITE_DICE_GAME_ADDRESS"),
  TOKEN: getEnvVar("VITE_TOKEN_ADDRESS"),
};

// Chain Configuration
export const CHAIN_CONFIG = {
  CHAIN_ID: parseInt(getEnvVar("VITE_CHAIN_ID", "11155111")),
  RPC_URL: getEnvVar("SEPOLIA_TESTNET_RPC"),
  EXPLORER_URL: getEnvVar("VITE_EXPLORER_URL"),
};

// Chainlink VRF Configuration
export const VRF_CONFIG = {
  COORDINATOR: getEnvVar("CHAIN_LINK_VRF_COORDINATOR"),
  KEY_HASH: getEnvVar("CHAIN_LINK_KEY_HASH"),
  SUBSCRIPTION_ID: getEnvVar("CHAIN_LINK_SUBSCRIPTION_ID"),
  CALLBACK_GAS_LIMIT: parseInt(getEnvVar("CHAIN_LINK_CALLBACKGASLIMIT", "200000")),
  REQUEST_CONFIRMATIONS: parseInt(getEnvVar("CHAIN_LINK_REQUESTCONFIRMATIONS", "3")),
  NUM_WORDS: parseInt(getEnvVar("CHAIN_LINK_NUMWORDS", "1")),
};

// Game States - matching contract enum
export const GAME_STATES = {
  INACTIVE: 0,
  ACTIVE: 1,
  PENDING_VRF: 2,
  COMPLETED: 3,
  FAILED: 4
};

// Game Configuration
export const GAME_CONFIG = {
  PAYOUT_MULTIPLIER: 6,
  MIN_BET: "0.000000000000000001",
  MAX_RETRIES: 3,
  POLLING_INTERVAL: 5000
};

// Error Messages
export const ERROR_MESSAGES = {
  INVALID_BET_PARAMETERS: "Invalid bet parameters",
  INSUFFICIENT_CONTRACT_BALANCE: "Insufficient contract balance",
  INSUFFICIENT_USER_BALANCE: "Insufficient user balance",
  TRANSFER_FAILED: "Token transfer failed",
  GAME_ERROR: "Game error",
  VRF_ERROR: "VRF error",
  ROLE_ERROR: "Role error",
  PAYOUT_CALCULATION_ERROR: "Payout calculation error",
};

// Contract Events
export const EVENTS = {
  GAME_STARTED: "GameStarted",
  GAME_COMPLETED: "GameCompleted",
  RANDOM_WORDS_FULFILLED: "RandomWordsFulfilled",
};

// Time Constants
export const TIME = {
  POLL_INTERVAL: 10000, // Poll for game updates every 10 seconds
};

// Error Codes
export const ERROR_CODES = {
  USER_REJECTED: 4001,
  WALLET_DISCONNECTED: 4100,
  CHAIN_MISMATCH: 4902,
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  GAME_IN_PROGRESS: 'GAME_IN_PROGRESS',
  INVALID_BET: 'INVALID_BET',
  NETWORK_ERROR: -32603,
  TIMEOUT: -32008,
  CONTRACT_ERROR: 'CONTRACT_ERROR'
};

// Network Configuration
export const SUPPORTED_CHAIN_ID = 11155111; // Sepolia testnet chain ID

// Network Configurations
export const NETWORKS = {
  SEPOLIA: {
    chainId: 11155111,
    name: 'Sepolia',
    rpcUrl: import.meta.env.VITE_SEPOLIA_TESTNET_RPC || 'https://eth-sepolia.g.alchemy.com/v2/tha8qgVwehSf9EJLAT_qDNfbiFL7lGP5',
    explorer: import.meta.env.VITE_EXPLORER_URL || 'https://sepolia.etherscan.io',
    contracts: {
      dice: import.meta.env.VITE_DICE_GAME_ADDRESS,
      token: import.meta.env.VITE_TOKEN_ADDRESS,
      chainlink: import.meta.env.CHAIN_LINK_TOKEN
    }
  }
};

// Default Network
export const DEFAULT_NETWORK = NETWORKS.SEPOLIA;

// Chain IDs
export const CHAIN_IDS = {
  SEPOLIA: SUPPORTED_CHAIN_ID,
  MAINNET: 1,
};

export const POLLING_INTERVAL = 5000; // 5 seconds

export const TRANSACTION_TIMEOUT = 30000; // 30 seconds

// Roles
export const ROLES = {
  DEFAULT_ADMIN_ROLE: '0x0000000000000000000000000000000000000000000000000000000000000000',
  MINTER_ROLE: getEnvVar("MINTER_ADDRESS"),
  BURNER_ROLE: getEnvVar("BURNER_ADDRESS")
};

// Transaction Types
export const TRANSACTION_TYPES = {
  APPROVE: 'APPROVE',
  PLAY: 'PLAY',
  RESOLVE: 'RESOLVE'
};

export const GAME_STATUS = {
  PENDING: 0,
  STARTED: 1,
  COMPLETED_WIN: 2,
  COMPLETED_LOSS: 3,
  CANCELLED: 4
};

export const GAME_ERROR_MESSAGES = {
  GAME_IN_PROGRESS: "A game is already in progress",
  INVALID_BET: "Invalid bet parameters",
  INSUFFICIENT_BALANCE: "Insufficient balance",
  VRF_ERROR: "Random number generation failed",
  INVALID_GAME_STATE: "Invalid game state"
};

// Add this to constants.js
export const UI_STATES = {
  IDLE: 'IDLE',
  SELECTING: 'SELECTING',
  APPROVING: 'APPROVING',
  PLACING_BET: 'PLACING_BET',
  WAITING_FOR_RESULT: 'WAITING_FOR_RESULT',
  RESOLVING: 'RESOLVING',
  COMPLETED: 'COMPLETED',
  ERROR: 'ERROR'
};
