import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useContract } from '@/hooks/useContract';
import { useWallet } from '@/hooks/useWallet';
import { toast } from 'react-toastify';

const DiceGame = ({ onGameComplete, isEnabled }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [betAmount, setBetAmount] = useState('');
  const { contract } = useContract();
  const { address } = useWallet();

  const handleRoll = useCallback(async () => {
    if (!contract || !address || !betAmount) {
      toast.error('Please enter bet amount');
      return;
    }
    
    try {
      setIsLoading(true);
      const tx = await contract.roll({ value: betAmount });
      const receipt = await tx.wait();
      
      const result = {
        roll: receipt.events[0].args.roll.toNumber(),
        won: receipt.events[0].args.won,
        payout: receipt.events[0].args.payout
      };
      
      onGameComplete?.(result);
      toast.success(`Roll result: ${result.roll}`);
    } catch (error) {
      toast.error('Game failed');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [contract, address, betAmount, onGameComplete]);

  return (
    <div className="dice-game">
      <input
        type="number"
        value={betAmount}
        onChange={(e) => setBetAmount(e.target.value)}
        placeholder="Enter bet amount"
        disabled={isLoading}
      />
      <button
        onClick={handleRoll}
        disabled={isLoading || !isEnabled}
      >
        {isLoading ? 'Rolling...' : 'Roll Dice'}
      </button>
    </div>
  );
};

DiceGame.propTypes = {
  onGameComplete: PropTypes.func,
  isEnabled: PropTypes.bool.isRequired
};

export default DiceGame; 