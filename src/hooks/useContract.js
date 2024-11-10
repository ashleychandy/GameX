import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { contracts } from '../config';

export function useContract(contractName) {
  const [contract, setContract] = useState(null);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const initializeContract = async () => {
      const { address, abi } = contracts[contractName];

      if (!address || !abi) {
        console.error(`Invalid contract config for ${contractName}`);
        setContract(null);
        setIsValid(false);
        return;
      }

      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const newContract = new ethers.Contract(address, abi, signer);

        const code = await provider.getCode(address);
        const valid = code !== '0x' && code !== '0x0';

        if (!valid) {
          console.error(`No contract code found at ${address}`);
          setContract(null);
          setIsValid(false);
          return;
        }

        setContract(newContract);
        setIsValid(true);
      } catch (error) {
        console.error(`Error initializing ${contractName} contract:`, error);
        setContract(null);
        setIsValid(false);
      }
    };

    initializeContract();
  }, [contractName]);

  return { contract, isValid };
} 