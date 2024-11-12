import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { switchNetwork, isCorrectNetwork } from '../config/networks';
import { toast } from 'react-toastify';

export function useNetwork() {
  const { provider, isConnected } = useWallet();
  const [chainId, setChainId] = useState(null);
  const [isCorrectChain, setIsCorrectChain] = useState(false);

  // Update chain state when network changes
  useEffect(() => {
    if (!provider || !isConnected) return;

    const handleChainChanged = (newChainId) => {
      setChainId(Number(newChainId));
      setIsCorrectChain(isCorrectNetwork(newChainId));
    };

    // Get initial chain
    provider.getNetwork().then(network => {
      handleChainChanged(network.chainId);
    });

    // Listen for chain changes
    provider.on('chainChanged', handleChainChanged);

    return () => {
      provider.removeListener('chainChanged', handleChainChanged);
    };
  }, [provider, isConnected]);

  // Function to switch networks
  const switchToCorrectNetwork = useCallback(async () => {
    if (!provider) return;

    try {
      await switchNetwork(provider);
      toast.success('Successfully switched network');
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  }, [provider]);

  return {
    chainId,
    isCorrectChain,
    switchToCorrectNetwork
  };
} 