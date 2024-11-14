import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useGame } from '../../contexts/GameContext';

const NumberSelector = () => {
  const { selectedNumber, setSelectedNumber } = useGame();

  const numbers = [1, 2, 3, 4, 5, 6];

  return (
    <Container>
      <Title>Select a Number</Title>
      <NumberGrid>
        {numbers.map((number) => (
          <NumberButton
            key={number}
            as={motion.button}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            selected={selectedNumber === number}
            onClick={() => setSelectedNumber(number)}
          >
            {number}
          </NumberButton>
        ))}
      </NumberGrid>
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.colors.text};
`;

const NumberGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  padding: 1rem;
`;

const NumberButton = styled.button`
  padding: 2rem;
  font-size: 2rem;
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  background: ${({ selected, theme }) => 
    selected ? theme.colors.primary : theme.colors.background};
  color: ${({ selected, theme }) => 
    selected ? theme.colors.white : theme.colors.text};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

export default NumberSelector; 