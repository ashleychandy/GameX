import { useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { toast } from 'react-toastify';
import { formatAmount } from '../utils/format';

export function useContractEvents() {
  const { diceContract: contract, address } = useWallet();

  useEffect(() => {
    if (!contract || !address) return;

    const handleGameStarted = (player, number, amount, event) => {
      if (player.toLowerCase() === address.toLowerCase()) {
        toast.info(
          `Bet placed: ${number} for ${formatAmount(amount)} DICE`,
          { toastId: event.transactionHash }
        );
      }
    };

    const handleGameCompleted = (player, result, payout, event) => {
      if (player.toLowerCase() === address.toLowerCase()) {
        const won = payout > 0;
        toast.success(
          won 
            ? `You won ${formatAmount(payout)} DICE!` 
            : 'Better luck next time!',
          { toastId: event.transactionHash }
        );
      }
    };

    const handlePaused = (account) => {
      toast.warning('Game has been paused by admin');
    };

    const handleUnpaused = (account) => {
      toast.success('Game has been unpaused');
    };

    // Add event listeners
    contract.on('GameStarted', handleGameStarted);
    contract.on('GameCompleted', handleGameCompleted);
    contract.on('Paused', handlePaused);
    contract.on('Unpaused', handleUnpaused);

    return () => {
      contract.off('GameStarted', handleGameStarted);
      contract.off('GameCompleted', handleGameCompleted);
      contract.off('Paused', handlePaused);
      contract.off('Unpaused', handleUnpaused);
    };
  }, [contract, address]);
} 