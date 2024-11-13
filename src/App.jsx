import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { router } from './routes';
import { themes } from './styles/theme';
import { GlobalStyle } from './styles/GlobalStyle';
import { WalletProvider } from './contexts/WalletContext';
import { GameProvider } from './contexts/GameContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <ThemeProvider theme={themes.dark}>
      <WalletProvider>
        <GameProvider>
          <GlobalStyle />
          <RouterProvider router={router} />
          <ToastContainer 
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
          />
        </GameProvider>
      </WalletProvider>
    </ThemeProvider>
  );
}

export default App; 