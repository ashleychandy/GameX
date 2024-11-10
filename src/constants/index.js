export const CHAIN_IDS = {
  SEPOLIA: 11155111,
  MAINNET: 1
};

export const NETWORKS = {
  [CHAIN_IDS.SEPOLIA]: {
    chainId: `0x${Number(CHAIN_IDS.SEPOLIA).toString(16)}`,
    chainName: 'Sepolia Test Network',
    nativeCurrency: {
      name: 'Sepolia ETH',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: [import.meta.env.SEPOLIA_TESTNET_RPC],
    blockExplorerUrls: [import.meta.env.VITE_EXPLORER_URL]
  }
};

export const DICE_CONTRACT_ADDRESS = import.meta.env.VITE_DICE_GAME_ADDRESS;
export const TOKEN_CONTRACT_ADDRESS = import.meta.env.VITE_TOKEN_ADDRESS;

export const GAME_STATES = {
  PENDING: 'PENDING',
  WAITING_FOR_RANDOM: 'WAITING_FOR_RANDOM',
  READY_TO_RESOLVE: 'READY_TO_RESOLVE',
  COMPLETED: 'COMPLETED'
};

export const PAYOUT_MULTIPLIER = 6;
export const MIN_BET = '1';
export const MAX_BET = '1000';