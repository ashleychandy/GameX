import { CONFIG } from '../config';

// Network configuration constants
export const NETWORKS = {
  SEPOLIA: {
    chainId: CONFIG.network.chainId,
    name: 'Sepolia Test Network',
    rpcUrl: CONFIG.network.rpcUrl,
    explorerUrl: CONFIG.network.explorerUrl,
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH', 
      decimals: 18
    }
  }
};

// Helper to format chainId to hex
const formatChainId = (chainId) => `0x${Number(chainId).toString(16)}`;

// Network switching function with better error handling
export const switchNetwork = async (provider) => {
  if (!provider) {
    throw new Error('Provider is required');
  }

  const targetNetwork = NETWORKS.SEPOLIA;
  const chainId = formatChainId(targetNetwork.chainId);

  try {
    // First try to switch to network
    await provider.send('wallet_switchEthereumChain', [{ chainId }]);
  } catch (error) {
    // Handle different error cases
    if (error.code === 4902) {
      // Network needs to be added
      try {
        await provider.send('wallet_addEthereumChain', [{
          chainId,
          chainName: targetNetwork.name,
          rpcUrls: [targetNetwork.rpcUrl],
          nativeCurrency: targetNetwork.nativeCurrency,
          blockExplorerUrls: [targetNetwork.explorerUrl]
        }]);
      } catch (addError) {
        throw new Error(`Failed to add network: ${addError.message}`);
      }
    } else if (error.code === 4001) {
      throw new Error('User rejected network switch');
    } else {
      throw new Error(`Failed to switch network: ${error.message}`);
    }
  }
};

// Helper to check if connected to correct network
export const isCorrectNetwork = (chainId) => {
  return Number(chainId) === NETWORKS.SEPOLIA.chainId;
};

// Export network constants
export const DEFAULT_NETWORK = NETWORKS.SEPOLIA;
export const SUPPORTED_NETWORKS = [NETWORKS.SEPOLIA]; 