import { useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';

export function useContractEvents(contract, address, refreshGameState) {
  const eventHandlersRef = useRef({});

  const handleGameEvent = useCallback(async (...args) => {
    try {
      await refreshGameState();
      
      const [eventName] = args;
      switch(eventName) {
        case 'GameStarted':
          toast.info('New game started!');
          break;
        case 'GameCompleted':
          toast.success('Game completed!');
          break;
        case 'GameCancelled':
          toast.warning('Game cancelled');
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error handling game event:', error);
      toast.error('Failed to update game state');
    }
  }, [refreshGameState]);

  useEffect(() => {
    if (!contract || !address) return;

    const filters = [
      contract.filters.GameStarted(address),
      contract.filters.GameCompleted(address),
      contract.filters.GameCancelled(address),
      contract.filters.BetPlaced(address),
      contract.filters.FundsRecovered(address)
    ];

    // Store event handlers to prevent duplicate listeners
    eventHandlersRef.current = filters.map(filter => ({
      filter,
      handler: (...args) => handleGameEvent(...args)
    }));

    // Add listeners
    eventHandlersRef.current.forEach(({ filter, handler }) => {
      contract.on(filter, handler);
    });

    return () => {
      // Remove listeners
      eventHandlersRef.current.forEach(({ filter, handler }) => {
        contract.off(filter, handler);
      });
    };
  }, [contract, address, handleGameEvent]);

  // Expose method to manually refresh events
  const refreshEvents = useCallback(async () => {
    if (!contract || !address) return;
    
    try {
      const blockNumber = await contract.provider.getBlockNumber();
      const events = await contract.queryFilter({
        address: contract.address,
        fromBlock: blockNumber - 100, // Last 100 blocks
        toBlock: 'latest'
      });
      
      return events;
    } catch (error) {
      console.error('Error refreshing events:', error);
      return [];
    }
  }, [contract, address]);

  return { refreshEvents };
} 