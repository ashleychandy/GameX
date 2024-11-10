import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const SelectorContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 1rem;
  margin: 2rem 0;
`;

const NumberButton = styled(motion.button)`
  aspect-ratio: 1;
  border-radius: 12px;
  background: ${({ $selected, theme }) => 
    $selected ? theme.gradients.primary : theme.surface};
  color: ${({ $selected, theme }) => 
    $selected ? theme.text.inverse : theme.text.primary};
  font-size: 1.5rem;
  font-weight: bold;
  border: 2px solid ${({ $selected, theme }) => 
    $selected ? 'transparent' : theme.border};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadow.md};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export function NumberSelector({ selectedNumber, onSelect, disabled }) {
  return (
    <SelectorContainer>
      {[1, 2, 3, 4, 5, 6].map((number) => (
        <NumberButton
          key={number}
          $selected={selectedNumber === number}
          onClick={() => onSelect(number)}
          disabled={disabled}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {number}
        </NumberButton>
      ))}
    </SelectorContainer>
  );
} 