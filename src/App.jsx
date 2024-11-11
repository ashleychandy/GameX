import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { WalletProvider } from './contexts/WalletContext';
import { GameProvider } from './contexts/GameContext';
import { router } from './routes';
import { themes } from './styles/theme';
import { GlobalStyle } from './styles/GlobalStyle';
import { ErrorBoundary } from './components/common/ErrorBoundary';

const theme = {
  ...themes.dark,
  shadow: {
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  },
};

function App() {
  return (
    <ErrorBoundary>
      <WalletProvider>
        <GameProvider>
          <ThemeProvider theme={theme}>
            <GlobalStyle />
            <RouterProvider router={router} />
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
          </ThemeProvider>
        </GameProvider>
      </WalletProvider>
    </ErrorBoundary>
  );
}

export default App; 