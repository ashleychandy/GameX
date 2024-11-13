import { ethers } from "ethers";
import { CONFIG } from '../config';

// Environment variable validation with fallbacks
const getEnvVar = (name, fallback = "") => {
  const value = import.meta.env[name];
  if (!value && !fallback) {
    console.warn(`Environment variable ${name} not found, using fallback value`);
  }
  return value || fallback;
};

// Contract Addresses
export const CONTRACTS = {
  DICE: CONFIG.contracts.dice.address,
  TOKEN: CONFIG.contracts.token.address,
};

// Chain Configuration
export const CHAIN_CONFIG = {
  CHAIN_ID: CONFIG.network.chainId,
  RPC_URL: CONFIG.network.rpcUrl,
  EXPLORER_URL: CONFIG.network.explorerUrl,
};

// Chainlink VRF Configuration
export const VRF_CONFIG = {
  coordinator: CONFIG.chainlink.coordinator,
  keyHash: CONFIG.chainlink.keyHash,
  subscriptionId: CONFIG.chainlink.subscriptionId,
  callbackGasLimit: CONFIG.chainlink.callbackGasLimit,
  requestConfirmations: CONFIG.chainlink.requestConfirmations,
  numWords: CONFIG.chainlink.numWords
};

// Game States - matching contract enum
export const GAME_STATES = {
  IDLE: 0,
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
  NETWORK_ERROR: "Network error occurred",
  USER_REJECTED: "Transaction rejected by user",
  CHAIN_MISMATCH: "Please switch to the correct network",
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
  NETWORK_ERROR: -32603,
  INSUFFICIENT_FUNDS: -32000,
  UNPREDICTABLE_GAS_LIMIT: -32603,
};

// Network Configuration
export const SUPPORTED_CHAIN_ID = CONFIG.network.chainId;

// Network Configurations
export const NETWORKS = {
  SEPOLIA: {
    chainId: CONFIG.network.chainId,
    name: 'Sepolia',
    rpcUrl: CONFIG.network.rpcUrl,
    explorer: CONFIG.network.explorerUrl,
    contracts: {
      dice: CONFIG.contracts.dice.address,
      token: CONFIG.contracts.token.address,
      chainlink: CONFIG.chainlink.token
    }
  }
};

// Default Network
export const DEFAULT_NETWORK = NETWORKS.SEPOLIA;

// Chain IDs
export const CHAIN_IDS = {
  SEPOLIA: CONFIG.network.chainId,
  MAINNET: 1,
};

export const POLLING_INTERVAL = 5000; // 5 seconds

export const TRANSACTION_TIMEOUT = 30000; // 30 seconds

// Roles
export const ROLES = {
  DEFAULT_ADMIN_ROLE: '0x0000000000000000000000000000000000000000000000000000000000000000',
  MINTER_ROLE: ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE")),
  BURNER_ROLE: ethers.keccak256(ethers.toUtf8Bytes("BURNER_ROLE"))
};

// Transaction Types
export const TRANSACTION_TYPES = {
  APPROVE: 'APPROVE',
  PLAY: 'PLAY',
  RESOLVE: 'RESOLVE'
};

export const GAME_STATUS = {
  IDLE: 0,
  ACTIVE: 1,
  COMPLETED: 2,
  CANCELLED: 3
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
  IDLE: 'idle',
  APPROVING: 'approving',
  PLACING_BET: 'placingBet',
  WAITING_FOR_RESULT: 'waitingForResult',
  RESOLVING: 'resolving',
  CLAIMING: 'claiming'
};

export const NETWORK_CONFIG = {
  chainId: CONFIG.network.chainId,
  rpcUrl: CONFIG.network.rpcUrl,
  explorerUrl: CONFIG.network.explorerUrl
};

export const CONTRACT_ADDRESSES = {
  token: CONFIG.contracts.token.address,
  dice: CONFIG.contracts.dice.address
};

export const CHAINLINK_CONFIG = {
  coordinator: CONFIG.chainlink.coordinator,
  keyHash: CONFIG.chainlink.keyHash,
  subscriptionId: CONFIG.chainlink.subscriptionId,
  callbackGasLimit: CONFIG.chainlink.callbackGasLimit,
  requestConfirmations: CONFIG.chainlink.requestConfirmations,
  numWords: CONFIG.chainlink.numWords
};
