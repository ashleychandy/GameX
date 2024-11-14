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
export const formatAmount = (value, decimals = 4) => {
  if (!value) return "0";
  try {
    return parseFloat(ethers.formatEther(value)).toFixed(decimals);
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

/**
 * @param {string} address
 * @param {number} chars
 * @returns {string}
 */
export const shortenAddress = (address, chars = 4) => {
  if (!address) return '';
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
};

/**
 * @param {number} ms
 * @returns {Promise<void>}
 */
export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * @param {string} amount
 * @returns {ethers.BigNumber}
 */
export const parseAmount = (amount) => {
  if (!amount) return ethers.constants.Zero;
  try {
    return ethers.parseEther(amount.toString());
  } catch (error) {
    console.error("Error parsing amount:", error);
    return ethers.constants.Zero;
  }
};

// ... rest of the helper functions 