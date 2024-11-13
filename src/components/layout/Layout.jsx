import React, { useEffect } from 'react';
import styled from 'styled-components';
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { getRouteMetadata } from '../../router';

// Styled Components
const LayoutContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text.primary};
`;

const Header = styled(motion.header)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  background: ${({ theme }) => theme.surface};
  box-shadow: ${({ theme }) => theme.shadow.sm};
  z-index: 100;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;

  @media (max-width: 768px) {
    gap: 0.5rem;
  }
`;

const HeaderTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text.primary};
  background: ${({ theme }) => theme.gradients.primary};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
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

export function Layout() {
  const location = useLocation();
  
  useEffect(() => {
    const { title } = getRouteMetadata(location.pathname);
    if (title) {
      document.title = `${title} | GameX`;
    }
  }, [location]);

  return (
    <LayoutContainer>
      <Header
        initial="initial"
        animate="animate"
        exit="exit"
        variants={containerVariants}
      >
        <HeaderLeft>
          <HeaderTitle>GameX</HeaderTitle>
        </HeaderLeft>
        <HeaderRight>
          <Navbar />
        </HeaderRight>
      </Header>

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

// PropTypes are not needed since this component doesn't accept any props

export default Layout; 