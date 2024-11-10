import { useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../contexts/WalletContext';
import { handleError } from '../utils/errorHandling';
import { toast } from 'react-toastify';
import { contracts } from '../config';

export function useTokenApproval() {
  const { tokenContract: token, diceContract: dice, address } = useWallet();
  const [isApproving, setIsApproving] = useState(false);
  const [allowance, setAllowance] = useState('0');

  useEffect(() => {
    if (!token || !dice || !address) return;
    
    const fetchAllowance = async () => {
      try {
        const current = await token.allowance(address, dice.target);
        setAllowance(current.toString());
      } catch (error) {
        console.error('Error fetching allowance:', error);
      }
    };

    fetchAllowance();
    
    const filter = token.filters.Approval(address, dice.target);
    token.on(filter, fetchAllowance);
    
    return () => {
      token.off(filter, fetchAllowance);
    };
  }, [token, dice, address]);

  const checkAndApprove = useCallback(async (amount) => {
    if (!token || !dice || !address) {
      toast.error('Wallet not connected');
      return false;
    }

    try {
      setIsApproving(true);
      
      const amountWei = ethers.parseEther(amount.toString());
      
      if (ethers.getBigInt(allowance) >= amountWei) {
        return true;
      }

      const largeApprovalAmount = ethers.parseEther('1000000');
      const tx = await token.approve(dice.target, largeApprovalAmount);
      
      toast.info('Approving tokens...');
      await tx.wait();
      toast.success('Tokens approved!');
      
      return true;

    } catch (error) {
      const { message } = handleError(error);
      toast.error(message);
      return false;
    } finally {
      setIsApproving(false);
    }
  }, [token, dice, address, allowance]);

  return { isApproving, checkAndApprove, allowance };
} 