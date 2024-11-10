import { ethers } from 'ethers';

// Format address for display
export function formatAddress(address) {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Format token amount
export function formatAmount(amount) {
  if (!amount) return '0.00';
  try {
    // Handle string numbers that are already in decimal format
    if (typeof amount === 'string' && amount.includes('.')) {
      return parseFloat(amount).toFixed(2);
    }
    // Handle BigNumber values
    return parseFloat(ethers.formatEther(amount)).toFixed(2);
  } catch (error) {
    console.error('Error formatting amount:', error);
    return '0.00';
  }
}

// Parse amount to wei
export function parseAmount(amount, decimals = 18) {
  if (!amount) return '0';
  try {
    // Remove any trailing zeros after decimal
    const cleanAmount = amount.toString().replace(/\.?0+$/, '');
    return ethers.parseUnits(cleanAmount, decimals);
  } catch (error) {
    console.error('Error parsing amount:', error);
    return '0';
  }
}

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