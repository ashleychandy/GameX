import { ethers } from 'ethers';
import { TRANSACTION_TIMEOUT, ERROR_CODES, GAME_STATUS } from './constants';
import { handleError } from './errorHandling';

export const executeTransaction = async (
  transactionFn,
  { 
    timeout = TRANSACTION_TIMEOUT,
    gasLimit,
    gasPrice,
    nonce,
    value
  } = {}
) => {
  try {
    const tx = await Promise.race([
      transactionFn({
        ...(gasLimit && { gasLimit }),
        ...(gasPrice && { gasPrice }),
        ...(nonce && { nonce }),
        ...(value && { value })
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Transaction timeout')), timeout)
      )
    ]);

    const receipt = await tx.wait();
    
    if (receipt.status === 0) {
      throw new Error('Transaction failed');
    }

    return receipt;
  } catch (error) {
    const { message, code } = handleError(error);
    
    // Rethrow user rejections without modification
    if (code === ERROR_CODES.USER_REJECTED) {
      throw error;
    }

    throw new Error(`Transaction failed: ${message}`);
  }
};

export const estimateGas = async (contract, method, args = [], value = 0) => {
  try {
    const gasEstimate = await contract.estimateGas[method](...args, { value });
    // Add 20% buffer to gas estimate
    return gasEstimate.mul(120).div(100);
  } catch (error) {
    console.error('Gas estimation failed:', error);
    throw error;
  }
};

export const validateGameState = (gameState) => {
  if (!gameState) {
    return {
      isActive: false,
      status: GAME_STATUS.IDLE,
      chosenNumber: 0,
      amount: ethers.parseEther('0'),
      requestId: null,
      result: null,
      payout: ethers.parseEther('0')
    };
  }

  return {
    isActive: gameState.isActive || false,
    status: gameState.status || GAME_STATUS.IDLE,
    chosenNumber: Number(gameState.chosenNumber) || 0,
    amount: gameState.amount || ethers.parseEther('0'),
    requestId: gameState.requestId || null,
    result: gameState.result ? Number(gameState.result) : null,
    payout: gameState.payout || ethers.parseEther('0')
  };
};

export const validateGameData = (data) => {
  return {
    isActive: data?.isActive || false,
    chosenNumber: data?.chosenNumber?.toString() || '0',
    amount: data?.amount?.toString() || '0',
    status: data?.status || GAME_STATUS.IDLE,
    requestId: data?.requestId || null,
    result: data?.result?.toString() || null,
    payout: data?.payout?.toString() || '0'
  };
};

export class ContractError extends Error {
  constructor(message, code = 'CONTRACT_ERROR') {
    super(message);
    this.name = 'ContractError';
    this.code = code;
  }
}

export const handleContractError = (error) => {
  // Handle specific contract errors
  if (error.code === 'ACTION_REJECTED') {
    throw new ContractError('Transaction was rejected by user', 'USER_REJECTED');
  }
  
  if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
    throw new ContractError('Transaction would fail - check your inputs', 'TRANSACTION_WOULD_FAIL');
  }

  // Generic contract error
  throw new ContractError(error.message || 'Contract operation failed');
};