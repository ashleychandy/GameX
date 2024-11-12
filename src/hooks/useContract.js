import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../contexts/WalletContext';
import { NETWORKS } from '../utils/constants';
import { toast } from 'react-toastify';

export function useContract(contractType) {
  const [contract, setContract] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { provider, signer, isConnected, chainId } = useWallet();

  const initializeContract = useCallback(async () => {
    if (!isConnected || !provider || !signer) {
      setContract(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Validate network
      const network = NETWORKS[chainId];
      if (!network) {
        throw new Error('Unsupported network');
      }

      const contractConfig = network.contracts[contractType];
      if (!contractConfig) {
        throw new Error(`Contract ${contractType} not configured for network ${chainId}`);
      }

      // Verify contract deployment
      const code = await provider.getCode(contractConfig.address);
      if (code === '0x') {
        throw new Error(`Contract not deployed at ${contractConfig.address}`);
      }

      const contract = new ethers.Contract(
        contractConfig.address,
        contractConfig.abi,
        signer
      );

      setContract(contract);
    } catch (error) {
      setError(error.message);
      toast.error(`Failed to initialize ${contractType} contract: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [provider, signer, chainId, contractType, isConnected]);

  useEffect(() => {
    initializeContract();
  }, [initializeContract]);

  return { contract, isLoading, error };
} 