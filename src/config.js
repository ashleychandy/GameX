// Helper to safely get env variables
const getEnvVar = (key, defaultValue = '') => {
  return import.meta.env[key] || defaultValue;
};

// Game configuration
export const config = {
  // Contract addresses
  contracts: {
    dice: getEnvVar('VITE_DICE_GAME_ADDRESS'),
    token: getEnvVar('VITE_TOKEN_ADDRESS'),
    roles: {
      minter: getEnvVar('MINTER_ADDRESS'),
      burner: getEnvVar('BURNER_ADDRESS')
    }
  },
  
  // Network config
  network: {
    chainId: parseInt(getEnvVar('VITE_CHAIN_ID')),
    rpc: getEnvVar('VITE_SEPOLIA_RPC'),
    explorerUrl: getEnvVar('VITE_EXPLORER_URL'),
  },

  // ChainLink settings
  chainLink: {
    keyHash: getEnvVar('CHAIN_LINK_KEY_HASH'),
    subscriptionId: getEnvVar('CHAIN_LINK_SUBSCRIPTION_ID'),
    callbackGasLimit: parseInt(getEnvVar('CHAIN_LINK_CALLBACKGASLIMIT', '200000')),
    requestConfirmations: parseInt(getEnvVar('CHAIN_LINK_REQUESTCONFIRMATIONS', '3')),
    numWords: parseInt(getEnvVar('CHAIN_LINK_NUMWORDS', '1')),
    enableNativePayment: getEnvVar('CHAIN_LINK_ENABLENATIVEPAYMENT') === 'true',
    vrfCoordinator: getEnvVar('CHAIN_LINK_VRF_COORDINATOR'),
    token: getEnvVar('CHAIN_LINK_TOKEN'),
  }
};

// Game states
export const GAME_STATES = {
  IDLE: 'IDLE',
  WAITING_FOR_APPROVAL: 'WAITING_FOR_APPROVAL',
  PLACING_BET: 'PLACING_BET',
  WAITING_FOR_RESULT: 'WAITING_FOR_RESULT',
  RESOLVING: 'RESOLVING',
  COMPLETED: 'COMPLETED',
  ERROR: 'ERROR'
};

// Refresh intervals (in ms)
export const REFRESH_INTERVALS = {
  gameState: 5000,
  pendingRequest: 3000,
  userStats: 30000
};
