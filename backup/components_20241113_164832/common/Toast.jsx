import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const ToastContainer = styled(motion.div)`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: ${({ theme, $type }) => {
    switch ($type) {
      case 'error':
        return `${theme.error}10`;
      case 'success':
        return `${theme.success}10`;
      case 'warning':
        return `${theme.warning}10`;
      default:
        return theme.surface;
    }
  }};
  border-left: 4px solid ${({ theme, $type }) => {
    switch ($type) {
      case 'error':
        return theme.error;
      case 'success':
        return theme.success;
      case 'warning':
        return theme.warning;
      default:
        return theme.primary;
    }
  }};
  border-radius: 8px;
`;

const IconContainer = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme, $type }) => {
    switch ($type) {
      case 'error':
        return theme.error;
      case 'success':
        return theme.success;
      case 'warning':
        return theme.warning;
      default:
        return theme.primary;
    }
  }};
`;

const Content = styled.div`
  flex: 1;

  .title {
    font-weight: 600;
    margin-bottom: 0.25rem;
  }

  .message {
    color: ${({ theme }) => theme.text.secondary};
    font-size: 0.875rem;
  }
`;

export function Toast({ type = 'info', title, message }) {
  return (
    <ToastContainer
      $type={type}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
    >
      <IconContainer $type={type}>
        {type === 'success' && '✓'}
        {type === 'error' && '✕'}
        {type === 'warning' && '⚠'}
        {type === 'info' && 'ℹ'}
      </IconContainer>
      <Content>
        {title && <div className="title">{title}</div>}
        {message && <div className="message">{message}</div>}
      </Content>
    </ToastContainer>
  );
} 