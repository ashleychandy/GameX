import React from 'react';
import { ThemeProvider } from 'styled-components';
import { RouterProvider } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { router } from './router';
import { GlobalStyles } from './styles/GlobalStyles';
import { lightTheme, darkTheme } from './styles/theme';
import { useTheme } from './hooks/useTheme';
import 'react-toastify/dist/ReactToastify.css';

export default function App() {
  const { theme } = useTheme();
  const currentTheme = theme === 'dark' ? darkTheme : lightTheme;

  return (
    <ThemeProvider theme={currentTheme}>
      <GlobalStyles />
      <RouterProvider router={router} />
      <ToastContainer
        position="bottom-right"
        theme={theme}
        autoClose={5000}
      />
    </ThemeProvider>
  );
} 