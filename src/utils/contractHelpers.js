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

export const executeTransaction = async (transaction, options = {}) => {
  const { timeout = TRANSACTION_TIMEOUT } = options;

  try {
    // Send transaction with timeout
    const tx = await Promise.race([
      transaction(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Transaction timeout')), timeout)
      )
    ]);

    // Wait for confirmation
    const receipt = await tx.wait();
    
    if (!receipt.status) {
      throw new ContractError(
        'Transaction failed',
        ERROR_CODES.CONTRACT_ERROR,
        { receipt }
      );
    }

    return receipt;
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

export const validateContractState = async (contract, requirements = {}) => {
  if (!contract) {
    throw new ValidationError('Contract not initialized');
  }

  try {
    // Check if contract is deployed
    const code = await contract.provider.getCode(contract.target);
    if (code === '0x') {
      throw new ValidationError('Contract not deployed');
    }

    // Check additional requirements
    for (const [check, message] of Object.entries(requirements)) {
      if (!await check()) {
        throw new ValidationError(message);
      }
    }

    return true;
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new ContractError(
      'Contract validation failed',
      ERROR_CODES.CONTRACT_ERROR,
      { originalError: error }
    );
  }
};

export const formatContractError = (error) => {
  // Handle specific contract revert reasons
  if (error.data?.message) {
    return new ContractError(
      error.data.message,
      ERROR_CODES.CONTRACT_ERROR
    );
  }

  // Handle user rejection
  if (error.code === ERROR_CODES.USER_REJECTED) {
    return new ContractError(
      'Transaction rejected by user',
      ERROR_CODES.USER_REJECTED
    );
  }

  // Handle network errors
  if (error.code === ERROR_CODES.NETWORK_ERROR) {
    return new ContractError(
      'Network error occurred',
      ERROR_CODES.NETWORK_ERROR
    );
  }

  return new ContractError(
    error.message || 'Unknown contract error',
    error.code || ERROR_CODES.CONTRACT_ERROR
  );
}; 