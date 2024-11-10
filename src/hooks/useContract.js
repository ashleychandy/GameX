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
      setContract(null);
      setIsValid(false);
      return;
    }

    try {
      const { address, abi } = CONTRACT_TYPES[contractType];
      const contract = new ethers.Contract(address, abi, signer);
      
      // Verify contract is deployed
      const code = await provider.getCode(address);
      if (code === '0x') {
        throw new Error('Contract not deployed');
      }

      setContract(contract);
      setIsValid(true);
    } catch (error) {
      console.error(`Failed to initialize ${contractType} contract:`, error);
      setContract(null);
      setIsValid(false);
    }
  }, [provider, signer, contractType]);

  useEffect(() => {
    initializeContract();
  }, [initializeContract]);

  return { contract, isValid };
} 