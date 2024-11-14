import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppProviders } from './contexts/AppProviders';
import { GlobalStyles } from './styles/GlobalStyles';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppProviders>
      <GlobalStyles />
      <App />
    </AppProviders>
  </React.StrictMode>
); 