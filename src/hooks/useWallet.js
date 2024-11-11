import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { handleError } from '../utils/errorHandling';
import { contracts, network } from '../config';
import { CHAIN_IDS } from '../utils/constants';

export function useWallet() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [address, setAddress] = useState('');
  const [chainId, setChainId] = useState(null);
  const [balance, setBalance] = useState('0');
  const [isConnecting, setIsConnecting] = useState(false);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      toast.error('Please install MetaMask to use this application');
      return false;
    }

    try {
      setIsConnecting(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      
      if (network.chainId !== CHAIN_IDS.SEPOLIA) {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${CHAIN_IDS.SEPOLIA.toString(16)}` }],
        });
      }

      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const balance = await provider.getBalance(address);

      setProvider(provider);
      setSigner(signer);
      setAddress(address);
      setChainId(network.chainId);
      setBalance(ethers.formatEther(balance));

      return true;
    } catch (error) {
      const { message } = handleError(error);
      toast.error(message);
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setProvider(null);
    setSigner(null);
    setAddress('');
    setChainId(null);
    setBalance('0');
  }, []);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', () => {
        connectWallet();
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });

      window.ethereum.on('disconnect', () => {
        disconnectWallet();
      });

      return () => {
        window.ethereum.removeAllListeners();
      };
    }
  }, [connectWallet, disconnectWallet]);

  return {
    provider,
    signer,
    address,
    chainId,
    balance,
    isConnecting,
    isConnected: Boolean(address),
    connectWallet,
    disconnectWallet
  };
}