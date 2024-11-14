import React from "react";
import { GameProvider } from "@/contexts/GameContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { Web3Provider } from "@/contexts/Web3Context";

export const AppProviders = ({ children }) => (
  <Web3Provider>
    <ThemeProvider>
      <NotificationProvider>
        <GameProvider>{children}</GameProvider>
      </NotificationProvider>
    </ThemeProvider>
  </Web3Provider>
);
