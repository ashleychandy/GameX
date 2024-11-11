import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../contexts/WalletContext';
import { useTokenApproval } from './useTokenApproval';
import { handleError } from '../utils/errors';
import { estimateGas } from '../utils/gas';
import { UI_STATES } from '../utils/constants';

const handleContractError = (error) => {
  if (error.message.includes('arithmetic underflow or overflow')) {
    throw new Error('Invalid bet amount. Please check your input.');
  }
  
  if (error.message.includes('missing revert data')) {
    throw new Error('Transaction failed. Please try again.');
  }

  if (error.code === 'ACTION_REJECTED') {
    throw new Error('Transaction rejected by user');
  }

  if (error.code === 'INSUFFICIENT_FUNDS') {
    throw new Error('Insufficient funds for transaction');
  }

  throw new Error(error.message || 'Transaction failed');
};

export function useContractInteraction() {
  const { contract, address } = useWallet();
  const { approve, allowance } = useTokenApproval(contract?.address);
  const [uiState, setUiState] = useState(UI_STATES.IDLE);

  const checkAndApproveToken = async (amount) => {
    const parsedAmount = ethers.parseEther(amount.toString());
    const currentAllowance = ethers.parseEther(allowance);

    if (currentAllowance.lt(parsedAmount)) {
      try {
        setUiState(UI_STATES.APPROVING);
        await approve(amount);
        return true;
      } catch (error) {
        const { message } = handleError(error);
        throw new Error(message);
      }
    }
    return true;
  };

  const playDice = useCallback(async (number, amount) => {
    if (!contract || !address) {
      throw new Error('Contract or wallet not connected');
    }

    try {
      setUiState(UI_STATES.PLACING_BET);
      
      if (amount.lte(0)) {
        throw new Error('Bet amount must be greater than 0');
      }

      const approved = await checkAndApproveToken(amount);
      if (!approved) {
        throw new Error('Token approval failed');
      }

      const contractBalance = await contract.getContractBalance();
      if (amount.gt(contractBalance)) {
        throw new Error('Bet amount exceeds contract balance');
      }

      const gasLimit = await estimateGas(
        contract,
        'playDice',
        [number, amount],
        { gasLimitMultiplier: 1.2 }
      );

      const tx = await contract.playDice(number, amount, { gasLimit });
      setUiState(UI_STATES.WAITING_FOR_RESULT);
      await tx.wait();
      
      return tx;
    } catch (error) {
      handleContractError(error);
    } finally {
      setUiState(UI_STATES.IDLE);
    }
  }, [contract, address, checkAndApproveToken]);

  const resolveGame = useCallback(async () => {
    if (!contract || !address) {
      throw new Error('Contract or wallet not connected');
    }

    try {
      setUiState(UI_STATES.RESOLVING);
      const gasLimit = await estimateGas(contract, 'resolveGame');
      const tx = await contract.resolveGame({ gasLimit });
      await tx.wait();
      return tx;
    } catch (error) {
      const { message } = handleError(error);
      throw new Error(message);
    } finally {
      setUiState(UI_STATES.IDLE);
    }
  }, [contract, address]);

  const recoverStuckGame = useCallback(async (playerAddress) => {
    if (!contract || !address) {
      throw new Error('Contract or wallet not connected');
    }

    try {
      setUiState(UI_STATES.RECOVERING);
      const gasLimit = await estimateGas(contract, 'recoverStuckGame', [playerAddress]);
      const tx = await contract.recoverStuckGame(playerAddress, { gasLimit });
      await tx.wait();
      return tx;
    } catch (error) {
      const { message } = handleError(error);
      throw new Error(message);
    } finally {
      setUiState(UI_STATES.IDLE);
    }
  }, [contract, address]);

  const forceStopGame = useCallback(async (playerAddress) => {
    if (!contract || !address) {
      throw new Error('Contract or wallet not connected');
    }

    try {
      setUiState(UI_STATES.FORCE_STOPPING);
      const gasLimit = await estimateGas(contract, 'forceStopGame', [playerAddress]);
      const tx = await contract.forceStopGame(playerAddress, { gasLimit });
      await tx.wait();
      return tx;
    } catch (error) {
      const { message } = handleError(error);
      throw new Error(message);
    } finally {
      setUiState(UI_STATES.IDLE);
    }
  }, [contract, address]);

  const pause = useCallback(async () => {
    if (!contract || !address) {
      throw new Error('Contract or wallet not connected');
    }

    try {
      setUiState(UI_STATES.PAUSING);
      const gasLimit = await estimateGas(contract, 'pause');
      const tx = await contract.pause({ gasLimit });
      await tx.wait();
      return tx;
    } catch (error) {
      const { message } = handleError(error);
      throw new Error(message);
    } finally {
      setUiState(UI_STATES.IDLE);
    }
  }, [contract, address]);

  const unpause = useCallback(async () => {
    if (!contract || !address) {
      throw new Error('Contract or wallet not connected');
    }

    try {
      setUiState(UI_STATES.UNPAUSING);
      const gasLimit = await estimateGas(contract, 'unpause');
      const tx = await contract.unpause({ gasLimit });
      await tx.wait();
      return tx;
    } catch (error) {
      const { message } = handleError(error);
      throw new Error(message);
    } finally {
      setUiState(UI_STATES.IDLE);
    }
  }, [contract, address]);

  return {
    playDice,
    resolveGame,
    recoverStuckGame,
    forceStopGame,
    pause,
    unpause,
    uiState
  };
} 