import React from 'react';
import styled from 'styled-components';
import { formatEther } from 'ethers';

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 2px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  background: ${({ theme }) => theme.surface};
  color: ${({ theme }) => theme.text.primary};
  font-size: 1rem;
  width: 100%;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const MaxBetText = styled.span`
  color: ${({ theme }) => theme.text.secondary};
  font-size: 0.875rem;
`;

export function BetInput({ value, onChange, maxBet, disabled }) {
  const handleChange = (e) => {
    const value = e.target.value;
    if (value === '' || (/^\d*\.?\d*$/.test(value) && parseFloat(value) <= parseFloat(formatEther(maxBet)))) {
      onChange(value);
    }
  };

  return (
    <InputContainer>
      <Input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="Enter bet amount"
        disabled={disabled}
      />
      <MaxBetText>
        Max bet: {formatEther(maxBet)} DICE
      </MaxBetText>
    </InputContainer>
  );
} 