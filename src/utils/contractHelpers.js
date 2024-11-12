import { ethers } from 'ethers';
import { toast } from 'react-toastify';

export const executeContractTransaction = async (
  contract,
  method,
  args = [],
  options = {}
) => {
  const {
    onSuccess,
    onError,
    onPending,
    gasLimitMultiplier = 1.2,
    value = 0
  } = options;

  try {
    // Estimate gas with safety buffer
    const gasEstimate = await contract.estimateGas[method](...args, { value });
    const gasLimit = gasEstimate.mul(Math.floor(gasLimitMultiplier * 100)).div(100);

    // Execute transaction
    const tx = await contract[method](...args, { gasLimit, value });
    onPending?.(tx.hash);
    toast.info(`Transaction submitted: ${tx.hash}`);

    // Wait for confirmation
    const receipt = await tx.wait();
    
    if (receipt.status === 1) {
      onSuccess?.(receipt);
      return receipt;
    } else {
      throw new Error('Transaction failed');
    }
  } catch (error) {
    const message = error.reason || error.message;
    onError?.(message);
    toast.error(message);
    throw error;
  }
};

export const executeContractCall = async (
  contract,
  method,
  args = [],
  options = {}
) => {
  try {
    return await contract[method](...args, options);
  } catch (error) {
    console.error(`Failed to execute contract call: ${method}`, error);
    throw error;
  }
};