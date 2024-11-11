import { useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { contracts, SUPPORTED_NETWORKS } from '../config';
import { handleError } from '../utils/errorHandling';

export function useWallet() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [address, setAddress] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [balance, setBalance] = useState('0');
  const [tokenContract, setTokenContract] = useState(null);
  const [diceContract, setDiceContract] = useState(null);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      toast.error('Please install MetaMask');
      return false;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      setChainId(network.chainId);

      const accounts = await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      setProvider(provider);
      setSigner(signer);
      setAddress(address);

      // Initialize contracts
      const tokenContract = new ethers.Contract(
        contracts.token.address,
        contracts.token.abi,
        signer
      );
      const diceContract = new ethers.Contract(
        contracts.dice.address,
        contracts.dice.abi,
        signer
      );

      setTokenContract(tokenContract);
      setDiceContract(diceContract);

      return true;
    } catch (error) {
      const { message } = handleError(error);
      toast.error(message);
      return false;
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setProvider(null);
    setSigner(null);
    setAddress(null);
    setChainId(null);
    setBalance('0');
    setTokenContract(null);
    setDiceContract(null);
  }, []);

  const switchNetwork = useCallback(async (targetChainId) => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      });
      return true;
    } catch (error) {
      if (error.code === 4902) {
        try {
          const network = SUPPORTED_NETWORKS[targetChainId];
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${targetChainId.toString(16)}`,
                chainName: network.name,
                nativeCurrency: network.nativeCurrency,
                rpcUrls: network.rpcUrls,
                blockExplorerUrls: [network.blockExplorer],
              },
            ],
          });
          return true;
        } catch (addError) {
          const { message } = handleError(addError);
          toast.error(message);
          return false;
        }
      }
      const { message } = handleError(error);
      toast.error(message);
      return false;
    }
  }, []);

  const updateBalance = useCallback(async () => {
    if (!address || !tokenContract) return;

    try {
      const balance = await tokenContract.balanceOf(address);
      setBalance(balance.toString());
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  }, [address, tokenContract]);

  // Setup event listeners
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        setAddress(accounts[0]);
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
  }, [disconnectWallet]);

  // Auto-update balance
  useEffect(() => {
    updateBalance();

    if (tokenContract && address) {
      const filter = tokenContract.filters.Transfer(null, address);
      tokenContract.on(filter, updateBalance);

      return () => {
        tokenContract.off(filter, updateBalance);
      };
    }
  }, [tokenContract, address, updateBalance]);

  return {
    provider,
    signer,
    address,
    chainId,
    balance,
    tokenContract,
    diceContract,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    updateBalance,
  };
}