import React, { createContext, useContext, useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { toast } from 'react-toastify';
import { lightTheme, darkTheme } from '@/styles/theme';

// Theme Context
const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('light');
  
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

// Web3 Context
const Web3Context = createContext(null);

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      toast.error("Please install MetaMask!");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);
      setProvider(provider);
    } catch (error) {
      toast.error(error.message);
    }
  }, []);

  return (
    <Web3Context.Provider value={{ provider, account, connectWallet }}>
      {children}
    </Web3Context.Provider>
  );
};

// Game Context
const GameContext = createContext(null);

export const GameProvider = ({ children }) => {
  const [gameState, setGameState] = useState({
    isActive: false,
    currentBet: null,
    history: []
  });

  return (
    <GameContext.Provider value={{ gameState, setGameState }}>
      {children}
    </GameContext.Provider>
  );
};

// Root Provider
export const AppProviders = ({ children }) => (
  <ThemeProvider>
    <Web3Provider>
      <GameProvider>
        {children}
      </GameProvider>
    </Web3Provider>
  </ThemeProvider>
);

// Export hooks
export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useThemeContext must be used within ThemeProvider');
  return context;
};

export const useWeb3Context = () => {
  const context = useContext(Web3Context);
  if (!context) throw new Error('useWeb3Context must be used within Web3Provider');
  return context;
};

export const useGameContext = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGameContext must be used within GameProvider');
  return context;
};
