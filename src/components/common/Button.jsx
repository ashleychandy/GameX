import styled from 'styled-components';
import { motion } from 'framer-motion';

export const Button = styled(motion.button)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: ${({ $size }) => 
    $size === 'large' ? '1rem 2rem' : 
    $size === 'small' ? '0.5rem 1rem' : 
    '0.75rem 1.5rem'};
  font-size: ${({ $size }) => 
    $size === 'large' ? '1.125rem' : 
    $size === 'small' ? '0.875rem' : 
    '1rem'};
  font-weight: 600;
  border-radius: 9999px;
  border: none;
  background: ${({ theme, $variant }) => 
    $variant === 'primary' ? theme.gradients.primary :
    $variant === 'outline' ? 'transparent' :
    theme.surface};
  color: ${({ theme, $variant }) => 
    $variant === 'primary' ? theme.text.inverse : 
    theme.text.primary};
  border: 2px solid ${({ theme, $variant }) => 
    $variant === 'outline' ? theme.border : 'transparent'};
  width: ${({ $fullWidth }) => $fullWidth ? '100%' : 'auto'};
  opacity: ${({ disabled }) => disabled ? 0.5 : 1};
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: ${({ theme }) => theme.shadow.md};
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;