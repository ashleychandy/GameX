import { useMemo, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../contexts/WalletContext';
import { contracts } from '../config';

export function useContract(contractName) {
  const { signer, provider } = useWallet();
  const [contract, setContract] = useState(null);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const initializeContract = async () => {
      if (!signer || !contracts[contractName]) {
        console.debug(`Contract ${contractName} initialization skipped:`, {
          hasSigner: !!signer,
          hasConfig: !!contracts[contractName]
        });
        setContract(null);
        setIsValid(false);
        return;
      }

      try {
        const { address, abi } = contracts[contractName];
        
        // Validate contract config
        if (!address || !abi) {
          console.error(`Invalid contract config for ${contractName}:`, { address, hasABI: !!abi });
          throw new Error('Invalid contract configuration');
        }

        // Validate ABI format
        if (!Array.isArray(abi)) {
          console.error(`Invalid ABI format for ${contractName}`);
          throw new Error('Invalid ABI format');
        }

        // Create interface first to validate it
        const contractInterface = new ethers.Interface(abi);
        
        // Verify interface has functions
        if (!contractInterface.fragments || contractInterface.fragments.length === 0) {
          console.error(`No functions found in ${contractName} ABI`);
          throw new Error('Contract ABI contains no functions');
        }

        // Create contract instance with validated interface
        const newContract = new ethers.Contract(address, contractInterface, signer);
        
        // Verify contract code exists on chain
        const code = await provider.getCode(address);
        const valid = code !== '0x' && code !== '0x0';
        
        if (!valid) {
          console.error(`No contract code found at ${address}`);
          throw new Error('No contract code found at address');
        }

        console.debug(`Contract ${contractName} initialization successful:`, {
          address,
          functionCount: contractInterface.fragments.length,
          isValid: valid,
          availableFunctions: Object.keys(contractInterface.functions)
        });

        setContract(newContract);
        setIsValid(valid);
      } catch (error) {
        console.error(`Error initializing ${contractName} contract:`, error);
        setContract(null);
        setIsValid(false);
      }
    };

    initializeContract();
  }, [contractName, signer, provider]);

  return { contract, isValid };
} 