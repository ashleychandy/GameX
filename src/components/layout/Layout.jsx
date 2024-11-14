// src/components/Layout.jsx
import React, { useEffect } from 'react';
import styled from 'styled-components';
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { getRouteMetadata } from '@/router';
import PropTypes from 'prop-types';

const LayoutContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text.primary};
`;

const Main = styled(motion.main)`
  flex: 1;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background: ${({ theme }) => theme.background};

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const ContentContainer = styled(motion.div)`
  background: ${({ theme }) => theme.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadow.md};
  padding: 2rem;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

// Animation variants
const containerVariants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: {
      duration: 0.3,
      when: "beforeChildren"
    }
  },
  exit: { opacity: 0 }
};

const contentVariants = {
  initial: { y: 20, opacity: 0 },
  animate: { 
    y: 0, 
    opacity: 1,
    transition: {
      duration: 0.3
    }
  },
  exit: { 
    y: -20, 
    opacity: 0,
    transition: {
      duration: 0.2
    }
  }
};

function Layout() {
  const location = useLocation();
  
  useEffect(() => {
    const { title } = getRouteMetadata(location.pathname);
    if (title) {
      document.title = `${title} | GameX`;
    }
  }, [location]);

  return (
    <LayoutContainer>
      <Navbar />
      <Main
        initial="initial"
        animate="animate"
        exit="exit"
        variants={containerVariants}
      >
        <ContentContainer variants={contentVariants}>
          <Outlet />
        </ContentContainer>
      </Main>
      <Footer />
    </LayoutContainer>
  );
}

Layout.propTypes = {
  children: PropTypes.node
};

export { Layout };
