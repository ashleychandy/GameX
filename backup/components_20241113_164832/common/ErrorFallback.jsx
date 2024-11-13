import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Button } from './Button';

const ErrorContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
`;

const ErrorMessage = styled.p`
  color: ${({ theme }) => theme.colors.error};
  margin: 1rem 0;
`;

export function ErrorFallback({ error, resetErrorBoundary }) {
  const errorMessage = error?.message || 'An unexpected error occurred';
  
  return (
    <ErrorContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <h2>Oops! Something went wrong</h2>
      <ErrorMessage>{errorMessage}</ErrorMessage>
      <Button onClick={resetErrorBoundary}>Try Again</Button>
    </ErrorContainer>
  );
} 