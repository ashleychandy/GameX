import React, {
  createContext,
  useContext,
  useReducer,
} from "react";
import { GAME_STATES } from "../utils/constants";

const GameContext = createContext(null);

const initialState = {
  gameData: null,
  playerStats: null,
  previousBets: [],
  isLoading: false,
  error: null,
  currentGame: {
    isActive: false,
    chosenNumber: null,
    amount: null,
    status: GAME_STATES.IDLE,
  },
};

const gameReducer = (state, action) => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload, isLoading: false };

    case "UPDATE_GAME_DATA":
      return {
        ...state,
        gameData: action.payload,
        currentGame: action.payload.currentGame || state.currentGame,
        playerStats: action.payload.playerStats,
        previousBets: action.payload.previousBets || [],
        isLoading: false,
        error: null,
      };

    case "RESET_GAME":
      return {
        ...state,
        currentGame: {
          isActive: false,
          chosenNumber: null,
          amount: null,
          status: GAME_STATES.IDLE,
        },
        error: null,
      };

    default:
      return state;
  }
};

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const value = {
    ...state,
    setLoading,
    setError,
    updateGameData,
    resetGame,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export const useGameContext = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGameContext must be used within a GameProvider");
  }
  return context;
};
