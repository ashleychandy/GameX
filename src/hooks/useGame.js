import { useCallback, useRef, useState, useEffect } from "react";
import { useContract } from "./useContract";
import { useWallet } from "../contexts/WalletContext";
import { handleError } from "../utils/errorHandling";
import { validateGameData } from "../utils/format";
import { toast } from "react-toastify";
import { ethers } from "ethers";
import { 
  GAME_CONFIG, 
  UI_STATES, 
  GAME_STATES,
  SUPPORTED_CHAIN_ID 
} from "../utils/constants";
import { 
  formatGameData, 
  formatRequestDetails, 
  formatBetHistory 
} from "../utils/contractHelpers";

export function useGame() {
  const { contract, isValid } = useContract("dice");
  const { address, signer, chainId } = useWallet();
  const [gameData, setGameData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [uiState, setUiState] = useState(UI_STATES.IDLE);

  // Define isCorrectNetwork first
  const isCorrectNetwork = useCallback(() => {
    const currentChainId = typeof chainId === "bigint" ? Number(chainId) : chainId;
    return currentChainId === SUPPORTED_CHAIN_ID;
  }, [chainId]);

  // Then define canSelectNumber
  const canSelectNumber = useCallback(
    (number) => {
      if (!isCorrectNetwork()) {
        return false;
      }

      if (!contract || !address) {
        return false;
      }

      // Validate number range
      if (number < GAME_CONFIG.MIN_NUMBER || number > GAME_CONFIG.MAX_NUMBER) {
        return false;
      }

      // Check if there's no active game
      if (gameData?.currentGame?.isActive) {
        return false;
      }

      return true;
    },
    [gameData, contract, address, isCorrectNetwork]
  );

  // Now we can define handleNumberSelect
  const handleNumberSelect = useCallback((number) => {
    if (canSelectNumber(number)) {
      setSelectedNumber(number);
      setUiState(UI_STATES.SELECTING);
    } else {
      toast.error("Cannot select number at this time");
    }
  }, [canSelectNumber]);

  const clearNumberSelection = useCallback(() => {
    setSelectedNumber(null);
    setUiState(UI_STATES.IDLE);
  }, []);

  // Add getUIState helper
  const getUIState = useCallback(() => {
    if (error) return UI_STATES.ERROR;
    if (isLoading) return uiState;
    if (!gameData?.currentGame) return UI_STATES.IDLE;

    const { currentGame, requestDetails } = gameData;
    if (currentGame.isActive && !requestDetails.requestFulfilled) {
      return UI_STATES.WAITING_FOR_RESULT;
    }
    if (currentGame.isActive && requestDetails.requestFulfilled) {
      return UI_STATES.RESOLVING;
    }
    return UI_STATES.IDLE;
  }, [gameData, error, isLoading, uiState]);

  // Add fetchGameState
  const fetchGameState = useCallback(async () => {
    if (!isValid || !contract || !address) return;

    try {
      setIsLoading(true);
      setError(null);

      const [currentGame, requestDetails, previousBets] = await Promise.all([
        contract.getCurrentGame(address),
        contract.getCurrentRequestDetails(address),
        contract.getPreviousBets(address)
      ]);

      const formattedGameData = {
        currentGame: formatGameData(currentGame),
        requestDetails: formatRequestDetails(requestDetails),
        previousBets: formatBetHistory(previousBets)
      };

      setGameData(formattedGameData);
    } catch (error) {
      console.error("Error fetching game data:", error);
      setError(handleError(error));
    } finally {
      setIsLoading(false);
    }
  }, [contract, address, isValid]);

  // Add playDice function
  const playDice = useCallback(async (number, amount) => {
    if (!contract || !address) throw new Error("Contract not initialized");
    if (!isCorrectNetwork()) throw new Error("Please connect to correct network");

    try {
      const tx = await contract.playDice(number, ethers.parseEther(amount));
      return tx;
    } catch (error) {
      throw handleError(error);
    }
  }, [contract, address, isCorrectNetwork]);

  // Add resolveGame function
  const resolveGame = useCallback(async () => {
    if (!contract || !address) throw new Error("Contract not initialized");

    try {
      const tx = await contract.resolveGame();
      return tx;
    } catch (error) {
      throw handleError(error);
    }
  }, [contract, address]);

  // Return the hook's interface
  return {
    gameData,
    isLoading,
    error,
    selectedNumber,
    handleNumberSelect,
    clearNumberSelection,
    canSelectNumber,
    playDice,
    resolveGame,
    fetchGameState,
    isCorrectNetwork: isCorrectNetwork(),
    hasActiveGame: gameData?.currentGame?.isActive ?? false,
    isGameResolvable: gameData?.currentGame?.isActive && gameData?.requestDetails?.requestFulfilled,
    uiState: getUIState(),
    isNumberSelected: (number) => selectedNumber === number,
    availableNumbers: Array.from(
      { length: GAME_CONFIG.MAX_NUMBER }, 
      (_, i) => i + 1
    ),
    canPlay: !gameData?.currentGame?.isActive && selectedNumber !== null,
    networkStatus: {
      isCorrectNetwork: isCorrectNetwork(),
      chainId,
      requiredChainId: SUPPORTED_CHAIN_ID
    }
  };
}
