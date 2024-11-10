import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const FooterContainer = styled.footer`
  background: ${({ theme }) => theme.surface};
  padding: 2rem;
  margin-top: auto;
  box-shadow: ${({ theme }) => theme.shadow.sm};
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
`;

const FooterSection = styled.div`
  h3 {
    color: ${({ theme }) => theme.text.primary};
    margin-bottom: 1rem;
    font-size: 1.125rem;
  }

  p {
    color: ${({ theme }) => theme.text.secondary};
    font-size: 0.875rem;
    line-height: 1.6;
  }
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const SocialLink = styled(motion.a)`
  color: ${({ theme }) => theme.text.secondary};
  font-size: 1.5rem;
  
  &:hover {
    color: ${({ theme }) => theme.primary};
  }
`;

const Copyright = styled.div`
  text-align: center;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid ${({ theme }) => theme.border};
  color: ${({ theme }) => theme.text.secondary};
  font-size: 0.875rem;
`;

export function Footer() {
  return (
    <FooterContainer>
      <FooterContent>
        <FooterSection>
          <h3>About</h3>
          <p>
            Crypto Dice Game is a decentralized gambling game built on Ethereum.
            Play with our native GAMEX token and win big!
          </p>
        </FooterSection>

        <FooterSection>
          <h3>Links</h3>
          <p>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          </p>
          <p>
            <a href="https://docs.com" target="_blank" rel="noopener noreferrer">
              Documentation
            </a>
          </p>
        </FooterSection>

        <FooterSection>
          <h3>Connect</h3>
          <SocialLinks>
            <SocialLink
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              𝕏
            </SocialLink>
            <SocialLink
              href="https://discord.com"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              Discord
            </SocialLink>
          </SocialLinks>
        </FooterSection>
      </FooterContent>

      <Copyright>
        © {new Date().getFullYear()} Crypto Dice Game. All rights reserved.
      </Copyright>
    </FooterContainer>
  );
} 