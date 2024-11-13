import React from 'react';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
`;

const SpinnerContainer = styled(motion.div)`
  position: relative;
  width: ${({ $size }) => $size || '40px'};
  height: ${({ $size }) => $size || '40px'};
`;

const Spinner = styled.div`
  width: 100%;
  height: 100%;
  border: 4px solid ${({ theme }) => `${theme.primary}20`};
  border-top-color: ${({ theme }) => theme.primary};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const InnerSpinner = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 70%;
  height: 70%;
  border: 4px solid transparent;
  border-top-color: ${({ theme }) => theme.secondary};
  border-radius: 50%;
  animation: ${spin} 0.75s linear infinite reverse;
`;

const Label = styled(motion.div)`
  margin-top: 1rem;
  color: ${({ theme }) => theme.text.secondary};
  font-size: 0.875rem;
  text-align: center;
  animation: ${pulse} 2s ease-in-out infinite;
`;

export function LoadingSpinner({ size, label }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
    >
      <SpinnerContainer
        $size={size}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <Spinner />
        <InnerSpinner />
      </SpinnerContainer>
      {label && (
        <Label
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {label}
        </Label>
      )}
    </motion.div>
  );
} 