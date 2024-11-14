import { useEffect, useCallback } from 'react';
import { useContract } from './useContract';
import { useGame } from '../contexts/GameContext';
import { toast } from 'react-toastify';

export const useContractEvents = () => {
  const contract = useContract();
  const { setGameHistory } = useGame();

  const handleGameResult = useCallback((player, number, result, amount, won, event) => {
    const gameResult = {
      player,
      number: number.toString(),
      result: result.toString(),
      amount: amount.toString(),
      won,
      txHash: event.transactionHash,
      timestamp: new Date().getTime(),
    };

    setGameHistory(prev => [...prev, gameResult]);
    
    toast.success(
      won ? `Won ${ethers.formatEther(amount)} ETH!` : 'Better luck next time!',
      { position: 'top-right' }
    );
  }, [setGameHistory]);

  useEffect(() => {
    if (!contract) return;

    const gameResultFilter = contract.filters.GameResult();
    
    contract.on(gameResultFilter, handleGameResult);

    return () => {
      contract.off(gameResultFilter, handleGameResult);
    };
  }, [contract, handleGameResult]);
}; 