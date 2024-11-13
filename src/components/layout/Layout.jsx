import React, { useEffect } from 'react';
import styled from 'styled-components';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { getRouteMetadata } from '../../routes';
import { useTheme } from '../../hooks/useTheme';

const LayoutContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text.primary};
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  padding: 1rem 2rem;
  background: ${({ theme }) => theme.surface};
  box-shadow: ${({ theme }) => theme.shadow.sm};
`;

const Title = styled.h1`
  font-size: 1.5rem;
  color: ${({ theme }) => theme.text.primary};
  background: ${({ theme }) => theme.gradients.primary};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Main = styled.main`
  flex: 1;
  background: ${({ theme }) => theme.background};
`;

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
      <Header>
        <Title>GameX</Title>
      </Header>
      <Navbar />
      <Main>
        <Outlet />
      </Main>
      <Footer />
    </LayoutContainer>
  );
} 