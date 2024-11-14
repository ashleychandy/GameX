import { ethers } from "ethers";
import { format } from "date-fns";

/**
 * @param {string} text
 * @returns {Promise<boolean>}
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error("Failed to copy:", error);
    return false;
  }
};

/**
 * @param {Function} operation
 * @param {number} maxRetries
 * @param {number} delay
 */
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

/**
 * @param {string|number} value
 * @returns {string}
 */
export const formatAmount = (value) => {
  if (!value) return "0";
  try {
    return ethers.formatEther(value);
  } catch (error) {
    console.error("Error formatting amount:", error);
    return "0";
  }
};

/**
 * @param {number} timestamp
 * @returns {string}
 */
export const formatDate = (timestamp) => {
  return format(new Date(timestamp * 1000), "MMM d, yyyy HH:mm");
};

/**
 * @param {Object} data
 * @returns {Object}
 */
export const validateGameData = (data) => {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid game data format");
  }
  const requiredFields = ["isActive", "chosenNumber", "amount", "status"];
  const missingFields = requiredFields.filter(field => !(field in data));
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
  }
  return data;
};

// ... rest of the helper functions 