import { ethers } from 'ethers';

// Format amount with proper decimals
export const formatAmount = (amount) => {
  if (!amount) return '0';
  return ethers.formatEther(amount);
};

// Format address to truncated form
export const formatAddress = (address) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Format date to readable string
export const formatDate = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(Number(timestamp) * 1000);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Handle errors and return message
export const handleError = (error) => {
  console.error('Error:', error);
  
  if (typeof error === 'string') {
    return { message: error };
  }

  if (error.reason) {
    return { message: error.reason };
  }

  if (error.message) {
    // Clean up common MetaMask error messages
    if (error.message.includes('user rejected')) {
      return { message: 'Transaction rejected by user' };
    }
    if (error.message.includes('insufficient funds')) {
      return { message: 'Insufficient funds for transaction' };
    }
    return { message: error.message };
  }

  return { message: 'An unexpected error occurred' };
};

// Copy text to clipboard
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy:', error);
    return false;
  }
};

// Format number with commas
export const formatNumber = (num) => {
  if (!num) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// Format timestamp
export function formatTimestamp(timestamp) {
  if (!timestamp) return '';
  return new Date(timestamp * 1000).toLocaleString();
}

// Calculate win rate
export function calculateWinRate(wins, total) {
  if (!total) return 0;
  return ((wins / total) * 100).toFixed(1);
}

// Format game status
export function formatGameStatus(status) {
  return status.replace(/_/g, ' ').toLowerCase();
}

export function getGameState(game, hasPendingRequest) {
  if (!game?.isActive) return 'PENDING';
  if (hasPendingRequest) return 'WAITING_FOR_RANDOM';
  if (game.result !== '0') return 'COMPLETED';
  return 'READY_TO_RESOLVE';
} 