import { useMemo } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../contexts/WalletContext';
import { contracts } from '../config';

export function useContract(contractName) {
  const { signer } = useWallet();

  return useMemo(() => {
    if (!signer || !contracts[contractName]) {
      return null;
    }

    const { address, abi } = contracts[contractName];
    return new ethers.Contract(address, abi, signer);
  }, [signer, contractName]);
} 