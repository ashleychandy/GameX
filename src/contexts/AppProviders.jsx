import React from 'react';
import { ThemeProvider } from 'styled-components';
import { theme } from '@/styles/theme';
import { WalletProvider } from './WalletContext';
import { GameProvider } from './GameContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export function AppProviders({ children }) {
  return (
    <ThemeProvider theme={theme}>
      <WalletProvider>
        <GameProvider>
          {children}
          <ToastContainer
            position="bottom-right"
            theme="dark"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </GameProvider>
      </WalletProvider>
    </ThemeProvider>
  );
} 