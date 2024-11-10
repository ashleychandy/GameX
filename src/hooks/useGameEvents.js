import { useEffect } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { useWallet } from '../contexts/WalletContext';

export function useGameEvents(onGameUpdate) {
  const { diceContract: contract, address } = useWallet();

  useEffect(() => {
    if (!contract || !address) return;

    const betPlacedFilter = contract.filters.BetPlaced(address);
    const gameResolvedFilter = contract.filters.GameResolved(address);
    const randomWordsFilter = contract.filters.RandomWordsFulfilled();

    const handleBetPlaced = (player, number, amount, timestamp) => {
      if (player.toLowerCase() === address.toLowerCase()) {
        toast.info(`Bet placed: ${number} for ${ethers.formatEther(amount)} DICE`);
        onGameUpdate?.();
      }
    };

    const handleGameResolved = (player, result, payout) => {
      if (player.toLowerCase() === address.toLowerCase()) {
        const won = payout > 0;
        toast[won ? 'success' : 'info'](
          won ? `You won ${ethers.formatEther(payout)} DICE!` : 'Better luck next time!'
        );
        onGameUpdate?.();
      }
    };

    contract.on(betPlacedFilter, handleBetPlaced);
    contract.on(gameResolvedFilter, handleGameResolved);
    contract.on(randomWordsFilter, onGameUpdate);

    return () => {
      contract.off(betPlacedFilter, handleBetPlaced);
      contract.off(gameResolvedFilter, handleGameResolved);
      contract.off(randomWordsFilter, onGameUpdate);
    };
  }, [contract, address, onGameUpdate]);
} 