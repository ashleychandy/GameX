import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { handleError } from '../utils/errorHandling';

const WalletContext = createContext();

export function WalletProvider({ children }) {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [address, setAddress] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [chainId, setChainId] = useState(null);
  const [balance, setBalance] = useState('0');

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast.error('Please install MetaMask to use this application');
      return;
    }

    try {
      setIsConnecting(true);
      
      // Request account access
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const network = await provider.getNetwork();
      const balance = await provider.getBalance(accounts[0]);
      
      setProvider(provider);
      setSigner(signer);
      setAddress(accounts[0]);
      setChainId(network.chainId);
      setBalance(balance.toString());
      setIsConnected(true);

      // Subscribe to account changes
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

    } catch (error) {
      const message = handleError(error);
      toast.error(message);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setProvider(null);
    setSigner(null);
    setAddress('');
    setIsConnected(false);
    setChainId(null);
    setBalance('0');

    // Remove listeners
    if (window.ethereum) {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    }
  };

  const handleAccountsChanged = async (accounts) => {
    if (accounts.length === 0) {
      // User disconnected their wallet
      disconnectWallet();
      toast.info('Wallet disconnected');
    } else {
      // Account changed, update state
      setAddress(accounts[0]);
      if (provider) {
        const balance = await provider.getBalance(accounts[0]);
        setBalance(balance.toString());
      }
    }
  };

  const handleChainChanged = (chainId) => {
    window.location.reload();
  };

  // Auto-connect if previously connected
  useEffect(() => {
    const autoConnect = async () => {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ 
          method: 'eth_accounts' 
        });
        if (accounts.length > 0) {
          connectWallet();
        }
      }
    };
    autoConnect();
  }, []);

  const value = {
    provider,
    signer,
    address,
    isConnected,
    isConnecting,
    chainId,
    balance,
    connectWallet,
    disconnectWallet
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

