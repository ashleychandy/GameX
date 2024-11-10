import { useEffect } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { useWallet } from '../contexts/WalletContext';
import { EVENTS } from '../utils/constants';

export function useGameEvents(onGameUpdate) {
  const { contract, address } = useWallet();

  useEffect(() => {
    if (!contract || !address) return;

    const gameStartedFilter = contract.filters[EVENTS.GAME_STARTED](address);
    const gameCompletedFilter = contract.filters[EVENTS.GAME_COMPLETED](address);
    const randomWordsFilter = contract.filters[EVENTS.RANDOM_WORDS_FULFILLED]();

    const handleGameStarted = (player, number, amount, timestamp) => {
      if (player.toLowerCase() === address.toLowerCase()) {
        toast.info(`Bet placed: ${number} for ${ethers.formatEther(amount)} DICE`);
        onGameUpdate?.();
      }
    };

    const handleGameCompleted = (player, chosenNumber, result, amount, payout) => {
      if (player.toLowerCase() === address.toLowerCase()) {
        const won = payout > 0;
        toast[won ? 'success' : 'info'](
          won ? `You won ${ethers.formatEther(payout)} DICE!` : 'Better luck next time!'
        );
        onGameUpdate?.();
      }
    };

    contract.on(gameStartedFilter, handleGameStarted);
    contract.on(gameCompletedFilter, handleGameCompleted);
    contract.on(randomWordsFilter, onGameUpdate);

    return () => {
      contract.off(gameStartedFilter, handleGameStarted);
      contract.off(gameCompletedFilter, handleGameCompleted);
      contract.off(randomWordsFilter, onGameUpdate);
    };
  }, [contract, address, onGameUpdate]);
} 