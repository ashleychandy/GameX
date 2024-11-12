import { toast } from 'react-toastify';

export const handleContractError = (error) => {
  console.error('Contract Error:', error);
  
  if (error.code === 'ACTION_REJECTED') {
    toast.error('Transaction rejected by user');
    return;
  }
  
  if (error.code === -32603) {
    toast.error('Internal JSON-RPC error');
    return;
  }
  
  if (error.message?.includes('insufficient funds')) {
    toast.error('Insufficient funds for transaction');
    return;
  }
  
  toast.error('Transaction failed. Please try again.');
}; 