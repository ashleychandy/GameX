import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

// Create a motion button as the base
const MotionButton = motion.button;

const StyledButton = styled(MotionButton)`
  padding: ${({ $size }) => {
    switch ($size) {
      case 'small': return '0.5rem 1rem';
      case 'large': return '1rem 2rem';
      default: return '0.75rem 1.5rem';
    }
  }};
  font-size: ${({ $size }) => {
    switch ($size) {
      case 'small': return '0.875rem';
      case 'large': return '1.125rem';
      default: return '1rem';
    }
  }};
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  background: ${({ theme, $variant }) => {
    switch ($variant) {
      case 'secondary': return theme.surface;
      case 'outline': return 'transparent';
      default: return theme.primary;
    }
  }};
  color: ${({ theme, $variant }) => {
    switch ($variant) {
      case 'secondary': return theme.text.primary;
      case 'outline': return theme.primary;
      default: return theme.text.button;
    }
  }};
  border: 2px solid ${({ theme, $variant }) => 
    $variant === 'outline' ? theme.primary : 'transparent'
  };

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.primary};
    outline-offset: 2px;
  }
`;

export const Button = React.forwardRef(({ 
  children, 
  $variant = 'primary',
  $size = 'medium',
  ...props 
}, ref) => {
  return (
    <StyledButton
      ref={ref}
      $variant={$variant}
      $size={$size}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {children}
    </StyledButton>
  );
});

Button.displayName = 'Button';