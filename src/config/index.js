import { ethers } from 'ethers';

// Validate required env variables
const requiredEnvVars = [
  'VITE_TOKEN_ADDRESS',
  'VITE_DICE_GAME_ADDRESS',
  'VITE_SEPOLIA_RPC',
  'VITE_CHAIN_ID'
];

requiredEnvVars.forEach(varName => {
  if (!import.meta.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
});

export const CONFIG = {
  network: {
    chainId: parseInt(import.meta.env.VITE_CHAIN_ID),
    rpcUrl: import.meta.env.VITE_SEPOLIA_RPC,
    explorerUrl: import.meta.env.VITE_EXPLORER_URL
  },
  contracts: {
    token: {
      address: import.meta.env.VITE_TOKEN_ADDRESS,
      roles: {
        minter: import.meta.env.MINTER_ADDRESS,
        burner: import.meta.env.BURNER_ADDRESS
      }
    },
    dice: {
      address: import.meta.env.VITE_DICE_GAME_ADDRESS
    }
  },
  chainlink: {
    coordinator: import.meta.env.CHAIN_LINK_VRF_COORDINATOR,
    keyHash: import.meta.env.CHAIN_LINK_KEY_HASH,
    subscriptionId: import.meta.env.CHAIN_LINK_SUBSCRIPTION_ID,
    callbackGasLimit: parseInt(import.meta.env.CHAIN_LINK_CALLBACKGASLIMIT),
    requestConfirmations: parseInt(import.meta.env.CHAIN_LINK_REQUESTCONFIRMATIONS),
    numWords: parseInt(import.meta.env.CHAIN_LINK_NUMWORDS),
    token: import.meta.env.CHAIN_LINK_TOKEN
  }
};