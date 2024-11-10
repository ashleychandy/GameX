import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { ToastContainer } from 'react-toastify';
import { WalletProvider } from './contexts/WalletContext';
import { router } from './routes.jsx';
import { themes } from './styles/theme';
import { GlobalStyle } from './styles/GlobalStyle';

function App() {
  return (
    <ThemeProvider theme={themes.dark}>
      <WalletProvider>
        <GlobalStyle />
        <RouterProvider router={router} />
        <ToastContainer
          position="bottom-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
      </WalletProvider>
    </ThemeProvider>
  );
}

export default App; 