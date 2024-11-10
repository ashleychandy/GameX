import { toast } from 'react-toastify';
import { ERROR_CODES } from './constants';

export const handleError = (error, fallback = 'An unexpected error occurred') => {
  console.error('Error:', error);

  if (error?.code === 'ACTION_REJECTED') {
    return 'Transaction was rejected by user';
  }

  if (error?.message) {
    // Clean up common Web3 error messages
    let message = error.message
      .replace('MetaMask Tx Signature: ', '')
      .replace('Error: ', '');
      
    // Limit length for display
    return message.length > 150 
      ? message.substring(0, 150) + '...'
      : message;
  }

  return fallback;
};

export const isUserRejection = (error) => {
  return error?.code === 'ACTION_REJECTED' || 
         error?.code === 4001 ||
         error?.message?.includes('User denied');
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