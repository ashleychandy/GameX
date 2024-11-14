const validateEnv = () => {
  const required = [
    'VITE_SEPOLIA_RPC',
    'VITE_CHAIN_ID',
    'VITE_TOKEN_ADDRESS',
    'VITE_DICE_GAME_ADDRESS'
  ];
  
  const missing = required.filter(key => !import.meta.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required env variables: ${missing.join(', ')}`);
  }
  return import.meta.env;
};

const env = validateEnv();

export const config = {
  network: {
    rpc: env.VITE_SEPOLIA_RPC,
    chainId: parseInt(env.VITE_CHAIN_ID),
    explorer: env.VITE_EXPLORER_URL,
    name: 'Sepolia Test Network',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18
    }
  },
  contracts: {
    token: env.VITE_TOKEN_ADDRESS,
    dice: env.VITE_DICE_GAME_ADDRESS
  }
};

export const GAME_CONFIG = {
  PAYOUT_MULTIPLIER: 6,
  MIN_BET: '0.000000000000000001',
  MAX_RETRIES: 3,
  POLLING_INTERVAL: 5000
};

export const switchNetwork = async (provider) => {
  if (!provider) {
    throw new Error('Provider is required');
  }

  const chainId = `0x${Number(config.network.chainId).toString(16)}`;

  try {
    await provider.send('wallet_switchEthereumChain', [{ chainId }]);
  } catch (error) {
    if (error.code === 4902) {
      try {
        await provider.send('wallet_addEthereumChain', [{
          chainId,
          chainName: config.network.name,
          rpcUrls: [config.network.rpc],
          nativeCurrency: config.network.nativeCurrency,
          blockExplorerUrls: [config.network.explorer]
        }]);
      } catch (addError) {
        throw new Error(`Failed to add network: ${addError.message}`);
      }
    } else {
      throw error;
    }
  }
}; 