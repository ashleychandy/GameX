import { useMemo } from 'react';
import { ethers } from 'ethers';
import { useWallet } from './useWallet';
import { DICE_ABI, TOKEN_ABI } from '@/contracts/abis';
import { CONFIG } from '@/config';

export function useContract(contractType = 'dice') {
  const { provider, signer } = useWallet();

  const contract = useMemo(() => {
    if (!provider || !signer) return null;

    const contracts = {
      dice: {
        address: CONFIG.contracts.diceGameAddress,
        abi: DICE_ABI
      },
      token: {
        address: CONFIG.contracts.tokenAddress,
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