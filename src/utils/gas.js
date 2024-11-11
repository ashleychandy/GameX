export const estimateGas = async (contract, method, args = [], options = {}) => {
  const { gasLimitMultiplier = 1.2 } = options;
  
  try {
    // First try to estimate gas
    const estimatedGas = await contract[method].estimateGas(...args);
    
    // Add buffer to estimated gas
    return ethers.BigNumber.from(estimatedGas)
      .mul(Math.floor(gasLimitMultiplier * 100))
      .div(100);
  } catch (error) {
    // If estimation fails, use a safe default
    console.warn(`Gas estimation failed for ${method}:`, error);
    return ethers.BigNumber.from(500000); // Safe default gas limit
  }
}; 