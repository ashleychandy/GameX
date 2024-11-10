import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const ButtonStyles = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: ${({ $size }) => 
    $size === 'large' ? '1rem 2rem' : 
    $size === 'small' ? '0.5rem 1rem' : 
    '0.75rem 1.5rem'};
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  width: ${({ $fullWidth }) => $fullWidth ? '100%' : 'auto'};
  
  ${({ $variant, theme }) => {
    switch ($variant) {
      case 'primary':
        return `
          background: ${theme.primary};
          color: ${theme.text.inverse};
          border: none;
          &:hover:not(:disabled) {
            background: ${theme.primaryHover};
          }
        `;
      case 'secondary':
        return `
          background: ${theme.surface};
          color: ${theme.text.primary};
          border: 1px solid ${theme.border};
          &:hover:not(:disabled) {
            background: ${theme.surfaceHover};
          }
        `;
      default:
        return '';
    }
  }}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const StyledLink = styled(Link)`
  text-decoration: none;
  color: inherit;
`;

export const Button = React.forwardRef(({
  children,
  to,
  onClick,
  $variant = 'primary',
  $size = 'medium',
  $fullWidth = false,
  disabled = false,
  type = 'button',
  ...props
}, ref) => {
  // If 'to' prop is provided, render as Link
  if (to) {
    return (
      <ButtonStyles
        as="div"
        $variant={$variant}
        $size={$size}
        $fullWidth={$fullWidth}
        {...props}
        ref={ref}
      >
        <StyledLink to={to}>
          {children}
        </StyledLink>
      </ButtonStyles>
    );
  }

  // Otherwise render as button
  return (
    <ButtonStyles
      onClick={onClick}
      $variant={$variant}
      $size={$size}
      $fullWidth={$fullWidth}
      disabled={disabled}
      type={type}
      {...props}
      ref={ref}
    >
      {children}
    </ButtonStyles>
  );
});

Button.displayName = 'Button';