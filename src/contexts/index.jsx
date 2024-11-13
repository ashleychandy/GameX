import React from 'react';
import { GameProvider } from './GameContext';
import { ThemeProvider } from './ThemeContext';
import { NotificationProvider } from './NotificationContext';
import { Web3Provider } from './Web3Context';

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