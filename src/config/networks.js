export const SUPPORTED_NETWORKS = {
  SEPOLIA: {
    chainId: 11155111,
    name: 'Sepolia Test Network',
    currency: {
      name: 'Sepolia ETH',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: ['https://rpc.sepolia.org'],
    blockExplorerUrls: ['https://sepolia.etherscan.io']
  },
  MAINNET: {
    chainId: 1,
    name: 'Ethereum Mainnet',
    currency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: ['https://mainnet.infura.io/v3/YOUR-PROJECT-ID'],
    blockExplorerUrls: ['https://etherscan.io']
  }
};

export const DEFAULT_NETWORK = SUPPORTED_NETWORKS.SEPOLIA;

export async function switchNetwork(provider, chainId) {
  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${chainId.toString(16)}` }]
    });
    return true;
  } catch (error) {
    if (error.code === 4902) {
      const network = Object.values(SUPPORTED_NETWORKS).find(n => n.chainId === chainId);
      if (network) {
        try {
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${chainId.toString(16)}`,
              chainName: network.name,
              nativeCurrency: network.currency,
              rpcUrls: network.rpcUrls,
              blockExplorerUrls: network.blockExplorerUrls
            }]
          });
          return true;
        } catch (addError) {
          console.error('Failed to add network:', addError);
          return false;
        }
      }
    }
    console.error('Failed to switch network:', error);
    return false;
  }
} 