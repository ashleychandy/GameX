import React from 'react';
import styled from 'styled-components';

const Footer = () => {
  return (
    <FooterContainer>
      <FooterContent>
        <Copyright>© 2023 Dice Game. All rights reserved.</Copyright>
        <Links>
          <FooterLink href="/terms">Terms</FooterLink>
          <FooterLink href="/privacy">Privacy</FooterLink>
          <FooterLink href="https://github.com/your-repo">GitHub</FooterLink>
        </Links>
      </FooterContent>
    </FooterContainer>
  );
};

const FooterContainer = styled.footer`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  padding: ${({ theme }) => theme.spacing.lg};
  margin-top: auto;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.md};
  }
`;

const Copyright = styled.p`
  color: ${({ theme }) => theme.colors.textAlt};
`;

const Links = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
`;

const FooterLink = styled.a`
  color: ${({ theme }) => theme.colors.textAlt};
  text-decoration: none;
  transition: color 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

export default Footer; 