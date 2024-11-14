import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    font-size: 16px;
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    background: ${({ theme }) => theme.background};
    color: ${({ theme }) => theme.text.primary};
    line-height: 1.5;
    min-height: 100vh;
    transition: background-color 0.2s ease;
  }

  #root {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  button {
    font-family: inherit;
    border: none;
    cursor: pointer;
    
    &:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  input, textarea {
    font-family: inherit;
    font-size: inherit;
  }

  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.surface2};
  }

  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.surface3};
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.text.secondary};
  }
`; 