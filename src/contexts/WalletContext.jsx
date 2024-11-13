import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { ethers } from "ethers";
import { toast } from "react-toastify";
import { SUPPORTED_NETWORKS } from "../utils/constants";
import { handleError } from "../utils/errorHandling";

const SUPPORTED_NETWORKS = {
  1: "Ethereum Mainnet",
  5: "Goerli Testnet",
  // Add other networks as needed
};

export const WalletContext = createContext({});

export function WalletProvider({ children }) {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [address, setAddress] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [contracts, setContracts] = useState({
    dice: null,
    token: null
  });

  const handleError = useCallback((error) => {
    console.error("Wallet error:", error);

    if (error.code === 4001) {
      toast.error("Transaction rejected by user");
    } else if (error.code === -32002) {
      toast.error("Please unlock your wallet");
    } else {
      toast.error(error.message || "An error occurred");
    }
  }, []);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      toast.error("Please install MetaMask!");
      return;
    }

    try {
      setIsConnecting(true);

      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      const currentChainId = parseInt(chainId, 16);

      if (!SUPPORTED_NETWORKS[currentChainId]) {
        throw new Error("Please switch to a supported network");
      }

      const ethProvider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await ethProvider.send("eth_requestAccounts", []);
      const ethSigner = await ethProvider.getSigner();

      setProvider(ethProvider);
      setSigner(ethSigner);
      setAddress(accounts[0]);
      setChainId(currentChainId);

      toast.success("Wallet connected successfully!");
    } catch (error) {
      handleError(error);
    } finally {
      setIsConnecting(false);
    }
  }, [handleError]);

  const disconnectWallet = useCallback(() => {
    setProvider(null);
    setSigner(null);
    setAddress(null);
    setChainId(null);
    toast.info("Wallet disconnected");
  }, []);

  useEffect(() => {
    if (!window.ethereum) return;

    const handleNetworkChange = () => {
      window.location.reload();
    };

    const handleAccountsChange = (accounts) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        setAddress(accounts[0]);
      }
    };

    window.ethereum.on("chainChanged", handleNetworkChange);
    window.ethereum.on("accountsChanged", handleAccountsChange);

    // Auto-connect if previously connected
    const autoConnect = async () => {
      if (localStorage.getItem("shouldAutoConnect") === "true") {
        await connectWallet();
      }
    };
    autoConnect();

    return () => {
      window.ethereum.removeListener("chainChanged", handleNetworkChange);
      window.ethereum.removeListener("accountsChanged", handleAccountsChange);
    };
  }, [connectWallet, disconnectWallet]);

  return (
    <WalletContext.Provider value={{
      provider,
      signer,
      address,
      chainId,
      isConnected,
      contracts,
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
