import { toast } from 'react-toastify';
import { TRANSACTION_TIMEOUT, ERROR_CODES } from './constants';
import { ContractError, handleContractError } from './contractHelpers';

export const createTransactionToast = (message, type = 'info') => {
  const toastId = Date.now();
  toast[type](message, {
    toastId,
    autoClose: false,
    closeButton: true
  });
  return toastId;
};

export const updateTransactionToast = (toastId, message, type = 'success') => {
  toast.update(toastId, {
    render: message,
    type,
    autoClose: 5000
  });
};

export const handleTransaction = async (tx, options = {}) => {
  const { onSubmitted, onSuccess, onError } = options;
  
  try {
    if (onSubmitted) onSubmitted();
    const receipt = await tx.wait();
    if (onSuccess) onSuccess(receipt);
    return receipt;
  } catch (error) {
    if (onError) onError(error);
    throw error;
  }
};

export const estimateGas = async (contract, method, args = []) => {
  try {
    const gasEstimate = await contract.estimateGas[method](...args);
    return Math.floor(gasEstimate * 1.2); // Add 20% buffer
  } catch (error) {
    console.error('Gas estimation failed:', error);
    return 500000; // Default fallback gas limit
  }
};

export const executeTransaction = async (transaction, options = {}) => {
  try {
    const tx = await transaction();
    const receipt = await tx.wait();
    return receipt;
  } catch (error) {
    throw handleContractError(error);
  }
}; 