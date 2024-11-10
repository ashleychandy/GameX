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

// Handle errors
export function handleError(error) {
  console.error('Error:', error);
  
  if (error.code === 'ACTION_REJECTED') {
    return { message: 'Transaction rejected by user' };
  }
  
  if (error.code === 'INSUFFICIENT_FUNDS') {
    return { message: 'Insufficient funds for transaction' };
  }

  if (error.code === 'CALL_EXCEPTION') {
    return { message: 'Contract call failed' };
  }

  if (error.data?.message) {
    return { message: error.data.message };
  }

  if (error.message) {
    // Clean up common web3 error messages
    let message = error.message
      .replace('MetaMask Tx Signature: ', '')
      .replace('execution reverted: ', '')
      .replace('missing revert data', 'Contract call failed');
    return { message };
  }

  return { message: 'An unexpected error occurred' };
}

export function getGameState(game, hasPendingRequest) {
  if (!game?.isActive) return 'PENDING';
  if (hasPendingRequest) return 'WAITING_FOR_RANDOM';
  if (game.result !== '0') return 'COMPLETED';
  return 'READY_TO_RESOLVE';
} 