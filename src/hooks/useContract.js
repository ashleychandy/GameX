import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../contexts/WalletContext';
import { NETWORKS } from '../utils/constants';
import DiceABI from '../abi/Dice.json';
import TokenABI from '../abi/Token.json';

const CONTRACT_TYPES = {
  dice: {
    address: NETWORKS.SEPOLIA.contracts.dice,
    abi: DiceABI.abi
  },
  token: {
    address: NETWORKS.SEPOLIA.contracts.token,
    abi: TokenABI.abi
  }
};

export function useContract(contractType) {
  const [contract, setContract] = useState(null);
  const [isValid, setIsValid] = useState(false);
  const { provider, signer, isConnected } = useWallet();

  const initializeContract = useCallback(async () => {
    if (!isConnected || !provider || !signer || !CONTRACT_TYPES[contractType]) {
      setContract(null);
      setIsValid(false);
      return;
    }

    try {
      const { address, abi } = CONTRACT_TYPES[contractType];
      
      if (!address) {
        console.error(`${contractType} contract address not configured`);
        return;
      }

      // Create contract instance
      const contract = new ethers.Contract(address, abi, signer);
      
      // Verify contract is deployed
      const code = await provider.getCode(address);
      if (code === '0x') {
        console.error(`${contractType} contract not deployed at ${address}`);
        return;
      }

      setContract(contract);
      setIsValid(true);
    } catch (error) {
      console.error(`Failed to initialize ${contractType} contract:`, error);
      setContract(null);
      setIsValid(false);
    }
  }, [provider, signer, contractType, isConnected]);

  useEffect(() => {
    initializeContract();
  }, [initializeContract]);

  return { contract, isValid };
} 