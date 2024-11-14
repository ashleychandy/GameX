import React, { createContext, useContext, useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { toast } from 'react-toastify';
import themes from '@/styles/theme';

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
      const provider = new ethers.providers.Web3Provider(window.ethereum);
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

// Theme Context
const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('light');
  
  const toggleTheme = () => {
    setCurrentTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme: currentTheme, toggleTheme }}>
      <StyledThemeProvider theme={themes[currentTheme]}>
        {children}
      </StyledThemeProvider>
    </ThemeContext.Provider>
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

// Notification Context
const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const notify = useCallback((message, type = 'info') => {
    toast[type](message);
  }, []);

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
    </NotificationContext.Provider>
  );
};

// Root Provider
export const AppProviders = ({ children }) => (
  <Web3Provider>
    <ThemeProvider>
      <NotificationProvider>
        <GameProvider>
          {children}
        </GameProvider>
      </NotificationProvider>
    </ThemeProvider>
  </Web3Provider>
);
