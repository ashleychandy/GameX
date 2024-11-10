// Environment configuration
export const ENV = {
  // Network
  CHAIN_ID: import.meta.env.VITE_CHAIN_ID || '11155111',
  RPC_URL: import.meta.env.SEPOLIA_TESTNET_RPC,
  
  // Contract addresses
  DICE_CONTRACT: import.meta.env.VITE_DICE_GAME_ADDRESS,
  TOKEN_CONTRACT: import.meta.env.VITE_TOKEN_ADDRESS,
  
  // VRF Configuration
  VRF_COORDINATOR: import.meta.env.CHAIN_LINK_VRF_COORDINATOR,
  KEY_HASH: import.meta.env.CHAIN_LINK_KEY_HASH,
  
  // Feature flags
  ENABLE_TESTNET_FAUCET: true,
  
  // API endpoints
  EXPLORER_URL: import.meta.env.VITE_EXPLORER_URL,
  
  // Other configurations
  MIN_BET: '1',
  MAX_BET: '1000',
  PAYOUT_MULTIPLIER: '6'
}; 