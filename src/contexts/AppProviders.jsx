import React from 'react';
import { WalletProvider } from './WalletContext';
import { GameProvider } from './GameContext';
import { ThemeProvider } from './ThemeContext';

const AppProviders = ({ children }) => {
  return (
    <ThemeProvider>
      <WalletProvider>
        <GameProvider>
          {children}
        </GameProvider>
      </WalletProvider>
    </ThemeProvider>
  );
};

export default AppProviders; 