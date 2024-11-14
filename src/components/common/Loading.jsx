import React from 'react';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: ${({ $size }) => $size === 'small' ? '100px' : '200px'};
  gap: 1rem;
`;

const Spinner = styled.div`
  width: ${({ $size }) => $size === 'small' ? '24px' : '48px'};
  height: ${({ $size }) => $size === 'small' ? '24px' : '48px'};
  border: 3px solid ${({ theme }) => theme.surface2};
  border-top: 3px solid ${({ theme }) => theme.primary};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const Message = styled.p`
  color: ${({ theme }) => theme.text.secondary};
  font-size: 0.875rem;
`;

export function Loading({ size = 'medium', message }) {
  return (
    <LoadingContainer $size={size}>
      <Spinner $size={size} />
      {message && <Message>{message}</Message>}
    </LoadingContainer>
  );
} 