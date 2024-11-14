// src/components/Layout.jsx
import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

const LayoutWrapper = styled(motion.div)`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.background};
`;

const Main = styled(motion.main)`
  flex: 1;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

export function Layout() {
  return (
    <LayoutWrapper>
      <Navbar />
      <Main
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageTransition}
      >
        <Outlet />
      </Main>
      <Footer />
    </LayoutWrapper>
  );
}

