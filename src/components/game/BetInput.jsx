import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { ethers } from 'ethers';
import { GAME_CONFIG } from '../../utils/constants';

const InputWrapper = styled.div`
  margin: 1.5rem 0;
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem;
  border-radius: 8px;
  border: 2px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.surface};
  color: ${({ theme }) => theme.text.primary};
  font-size: 1rem;
  transition: all 0.2s ease;

  &:focus {
    border-color: ${({ theme }) => theme.primary};
    outline: none;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const QuickAmountButton = styled(motion.button)`
  padding: 0.5rem 1rem;
  margin: 0.5rem;
  border-radius: 8px;
  background: ${({ theme }) => theme.surface};
  border: 1px solid ${({ theme }) => theme.border};
  color: ${({ theme }) => theme.text.primary};
  cursor: pointer;

  &:hover {
    border-color: ${({ theme }) => theme.primary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export function BetInput({ value, onChange, disabled, maxAmount }) {
  const quickAmounts = ['0.1', '0.5', '1', '5'];

  const handleQuickAmount = (amount) => {
    onChange(amount);
  };

  const handleMaxAmount = () => {
    const maxBet = ethers.formatEther(
      ethers.parseEther(maxAmount.toString()).gt(GAME_CONFIG.MAX_BET)
        ? GAME_CONFIG.MAX_BET
        : maxAmount.toString()
    );
    onChange(maxBet);
  };

  return (
    <InputWrapper>
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Enter bet amount"
        min={ethers.formatEther(GAME_CONFIG.MIN_BET)}
        max={ethers.formatEther(GAME_CONFIG.MAX_BET)}
        step="0.1"
      />
      
      <div>
        {quickAmounts.map((amount) => (
          <QuickAmountButton
            key={amount}
            onClick={() => handleQuickAmount(amount)}
            disabled={disabled}
            whileHover={{ scale: disabled ? 1 : 1.05 }}
            whileTap={{ scale: disabled ? 1 : 0.95 }}
          >
            {amount}
          </QuickAmountButton>
        ))}
        <QuickAmountButton
          onClick={handleMaxAmount}
          disabled={disabled}
          whileHover={{ scale: disabled ? 1 : 1.05 }}
          whileTap={{ scale: disabled ? 1 : 0.95 }}
        >
          Max
        </QuickAmountButton>
      </div>
    </InputWrapper>
  );
} 