import React from "react";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { ThemeProvider } from "styled-components";
import AppProviders from "./contexts/AppProviders";
import Routes from "./routes";
import GlobalStyles from "./styles/GlobalStyles";
import theme from "./styles/theme";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <AppProviders>
          <GlobalStyles />
          <Routes />
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            closeOnClick
            pauseOnHover
          />
        </AppProviders>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
