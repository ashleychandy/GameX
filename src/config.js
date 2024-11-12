import { DiceABI } from "./abi/Dice.json";
import { TokenABI } from "./abi/Token.json";

// Game configuration
export const gameConfig = {
  // Betting limits
  minBet: "0.01",
  maxBet: "100",

  // Chain Link VRF Settings
  chainLink: {
    keyHash: import.meta.env.CHAIN_LINK_KEY_HASH,
    subscriptionId: import.meta.env.CHAIN_LINK_SUBSCRIPTION_ID,
    callbackGasLimit: import.meta.env.CHAIN_LINK_CALLBACKGASLIMIT,
    requestConfirmations: import.meta.env.CHAIN_LINK_REQUESTCONFIRMATIONS,
    numWords: import.meta.env.CHAIN_LINK_NUMWORDS,
    enableNativePayment:
      import.meta.env.CHAIN_LINK_ENABLENATIVEPAYMENT === "true",
    vrfCoordinator: import.meta.env.CHAIN_LINK_VRF_COORDINATOR,
    token: import.meta.env.CHAIN_LINK_TOKEN,
  },

  // Contract addresses
  contracts: {
    token: import.meta.env.VITE_TOKEN_ADDRESS,
    dice: import.meta.env.VITE_DICE_GAME_ADDRESS,
    minter: import.meta.env.MINTER_ADDRESS,
    burner: import.meta.env.BURNER_ADDRESS,
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
    chainId: import.meta.env.VITE_CHAIN_ID,
    contracts: {
      dice: {
        address: import.meta.env.VITE_DICE_GAME_ADDRESS,
        abi: DiceABI,
      },
      token: {
        address: import.meta.env.VITE_TOKEN_ADDRESS,
        abi: TokenABI,
      },
    },
    rpcUrl: import.meta.env.VITE_SEPOLIA_RPC,
    explorerUrl: import.meta.env.VITE_EXPLORER_URL,
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
    chainId: import.meta.env.VITE_CHAIN_ID ? Number(import.meta.env.VITE_CHAIN_ID) : 11155111,
    rpcUrl: import.meta.env.VITE_SEPOLIA_RPC || 'https://eth-sepolia.g.alchemy.com/v2/default',
    explorerUrl: import.meta.env.VITE_EXPLORER_URL || 'https://sepolia.etherscan.io',
    name: 'Sepolia Test Network'
  },
  // ... rest of config
};
