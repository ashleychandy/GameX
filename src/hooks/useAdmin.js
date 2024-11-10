import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../contexts/WalletContext';
import { ROLES } from '../utils/constants';
import { handleError } from '../utils/errorHandling';
import { toast } from 'react-toastify';

export function useAdmin() {
  const { tokenContract: token, diceContract: dice, address } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleTransaction = async (operation, successMessage) => {
    try {
      setIsLoading(true);
      setError(null);
      const tx = await operation();
      toast.info('Transaction submitted...');
      await tx.wait();
      toast.success(successMessage);
      return true;
    } catch (error) {
      const { message } = handleError(error);
      setError(message);
      toast.error(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const mintTokens = useCallback(async (to, amount) => {
    if (!token) return;
    return handleTransaction(
      () => token.mint(to, ethers.parseEther(amount)),
      `Successfully minted ${amount} tokens to ${to}`
    );
  }, [token]);

  const setHouseEdge = useCallback(async (newEdge) => {
    if (!dice) return;
    return handleTransaction(
      () => dice.setHouseEdge(ethers.parseEther(newEdge)),
      `House edge updated to ${newEdge}%`
    );
  }, [dice]);

  const withdrawFunds = useCallback(async (amount) => {
    if (!dice) return;
    return handleTransaction(
      () => dice.withdrawFunds(ethers.parseEther(amount)),
      `Successfully withdrawn ${amount} tokens`
    );
  }, [dice]);

  const pauseGame = useCallback(async () => {
    if (!dice) return;
    return handleTransaction(
      () => dice.pause(),
      'Game paused successfully'
    );
  }, [dice]);

  const unpauseGame = useCallback(async () => {
    if (!dice) return;
    return handleTransaction(
      () => dice.unpause(),
      'Game unpaused successfully'
    );
  }, [dice]);

  const setHistorySize = useCallback(async (size) => {
    if (!dice) return;
    return handleTransaction(
      () => dice.setHistorySize(size),
      `History size updated to ${size}`
    );
  }, [dice]);

  const setCallbackGasLimit = useCallback(async (limit) => {
    if (!dice) return;
    return handleTransaction(
      () => dice.setCallbackGasLimit(limit),
      `Callback gas limit updated to ${limit}`
    );
  }, [dice]);

  const setCoordinator = useCallback(async (coordinatorAddress) => {
    if (!dice) return;
    return handleTransaction(
      () => dice.setCoordinator(coordinatorAddress),
      'VRF Coordinator updated successfully'
    );
  }, [dice]);

  const grantTokenRole = useCallback(async (role, account) => {
    if (!token) return;
    const roleHash = ROLES[role];
    return handleTransaction(
      () => token.grantRole(roleHash, account),
      `${role} granted to ${account}`
    );
  }, [token]);

  const revokeTokenRole = useCallback(async (role, account) => {
    if (!token) return;
    const roleHash = ROLES[role];
    return handleTransaction(
      () => token.revokeRole(roleHash, account),
      `${role} revoked from ${account}`
    );
  }, [token]);

  return {
    isLoading,
    error,
    mintTokens,
    setHouseEdge,
    withdrawFunds,
    pauseGame,
    unpauseGame,
    setHistorySize,
    setCallbackGasLimit,
    setCoordinator,
    grantTokenRole,
    revokeTokenRole
  };
} 