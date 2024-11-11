export const NETWORKS = {
  SEPOLIA: {
    chainId: 11155111,
    contracts: {
      dice: import.meta.env.VITE_DICE_ADDRESS,
      token: import.meta.env.VITE_TOKEN_ADDRESS
    }
  }
}; 