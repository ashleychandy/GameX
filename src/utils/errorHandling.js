import { toast } from 'react-toastify';
import { CONTRACT_ERRORS } from './constants';

export const handleError = (error) => {
  console.error('Error:', error);

  // Check for custom contract errors
  if (error.data?.errorName) {
    switch (error.data.errorName) {
      case CONTRACT_ERRORS.INSUFFICIENT_ALLOWANCE:
        return { message: 'Please approve tokens first' };
      case CONTRACT_ERRORS.INVALID_BET_PARAMETERS:
        return { message: 'Invalid bet parameters' };
      case CONTRACT_ERRORS.GAME_ALREADY_ACTIVE:
        return { message: 'A game is already in progress' };
      case CONTRACT_ERRORS.INSUFFICIENT_BALANCE:
        return { message: 'Insufficient token balance' };
      default:
        return { message: error.data.errorName };
    }
  }

  // Handle user rejection
  if (error.code === 'ACTION_REJECTED') {
    return { message: 'Transaction rejected by user' };
  }

  // Handle network errors
  if (error.code === 'NETWORK_ERROR') {
    return { message: 'Network error occurred. Please try again.' };
  }

  // Return original error message if no specific handling
  return { message: error.message || 'An unexpected error occurred' };
};

export const showError = (error) => {
  const { message } = handleError(error);
  toast.error(message);
  return message;
};