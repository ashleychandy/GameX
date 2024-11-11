import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { handleError } from '../utils/errorHandling';
import { SUPPORTED_CHAIN_ID } from '../utils/constants';
import DiceABI from '../abi/Dice.json';
import TokenABI from '../abi/Token.json';
import { NETWORKS } from '../utils/constants';
import { config } from '../utils/config';

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [address, setAddress] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [diceContract, setDiceContract] = useState(null);
  const [tokenContract, setTokenContract] = useState(null);
  const [chainId, setChainId] = useState(null);

  const resetWalletState = useCallback(() => {
    setIsConnected(false);
    setAddress(null);
    setProvider(null);
    setSigner(null);
    setDiceContract(null);
    setTokenContract(null);
    localStorage.removeItem('wallet-autoconnect');
  }, []);

  const initializeContracts = useCallback(async (signer) => {
    try {
      const diceContract = new ethers.Contract(
        NETWORKS.SEPOLIA.contracts.dice,
        DiceABI.abi,
        signer
      );

      const tokenContract = new ethers.Contract(
        NETWORKS.SEPOLIA.contracts.token,
        TokenABI.abi,
        signer
      );

      setDiceContract(diceContract);
      setTokenContract(tokenContract);
    } catch (error) {
      console.error('Contract initialization failed:', error);
      throw error;
    }
  }, []);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      toast.error('Please install MetaMask!');
      return;
    }

    try {
      setIsConnecting(true);

      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });

      const chainId = await window.ethereum.request({ 
        method: 'eth_chainId' 
      });
      
      const currentChainId = parseInt(chainId, 16);
      setChainId(currentChainId);

      if (currentChainId !== SUPPORTED_CHAIN_ID) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${SUPPORTED_CHAIN_ID.toString(16)}` }],
          });
        } catch (error) {
          toast.error('Please switch to the correct network');
          throw error;
        }
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      await initializeContracts(signer);

      setProvider(provider);
      setSigner(signer);
      setAddress(accounts[0]);
      setIsConnected(true);
      
      localStorage.setItem('wallet-autoconnect', 'true');
      
      toast.success('Wallet connected successfully!');
    } catch (error) {
      const { message } = handleError(error);
      toast.error(message);
      resetWalletState();
    } finally {
      setIsConnecting(false);
    }
  }, [initializeContracts, resetWalletState]);

  const disconnectWallet = useCallback(() => {
    resetWalletState();
    toast.success('Wallet disconnected');
  }, [resetWalletState]);

  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        resetWalletState();
      } else {
        setAddress(accounts[0]);
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    const handleDisconnect = () => {
      resetWalletState();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
    window.ethereum.on('disconnect', handleDisconnect);

    return () => {
      if (window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        window.ethereum.removeListener('disconnect', handleDisconnect);
      }
    };
  }, [resetWalletState]);

  useEffect(() => {
    const autoConnect = async () => {
      if (window.ethereum && localStorage.getItem('wallet-autoconnect')) {
        try {
          await connectWallet();
        } catch (error) {
          console.error('Auto-connect failed:', error);
          resetWalletState();
        }
      }
    };

    autoConnect();
  }, [connectWallet, resetWalletState]);

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        isConnecting,
        address,
        provider,
        signer,
        diceContract,
        tokenContract,
        chainId,
        connectWallet,
        disconnectWallet
      }}
    >
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


