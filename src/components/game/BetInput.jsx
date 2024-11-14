import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { validateBetAmount } from '../../utils/helpers';
import { MIN_BET, MAX_BET } from '../../utils/constants';

const BetInput = ({ value, onChange, disabled }) => {
  const handleChange = (e) => {
    const newValue = e.target.value;
    if (newValue === '' || /^\d*\.?\d*$/.test(newValue)) {
      onChange(newValue);
    }
  };

  const isValid = validateBetAmount(value, MIN_BET, MAX_BET);

  return (
    <InputContainer
      as={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <InputLabel>Bet Amount (ETH)</InputLabel>
      <InputWrapper>
        <StyledInput
          type="text"
          value={value}
          onChange={handleChange}
          disabled={disabled}
          isValid={isValid}
          placeholder={`Min: ${MIN_BET} ETH - Max: ${MAX_BET} ETH`}
        />
        <ETHLabel>ETH</ETHLabel>
      </InputWrapper>
      <InputInfo>
        {!isValid && value !== '' && (
          <ErrorMessage>
            Please enter an amount between {MIN_BET} and {MAX_BET} ETH
          </ErrorMessage>
        )}
      </InputInfo>
    </InputContainer>
  );
};

const InputContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const InputLabel = styled.label`
  display: block;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  font-weight: bold;
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const StyledInput = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  padding-right: 4rem;
  border: 2px solid ${({ theme, isValid }) => 
    isValid ? theme.colors.border : theme.colors.error};
  border-radius: 4px;
  font-size: 1rem;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => `${theme.colors.primary}33`};
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.backgroundAlt};
    cursor: not-allowed;
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textAlt};
  }
`;

const ETHLabel = styled.span`
  position: absolute;
  right: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.textAlt};
  font-weight: bold;
`;

const InputInfo = styled.div`
  min-height: 20px;
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

const ErrorMessage = styled.span`
  color: ${({ theme }) => theme.colors.error};
  font-size: 0.8rem;
`;

export default BetInput; 