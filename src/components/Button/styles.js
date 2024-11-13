import styled from 'styled-components'

export const StyledButton = styled.button`
  padding: 10px 20px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  
  ${({ variant, theme }) => {
    switch(variant) {
      case 'secondary':
        return `
          background: ${theme.colors.secondary};
          color: ${theme.colors.white};
        `
      case 'outline':
        return `
          background: transparent;
          border: 1px solid ${theme.colors.primary};
          color: ${theme.colors.primary};
        `
      default:
        return `
          background: ${theme.colors.primary};
          color: ${theme.colors.white};
        `
    }
  }}
` 