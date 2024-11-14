import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { router } from './router';
import { GlobalStyles } from './styles/GlobalStyles';
import { AppProviders } from './contexts';
import 'react-toastify/dist/ReactToastify.css';

export default function App() {
  return (
    <AppProviders>
      <GlobalStyles />
      <RouterProvider router={router} />
      <ToastContainer
        position="bottom-right"
        theme="dark"
        autoClose={5000}
      />
    </AppProviders>
  );
} 