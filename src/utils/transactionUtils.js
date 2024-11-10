import { toast } from 'react-toastify';
import { TRANSACTION_TIMEOUT, ERROR_CODES } from './constants';
import { ContractError } from './contractHelpers';

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

export const handleTransaction = async (
  transaction,
  {
    pendingMessage = 'Transaction pending...',
    successMessage = 'Transaction successful',
    errorMessage = 'Transaction failed',
    timeout = TRANSACTION_TIMEOUT
  } = {}
) => {
  const toastId = createTransactionToast(pendingMessage);

  try {
    const tx = await Promise.race([
      transaction(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Transaction timeout')), timeout)
      )
    ]);

    updateTransactionToast(toastId, 'Waiting for confirmation...');
    const receipt = await tx.wait();

    if (!receipt.status) {
      throw new ContractError('Transaction failed', ERROR_CODES.CONTRACT_ERROR);
    }

    updateTransactionToast(toastId, successMessage, 'success');
    return receipt;
  } catch (error) {
    const message = error.code === ERROR_CODES.USER_REJECTED
      ? 'Transaction rejected by user'
      : errorMessage;

    updateTransactionToast(toastId, message, 'error');
    throw error;
  }
};

export const estimateGas = async (contract, method, args = [], buffer = 1.1) => {
  try {
    const gasEstimate = await contract.estimateGas[method](...args);
    return Math.ceil(gasEstimate * buffer);
  } catch (error) {
    console.error('Gas estimation failed:', error);
    throw new ContractError(
      'Failed to estimate gas',
      ERROR_CODES.CONTRACT_ERROR,
      { method, args }
    );
  }
}; 