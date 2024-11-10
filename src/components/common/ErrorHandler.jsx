import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Button } from './Button';

const ErrorContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 2rem;
  text-align: center;
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors.error};
  margin: 1rem 0;
  max-width: 600px;
`;

const ErrorDetails = styled.pre`
  background: ${({ theme }) => theme.background};
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
  max-width: 100%;
  overflow-x: auto;
`;

export function ErrorHandler({ error, resetError }) {
  const errorMessage = error?.message || 'An unexpected error occurred';
  
  return (
    <ErrorContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <h2>Something went wrong</h2>
      <ErrorMessage>{errorMessage}</ErrorMessage>
      {process.env.NODE_ENV === 'development' && error?.stack && (
        <ErrorDetails>{error.stack}</ErrorDetails>
      )}
      <Button onClick={resetError}>Try Again</Button>
    </ErrorContainer>
  );
} 