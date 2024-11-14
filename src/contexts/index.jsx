import React, { createContext, useContext, useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { toast } from 'react-toastify';
import { lightTheme, darkTheme } from '@/styles/theme';
import { WalletProvider } from './WalletContext';
import { GameProvider } from './GameContext';

// Theme Context
const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('dark');
  
  const toggleTheme = () => {
    setCurrentTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const theme = currentTheme === 'light' ? lightTheme : darkTheme;

  return (
    <ThemeContext.Provider value={{ theme: currentTheme, toggleTheme }}>
      <StyledThemeProvider theme={theme}>
        {children}
      </StyledThemeProvider>
    </ThemeContext.Provider>
  );
};

// Root Provider
export const AppProviders = ({ children }) => (
  <ThemeProvider>
    <WalletProvider>
      <GameProvider>
        {children}
      </GameProvider>
    </WalletProvider>
  </ThemeProvider>
);

// Export hooks
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};

export { useWallet } from './WalletContext';
export { useGameContext } from './GameContext';
