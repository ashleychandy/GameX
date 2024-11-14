import { useState, useEffect, useCallback } from 'react';
import { useContract } from './useContract';
import { useWallet } from '../contexts/WalletContext';
import { notify } from '../services/notifications';

export const useGameEvents = () => {
  const contract = useContract();
  const { account } = useWallet();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPastEvents = useCallback(async () => {
    if (!contract || !account) return;

    try {
      setLoading(true);
      const filter = contract.filters.GameResult(account);
      const events = await contract.queryFilter(filter, -10000, 'latest');
      
      const formattedResults = events.map(event => ({
        id: `${event.transactionHash}-${event.logIndex}`,
        player: event.args.player,
        guess: event.args.number.toString(),
        result: event.args.result.toString(),
        amount: event.args.amount,
        won: event.args.won,
        timestamp: new Date(event.block.timestamp * 1000).getTime()
      }));

      setResults(formattedResults.sort((a, b) => b.timestamp - a.timestamp));
    } catch (error) {
      console.error('Failed to fetch past events:', error);
      notify.error('Failed to load game history');
    } finally {
      setLoading(false);
    }
  }, [contract, account]);

  const handleGameResult = useCallback((player, number, result, amount, won, event) => {
    if (player.toLowerCase() !== account.toLowerCase()) return;

    setResults(prev => [{
      id: `${event.transactionHash}-${event.logIndex}`,
      player,
      guess: number.toString(),
      result: result.toString(),
      amount,
      won,
      timestamp: Date.now()
    }, ...prev]);
  }, [account]);

  useEffect(() => {
    fetchPastEvents();
  }, [fetchPastEvents]);

  useEffect(() => {
    if (!contract) return;

    const gameResultFilter = contract.filters.GameResult(account);
    contract.on(gameResultFilter, handleGameResult);

    return () => {
      contract.off(gameResultFilter, handleGameResult);
    };
  }, [contract, account, handleGameResult]);

  return {
    results,
    loading,
    refreshResults: fetchPastEvents
  };
}; 