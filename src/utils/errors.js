import { toast } from 'react-toastify';

export const ERROR_CODES = {
  ACTION_REJECTED: 4001,
  NETWORK_ERROR: -32603,
  INSUFFICIENT_FUNDS: -32000,
  CHAIN_NOT_ADDED: 4902
};

export const handleError = (error) => {
  console.error('Error:', error);
  
  const errorMessages = {
    [ERROR_CODES.ACTION_REJECTED]: 'Transaction rejected by user',
    [ERROR_CODES.NETWORK_ERROR]: 'Network error occurred',
    [ERROR_CODES.INSUFFICIENT_FUNDS]: 'Insufficient funds for transaction',
    [ERROR_CODES.CHAIN_NOT_ADDED]: 'Network not added to MetaMask'
  };
  
  const message = errorMessages[error.code] || error.message || 'An error occurred';
  toast.error(message);
  
  return {
    message,
    code: error.code,
    originalError: error
  };
};

export class WalletError extends Error {
  constructor(message) {
    super(message);
    this.name = 'WalletError';
  }
}

export class ContractError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ContractError';
  }
}

export const ERROR_MESSAGES = {
  WALLET_NOT_CONNECTED: 'Please connect your wallet',
  WRONG_NETWORK: 'Please switch to the correct network',
  INSUFFICIENT_FUNDS: 'Insufficient funds for transaction',
  INVALID_BET_AMOUNT: 'Invalid bet amount',
  INVALID_NUMBER: 'Please select a valid number (1-6)',
}; 