import React from 'react';
import { WalletPrompt } from '../../components/common/WalletPrompt';
import { useWallet } from '../../hooks/useWallet';

export function HomePage() {
  const { isConnected } = useWallet();

  return (
    <div>
      <h1>Welcome to Dice Game</h1>
      {!isConnected && <WalletPrompt />}
    </div>
  );
}