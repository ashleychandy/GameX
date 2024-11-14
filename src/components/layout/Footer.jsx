import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const FooterContainer = styled(motion.footer)`
  background: ${({ theme }) => theme.surface};
  border-top: 1px solid ${({ theme }) => theme.border};
  padding: 2rem;
  margin-top: auto;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
`;

const Copyright = styled.p`
  color: ${({ theme }) => theme.text.secondary};
`;

const Links = styled.div`
  display: flex;
  gap: 2rem;
  
  a {
    color: ${({ theme }) => theme.text.secondary};
    text-decoration: none;
    transition: color 0.2s ease;
    
    &:hover {
      color: ${({ theme }) => theme.primary};
    }
  }
`;

export function Footer() {
  return (
    <FooterContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <FooterContent>
        <Copyright>
          © {new Date().getFullYear()} Dice Game. All rights reserved.
        </Copyright>
        <Links>
          <a href="#" target="_blank" rel="noopener noreferrer">Terms</a>
          <a href="#" target="_blank" rel="noopener noreferrer">Privacy</a>
          <a href="#" target="_blank" rel="noopener noreferrer">Documentation</a>
        </Links>
      </FooterContent>
    </FooterContainer>
  );
} 