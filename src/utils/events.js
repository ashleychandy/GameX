export const GAME_EVENTS = {
  GAME_STARTED: 'GameStarted',
  GAME_COMPLETED: 'GameCompleted',
  WINNINGS_CLAIMED: 'WinningsClaimed',
  GAME_CANCELLED: 'GameCancelled'
};

export const setupGameEventListeners = (contract, callbacks) => {
  if (!contract) return () => {};

  const listeners = Object.entries(callbacks).map(([event, callback]) => {
    if (GAME_EVENTS[event]) {
      contract.on(GAME_EVENTS[event], callback);
      return () => contract.off(GAME_EVENTS[event], callback);
    }
    return () => {};
  });

  return () => listeners.forEach(cleanup => cleanup());
}; 