import React from 'react';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

const LoadingContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: ${({ $size }) => $size === 'small' ? '100px' : '200px'};
  gap: 1rem;
`;

const LoadingSpinner = styled.div`
  width: ${({ $size }) => {
    switch ($size) {
      case 'small': return '24px';
      case 'large': return '48px';
      default: return '32px';
    }
  }};
  height: ${({ $size }) => {
    switch ($size) {
      case 'small': return '24px';
      case 'large': return '48px';
      default: return '32px';
    }
  }};
  border: 3px solid ${({ theme }) => theme.background};
  border-top: 3px solid ${({ theme }) => theme.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.p`
  color: ${({ theme }) => theme.text.secondary};
  font-size: ${({ $size }) => $size === 'small' ? '0.875rem' : '1rem'};
  text-align: center;
  margin: 0;
`;

export function Loading({ size = 'medium', message = 'Loading...' }) {
  return (
    <LoadingContainer
      $size={size}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <LoadingSpinner $size={size} />
      {message && <LoadingText $size={size}>{message}</LoadingText>}
    </LoadingContainer>
  );
}

Loading.propTypes = {
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  message: PropTypes.string
};

export default Loading; 