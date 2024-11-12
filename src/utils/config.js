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

export const validateEnv = () => {
  const required = [
    'VITE_CHAIN_ID',
    'VITE_TOKEN_ADDRESS',
    'VITE_DICE_GAME_ADDRESS',
    'VITE_SEPOLIA_RPC'
  ];
  
  const missing = required.filter(key => !import.meta.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required env variables: ${missing.join(', ')}`);
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