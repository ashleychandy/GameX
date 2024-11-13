import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { router } from './routes';
import { themes } from './styles/theme';
import { GlobalStyle } from './styles/GlobalStyle';
import { WalletProvider } from './contexts/WalletContext';
import { GameProvider } from './contexts/GameContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { useTheme } from './hooks';

function App() {
  const { currentTheme } = useTheme();

  return (
    <ThemeProvider theme={themes[currentTheme]}>
      <NotificationProvider>
        <GlobalStyle />
        <RouterProvider router={router} />
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App; 