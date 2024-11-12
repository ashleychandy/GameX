import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import DiceABI from '../abi/Dice.json';
import TokenABI from '../abi/Token.json';
import { SUPPORTED_NETWORKS } from '../config';

export function useWallet() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [address, setAddress] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [contracts, setContracts] = useState({
    dice: null,
    token: null
  });

  const initializeContracts = useCallback(async (signer) => {
    try {
      const network = await signer.provider.getNetwork();
      const networkConfig = SUPPORTED_NETWORKS[network.chainId];
      
      if (!networkConfig) {
        throw new Error('Unsupported network');
      }

      const diceContract = new ethers.Contract(
        networkConfig.contracts.dice.address,
        DiceABI.abi,
        signer
      );

      const tokenContract = new ethers.Contract(
        networkConfig.contracts.token.address,
        TokenABI.abi,
        signer
      );

      // Verify contracts are deployed
      const [diceCode, tokenCode] = await Promise.all([
        signer.provider.getCode(diceContract.address),
        signer.provider.getCode(tokenContract.address)
      ]);

      if (diceCode === '0x' || tokenCode === '0x') {
        throw new Error('Contracts not deployed');
      }

      diceContract.on('GameStarted', (player, amount, requestId) => {
        console.log('Game Started:', { player, amount, requestId });
      });

      diceContract.on('GameResolved', (player, result, payout) => {
        console.log('Game Resolved:', { player, result, payout });
      });

      setContracts({ dice: diceContract, token: tokenContract });
      return { dice: diceContract, token: tokenContract };
    } catch (error) {
      console.error('Contract initialization failed:', error);
      throw error;
    }
  }, []);

  const checkAdminStatus = useCallback(async (address, contract) => {
    if (!address || !contract) return false;
    try {
      const adminRole = await contract.DEFAULT_ADMIN_ROLE();
      return await contract.hasRole(adminRole, address);
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }, []);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      toast.error('Please install MetaMask!');
      return false;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      setChainId(network.chainId);

      if (!SUPPORTED_NETWORKS[network.chainId]) {
        toast.error('Please switch to a supported network');
        return false;
      }

      const accounts = await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      setProvider(provider);
      setSigner(signer);
      setAddress(address);
      setIsConnected(true);

      const contracts = await initializeContracts(signer);
      const isAdmin = await checkAdminStatus(address, contracts.dice);
      setIsAdmin(isAdmin);

      localStorage.setItem('wallet-autoconnect', 'true');
      return true;
    } catch (error) {
      console.error('Wallet connection failed:', error);
      toast.error(error.message || 'Failed to connect wallet');
      return false;
    }
  }, [initializeContracts, checkAdminStatus]);

  const disconnectWallet = useCallback(() => {
    setProvider(null);
    setSigner(null);
    setAddress(null);
    setChainId(null);
    setIsConnected(false);
    setIsAdmin(false);
    setContracts({ dice: null, token: null });
    localStorage.removeItem('wallet-autoconnect');
  }, []);

  // Auto-connect if previously connected
  useEffect(() => {
    if (localStorage.getItem('wallet-autoconnect') === 'true') {
      connectWallet();
    }
  }, [connectWallet]);

  // Setup network change listener
  useEffect(() => {
    if (!window.ethereum) return;

    const handleChainChanged = (chainId) => {
      window.location.reload();
    };

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else if (accounts[0] !== address) {
        window.location.reload();
      }
    };

    window.ethereum.on('chainChanged', handleChainChanged);
    window.ethereum.on('accountsChanged', handleAccountsChanged);

    return () => {
      window.ethereum.removeListener('chainChanged', handleChainChanged);
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
    };
  }, [address, disconnectWallet]);

  return {
    provider,
    signer,
    address,
    chainId,
    isConnected,
    isAdmin,
    contracts,
    connectWallet,
    disconnectWallet
  };
}