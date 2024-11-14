import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

const SelectorContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
  gap: 0.5rem;
  margin: 1rem 0;
`;

const NumberButton = styled(motion.button)`
  padding: 1rem;
  border-radius: 8px;
  background: ${({ theme, $selected }) => 
    $selected ? theme.primary : theme.surface};
  color: ${({ theme, $selected }) => 
    $selected ? 'white' : theme.text.primary};
  border: 2px solid ${({ theme, $selected }) => 
    $selected ? theme.primary : theme.border};
  font-size: 1.25rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    border-color: ${({ theme }) => theme.primary};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

export function NumberSelector({ selectedNumber, onSelect, disabled, numbers }) {
  return (
    <SelectorContainer>
      {numbers.map(number => (
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

NumberSelector.propTypes = {
  selectedNumber: PropTypes.number.isRequired,
  onSelect: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  numbers: PropTypes.arrayOf(PropTypes.number).isRequired
}; 