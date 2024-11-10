import { ethers } from 'ethers';
import { handleError } from './errorHandling';

// Game-specific contract helpers
export const GAME_STATES = {
  INACTIVE: 0,
  ACTIVE: 1,
  PENDING_VRF: 2,
  COMPLETED: 3,
  FAILED: 4
};

export const executeContractCall = async (contract, method, args = [], options = {}) => {
  try {
    const tx = await contract[method](...args, options);
    const receipt = await tx.wait();
    return receipt;
  } catch (error) {
    throw handleError(error);
  }
};

// Game-specific contract validations
export const validateGameState = async (contract, address) => {
  if (!contract || !address) {
    throw new Error('Contract or address not initialized');
  }

  try {
    const currentGame = await contract.getCurrentGame(address);
    return {
      canPlay: !currentGame.isActive,
      currentState: currentGame.status,
      hasActiveGame: currentGame.isActive
    };
  } catch (error) {
    throw handleError(error);
  }
};

// Game-specific event filters
export const getGameEventFilters = (contract, address) => {
  if (!contract || !address) return {};
  
  return {
    gameStarted: contract.filters.GameStarted(address),
    gameResolved: contract.filters.GameResolved(address),
    randomWordsFulfilled: contract.filters.RandomWordsFulfilled()
  };
};

// Format game data from contract
export const formatGameData = (gameData) => {
  return {
    isActive: gameData.isActive,
    chosenNumber: gameData.chosenNumber.toString(),
    result: gameData.result.toString(),
    amount: ethers.formatEther(gameData.amount),
    timestamp: gameData.timestamp.toString(),
    payout: ethers.formatEther(gameData.payout),
    status: gameData.status
  };
};

// Format request details from contract
export const formatRequestDetails = (details) => {
  return {
    requestId: details[0].toString(),
    requestFulfilled: details[1],
    requestActive: details[2]
  };
};

// Format bet history from contract
export const formatBetHistory = (bets) => {
  return bets.map(bet => ({
    chosenNumber: bet.chosenNumber.toString(),
    rolledNumber: bet.rolledNumber.toString(),
    amount: ethers.formatEther(bet.amount),
    timestamp: bet.timestamp.toString()
  }));
}; 