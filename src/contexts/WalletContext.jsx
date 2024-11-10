import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { handleError } from '../utils/errorHandling';
import { contracts } from '../config';
import { NETWORKS, SUPPORTED_CHAIN_ID } from '../utils/constants';

const WalletContext = createContext();

export function WalletProvider({ children }) {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState('0');
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [diceContract, setDiceContract] = useState(null);
  const [tokenContract, setTokenContract] = useState(null);

  // Initialize provider
  useEffect(() => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(provider);

      // Listen for account changes
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  // Add auto-connect effect
  useEffect(() => {
    const autoConnect = async () => {
      // Check if user was previously connected
      const wasConnected = localStorage.getItem('walletConnected');
      
      if (wasConnected === 'true') {
        try {
          await connectWallet();
        } catch (error) {
          console.error('Auto-connect failed:', error);
          // Clear stored connection state if auto-connect fails
          localStorage.removeItem('walletConnected');
        }
      }
    };

    autoConnect();
  }, []); // Run once on mount

  // Handle account changes
  const handleAccountsChanged = async (accounts) => {
    if (accounts.length === 0) {
      disconnectWallet();
    } else {
      const newAddress = accounts[0];
      setAddress(newAddress);
      await updateBalance(newAddress);
    }
  };

  // Handle chain changes
  const handleChainChanged = () => {
    window.location.reload();
  };

  // Connect wallet
  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        throw new Error('Please install MetaMask');
      }

      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      const chainId = await window.ethereum.request({ 
        method: 'eth_chainId' 
      });
      
      // Check if we're on the correct network
      const formattedChainId = `0x${Number(SUPPORTED_CHAIN_ID).toString(16)}`;
      if (chainId !== formattedChainId) {
        await switchNetwork();
      }

      const address = accounts[0];
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // Initialize contracts with proper error handling
      try {
        const dice = new ethers.Contract(
          contracts.dice.address,
          contracts.dice.abi,
          signer
        );
        
        const token = new ethers.Contract(
          contracts.token.address,
          contracts.token.abi,
          signer
        );

        // Verify contracts are deployed
        const [diceAddress, tokenAddress] = await Promise.all([
          dice.getAddress(),
          token.getAddress(),
        ]);

        if (!diceAddress || !tokenAddress) {
          throw new Error('Contract addresses are invalid');
        }

        // Basic method availability check
        if (!dice.playDice || !token.balanceOf) {
          throw new Error('Required contract methods not found');
        }

        setIsConnected(true);
        setAddress(address);
        setSigner(signer);
        setDiceContract(dice);
        setTokenContract(token);
        
        localStorage.setItem('walletConnected', 'true');
        await updateBalance(address);

      } catch (error) {
        console.error('Contract initialization error:', error);
        toast.error('Failed to initialize game contracts. Please check network configuration.');
        throw new Error('Contract initialization failed: ' + error.message);
      }

    } catch (error) {
      handleError(error, 'connectWallet');
      throw error; // Re-throw to be handled by the UI
    }
  };

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    setIsConnected(false);
    setAddress(null);
    setSigner(null);
    setDiceContract(null);
    setTokenContract(null);
    setBalance('0');
    // Clear stored connection state
    localStorage.removeItem('walletConnected');
  }, []);

  // Switch network
  const switchNetwork = async () => {
    try {
      const formattedChainId = `0x${Number(SUPPORTED_CHAIN_ID).toString(16)}`;
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: formattedChainId }],
      });
    } catch (error) {
      if (error.code === 4902) {
        const network = NETWORKS[SUPPORTED_CHAIN_ID];
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: `0x${Number(SUPPORTED_CHAIN_ID).toString(16)}`,
            chainName: network.name,
            nativeCurrency: network.currency,
            rpcUrls: network.rpcUrls,
            blockExplorerUrls: network.blockExplorerUrls
          }]
        });
      } else {
        throw error;
      }
    }
  };

  // Update token balance
  const updateBalance = async (address) => {
    if (!tokenContract) return;
    try {
      const balance = await tokenContract.balanceOf(address);
      setBalance(balance.toString());
    } catch (error) {
      console.error('Error updating balance:', error);
    }
  };

  // Add wallet change listeners
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        // User disconnected wallet
        disconnectWallet();
      } else if (accounts[0] !== address) {
        // Account changed, reconnect
        connectWallet();
      }
    };

    const handleChainChanged = () => {
      // Chain changed, refresh page as recommended by MetaMask
      window.location.reload();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [address, disconnectWallet]);

  const value = {
    isConnected,
    address,
    balance,
    provider,
    signer,
    diceContract,
    tokenContract,
    connectWallet,
    disconnectWallet,
    updateBalance
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}
export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}

