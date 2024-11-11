import { z } from 'zod';

const envSchema = z.object({
  VITE_SEPOLIA_RPC: z.string().optional(),
  VITE_CHAIN_ID: z.string().optional(),
  VITE_EXPLORER_URL: z.string().optional(),
  VITE_TOKEN_ADDRESS: z.string().optional(),
  VITE_DICE_GAME_ADDRESS: z.string().optional(),
  CHAIN_LINK_VRF_COORDINATOR: z.string().optional(),
  CHAIN_LINK_KEY_HASH: z.string().optional(),
  CHAIN_LINK_SUBSCRIPTION_ID: z.string().optional(),
  CHAIN_LINK_CALLBACKGASLIMIT: z.string().optional(),
  CHAIN_LINK_REQUESTCONFIRMATIONS: z.string().optional(),
  CHAIN_LINK_NUMWORDS: z.string().optional(),
  CHAIN_LINK_TOKEN: z.string().optional(),
}).partial();

const validateEnv = () => {
  try {
    const env = {
      VITE_SEPOLIA_RPC: import.meta.env.VITE_SEPOLIA_RPC,
      VITE_CHAIN_ID: import.meta.env.VITE_CHAIN_ID,
      VITE_EXPLORER_URL: import.meta.env.VITE_EXPLORER_URL,
      VITE_TOKEN_ADDRESS: import.meta.env.VITE_TOKEN_ADDRESS,
      VITE_DICE_GAME_ADDRESS: import.meta.env.VITE_DICE_GAME_ADDRESS,
      CHAIN_LINK_VRF_COORDINATOR: import.meta.env.CHAIN_LINK_VRF_COORDINATOR,
      CHAIN_LINK_KEY_HASH: import.meta.env.CHAIN_LINK_KEY_HASH,
      CHAIN_LINK_SUBSCRIPTION_ID: import.meta.env.CHAIN_LINK_SUBSCRIPTION_ID,
      CHAIN_LINK_CALLBACKGASLIMIT: import.meta.env.CHAIN_LINK_CALLBACKGASLIMIT,
      CHAIN_LINK_REQUESTCONFIRMATIONS: import.meta.env.CHAIN_LINK_REQUESTCONFIRMATIONS,
      CHAIN_LINK_NUMWORDS: import.meta.env.CHAIN_LINK_NUMWORDS,
      CHAIN_LINK_TOKEN: import.meta.env.CHAIN_LINK_TOKEN,
    };
    return envSchema.parse(env);
  } catch (error) {
    console.warn('Environment validation warning:', error.errors);
    return {};
  }
};

const env = validateEnv();

export const config = {
  network: {
    rpc: env.VITE_SEPOLIA_RPC || 'https://eth-sepolia.g.alchemy.com/v2/default',
    chainId: parseInt(env.VITE_CHAIN_ID || '11155111'),
    explorer: env.VITE_EXPLORER_URL || 'https://sepolia.etherscan.io'
  },
  contracts: {
    token: env.VITE_TOKEN_ADDRESS,
    dice: env.VITE_DICE_GAME_ADDRESS,
    chainlink: env.CHAIN_LINK_TOKEN
  },
  chainlink: {
    coordinator: env.CHAIN_LINK_VRF_COORDINATOR,
    keyHash: env.CHAIN_LINK_KEY_HASH,
    subscriptionId: env.CHAIN_LINK_SUBSCRIPTION_ID,
    callbackGasLimit: parseInt(env.CHAIN_LINK_CALLBACKGASLIMIT || '200000'),
    requestConfirmations: parseInt(env.CHAIN_LINK_REQUESTCONFIRMATIONS || '3'),
    numWords: parseInt(env.CHAIN_LINK_NUMWORDS || '1')
  }
}; 