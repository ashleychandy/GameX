import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { GAME_CONFIG } from '../../utils/constants';

const Container = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  padding: 2rem;
  max-width: 500px;
  margin: 0 auto;
`;

const NumberButton = styled(motion.button)`
  aspect-ratio: 1;
  background: ${({ $selected, theme }) => 
    $selected ? theme.primary : theme.surface};
  border: 2px solid ${({ $selected, theme }) => 
    $selected ? theme.primary : theme.border};
  border-radius: 16px;
  color: ${({ $selected, theme }) => 
    $selected ? theme.text.inverse : theme.text.primary};
  font-size: 2rem;
  font-weight: bold;
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  opacity: ${({ disabled }) => disabled ? 0.5 : 1};
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    border-color: ${({ theme }) => theme.primary};
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

export function NumberSelector({ selectedNumber, onSelect, disabled }) {
  const numbers = Array.from({ length: GAME_CONFIG.MAX_NUMBER }, (_, i) => i + 1);

  return (
    <Container>
      {numbers.map(number => (
        <NumberButton
          key={number}
          $selected={selectedNumber === number}
          disabled={disabled}
          onClick={() => onSelect(number)}
          whileHover={{ scale: disabled ? 1 : 1.05 }}
          whileTap={{ scale: disabled ? 1 : 0.95 }}
        >
          {number}
        </NumberButton>
      ))}
    </Container>
  );
} 