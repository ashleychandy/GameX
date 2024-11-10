import { ethers } from 'ethers';

export const formatAmount = (amount) => {
  try {
    return ethers.formatEther(amount.toString());
  } catch (error) {
    console.error('Error formatting amount:', error);
    return '0';
  }
};

export const parseAmount = (amount) => {
  try {
    return ethers.parseEther(amount.toString());
  } catch (error) {
    console.error('Error parsing amount:', error);
    return ethers.parseEther('0');
  }
}; 