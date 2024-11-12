import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import ErrorBoundary from './components/ErrorBoundary';
import { validateEnv } from './utils/config';
import 'react-toastify/dist/ReactToastify.css';

// Validate environment variables on app start
validateEnv();

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ToastContainer />
        {/* Your routes and other components */}
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App; 