import React from 'react';
import styled from 'styled-components';

const FooterContainer = styled.footer`
  padding: 1rem 2rem;
  background: ${({ theme }) => theme.surface};
  color: ${({ theme }) => theme.text.secondary};
  text-align: center;
  box-shadow: ${({ theme }) => theme.shadow.sm};
`;

export function Footer() {
  return (
    <FooterContainer>
      <p>© {new Date().getFullYear()} Crypto Dice Game. All rights reserved.</p>
    </FooterContainer>
  );
} 