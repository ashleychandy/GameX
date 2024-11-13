import { toast } from "react-toastify";
import { ERROR_CODES } from "./constants";

export const ERROR_CODES = {
  USER_REJECTED: 4001,
  NETWORK_ERROR: -32603,
  INSUFFICIENT_FUNDS: -32000,
  UNPREDICTABLE_GAS_LIMIT: -32603,
};

export const handleError = (error) => {
  console.error("Error:", error);

  // Handle user rejection
  if (error.code === ERROR_CODES.USER_REJECTED) {
    return {
      message: "Transaction rejected by user",
      code: "USER_REJECTED",
    };
  }

  // Handle network errors
  if (error.code === ERROR_CODES.NETWORK_ERROR) {
    return {
      message: "Network error occurred. Please check your connection.",
      code: "NETWORK_ERROR",
    };
  }

  // Handle insufficient funds
  if (error.code === ERROR_CODES.INSUFFICIENT_FUNDS) {
    return {
      message: "Insufficient funds for transaction",
      code: "INSUFFICIENT_FUNDS",
    };
  }

  // Handle contract errors
  if (error.message?.includes("execution reverted")) {
    const reason = error.data?.message || "Transaction failed";
    return {
      message: reason,
      code: "CONTRACT_ERROR",
    };
  }

  // Handle gas estimation failures
  if (error.code === ERROR_CODES.UNPREDICTABLE_GAS_LIMIT) {
    return {
      message: "Transaction would fail. Check your inputs.",
      code: "GAS_ESTIMATE_FAILED",
    };
  }

  // Handle other errors
  return {
    message: error.message || "An unknown error occurred",
    code: "UNKNOWN_ERROR",
  };
};

export const showError = (error) => {
  const errorDetails = handleError(error);
  toast.error(errorDetails.message);
  return errorDetails;
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
