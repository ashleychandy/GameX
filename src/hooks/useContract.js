import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../contexts/WalletContext';
import { DICE_GAME_ABI, DICE_GAME_ADDRESS } from '../config/contracts';

export const useContract = () => {
  const { provider, account } = useWallet();
  const [contract, setContract] = useState(null);

  useEffect(() => {
    if (!provider || !account) {
      setContract(null);
      return;
    }

    try {
      const signer = provider.getSigner(account);
      const gameContract = new ethers.Contract(
        DICE_GAME_ADDRESS,
        DICE_GAME_ABI,
        signer
      );
      setContract(gameContract);
    } catch (error) {
      console.error('Failed to create contract instance:', error);
      setContract(null);
    }
  }, [provider, account]);

  return contract;
}; 