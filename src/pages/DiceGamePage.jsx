import React from 'react';
import { Navigate } from 'react-router-dom';
import { DiceGame } from '../components/game/DiceGame';
import { useWallet } from '../contexts/WalletContext';

export function DiceGamePage() {
  const { isConnected } = useWallet();

  if (!isConnected) {
    return <Navigate to="/" replace />;
  }

  return <DiceGame />;
}

export default DiceGamePage; 