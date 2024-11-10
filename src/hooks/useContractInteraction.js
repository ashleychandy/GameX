export function useContractInteraction() {
  // Add proper transaction handling with retries
  const executeTransaction = async (contractFn, ...args) => {
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        const tx = await contractFn(...args);
        const receipt = await tx.wait();
        
        // Verify transaction success
        if (receipt.status === 0) {
          throw new Error('Transaction failed');
        }
        
        return receipt;
      } catch (error) {
        attempt++;
        if (attempt === maxRetries) {
          throw error;
        }
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  };

  // Add proper event handling
  const listenForEvents = (contract, eventName, handler) => {
    const eventFilter = contract.filters[eventName]();
    
    const eventHandler = (...args) => {
      try {
        handler(...args);
      } catch (error) {
        console.error(`Error handling ${eventName} event:`, error);
      }
    };

    contract.on(eventFilter, eventHandler);
    
    return () => {
      contract.off(eventFilter, eventHandler);
    };
  };
} 