import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const STORAGE_KEY = 'game_settings';

const defaultSettings = {
  gasPrice: 'auto',
  slippageTolerance: '0.5',
  theme: 'light',
  soundEnabled: true,
  notifications: true,
  autoReveal: true,
  confirmations: 1,
  customGasLimit: '',
  maxBet: ethers.parseEther('1.0'),
  minBet: ethers.parseEther('0.01'),
};

export const useGameSettings = () => {
  const [settings, setSettings] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  const validateSetting = (key, value) => {
    switch (key) {
      case 'slippageTolerance':
        const tolerance = parseFloat(value);
        return !isNaN(tolerance) && tolerance > 0 && tolerance <= 100;
      
      case 'confirmations':
        const confirmations = parseInt(value);
        return !isNaN(confirmations) && confirmations > 0;
      
      case 'customGasLimit':
        if (!value) return true;
        const gasLimit = parseInt(value);
        return !isNaN(gasLimit) && gasLimit >= 21000;
      
      case 'maxBet':
        try {
          const maxBet = ethers.parseEther(value);
          return maxBet.gt(settings.minBet);
        } catch {
          return false;
        }
      
      case 'minBet':
        try {
          const minBet = ethers.parseEther(value);
          return minBet.gt(0) && minBet.lt(settings.maxBet);
        } catch {
          return false;
        }
      
      default:
        return true;
    }
  };

  return {
    settings,
    updateSetting,
    resetSettings,
    validateSetting
  };
}; 