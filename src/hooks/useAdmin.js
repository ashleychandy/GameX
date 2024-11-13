import { ethers } from "ethers";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { config } from "./config";

// Environment variable validation
const getEnvVar = (name, fallback = "") => {
  const value = import.meta.env[name];
  if (!value && !fallback) {
    console.warn(
      `Environment variable ${name} not found, using fallback value`
    );
  }
  return value || fallback;
};

// Constants
export const CONTRACTS = {
  DICE: config.contracts.dice.address,
  TOKEN: config.contracts.token.address,
};

export const CHAIN_CONFIG = {
  CHAIN_ID: config.network.chainId,
  RPC_URL: config.network.rpcUrl,
  EXPLORER_URL: config.network.explorerUrl,
};

export const VRF_CONFIG = {
  coordinator: config.chainlink.coordinator,
  keyHash: config.chainlink.keyHash,
  subscriptionId: config.chainlink.subscriptionId,
  callbackGasLimit: config.chainlink.callbackGasLimit,
  requestConfirmations: config.chainlink.requestConfirmations,
  numWords: config.chainlink.numWords,
};

export const GAME_STATES = {
  IDLE: 0,
  ACTIVE: 1,
  PENDING_VRF: 2,
  COMPLETED: 3,
  FAILED: 4,
};

export const GAME_CONFIG = {
  PAYOUT_MULTIPLIER: 6,
  MIN_BET: "0.000000000000000001",
  MAX_RETRIES: 3,
  POLLING_INTERVAL: 5000,
};

export const ERROR_MESSAGES = {
  INVALID_BET_PARAMETERS: "Invalid bet parameters",
  INSUFFICIENT_CONTRACT_BALANCE: "Insufficient contract balance",
  INSUFFICIENT_USER_BALANCE: "Insufficient user balance",
  TRANSFER_FAILED: "Token transfer failed",
  GAME_ERROR: "Game error",
  VRF_ERROR: "VRF error",
  ROLE_ERROR: "Role error",
  PAYOUT_CALCULATION_ERROR: "Payout calculation error",
  NETWORK_ERROR: "Network error occurred",
  USER_REJECTED: "Transaction rejected by user",
  CHAIN_MISMATCH: "Please switch to the correct network",
};

export const EVENTS = {
  GAME_STARTED: "GameStarted",
  GAME_COMPLETED: "GameCompleted",
  RANDOM_WORDS_FULFILLED: "RandomWordsFulfilled",
};

export const TIME = {
  POLL_INTERVAL: 10000,
};

export const ERROR_CODES = {
  USER_REJECTED: 4001,
  NETWORK_ERROR: -32603,
  INSUFFICIENT_FUNDS: -32000,
  UNPREDICTABLE_GAS_LIMIT: -32603,
};

export const NETWORKS = {
  SEPOLIA: {
    chainId: config.network.chainId,
    name: "Sepolia",
    rpcUrl: config.network.rpcUrl,
    explorer: config.network.explorerUrl,
    contracts: {
      dice: config.contracts.dice.address,
      token: config.contracts.token.address,
      chainlink: config.chainlink.token,
    },
  },
};

export const DEFAULT_NETWORK = NETWORKS.SEPOLIA;
export const SUPPORTED_CHAIN_ID = config.network.chainId;
export const POLLING_INTERVAL = 5000;
export const TRANSACTION_TIMEOUT = 30000;

export const ROLES = {
  DEFAULT_ADMIN_ROLE:
    "0x0000000000000000000000000000000000000000000000000000000000000000",
  MINTER_ROLE: ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE")),
  BURNER_ROLE: ethers.keccak256(ethers.toUtf8Bytes("BURNER_ROLE")),
};

export const UI_STATES = {
  IDLE: "idle",
  APPROVING: "approving",
  PLACING_BET: "placingBet",
  WAITING_FOR_RESULT: "waitingForResult",
  RESOLVING: "resolving",
  CLAIMING: "claiming",
};

// Formatting Functions
export const formatAmount = (value) => {
  if (!value) return "0";
  try {
    return ethers.formatEther(value);
  } catch (error) {
    console.error("Error formatting amount:", error);
    return "0";
  }
};

export const formatAddress = (address) => {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatDate = (timestamp) => {
  try {
    return format(new Date(timestamp * 1000), "MMM d, yyyy HH:mm");
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid date";
  }
};

export const formatNumber = (num) => {
  if (!num) return "0";
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export const formatTimestamp = (timestamp) => {
  if (!timestamp) return "";
  return new Date(timestamp * 1000).toLocaleString();
};

export const formatGameStatus = (status) => {
  return status.replace(/_/g, " ").toLowerCase();
};

// Game State Functions
export const getGameState = (game, hasPendingRequest) => {
  if (!game?.isActive) return "PENDING";
  if (hasPendingRequest) return "WAITING_FOR_RANDOM";
  if (game.result !== "0") return "COMPLETED";
  return "READY_TO_RESOLVE";
};

export const calculateMaxBet = (contractBalance) => {
  try {
    if (!contractBalance || contractBalance.eq(0))
      return ethers.parseEther("0");
    return contractBalance.div(100);
  } catch (error) {
    console.error("Error calculating max bet:", error);
    return ethers.parseEther("0");
  }
};

export const calculateWinRate = (wins, total) => {
  if (!total) return 0;
  return ((wins / total) * 100).toFixed(1);
};

// Data Formatting Functions
export const formatGameData = (data) => {
  if (!data) return null;
  try {
    return {
      isActive: Boolean(data.isActive),
      chosenNumber: data.chosenNumber?.toString() || "0",
      result: data.result?.toString() || "0",
      amount: formatAmount(data.amount || "0"),
      timestamp: data.timestamp?.toString() || "0",
      payout: formatAmount(data.payout || "0"),
      randomWord: data.randomWord?.toString() || "0",
      status: data.status?.toString() || "0",
    };
  } catch (error) {
    console.error("Error formatting game data:", error);
    return null;
  }
};

export const formatStats = (stats) => {
  if (!stats) return null;
  try {
    return {
      winRate: stats.winRate?.toString() || "0",
      averageBet: formatAmount(stats.averageBet || "0"),
      totalGamesWon: stats.totalGamesWon?.toString() || "0",
      totalGamesLost: stats.totalGamesLost?.toString() || "0",
    };
  } catch (error) {
    console.error("Error formatting stats:", error);
    return null;
  }
};

export const formatBetHistory = (bet) => {
  try {
    return {
      chosenNumber: bet.chosenNumber?.toString() || "0",
      rolledNumber: bet.rolledNumber?.toString() || "0",
      amount: formatAmount(bet.amount || "0"),
      timestamp: bet.timestamp?.toString() || "0",
    };
  } catch (error) {
    console.error("Error formatting bet history:", error);
    return null;
  }
};

// Contract Interaction Functions
export const executeContractTransaction = async (
  contract,
  method,
  args = [],
  options = {}
) => {
  const {
    value = 0,
    gasLimit,
    gasPrice,
    nonce,
    timeout = TRANSACTION_TIMEOUT,
    onSuccess,
    onError,
    onPending,
  } = options;

  try {
    const finalGasLimit =
      gasLimit ||
      (await estimateGasWithBuffer(contract, method, args, { value }));

    const transaction = await Promise.race([
      contract[method](...args, {
        value,
        gasLimit: finalGasLimit,
        ...(gasPrice && { gasPrice }),
        ...(nonce && { nonce }),
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Transaction timeout")), timeout)
      ),
    ]);

    onPending?.(transaction.hash);
    const receipt = await transaction.wait();

    if (receipt.status === 1) {
      onSuccess?.(receipt);
      return receipt;
    } else {
      throw new Error("Transaction failed");
    }
  } catch (error) {
    onError?.(error);
    throw error;
  }
};

export const estimateGasWithBuffer = async (
  contract,
  method,
  args = [],
  options = {}
) => {
  try {
    const gasEstimate = await contract.estimateGas[method](...args, options);
    return gasEstimate.mul(120).div(100); // Add 20% buffer
  } catch (error) {
    console.error("Gas estimation failed:", error);
    return ethers.BigNumber.from("500000");
  }
};

// Toast Notifications
export const createTransactionToast = (message, type = "info") => {
  const toastId = Date.now();
  toast[type](message, {
    toastId,
    autoClose: false,
    closeButton: true,
  });
  return toastId;
};

export const updateTransactionToast = (toastId, message, type = "success") => {
  toast.update(toastId, {
    render: message,
    type,
    autoClose: 5000,
  });
};

// Error Handling
export const handleError = (error) => {
  console.error("Error:", error);

  if (error.code === ERROR_CODES.USER_REJECTED) {
    return {
      message: "Transaction rejected by user",
      code: "USER_REJECTED",
    };
  }

  if (error.code === ERROR_CODES.NETWORK_ERROR) {
    return {
      message: "Network error occurred. Please check your connection.",
      code: "NETWORK_ERROR",
    };
  }

  if (error.code === ERROR_CODES.INSUFFICIENT_FUNDS) {
    return {
      message: "Insufficient funds for transaction",
      code: "INSUFFICIENT_FUNDS",
    };
  }

  if (error.message?.includes("execution reverted")) {
    const reason = error.data?.message || "Transaction failed";
    return {
      message: reason,
      code: "CONTRACT_ERROR",
    };
  }

  return {
    message: error.message || "An unknown error occurred",
    code: "UNKNOWN_ERROR",
  };
};

// Utility Functions
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error("Failed to copy:", error);
    return false;
  }
};

export const retryOperation = async (
  operation,
  maxRetries = 3,
  delay = 1000
) => {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
};

export const validateGameData = (data) => {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid game data format");
  }

  const requiredFields = ["isActive", "chosenNumber", "amount", "status"];
  const missingFields = requiredFields.filter((field) => !(field in data));

  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
  }

  return data;
};
