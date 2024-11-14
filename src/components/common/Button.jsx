import styled from 'styled-components';
import { motion } from 'framer-motion';

export const Button = styled(motion.button)`
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  position: relative;
  
  ${({ $variant, theme }) => {
    switch ($variant) {
      case 'primary':
        return `
          background: ${theme.gradients.primary};
          color: white;
          &:hover:not(:disabled) {
            opacity: 0.9;
            transform: translateY(-1px);
          }
        `;
      case 'secondary':
        return `
          background: ${theme.surface2};
          color: ${theme.text.primary};
          &:hover:not(:disabled) {
            background: ${theme.surface3};
          }
        `;
      case 'outline':
        return `
          background: transparent;
          border: 2px solid ${theme.border};
          color: ${theme.text.primary};
          &:hover:not(:disabled) {
            background: ${theme.surface2};
          }
        `;
      default:
        return `
          background: ${theme.surface};
          color: ${theme.text.primary};
          &:hover:not(:disabled) {
            background: ${theme.surface2};
          }
        `;
    }
  }}

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  ${({ $loading }) => $loading && `
    color: transparent;
    pointer-events: none;

    &::after {
      content: '';
      position: absolute;
      width: 16px;
      height: 16px;
      top: 50%;
      left: 50%;
      margin: -8px 0 0 -8px;
      border: 2px solid transparent;
      border-top-color: currentColor;
      border-radius: 50%;
      animation: button-loading-spinner 0.6s linear infinite;
    }
  `}

  @keyframes button-loading-spinner {
    from {
      transform: rotate(0turn);
    }
    to {
      transform: rotate(1turn);
    }
  }
`; 