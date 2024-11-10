import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../contexts/WalletContext';
import { ROLES } from '../utils/constants';
import { handleError } from '../utils/helpers';
import { toast } from 'react-toastify';

export function useAdmin() {
  const { tokenContract: token, diceContract: dice, address } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const checkIsAdmin = useCallback(async () => {
    if (!token || !address) return false;
    try {
      const hasAdminRole = await token.hasRole(ROLES.DEFAULT_ADMIN_ROLE, address);
      return hasAdminRole;
    } catch (error) {
      console.error('Error checking admin role:', error);
      return false;
    }
  }, [token, address]);

  const mintTokens = useCallback(async (to, amount) => {
    if (!token) return;
    try {
      setIsLoading(true);
      setError(null);
      const tx = await token.mint(to, ethers.parseEther(amount));
      toast.info('Minting tokens...');
      await tx.wait();
      toast.success(`Successfully minted ${amount} GAMEX to ${to}`);
    } catch (error) {
      const { message } = handleError(error);
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const setHouseEdge = useCallback(async (newEdge) => {
    if (!dice) return;
    try {
      setIsLoading(true);
      setError(null);
      const tx = await dice.setHouseEdge(ethers.parseEther(newEdge));
      toast.info('Setting house edge...');
      await tx.wait();
      toast.success(`House edge updated to ${newEdge}%`);
    } catch (error) {
      const { message } = handleError(error);
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [dice]);

  const handleOperation = async (operation, successMessage) => {
    try {
      setIsLoading(true);
      setError(null);
      const tx = await operation();
      toast.info('Transaction submitted...');
      await tx.wait();
      toast.success(successMessage);
    } catch (error) {
      const { message } = handleError(error);
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const withdrawFunds = useCallback(async (amount) => {
    if (!dice) return;
    await handleOperation(
      () => dice.withdrawFunds(ethers.parseEther(amount)),
      `Successfully withdrawn ${amount} GAMEX`
    );
  }, [dice]);

  const pauseGame = useCallback(async () => {
    if (!dice) return;
    try {
      setIsLoading(true);
      setError(null);
      const tx = await dice.pause();
      toast.info('Pausing game...');
      await tx.wait();
      toast.success('Game paused successfully');
    } catch (error) {
      const { message } = handleError(error);
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [dice]);

  const unpauseGame = useCallback(async () => {
    if (!dice) return;
    try {
      setIsLoading(true);
      setError(null);
      const tx = await dice.unpause();
      toast.info('Unpausing game...');
      await tx.wait();
      toast.success('Game unpaused successfully');
    } catch (error) {
      const { message } = handleError(error);
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [dice]);

  return {
    isLoading,
    checkIsAdmin,
    mintTokens,
    setHouseEdge,
    withdrawFunds,
    pauseGame,
    unpauseGame
  };
} 