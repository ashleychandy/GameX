import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { NETWORKS, DEFAULT_NETWORK, ERROR_CODES } from '../utils/constants';
import { handleError } from '../utils/errorHandling';
import { toast } from 'react-toastify';
import TokenABI from '../abi/Token.json';

const WalletContext = createContext();

export function WalletProvider({ children }) {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [address, setAddress] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [balance, setBalance] = useState('0');
  const [isConnecting, setIsConnecting] = useState(false);

  // Auto connect on mount
  useEffect(() => {
    const autoConnect = async () => {
      if (window.ethereum && window.ethereum.selectedAddress) {
        try {
          await connectWallet();
        } catch (error) {
          console.error('Auto connect failed:', error);
        }
      }
    };
    autoConnect();
  }, []);

  const updateBalance = useCallback(async () => {
    if (!address || !signer) return;
    
    try {
      const tokenContract = new ethers.Contract(
        DEFAULT_NETWORK.contracts.token,
        TokenABI.abi,
        signer
      );
      const tokenBalance = await tokenContract.balanceOf(address);
      setBalance(tokenBalance.toString());
    } catch (error) {
      console.error('Error fetching token balance:', error);
    }
  }, [address, signer]);

  const switchNetwork = async () => {
    try {
      console.log('Attempting to switch to network:', DEFAULT_NETWORK.chainId);
      const chainIdHex = `0x${DEFAULT_NETWORK.chainId.toString(16)}`;
      console.log('Chain ID in hex:', chainIdHex);
      
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainIdHex }],
      });
      return true;
    } catch (error) {
      console.log('Switch network error:', error);
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${DEFAULT_NETWORK.chainId.toString(16)}`,
              chainName: 'Sepolia',
              nativeCurrency: {
                name: 'Sepolia ETH',
                symbol: 'SEP',
                decimals: 18
              },
              rpcUrls: [DEFAULT_NETWORK.rpcUrl],
              blockExplorerUrls: [DEFAULT_NETWORK.explorer]
            }]
          });
          return true;
        } catch (addError) {
          console.error('Error adding network:', addError);
          return false;
        }
      }
      return false;
    }
  };

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      toast.error('Please install MetaMask');
      return;
    }

    setIsConnecting(true);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      
      console.log('Current network:', network.chainId);
      console.log('Expected network:', DEFAULT_NETWORK.chainId);
      
      // Convert both to numbers for comparison
      const currentChainId = Number(network.chainId);
      const expectedChainId = Number(DEFAULT_NETWORK.chainId);

      if (currentChainId !== expectedChainId) {
        console.log('Network mismatch, attempting to switch...');
        const switched = await switchNetwork();
        if (!switched) {
          throw new Error('Failed to switch to Sepolia network');
        }
        // Get updated provider after network switch
        const updatedProvider = new ethers.BrowserProvider(window.ethereum);
        const updatedNetwork = await updatedProvider.getNetwork();
        if (Number(updatedNetwork.chainId) !== expectedChainId) {
          throw new Error('Please connect to Sepolia network');
        }
      }

      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      setProvider(provider);
      setSigner(signer);
      setAddress(address);
      setChainId(currentChainId);

      // Initial balance update
      updateBalance();
      
      toast.success('Wallet connected successfully!');

    } catch (error) {
      console.error('Connection error:', error);
      const { message } = handleError(error);
      toast.error(message);
    } finally {
      setIsConnecting(false);
    }
  }, [updateBalance]);

  const disconnectWallet = useCallback(() => {
    setProvider(null);
    setSigner(null);
    setAddress(null);
    setChainId(null);
    setBalance('0');
    toast.info('Wallet disconnected');
  }, []);

  // Handle account changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else if (accounts[0] !== address) {
        setAddress(accounts[0]);
        updateBalance();
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [address, disconnectWallet, updateBalance]);

  // Update balance periodically
  useEffect(() => {
    if (!address) return;

    const interval = setInterval(updateBalance, 10000); // Every 10 seconds
    return () => clearInterval(interval);
  }, [address, updateBalance]);

  const contextValue = {
    provider,
    signer,
    address,
    chainId,
    balance,
    isConnected: !!address,
    isConnecting,
    connectWallet,
    disconnectWallet,
    updateBalance
  };

  return (
    <WalletContext.Provider value={contextValue}>
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

