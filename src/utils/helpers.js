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
export const shortenAddress = (address) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
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

// Add isValidAddress function
export const isValidAddress = (address) => {
  try {
    return ethers.isAddress(address);
  } catch (error) {
    return false;
  }
};

// Add additional helper for role management
export const ADMIN_ROLE = ethers.keccak256(
  ethers.toUtf8Bytes("ADMIN_ROLE")
);

export const hasRole = async (contract, role, address) => {
  try {
    return await contract.hasRole(role, address);
  } catch (error) {
    console.error('Error checking role:', error);
    return false;
  }
};

export const formatEther = (value) => {
  if (!value) return '0';
  try {
    return ethers.formatEther(value);
  } catch (error) {
    console.error('Error formatting ether:', error);
    return '0';
  }
};

export const parseEther = (value) => {
  if (!value) return ethers.parseEther('0');
  try {
    return ethers.parseEther(value.toString());
  } catch (error) {
    console.error('Error parsing ether:', error);
    return ethers.parseEther('0');
  }
};

export const validateBetAmount = (amount, minBet, maxBet) => {
  const value = parseFloat(amount);
  if (isNaN(value)) return false;
  if (value < parseFloat(minBet)) return false;
  if (value > parseFloat(maxBet)) return false;
  return true;
};

export const calculateWinAmount = (betAmount, multiplier = 5) => {
  try {
    const amount = parseFloat(betAmount);
    return (amount * multiplier).toFixed(4);
  } catch (error) {
    return '0';
  }
};

export const getErrorMessage = (error) => {
  if (typeof error === 'string') return error;
  if (error.reason) return error.reason;
  if (error.message) return error.message;
  return 'An unknown error occurred';
};

// ... rest of the helper functions 