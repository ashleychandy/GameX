import React from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { GameProvider } from './GameContext';
import { lightTheme, darkTheme } from '@/styles/theme';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Theme Context
export const ThemeContext = React.createContext(null);

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = React.useState('dark');
  
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

export const AppProviders = ({ children }) => (
  <ThemeProvider>
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
  </ThemeProvider>
);

// Export hooks
export { useGameContext } from './GameContext';
