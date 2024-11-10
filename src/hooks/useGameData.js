import { useState, useRef } from 'react';

export function useGameData() {
  // Add proper data caching and management
  const cache = useRef(new Map());
  const [gameData, setGameData] = useState(null);

  const fetchGameData = async (gameId) => {
    // Check cache first
    if (cache.current.has(gameId)) {
      const cached = cache.current.get(gameId);
      if (Date.now() - cached.timestamp < 5 * 60 * 1000) {
        return cached.data;
      }
    }

    // Fetch fresh data
    const data = await fetchFromContract(gameId);
    
    // Update cache
    cache.current.set(gameId, {
      data,
      timestamp: Date.now()
    });

    return data;
  };

  // Add proper cache invalidation
  const invalidateCache = (gameId) => {
    if (gameId) {
      cache.current.delete(gameId);
    } else {
      cache.current.clear();
    }
  };
} 