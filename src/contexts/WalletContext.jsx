import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { ethers } from "ethers";
import { toast } from "react-toastify";
import { config } from '@/config';

export const WalletContext = createContext();

export function WalletProvider({ children }) {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chainId, setChainId] = useState(null);

  const handleAccountsChanged = useCallback((accounts) => {
    if (accounts.length === 0) {
      setAccount(null);
      setProvider(null);
    } else if (accounts[0] !== account) {
      setAccount(accounts[0]);
    }
  }, [account]);

  const handleChainChanged = useCallback(async (chainIdHex) => {
    const newChainId = parseInt(chainIdHex, 16);
    setChainId(newChainId);
    
    if (newChainId !== parseInt(config.network.chainId)) {
      setAccount(null);
      setProvider(null);
      toast.error("Please switch to the correct network");
    }
  }, []);

  const setupWalletListeners = useCallback(() => {
    if (!window.ethereum) return;

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
    window.ethereum.on('disconnect', () => {
      setAccount(null);
      setProvider(null);
    });

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
      window.ethereum.removeListener('disconnect', () => {});
    };
  }, [handleAccountsChanged, handleChainChanged]);

  const switchNetwork = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${parseInt(config.network.chainId).toString(16)}` }],
      });
    } catch (error) {
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${parseInt(config.network.chainId).toString(16)}`,
              chainName: config.network.name,
              nativeCurrency: config.network.nativeCurrency,
              rpcUrls: [config.network.rpcUrl],
              blockExplorerUrls: [config.network.explorer]
            }],
          });
        } catch (addError) {
          toast.error('Failed to add network to MetaMask');
        }
      } else {
        toast.error('Failed to switch network');
      }
    }
  };

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      toast.error("Please install MetaMask!");
      return;
    }

    try {
      setIsLoading(true);
      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      const currentChainId = parseInt(chainId, 16);

      if (currentChainId !== parseInt(config.network.chainId)) {
        await switchNetwork();
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      
      setAccount(accounts[0]);
      setProvider(provider);
      setChainId(currentChainId);
      toast.success('Wallet connected successfully!');
    } catch (error) {
      console.error('Wallet connection error:', error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setProvider(null);
    setChainId(null);
    toast.info('Wallet disconnected');
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        if (window.ethereum) {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            await connectWallet();
          }
        }
      } catch (error) {
        console.error('Wallet initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    init();
    const cleanup = setupWalletListeners();
    return cleanup;
  }, [connectWallet, setupWalletListeners]);

  return (
    <WalletContext.Provider value={{
      provider,
      account,
      chainId,
      isLoading,
      isConnected: !!account,
      connectWallet,
      disconnectWallet
    }}>
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
