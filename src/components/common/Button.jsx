import styled from 'styled-components';
import { motion } from 'framer-motion';

export const Button = styled(motion.button)`
  padding: ${({ $size = 'md' }) => {
    switch ($size) {
      case 'sm': return '0.5rem 1rem';
      case 'lg': return '1rem 2rem';
      default: return '0.75rem 1.5rem';
    }
  }};
  font-size: ${({ $size = 'md' }) => {
    switch ($size) {
      case 'sm': return '0.875rem';
      case 'lg': return '1.125rem';
      default: return '1rem';
    }
  }};
  font-weight: 500;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'auto')};
  
  ${({ $variant = 'primary', theme }) => {
    switch ($variant) {
      case 'primary':
        return `
          background: ${theme.gradients.primary};
          color: ${theme.text.inverse};
          &:hover:not(:disabled) {
            opacity: 0.9;
          }
        `;
      case 'secondary':
        return `
          background: ${theme.surface};
          color: ${theme.text.primary};
          border: 1px solid ${theme.border};
          &:hover:not(:disabled) {
            background: ${theme.background};
          }
        `;
      case 'outline':
        return `
          background: transparent;
          color: ${theme.primary};
          border: 1px solid ${theme.primary};
          &:hover:not(:disabled) {
            background: ${theme.primary};
            color: ${theme.text.inverse};
          }
        `;
      default:
        return '';
    }
  }}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;