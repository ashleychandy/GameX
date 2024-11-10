import { useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { toast } from 'react-toastify';
import { formatAmount } from '../utils/helpers';

export function useContractEvents() {
  const { diceContract: dice, address } = useWallet();

  useEffect(() => {
    if (!dice || !address) return;

    const betPlacedFilter = dice.filters.BetPlaced(address);
    const gameResolvedFilter = dice.filters.GameResolved(address);

    const handleBetPlaced = (player, number, amount, event) => {
      toast.info(
        `Bet placed: ${number} for ${formatAmount(amount)} GAMEX`,
        { toastId: event.transactionHash }
      );
    };

    const handleGameResolved = (player, result, payout, event) => {
      const won = payout > 0;
      toast.success(
        won 
          ? `You won ${formatAmount(payout)} GAMEX!` 
          : 'Better luck next time!',
        { toastId: event.transactionHash }
      );
    };

    dice.on(betPlacedFilter, handleBetPlaced);
    dice.on(gameResolvedFilter, handleGameResolved);

    return () => {
      dice.off(betPlacedFilter, handleBetPlaced);
      dice.off(gameResolvedFilter, handleGameResolved);
    };
  }, [dice, address]);
} 