import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { useWallet } from '../../contexts/WalletContext';
import { formatAmount } from '../../utils/helpers';

// Base Input Component
export const Input = styled.input`
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  background: ${({ theme }) => theme.surface};
  color: ${({ theme }) => theme.text.primary};
  width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'auto')};
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.primary}33;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &::placeholder {
    color: ${({ theme }) => theme.text.secondary};
  }
`;

// Amount Input Component
export const AmountInput = styled(Input)`
  text-align: right;
  font-family: monospace;
  letter-spacing: 0.5px;
`;

// Bet Input Component
export function BetInput({ value, onChange, disabled }) {
  return (
    <AmountInput
      type="number"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Enter bet amount"
      disabled={disabled}
      $fullWidth
    />
  );
}

// Balance Display Component
export function Balance() {
  const { balance } = useWallet();
  
  return (
    <BalanceContainer>
      Balance: {formatAmount(balance)} GameX
    </BalanceContainer>
  );
}

const BalanceContainer = styled.div`
  span {
    color: ${({ theme }) => theme.text.secondary};
    margin-right: 0.5rem;
  }
`;

// Search Input Component
export const SearchInput = styled(Input)`
  padding-left: 2.5rem;
  background-image: url('data:image/svg+xml,...'); // Add search icon SVG
  background-repeat: no-repeat;
  background-position: 0.75rem center;
  background-size: 1rem;
`;

// PropTypes
BetInput.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool
};

Input.propTypes = {
  $fullWidth: PropTypes.bool
};

// Export all input-related components
export default {
  Input,
  AmountInput,
  BetInput,
  Balance,
  SearchInput
}; 