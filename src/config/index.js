// Network Configuration
export const NETWORK_CONFIG = {
  chainId: import.meta.env.VITE_CHAIN_ID || '11155111', // Sepolia testnet
  rpcUrl: import.meta.env.VITE_SEPOLIA_RPC,
  name: 'Sepolia Testnet',
  explorer: import.meta.env.VITE_EXPLORER_URL || 'https://sepolia.etherscan.io',
  nativeCurrency: {
    name: 'Sepolia ETH',
    symbol: 'ETH',
    decimals: 18
  }
};

// Contract Addresses
export const CONTRACT_ADDRESSES = {
  token: import.meta.env.VITE_TOKEN_ADDRESS,
  diceGame: import.meta.env.VITE_DICE_GAME_ADDRESS
};

// Game Configuration
export const GAME_CONFIG = {
  minBet: '0.1',
  maxBet: '1000', 
  multiplier: 6,
  numbers: [1, 2, 3, 4, 5, 6],
  chainLink: {
    callbackGasLimit: 2500000,
    requestConfirmations: 3,
    numWords: 1
  }
};

// Export consolidated config
export const config = {
  network: NETWORK_CONFIG,
  contracts: CONTRACT_ADDRESSES,
  game: GAME_CONFIG
};


export const SUPPORTED_NETWORKS = {
  // Ethereum Mainnet
  1: {
    chainId: '0x1',
    chainName: 'Ethereum Mainnet',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://mainnet.infura.io/v3/YOUR-PROJECT-ID'],
    blockExplorerUrls: ['https://etherscan.io'],
  },
  // Sepolia Testnet
  11155111: {
    chainId: '0xaa36a7',
    chainName: 'Sepolia Testnet',
    nativeCurrency: {
      name: 'Sepolia Ether',
      symbol: 'SEP',
      decimals: 18,
    },
    rpcUrls: ['https://sepolia.infura.io/v3/YOUR-PROJECT-ID'],
    blockExplorerUrls: ['https://sepolia.etherscan.io'],
  },
};

export const DEFAULT_CHAIN_ID = 11155111; // Sepolia Testnet