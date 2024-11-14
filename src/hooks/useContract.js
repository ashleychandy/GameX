import { useMemo } from 'react';
import { ethers } from 'ethers';
import { useWallet } from './useWallet';
import { DICE_GAME_ABI, TOKEN_ABI } from '@/contracts/abis';
import { config } from '@/config';

export function useContract(contractType = 'dice') {
  const { provider, signer } = useWallet();

  const contract = useMemo(() => {
    if (!provider || !signer) return null;

    const contracts = {
      dice: {
        address: config.contracts.dice,
        abi: DICE_GAME_ABI
      },
      token: {
        address: config.contracts.token,
        abi: TOKEN_ABI
      }
    };

    const { address, abi } = contracts[contractType];
    
    try {
      return new ethers.Contract(address, abi, signer);
    } catch (error) {
      console.error(`Failed to create ${contractType} contract instance:`, error);
      return null;
    }
  }, [provider, signer, contractType]);

  return { contract };
} 