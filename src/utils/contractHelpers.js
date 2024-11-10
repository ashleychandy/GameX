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
    const tx = await Promise.race([
      transaction(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Transaction timeout')), timeout)
      )
    ]);

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

export const validateGameState = (gameState) => {
  if (!gameState) return null;

  return {
    isActive: gameState.isActive || false,
    chosenNumber: gameState.chosenNumber?.toString() || '0',
    result: gameState.result?.toString() || '0',
    amount: gameState.amount?.toString() || '0',
    timestamp: gameState.timestamp?.toString() || '0',
    payout: gameState.payout?.toString() || '0',
    randomWord: gameState.randomWord?.toString() || '0',
    status: gameState.status || 0
  };
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