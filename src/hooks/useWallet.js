import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { handleError } from '../utils/errorHandling';
import { contracts } from '../config';
import TokenABI from '../abi/Token.json';

export function useWallet() {
  const [address, setAddress] = useState(null);
  const [provider, setProvider] = useState(null);
  const [balance, setBalance] = useState('0');
  const [isConnecting, setIsConnecting] = useState(false);
  const [tokenContract, setTokenContract] = useState(null);

  // Initialize provider and contracts
  useEffect(() => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(provider);

      // Initialize token contract
      const tokenContract = new ethers.Contract(
        contracts.token.address,
        TokenABI.abi,
        provider
      );
      setTokenContract(tokenContract);
    }
  }, []);

  // Update balance when address changes
  useEffect(() => {
    const fetchBalance = async () => {
      if (tokenContract && address) {
        try {
          const balance = await tokenContract.balanceOf(address);
          setBalance(balance.toString());
        } catch (error) {
          console.error('Error fetching token balance:', error);
        }
      }
    };

    fetchBalance();
    
    // Set up event listener for balance changes
    if (tokenContract && address) {
      const filterFrom = tokenContract.filters.Transfer(address, null);
      const filterTo = tokenContract.filters.Transfer(null, address);
      
      tokenContract.on(filterFrom, fetchBalance);
      tokenContract.on(filterTo, fetchBalance);
      
      return () => {
        tokenContract.off(filterFrom, fetchBalance);
        tokenContract.off(filterTo, fetchBalance);
      };
    }
  }, [address, tokenContract]);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      toast.error('Please install MetaMask to connect wallet');
      return;
    }

    try {
      setIsConnecting(true);
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      
      setAddress(accounts[0]);
      toast.success('Wallet connected successfully');
    } catch (error) {
      const { message } = handleError(error);
      toast.error(message);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setAddress(null);
    setBalance('0');
  }, []);

  const isConnected = Boolean(address);

  return {
    address,
    balance,
    isConnected,
    isConnecting,
    connectWallet,
    disconnectWallet,
    provider,
    tokenContract
  };
}