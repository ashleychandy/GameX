import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { useWallet } from '../../contexts/WalletContext';
import { useAdmin } from '../../hooks/useAdmin';
import { handleError } from '../utils/errorHandling';

const AdminContainer = styled(motion.div)`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const AdminCard = styled.div`
  background: ${({ theme }) => theme.surface};
  border-radius: 24px;
  padding: 2rem;
  box-shadow: ${({ theme }) => theme.shadow.md};
  margin-bottom: 2rem;

  h2 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: ${({ theme }) => theme.text.primary};
  }
`;

const StatDisplay = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: ${({ theme }) => theme.background};
  border-radius: 8px;
  margin-bottom: 1rem;

  span {
    color: ${({ theme }) => theme.text.primary};
    font-weight: 600;
  }
`;

const MintSection = styled(AdminCard)`
  h3 {
    margin-bottom: 1.5rem;
  }

  .mint-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .input-group {
    display: flex;
    gap: 1rem;
    align-items: flex-end;
  }
`;

const AddressInput = styled.div`
  flex: 1;
  
  label {
    display: block;
    color: ${({ theme }) => theme.text.secondary};
    font-size: 0.875rem;
    margin-bottom: 0.5rem;
  }

  input {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 2px solid ${({ theme, $error }) => 
      $error ? theme.error : theme.border};
    border-radius: 12px;
    background: ${({ theme }) => theme.background};
    color: ${({ theme }) => theme.text.primary};
    font-size: 1rem;

    &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.primary};
      box-shadow: 0 0 0 4px ${({ theme }) => theme.primary}20;
    }
  }
`;

export function AdminPanel() {
  const { isConnected, isAdmin } = useWallet();
  const { 
    contractStats,
    isMinting,
    mintTokens,
    refreshStats
  } = useAdmin();

  const [mintAddress, setMintAddress] = useState('');
  const [mintAmount, setMintAmount] = useState('');
  const [addressError, setAddressError] = useState('');

  const handleMint = async () => {
    if (!mintAddress || !mintAmount) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await mintTokens(mintAddress, mintAmount);
      toast.success('Tokens minted successfully!');
      setMintAddress('');
      setMintAmount('');
      refreshStats();
    } catch (error) {
      const { message } = handleError(error);
      toast.error(message);
    }
  };

  if (!isConnected || !isAdmin) {
    return (
      <AdminContainer>
        <AdminCard>
          <h2>Admin Access Required</h2>
          <p>Please connect with an admin wallet to access this section.</p>
        </AdminCard>
      </AdminContainer>
    );
  }

  return (
    <AdminContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <MintSection>
        <h2>Token Management</h2>
        
        <div className="mint-form">
          <div className="input-group">
            <AddressInput $error={addressError}>
              <label>Recipient Address</label>
              <input
                type="text"
                value={mintAddress}
                onChange={(e) => {
                  setMintAddress(e.target.value);
                  setAddressError('');
                }}
                placeholder="0x..."
              />
            </AddressInput>
            <Input
              label="Amount"
              type="number"
              value={mintAmount}
              onChange={(e) => setMintAmount(e.target.value)}
              placeholder="100"
              style={{ width: '200px' }}
            />
            <Button
              $variant="primary"
              onClick={handleMint}
              disabled={isMinting}
              $loading={isMinting}
            >
              Mint Tokens
            </Button>
          </div>
        </div>
      </MintSection>

      <AdminCard>
        <h2>Contract Statistics</h2>
        <StatDisplay>
          <span>Total Supply</span>
          <span>{contractStats.totalSupply || '0'} DICE</span>
        </StatDisplay>
        <StatDisplay>
          <span>Total Games Played</span>
          <span>{contractStats.totalGames || '0'}</span>
        </StatDisplay>
        <StatDisplay>
          <span>Total Volume</span>
          <span>{contractStats.totalVolume || '0'} DICE</span>
        </StatDisplay>
      </AdminCard>
    </AdminContainer>
  );
} 