import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from '@/router';
import themes from '@/styles/theme';
import { GlobalStyle } from '@/styles/GlobalStyle';
import { AppProviders } from '@/contexts';
import { ToastContainer } from 'react-toastify';
import { useTheme } from '@/hooks/useTheme';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const { theme } = useTheme();

  return (
    <AppProviders>
      <GlobalStyle />
      <RouterProvider router={router} />
      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={theme}
      />
    </AppProviders>
  );
}

export default App; 