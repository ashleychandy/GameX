import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const SelectorContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
  gap: 1rem;
  padding: 1rem;
`;

const DiceButton = styled(motion.button)`
  padding: 1rem;
  border-radius: 8px;
  border: 2px solid ${({ theme, $selected }) => 
    $selected ? theme.primary : theme.border};
  background: ${({ theme, $selected }) => 
    $selected ? theme.primary : 'transparent'};
  color: ${({ theme, $selected }) => 
    $selected ? theme.text.inverse : theme.text.primary};
  font-size: 1.25rem;
  font-weight: 600;
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  opacity: ${({ disabled }) => disabled ? 0.5 : 1};
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    border-color: ${({ theme }) => theme.primary};
  }
`;

export function DiceSelector({ selectedNumber, onSelect, disabled }) {
  return (
    <SelectorContainer>
      {[1, 2, 3, 4, 5, 6].map(number => (
        <DiceButton
          key={number}
          $selected={selectedNumber === number}
          disabled={disabled}
          onClick={() => onSelect(number)}
          whileTap={{ scale: 0.95 }}
        >
          {number}
        </DiceButton>
      ))}
    </SelectorContainer>
  );
} 