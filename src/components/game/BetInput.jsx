import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { ethers } from 'ethers';

const BetInputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const InputWrapper = styled.div`
  position: relative;
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 1rem 1.5rem;
  padding-right: 4rem;
  border: 2px solid ${({ theme, $error }) => 
    $error ? theme.error : theme.border};
  border-radius: 12px;
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text.primary};
  font-size: 1.25rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme, $error }) => 
      $error ? theme.error : theme.primary};
    box-shadow: 0 0 0 4px ${({ theme, $error }) => 
      $error ? `${theme.error}20` : `${theme.primary}20`};
  }
`;

const TokenSymbol = styled.span`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.text.secondary};
  font-weight: 500;
`;

const QuickAmounts = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
`;

const QuickAmountButton = styled(motion.button)`
  padding: 0.75rem;
  border-radius: 8px;
  background: ${({ theme }) => theme.surface};
  border: 1px solid ${({ theme }) => theme.border};
  color: ${({ theme }) => theme.text.primary};
  font-weight: 500;
  
  &:hover {
    background: ${({ theme }) => theme.background};
    border-color: ${({ theme }) => theme.primary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ValidationMessage = styled(motion.p)`
  color: ${({ $error, theme }) => 
    $error ? theme.error : theme.success};
  font-size: 0.875rem;
  margin-top: 0.25rem;
`;

const MaxButton = styled(motion.button)`
  position: absolute;
  right: 4rem;
  top: 50%;
  transform: translateY(-50%);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  background: ${({ theme }) => theme.primary}20;
  color: ${({ theme }) => theme.primary};
  font-size: 0.75rem;
  font-weight: 600;

  &:hover {
    background: ${({ theme }) => theme.primary}40;
  }
`;

const MAX_SAFE_AMOUNT = '1000000'; // Reduced from 1000000000
const MIN_SAFE_AMOUNT = '0.000001';

export function BetInput({ 
  value, 
  onChange, 
  maxAmount, 
  disabled,
  error 
}) {
  const [quickAmounts, setQuickAmounts] = useState([]);

  useEffect(() => {
    if (maxAmount) {
      const max = parseFloat(ethers.formatEther(maxAmount));
      setQuickAmounts([
        max * 0.1,
        max * 0.25,
        max * 0.5,
        max
      ].map(n => Math.floor(n)));
    }
  }, [maxAmount]);

  const handleQuickAmount = (amount) => {
    onChange(amount.toString());
  };

  const handleMax = () => {
    if (maxAmount) {
      onChange(ethers.formatEther(maxAmount));
    }
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    
    try {
      // Don't process empty values
      if (!newValue) {
        onChange('');
        return;
      }

      // Validate numeric input
      if (isNaN(newValue)) {
        return;
      }

      const numValue = parseFloat(newValue);

      // Handle minimum value
      if (numValue < parseFloat(MIN_SAFE_AMOUNT)) {
        onChange(MIN_SAFE_AMOUNT);
        return;
      }

      // Handle maximum value
      if (numValue > parseFloat(MAX_SAFE_AMOUNT)) {
        onChange(MAX_SAFE_AMOUNT);
        return;
      }

      // Handle decimal places (max 18 decimals for ETH)
      const parts = newValue.split('.');
      if (parts[1] && parts[1].length > 18) {
        return;
      }

      onChange(newValue);
    } catch (error) {
      console.error('Input validation error:', error);
      // Keep the previous valid value
    }
  };

  return (
    <BetInputContainer>
      <InputWrapper>
        <StyledInput
          type="number"
          value={value}
          onChange={handleInputChange}
          placeholder="Enter bet amount"
          disabled={disabled}
          $error={!!error}
          min={MIN_SAFE_AMOUNT}
          max={MAX_SAFE_AMOUNT}
          step="0.000001"
        />
        <MaxButton onClick={handleMax}>MAX</MaxButton>
        <TokenSymbol>GAMEX</TokenSymbol>
      </InputWrapper>

      <AnimatePresence>
        {error && (
          <ValidationMessage
            $error
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {error}
          </ValidationMessage>
        )}
      </AnimatePresence>

      <QuickAmounts>
        {quickAmounts.map((amount) => (
          <QuickAmountButton
            key={amount}
            onClick={() => handleQuickAmount(amount)}
            disabled={disabled || amount > parseFloat(maxAmount)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {amount}
          </QuickAmountButton>
        ))}
      </QuickAmounts>
    </BetInputContainer>
  );
} 