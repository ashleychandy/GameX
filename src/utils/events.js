export const setupGameEventListeners = (contract, callbacks) => {
    if (!contract) return;
    
    contract.on("GameStarted", callbacks.onGameStarted);
    contract.on("GameResolved", callbacks.onGameResolved);
    
    return () => {
        contract.off("GameStarted", callbacks.onGameStarted);
        contract.off("GameResolved", callbacks.onGameResolved);
    };
}; 