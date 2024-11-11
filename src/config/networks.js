export const SUPPORTED_NETWORKS = {
  11155111: {
    chainId: '0xAA36A7',
    chainName: 'Sepolia Testnet',
    nativeCurrency: {
      name: 'Sepolia ETH',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: [import.meta.env.SEPOLIA_TESTNET_RPC],
    blockExplorerUrls: [import.meta.env.VITE_EXPLORER_URL]
  }
};

export const switchNetwork = async () => {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0xAA36A7' }] // Sepolia
    });
  } catch (error) {
    if (error.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [SUPPORTED_NETWORKS[11155111]]
      });
    }
  }
}; 