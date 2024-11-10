import { useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { toast } from 'react-toastify';
import { formatAmount } from '../utils/format';

export function useContractEvents() {
  const { diceContract: dice, address } = useWallet();

  useEffect(() => {
    if (!dice || !address) return;

    const betPlacedFilter = dice.filters.GameStarted(address);
    const gameResolvedFilter = dice.filters.GameCompleted(address);
    const vrfFulfilledFilter = dice.filters.RandomWordsFulfilled();

    const handleBetPlaced = (player, number, amount, event) => {
      toast.info(
        `Bet placed: ${number} for ${formatAmount(amount)} DICE`,
        { toastId: event.transactionHash }
      );
    };

    const handleGameResolved = (player, result, payout, event) => {
      const won = payout > 0;
      toast.success(
        won 
          ? `You won ${formatAmount(payout)} DICE!` 
          : 'Better luck next time!',
        { toastId: event.transactionHash }
      );
    };

    const handleVRFFulfilled = (requestId, randomWord) => {
      console.debug('VRF fulfilled:', { requestId, randomWord });
    };

    dice.on(betPlacedFilter, handleBetPlaced);
    dice.on(gameResolvedFilter, handleGameResolved);
    dice.on(vrfFulfilledFilter, handleVRFFulfilled);

    return () => {
      dice.off(betPlacedFilter, handleBetPlaced);
      dice.off(gameResolvedFilter, handleGameResolved);
      dice.off(vrfFulfilledFilter, handleVRFFulfilled);
    };
  }, [dice, address]);
} 