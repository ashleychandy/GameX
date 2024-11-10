import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../contexts/WalletContext';
import { CONTRACTS } from '../utils/constants';
import DiceABI from '../abi/Dice.json';
import TokenABI from '../abi/Token.json';
import { handleError } from '../utils/errorHandling';

const CONTRACT_TYPES = {
  dice: {
    address: CONTRACTS.DICE,
    abi: DiceABI.abi
  },
  token: {
    address: CONTRACTS.TOKEN,
    abi: TokenABI.abi
  }
};

export function useContract(contractType) {
  const [contract, setContract] = useState(null);
  const [isValid, setIsValid] = useState(false);
  const { provider, signer } = useWallet();

  const initializeContract = useCallback(async () => {
    if (!provider || !signer || !CONTRACT_TYPES[contractType]) {
      setIsValid(false);
      return;
    }

    try {
      const { address, abi } = CONTRACT_TYPES[contractType];
      if (!address || !abi) {
        throw new Error(`Invalid contract configuration for ${contractType}`);
      }

      const contract = new ethers.Contract(address, abi, signer);
      setContract(contract);
      setIsValid(true);
    } catch (error) {
      console.error(`Failed to initialize ${contractType} contract:`, error);
      setIsValid(false);
    }
  }, [provider, signer, contractType]);

  useEffect(() => {
    initializeContract();
  }, [initializeContract]);

  return { contract, isValid };
} 