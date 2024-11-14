import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';

const CHAIN_ID = import.meta.env.VITE_CHAIN_ID || '1';
const RPC_URL = import.meta.env.VITE_RPC_URL;

export const useWallet = () => {
  const [address, setAddress] = useState(null);
  const [provider, setProvider] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [networkError, setNetworkError] = useState(false);

  const checkNetwork = useCallback(async (provider) => {
    const network = await provider.getNetwork();
    const isCorrectNetwork = network.chainId === Number(CHAIN_ID);
    setNetworkError(!isCorrectNetwork);
    return isCorrectNetwork;
  }, []);

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      toast.error('Please install MetaMask');
      return;
    }

    try {
      setIsConnecting(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      
      const isCorrectNetwork = await checkNetwork(provider);
      if (!isCorrectNetwork) {
        toast.error('Please switch to the correct network');
        return;
      }

      setProvider(provider);
      setAddress(accounts[0]);
      localStorage.setItem('walletConnected', 'true');
    } catch (error) {
      console.error('Wallet connection error:', error);
      toast.error('Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  }, [checkNetwork]);

  const disconnect = useCallback(() => {
    setAddress(null);
    setProvider(null);
    localStorage.removeItem('walletConnected');
  }, []);

  useEffect(() => {
    const handleAccountsChanged = (accounts) => {
      setAddress(accounts[0] || null);
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      // Auto-connect if previously connected
      if (localStorage.getItem('walletConnected') === 'true') {
        connect();
      }
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [connect]);

  return {
    address,
    provider,
    connect,
    disconnect,
    isConnecting,
    networkError
  };
};