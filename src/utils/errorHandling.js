import { toast } from 'react-toastify';
import { ERROR_CODES } from './constants';

export const handleError = (error) => {
  console.error('Error:', error);

  // Handle MetaMask/wallet errors
  if (error.code === 4001) {
    return {
      type: 'USER_REJECTED',
      message: 'Transaction rejected by user',
      severity: 'warning'
    };
  }

  // Handle chain/network errors
  if (error.code === 4902) {
    return {
      type: 'NETWORK_ERROR',
      message: 'Please add and switch to the correct network',
      severity: 'warning'
    };
  }

  // Handle wallet connection errors
  if (error.code === -32002) {
    return {
      type: 'WALLET_CONNECTION',
      message: 'Please unlock your wallet and try again',
      severity: 'warning'
    };
  }

  // Handle JSON-RPC errors
  if (error.code && error.code <= -32000 && error.code >= -32099) {
    return {
      type: 'RPC_ERROR',
      message: error.message || 'RPC Error occurred',
      severity: 'error',
      retryable: true
    };
  }

  // Handle network errors
  if (error.message?.includes('network') || error.message?.includes('connection')) {
    return {
      type: 'NETWORK_ERROR',
      message: 'Network error. Please check your connection',
      severity: 'error',
      retryable: true
    };
  }

  // Handle contract errors with better formatting
  if (error.reason) {
    return {
      type: 'CONTRACT_ERROR',
      message: formatContractError(error.reason),
      severity: 'error',
      data: error.data
    };
  }

  // Handle MetaMask provider errors
  if (error.message?.includes('MetaMask')) {
    return {
      type: 'WALLET_ERROR',
      message: error.message.replace('MetaMask ', ''),
      severity: 'error'
    };
  }

  // Handle other errors
  return {
    type: 'UNKNOWN_ERROR',
    message: error.message || 'An unknown error occurred',
    severity: 'error',
    original: error
  };
};

// Add helper function to format contract errors
export const formatContractError = (error) => {
  // Remove "execution reverted: " prefix if present
  const message = error.replace(/^execution reverted: /i, '');
  
  // Capitalize first letter and add period if missing
  return message.charAt(0).toUpperCase() + 
         message.slice(1) + 
         (message.endsWith('.') ? '' : '.');
};

export const isUserRejectionError = (error) => {
  return error.code === ERROR_CODES.USER_REJECTED;
};

export const isNetworkError = (error) => {
  return error.code === ERROR_CODES.NETWORK_ERROR;
};

export const isContractError = (error) => {
  return error.code === ERROR_CODES.CONTRACT_ERROR;
};

export const formatErrorMessage = (error) => {
  const { message } = handleError(error);
  return message;
};

export const logError = (error, context = '') => {
  const { code, message } = handleError(error);
  console.error(`[${context}] Error ${code}:`, message, error);
  return { code, message };
}; 