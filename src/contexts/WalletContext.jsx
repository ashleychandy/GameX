import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { DICE_ADDRESS, TOKEN_ADDRESS, CHAIN_CONFIG, SUPPORTED_CHAIN_ID } from '../utils/constants';
import { handleError } from '../utils/helpers';
import DiceABI from '../abi/Dice.json';
import TokenABI from '../abi/Token.json';

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

      // Request account access
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      // Check network
      const chainId = await window.ethereum.request({ 
        method: 'eth_chainId' 
      });
      
      const formattedChainId = `0x${Number(SUPPORTED_CHAIN_ID).toString(16)}`;
      if (chainId !== formattedChainId) {
        await switchNetwork();
      }

      const address = accounts[0];
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // Initialize contracts
      const dice = new ethers.Contract(DICE_ADDRESS, DiceABI.abi, signer);
      const token = new ethers.Contract(TOKEN_ADDRESS, TokenABI.abi, signer);

      setIsConnected(true);
      setAddress(address);
      setSigner(signer);
      setDiceContract(dice);
      setTokenContract(token);

      await updateBalance(address);

    } catch (error) {
      const { message } = handleError(error);
      toast.error(message);
      throw error;
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setIsConnected(false);
    setAddress('');
    setBalance('0');
    setSigner(null);
    setDiceContract(null);
    setTokenContract(null);
  };

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
        const network = CHAIN_CONFIG[SUPPORTED_CHAIN_ID];
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: network.chainId,
            chainName: network.chainName,
            nativeCurrency: network.nativeCurrency,
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

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
