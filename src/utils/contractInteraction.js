import { ethers } from 'ethers';
import { AppError } from './errorHandling';
import { ERROR_CODES, TRANSACTION_TIMEOUT } from './constants';

export const estimateGasWithBuffer = async (
  contract,
  method,
  args = [],
  options = {}
) => {
  try {
    const gasEstimate = await contract.estimateGas[method](...args, options);
    // Add 20% buffer for safety
    return gasEstimate.mul(120).div(100);
  } catch (error) {
    console.error('Gas estimation failed:', error);
    // Return a default high gas limit if estimation fails
    return ethers.BigNumber.from('500000');
  }
};

export const executeContractTransaction = async (
  contract,
  method,
  args = [],
  options = {}
) => {
  const {
    value = 0,
    gasLimit,
    gasPrice,
    nonce,
    timeout = TRANSACTION_TIMEOUT
  } = options;

  try {
    // Estimate gas if not provided
    const finalGasLimit = gasLimit || await estimateGasWithBuffer(
      contract,
      method,
      args,
      { value }
    );

    const transaction = await Promise.race([
      contract[method](...args, {
        value,
        gasLimit: finalGasLimit,
        ...(gasPrice && { gasPrice }),
        ...(nonce && { nonce })
      }),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new AppError('Transaction timeout', ERROR_CODES.TIMEOUT)),
          timeout
        )
      )
    ]);

    const receipt = await transaction.wait();
    
    if (receipt.status === 0) {
      throw new AppError('Transaction failed', ERROR_CODES.TRANSACTION_FAILED);
    }

    return receipt;
  } catch (error) {
    if (error instanceof AppError) throw error;

    if (error.code === 4001) {
      throw new AppError('Transaction rejected by user', ERROR_CODES.USER_REJECTED);
    }

    throw new AppError(
      error.message || 'Transaction failed',
      ERROR_CODES.TRANSACTION_FAILED,
      { originalError: error }
    );
  }
};

export const getContractEvents = async (
  contract,
  eventName,
  filter = {},
  fromBlock = 0,
  toBlock = 'latest'
) => {
  try {
    const events = await contract.queryFilter(
      contract.filters[eventName](...Object.values(filter)),
      fromBlock,
      toBlock
    );

    return events.map(event => ({
      ...event.args,
      transactionHash: event.transactionHash,
      blockNumber: event.blockNumber,
      timestamp: event.block?.timestamp || 0
    }));
  } catch (error) {
    throw new AppError(
      'Failed to fetch contract events',
      ERROR_CODES.EVENT_FETCH_ERROR,
      { originalError: error }
    );
  }
};

export const decodeContractError = (error) => {
  try {
    if (!error.data) return null;
    
    // Try to decode the error data
    const iface = new ethers.Interface([
      'error InvalidBetParameters()',
      'error InsufficientContractBalance()',
      'error InsufficientUserBalance()',
      'error GameError()',
      'error VRFError()',
      'error PayoutCalculationError()'
    ]);

    const decodedError = iface.parseError(error.data);
    return decodedError.name;
  } catch {
    return null;
  }
}; 