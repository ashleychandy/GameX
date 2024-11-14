export const GAME_STATES = {
  IDLE: 'IDLE',
  BETTING: 'BETTING',
  ROLLING: 'ROLLING',
  COMPLETE: 'COMPLETE'
};

export const TRANSACTION_STATES = {
  NONE: 'NONE',
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  FAILED: 'FAILED'
};

export const NETWORK_NAMES = {
  1: 'Ethereum Mainnet',
  11155111: 'Sepolia Testnet'
};

export const MIN_BET = '0.01';
export const MAX_BET = '1.0';
export const DEFAULT_GAS_LIMIT = 250000; 