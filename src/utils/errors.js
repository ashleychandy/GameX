import { toast } from 'react-toastify';

export const ERROR_CODES = {
  ACTION_REJECTED: 4001,
  NETWORK_ERROR: -32603,
  INSUFFICIENT_FUNDS: -32000
};

export const handleError = (error) => {
  console.error('Error:', error);
  
  const errorTypes = {
    [ERROR_CODES.ACTION_REJECTED]: 'Transaction rejected by user',
    [ERROR_CODES.NETWORK_ERROR]: 'Network error occurred',
    [ERROR_CODES.INSUFFICIENT_FUNDS]: 'Insufficient funds for transaction'
  };
  
  const errorMessage = errorTypes[error.code] || 'Transaction failed. Please try again.';
  toast.error(errorMessage);
  
  return {
    message: errorMessage,
    code: error.code,
    originalError: error
  };
}; 