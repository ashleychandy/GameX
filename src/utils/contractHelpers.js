import { ethers } from 'ethers';
import { TRANSACTION_TIMEOUT, ERROR_CODES } from './constants';
import { ValidationError } from './validation';

export class ContractError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = 'ContractError';
    this.code = code;
    this.details = details;
  }
}

export const getContractWithSigner = (contract, signer) => {
  if (!contract || !signer) {
    throw new ContractError(
      'Contract or signer not initialized',
      ERROR_CODES.INITIALIZATION_ERROR
    );
  }
  return contract.connect(signer);
};

export const executeTransaction = async (transaction, options = {}) => {
  const { 
    timeout = TRANSACTION_TIMEOUT,
    gasLimit,
    gasPrice
  } = options;

  try {
    const tx = await Promise.race([
      transaction({
        ...(gasLimit && { gasLimit }),
        ...(gasPrice && { gasPrice })
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Transaction timeout')), timeout)
      )
    ]);

    const receipt = await tx.wait();
    return validateContractResponse(receipt);
  } catch (error) {
    if (error.code === ERROR_CODES.USER_REJECTED) {
      throw new ContractError(
        'Transaction rejected by user',
        ERROR_CODES.USER_REJECTED
      );
    }

    throw new ContractError(
      error.message || 'Transaction failed',
      error.code || ERROR_CODES.CONTRACT_ERROR,
      { originalError: error }
    );
  }
};

export const estimateGas = async (contract, method, args = [], options = {}) => {
  try {
    const gasEstimate = await contract.estimateGas[method](...args, options);
    // Add 20% buffer for safety
    return gasEstimate.mul(120).div(100);
  } catch (error) {
    console.error('Gas estimation failed:', error);
    throw new ContractError(
      'Failed to estimate gas',
      ERROR_CODES.GAS_ESTIMATE_ERROR,
      { method, args, error }
    );
  }
};

export const formatContractError = (error) => {
  if (error.reason) {
    return new ContractError(error.reason, ERROR_CODES.CONTRACT_ERROR);
  }

  if (error.message.includes('user rejected')) {
    return new ContractError(
      'Transaction rejected by user',
      ERROR_CODES.USER_REJECTED
    );
  }

  return new ContractError(
    'Contract interaction failed',
    ERROR_CODES.CONTRACT_ERROR,
    { originalError: error }
  );
};

export const formatBetHistory = (bet) => {
  if (!bet) return null;
  
  return {
    chosenNumber: bet.chosenNumber.toString(),
    rolledNumber: bet.rolledNumber.toString(),
    amount: bet.amount.toString(),
    timestamp: bet.timestamp.toString()
  };
};

export const parseGameStatus = (status) => {
  const statuses = ['PENDING', 'STARTED', 'COMPLETED_WIN', 'COMPLETED_LOSS', 'CANCELLED'];
  return statuses[status] || 'UNKNOWN';
};

export const withRetry = async (fn, maxRetries = 3) => {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
  
  throw lastError;
}; 