import { useMemo, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../contexts/WalletContext';
import { contracts } from '../config';

export function useContract(contractName) {
  const { signer, provider } = useWallet();
  const [isValid, setIsValid] = useState(false);

  const contract = useMemo(() => {
    if (!signer || !contracts[contractName]) {
      return null;
    }

    const { address, abi } = contracts[contractName];
    return new ethers.Contract(address, abi, signer);
  }, [signer, contractName]);

  useEffect(() => {
    const validateContract = async () => {
      if (!contract || !provider) return;
      
      try {
        const code = await provider.getCode(contract.target);
        setIsValid(code !== '0x');
      } catch (error) {
        console.error('Contract validation error:', error);
        setIsValid(false);
      }
    };

    validateContract();
  }, [contract, provider]);

  return { contract, isValid };
} 