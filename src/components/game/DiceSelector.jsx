import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const SelectorContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin: 2rem 0;
`;

const DiceButton = styled(motion.button)`
  aspect-ratio: 1;
  padding: 1.5rem;
  background: ${({ $selected, theme }) => 
    $selected ? theme.primary : theme.surface};
  border: 2px solid ${({ $selected, theme }) => 
    $selected ? theme.primary : theme.border};
  border-radius: 12px;
  color: ${({ $selected, theme }) => 
    $selected ? theme.text.inverse : theme.text.primary};
  font-size: 1.5rem;
  font-weight: bold;
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  opacity: ${({ disabled }) => disabled ? 0.5 : 1};
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.primary};
    transform: translateY(-2px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

export function DiceSelector({ selectedNumber, onSelect, disabled }) {
  const numbers = [1, 2, 3, 4, 5, 6];

  return (
    <SelectorContainer>
      {numbers.map(number => (
        <DiceButton
          key={number}
          $selected={selectedNumber === number}
          disabled={disabled}
          onClick={() => onSelect(number)}
          whileHover={{ scale: disabled ? 1 : 1.05 }}
          whileTap={{ scale: disabled ? 1 : 0.95 }}
        >
          {number}
        </DiceButton>
      ))}
    </SelectorContainer>
  );
} 