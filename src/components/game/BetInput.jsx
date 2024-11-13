import React from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { formatAmount } from "../../utils/format";

const InputContainer = styled.div`
  margin: 2rem 0;
`;

const InputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 1rem 1.5rem;
  padding-right: 4rem;
  border: 2px solid ${({ theme }) => theme.border};
  border-radius: 12px;
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text.primary};
  font-size: 1.25rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
    box-shadow: 0 0 0 4px ${({ theme }) => theme.primary}20;
  }

  &::placeholder {
    color: ${({ theme }) => theme.text.secondary};
  }
`;

const TokenLabel = styled.span`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.text.secondary};
  font-weight: 500;
`;

const QuickAmounts = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const QuickAmount = styled(motion.button)`
  padding: 0.5rem 1rem;
  border-radius: 8px;
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text.primary};
  border: 1px solid ${({ theme }) => theme.border};
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.surface};
    border-color: ${({ theme }) => theme.primary};
  }
`;

export function BetInput({ value, onChange, disabled }) {
  const quickAmounts = [10, 50, 100, 500];

  const handleChange = (e) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      onChange(value);
    }
  };

  return (
    <InputContainer>
      <InputWrapper>
        <StyledInput
          type="text"
          value={value}
          onChange={handleChange}
          placeholder="0.00"
          disabled={disabled}
        />
        <TokenLabel>DICE</TokenLabel>
      </InputWrapper>
      <QuickAmounts>
        {quickAmounts.map(amount => (
          <QuickAmount
            key={amount}
            onClick={() => onChange(amount.toString())}
            disabled={disabled}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {amount}
          </QuickAmount>
        ))}
      </QuickAmounts>
    </InputContainer>
  );
}
