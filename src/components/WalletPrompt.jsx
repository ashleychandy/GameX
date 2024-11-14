import React from 'react';
import PropTypes from 'prop-types';
import { useWallet } from '@/hooks/useWallet';
import { Button } from '@/components/Button';

const WalletPrompt = ({ onConnect }) => {
  const { connect, isConnecting } = useWallet();

  const handleConnect = async () => {
    try {
      await connect();
      onConnect?.();
    } catch (error) {
      console.error('Connection error:', error);
    }
  };

  return (
    <div className="wallet-prompt">
      <Button 
        onClick={handleConnect} 
        disabled={isConnecting}
      >
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </Button>
    </div>
  );
};

WalletPrompt.propTypes = {
  onConnect: PropTypes.func
};

export default WalletPrompt; 