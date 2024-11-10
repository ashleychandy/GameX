import React from 'react';
import { DiceGame } from '../../components/game/DiceGame';
import { useWallet } from '../../contexts/WalletContext';
import { WalletPrompt } from '../../components/common/WalletPrompt';

export function DiceGamePage() {
  const { isConnected } = useWallet();

  if (!isConnected) {
    return <WalletPrompt />;
  }

  return <DiceGame />;
}

export default DiceGamePage; 