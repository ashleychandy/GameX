import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { formatEther } from '../../utils/helpers';

const TOAST_VARIANTS = {
  win: {
    background: 'success',
    icon: '🎉',
    title: 'Congratulations!'
  },
  lose: {
    background: 'error',
    icon: '😢',
    title: 'Better Luck Next Time'
  },
  reward: {
    background: 'primary',
    icon: '💎',
    title: 'Reward Received'
  },
  error: {
    background: 'error',
    icon: '⚠️',
    title: 'Error'
  }
};

const GameToast = ({ type, message, amount, isVisible, onClose }) => {
  const variant = TOAST_VARIANTS[type];

  return (
    <AnimatePresence>
      {isVisible && (
        <ToastContainer
          as={motion.div}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          variant={variant.background}
        >
          <ToastIcon>{variant.icon}</ToastIcon>
          <ToastContent>
            <ToastTitle>{variant.title}</ToastTitle>
            <ToastMessage>{message}</ToastMessage>
            {amount && (
              <ToastAmount variant={variant.background}>
                {formatEther(amount)} ETH
              </ToastAmount>
            )}
          </ToastContent>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ToastContainer>
      )}
    </AnimatePresence>
  );
};

const ToastContainer = styled(motion.div)`
  position: fixed;
  bottom: ${({ theme }) => theme.spacing.xl};
  right: ${({ theme }) => theme.spacing.xl};
  background: ${({ theme, variant }) => theme.colors[variant]};
  color: ${({ theme }) => theme.colors.white};
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  min-width: 300px;
  max-width: 400px;
  box-shadow: ${({ theme }) => theme.shadows.large};
  z-index: 1000;
`;

const ToastIcon = styled.div`
  font-size: 2rem;
`;

const ToastContent = styled.div`
  flex: 1;
`;

const ToastTitle = styled.div`
  font-weight: bold;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const ToastMessage = styled.div`
  font-size: 0.9rem;
  opacity: 0.9;
`;

const ToastAmount = styled.div`
  margin-top: ${({ theme }) => theme.spacing.xs};
  font-weight: bold;
  color: ${({ theme, variant }) => 
    variant === 'error' ? theme.colors.white : theme.colors.white};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.white};
  font-size: 1.5rem;
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing.xs};
  opacity: 0.7;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 1;
  }
`;

export default GameToast; 