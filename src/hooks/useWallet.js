import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { CONFIG } from '@/config';

export function useWallet() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [address, setAddress] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [chainId, setChainId] = useState(null);

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      toast.error('Please install MetaMask!');
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      
      if (network.chainId !== CONFIG.network.chainId) {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${CONFIG.network.chainId.toString(16)}` }]
        });
      }

      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      setProvider(provider);
      setSigner(signer);
      setAddress(address);
      setChainId(network.chainId);

      // Check if user is admin
      const diceContract = new ethers.Contract(
        CONFIG.contracts.diceGameAddress,
        ['function isAdmin(address) view returns (bool)'],
        provider
      );
      const adminStatus = await diceContract.isAdmin(address);
      setIsAdmin(adminStatus);

    } catch (error) {
      toast.error('Failed to connect wallet');
      console.error(error);
    }
  }, []);

  const disconnect = useCallback(() => {
    setProvider(null);
    setSigner(null);
    setAddress(null);
    setIsAdmin(false);
    setChainId(null);
  }, []);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', () => {
        connect();
      });
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners();
      }
    };
  }, [connect]);

  return {
    provider,
    signer,
    address,
    isAdmin,
    chainId,
    isConnected: !!address,
    connect,
    disconnect
  };
}