import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../contexts/WalletContext';
import { useTokenApproval } from './useTokenApproval';
import { handleError } from '../utils/errorHandling';
import { UI_STATES, TRANSACTION_TIMEOUT } from '../utils/constants';
import { toast } from 'react-toastify';

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
        toast.error(message);
        return false;
      }
    }
    return true;
  };

  const placeBet = useCallback(async (number, amount) => {
    if (!contract || !address) {
      throw new Error('Contract or wallet not connected');
    }

    try {
      setUiState(UI_STATES.PLACING_BET);
      
      const approved = await checkAndApproveToken(amount);
      if (!approved) {
        throw new Error('Token approval failed');
      }

      const tx = await contract.playDice(
        number, 
        ethers.parseEther(amount.toString()),
        { gasLimit: 500000 }
      );

      setUiState(UI_STATES.WAITING_FOR_RESULT);
      await tx.wait();
      
      return tx;
    } catch (error) {
      const { message } = handleError(error);
      throw new Error(message);
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
      const tx = await contract.resolveGame({ gasLimit: 300000 });
      await tx.wait();
      return tx;
    } catch (error) {
      const { message } = handleError(error);
      throw new Error(message);
    } finally {
      setUiState(UI_STATES.IDLE);
    }
  }, [contract, address]);

  const cancelGame = useCallback(async () => {
    if (!contract || !address) {
      throw new Error('Contract or wallet not connected');
    }

    try {
      setUiState(UI_STATES.RESOLVING);
      const tx = await contract.cancelGame({ gasLimit: 200000 });
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
    placeBet,
    resolveGame,
    cancelGame,
    uiState
  };
} 