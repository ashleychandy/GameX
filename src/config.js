import { DiceABI } from "./abi/Dice.json";
import { TokenABI } from "./abi/Token.json";

// Helper to safely get env variables
const getEnvVar = (key, defaultValue = '') => {
  return import.meta.env[key] || defaultValue;
};

// Game configuration
export const gameConfig = {
  // Betting limits
  minBet: "0.01",
  maxBet: "100",

  // Chain Link VRF Settings
  chainLink: {
    keyHash: getEnvVar('CHAIN_LINK_KEY_HASH'),
    subscriptionId: getEnvVar('CHAIN_LINK_SUBSCRIPTION_ID'),
    callbackGasLimit: parseInt(getEnvVar('CHAIN_LINK_CALLBACKGASLIMIT', '200000')),
    requestConfirmations: parseInt(getEnvVar('CHAIN_LINK_REQUESTCONFIRMATIONS', '3')),
    numWords: parseInt(getEnvVar('CHAIN_LINK_NUMWORDS', '1')),
    enableNativePayment:
      getEnvVar('CHAIN_LINK_ENABLENATIVEPAYMENT') === "true",
    vrfCoordinator: getEnvVar('CHAIN_LINK_VRF_COORDINATOR'),
    token: getEnvVar('CHAIN_LINK_TOKEN'),
  },

  // Contract addresses
  contracts: {
    token: {
      address: getEnvVar('VITE_TOKEN_ADDRESS'),
      roles: {
        minter: getEnvVar('MINTER_ADDRESS'),
        burner: getEnvVar('BURNER_ADDRESS')
      }
    },
    dice: {
      address: getEnvVar('VITE_DICE_GAME_ADDRESS')
    }
  },

  // Game states
  states: {
    IDLE: "IDLE",
    WAITING_FOR_APPROVAL: "WAITING_FOR_APPROVAL",
    PLACING_BET: "PLACING_BET",
    WAITING_FOR_RESULT: "WAITING_FOR_RESULT",
    RESOLVING: "RESOLVING",
    COMPLETED: "COMPLETED",
    ERROR: "ERROR",
  },

  // Refresh intervals (in ms)
  refreshIntervals: {
    gameState: 5000,
    pendingRequest: 3000,
    userStats: 30000,
  },
};

// Network configuration
export const SUPPORTED_NETWORKS = {
  11155111: {
    // Sepolia
    name: "Sepolia",
    chainId: parseInt(getEnvVar('VITE_CHAIN_ID', '11155111')),
    contracts: {
      dice: {
        address: getEnvVar('VITE_DICE_GAME_ADDRESS'),
        abi: DiceABI,
      },
      token: {
        address: getEnvVar('VITE_TOKEN_ADDRESS'),
        abi: TokenABI,
      },
    },
    rpcUrl: getEnvVar('VITE_SEPOLIA_RPC', 'https://eth-sepolia.g.alchemy.com/v2/default'),
    explorerUrl: getEnvVar('VITE_EXPLORER_URL', 'https://sepolia.etherscan.io'),
  },
};

// UI configuration
export const uiConfig = {
  // Toast notifications
  toast: {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  },

  // Animation defaults
  animation: {
    duration: 0.3,
    ease: "easeInOut",
  },
};

export const DEFAULT_NETWORK = 11155111; // Sepolia as default network

export const CONFIG = {
  network: {
    chainId: Number(getEnvVar('VITE_CHAIN_ID', '11155111')),
    rpcUrl: getEnvVar('VITE_SEPOLIA_RPC'),
    explorerUrl: getEnvVar('VITE_EXPLORER_URL', 'https://sepolia.etherscan.io')
  },
  contracts: {
    tokenAddress: getEnvVar('VITE_TOKEN_ADDRESS'),
    diceGameAddress: getEnvVar('VITE_DICE_GAME_ADDRESS'),
    rouletteAddress: getEnvVar('VITE_ROULETTE_ADDRESS')
  }
};
