import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { ethers } from 'ethers';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { useWallet } from '../../contexts/WalletContext';
import { useAdmin } from '../../hooks/useAdmin';
import { useContractState } from '../../hooks/useContractState';
import { handleError } from '../../utils/errorHandling';
import { Loading } from '../common/Loading';

const AdminContainer = styled(motion.div)`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const AdminSection = styled.div`
  background: ${({ theme }) => theme.surface};
  border-radius: 24px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: ${({ theme }) => theme.shadow.md};

  h2 {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
    color: ${({ theme }) => theme.text.primary};
  }
`;

const ActionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
`;

const ActionCard = styled.div`
  background: ${({ theme }) => theme.background};
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid ${({ theme }) => theme.border};

  h3 {
    margin-bottom: 1rem;
    font-size: 1.1rem;
    color: ${({ theme }) => theme.text.primary};
  }

  .input-group {
    margin-bottom: 1rem;
  }
`;

const InputGroup = styled.div`
  margin-bottom: 1rem;

  label {
    display: block;
    margin-bottom: 0.5rem;
    color: ${({ theme }) => theme.text.secondary};
  }
`;

const StatsDisplay = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background: ${({ theme }) => theme.background};
  border-radius: 12px;
`;

const StatItem = styled.div`
  text-align: center;
  padding: 1rem;
  
  h4 {
    color: ${({ theme }) => theme.text.secondary};
    margin-bottom: 0.5rem;
  }
  
  p {
    font-size: 1.25rem;
    font-weight: bold;
    color: ${({ theme }) => theme.text.primary};
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.5rem;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text.primary};
  margin-bottom: 1rem;
`;

export function AdminPanel() {
  const { isConnected, isAdmin } = useWallet();
  const { state: contractState } = useContractState();
  const {
    mintTokens,
    setHouseEdge,
    withdrawFunds,
    pauseGame,
    unpauseGame,
    setHistorySize,
    setCallbackGasLimit,
    setCoordinator,
    revokeTokenRole,
    grantTokenRole,
    setMinBet,
    setMaxBet,
    isLoading,
    error
  } = useAdmin();

  const [inputs, setInputs] = useState({
    mintAddress: '',
    mintAmount: '',
    withdrawAmount: '',
    houseEdge: '',
    historySize: '',
    callbackGasLimit: '',
    coordinatorAddress: '',
    revokeAddress: '',
    grantAddress: '',
    roleType: 'MINTER_ROLE',
    minBet: '',
    maxBet: ''
  });

  const handleInputChange = (name, value) => {
    setInputs(prev => ({ ...prev, [name]: value }));
  };

  const validateInput = (name, value) => {
    switch (name) {
      case 'mintAmount':
      case 'withdrawAmount':
      case 'minBet':
      case 'maxBet':
        if (value <= 0) return 'Amount must be greater than 0';
        break;
      case 'houseEdge':
        if (value < 0 || value > 100) return 'House edge must be between 0 and 100';
        break;
      case 'mintAddress':
      case 'grantAddress':
      case 'coordinatorAddress':
        if (!ethers.isAddress(value)) return 'Invalid address';
        break;
      case 'callbackGasLimit':
        if (value < 100000) return 'Gas limit too low';
        break;
      default:
        return null;
    }
    return null;
  };

  const handleAction = async (action, ...args) => {
    try {
      // Validate all arguments
      const errors = args.map((arg, index) => validateInput(Object.keys(inputs)[index], arg));
      const error = errors.find(e => e !== null);
      if (error) {
        toast.error(error);
        return;
      }

      await action(...args);
      toast.success('Action completed successfully!');
    } catch (error) {
      const { message } = handleError(error);
      toast.error(message);
    }
  };

  if (!isConnected || !isAdmin) {
    return (
      <AdminContainer>
        <AdminSection>
          <h2>Admin Access Required</h2>
          <p>Please connect with an admin wallet to access this section.</p>
        </AdminSection>
      </AdminContainer>
    );
  }

  if (isLoading) {
    return (
      <AdminContainer>
        <Loading message="Loading admin panel..." />
      </AdminContainer>
    );
  }

  return (
    <AdminContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Contract Stats Section */}
      <AdminSection>
        <h2>Contract Statistics</h2>
        <StatsDisplay>
          <StatItem>
            <h4>Contract Balance</h4>
            <p>{ethers.formatEther(contractState.balance || '0')} GAMEX</p>
          </StatItem>
          <StatItem>
            <h4>Game Status</h4>
            <p>{contractState.paused ? 'Paused' : 'Active'}</p>
          </StatItem>
          <StatItem>
            <h4>House Edge</h4>
            <p>{ethers.formatEther(contractState.houseEdge || '0')}%</p>
          </StatItem>
          <StatItem>
            <h4>Min Bet</h4>
            <p>{ethers.formatEther(contractState.minBet || '0')} GAMEX</p>
          </StatItem>
          <StatItem>
            <h4>Max Bet</h4>
            <p>{ethers.formatEther(contractState.maxBet || '0')} GAMEX</p>
          </StatItem>
        </StatsDisplay>
      </AdminSection>

      {/* Token Management Section */}
      <AdminSection>
        <h2>Token Management</h2>
        <ActionGrid>
          <ActionCard>
            <h3>Mint Tokens</h3>
            <InputGroup>
              <Input
                label="Recipient Address"
                value={inputs.mintAddress}
                onChange={(e) => handleInputChange('mintAddress', e.target.value)}
                placeholder="0x..."
              />
            </InputGroup>
            <InputGroup>
              <Input
                label="Amount"
                type="number"
                value={inputs.mintAmount}
                onChange={(e) => handleInputChange('mintAmount', e.target.value)}
                placeholder="100"
              />
            </InputGroup>
            <Button
              onClick={() => handleAction(mintTokens, inputs.mintAddress, inputs.mintAmount)}
              disabled={isLoading}
            >
              Mint Tokens
            </Button>
          </ActionCard>

          <ActionCard>
            <h3>Token Roles</h3>
            <InputGroup>
              <Input
                label="Address"
                value={inputs.grantAddress}
                onChange={(e) => handleInputChange('grantAddress', e.target.value)}
                placeholder="0x..."
              />
            </InputGroup>
            <Select
              value={inputs.roleType}
              onChange={(e) => handleInputChange('roleType', e.target.value)}
            >
              <option value="DEFAULT_ADMIN_ROLE">Admin Role</option>
              <option value="MINTER_ROLE">Minter Role</option>
              <option value="BURNER_ROLE">Burner Role</option>
            </Select>
            <Button
              onClick={() => handleAction(grantTokenRole, inputs.roleType, inputs.grantAddress)}
              disabled={isLoading}
              style={{ marginRight: '1rem' }}
            >
              Grant Role
            </Button>
            <Button
              onClick={() => handleAction(revokeTokenRole, inputs.roleType, inputs.grantAddress)}
              disabled={isLoading}
              $variant="danger"
            >
              Revoke Role
            </Button>
          </ActionCard>
        </ActionGrid>
      </AdminSection>

      {/* Game Configuration Section */}
      <AdminSection>
        <h2>Game Configuration</h2>
        <ActionGrid>
          <ActionCard>
            <h3>House Edge</h3>
            <InputGroup>
              <Input
                label="New House Edge (%)"
                type="number"
                value={inputs.houseEdge}
                onChange={(e) => handleInputChange('houseEdge', e.target.value)}
                placeholder="5"
              />
            </InputGroup>
            <Button
              onClick={() => handleAction(setHouseEdge, inputs.houseEdge)}
              disabled={isLoading}
            >
              Update House Edge
            </Button>
          </ActionCard>

          <ActionCard>
            <h3>Bet Limits</h3>
            <InputGroup>
              <Input
                label="Minimum Bet"
                type="number"
                value={inputs.minBet}
                onChange={(e) => handleInputChange('minBet', e.target.value)}
                placeholder="1"
              />
            </InputGroup>
            <InputGroup>
              <Input
                label="Maximum Bet"
                type="number"
                value={inputs.maxBet}
                onChange={(e) => handleInputChange('maxBet', e.target.value)}
                placeholder="1000"
              />
            </InputGroup>
            <Button
              onClick={() => handleAction(setMinBet, inputs.minBet)}
              disabled={isLoading}
              style={{ marginRight: '1rem' }}
            >
              Set Min Bet
            </Button>
            <Button
              onClick={() => handleAction(setMaxBet, inputs.maxBet)}
              disabled={isLoading}
            >
              Set Max Bet
            </Button>
          </ActionCard>

          <ActionCard>
            <h3>History Size</h3>
            <InputGroup>
              <Input
                label="New History Size"
                type="number"
                value={inputs.historySize}
                onChange={(e) => handleInputChange('historySize', e.target.value)}
                placeholder="100"
              />
            </InputGroup>
            <Button
              onClick={() => handleAction(setHistorySize, inputs.historySize)}
              disabled={isLoading}
            >
              Update History Size
            </Button>
          </ActionCard>
        </ActionGrid>
      </AdminSection>

      {/* VRF Configuration Section */}
      <AdminSection>
        <h2>VRF Configuration</h2>
        <ActionGrid>
          <ActionCard>
            <h3>Callback Gas Limit</h3>
            <InputGroup>
              <Input
                label="Gas Limit"
                type="number"
                value={inputs.callbackGasLimit}
                onChange={(e) => handleInputChange('callbackGasLimit', e.target.value)}
                placeholder="200000"
              />
            </InputGroup>
            <Button
              onClick={() => handleAction(setCallbackGasLimit, inputs.callbackGasLimit)}
              disabled={isLoading}
            >
              Update Gas Limit
            </Button>
          </ActionCard>

          <ActionCard>
            <h3>VRF Coordinator</h3>
            <InputGroup>
              <Input
                label="Coordinator Address"
                value={inputs.coordinatorAddress}
                onChange={(e) => handleInputChange('coordinatorAddress', e.target.value)}
                placeholder="0x..."
              />
            </InputGroup>
            <Button
              onClick={() => handleAction(setCoordinator, inputs.coordinatorAddress)}
              disabled={isLoading}
            >
              Update Coordinator
            </Button>
          </ActionCard>
        </ActionGrid>
      </AdminSection>

      {/* Emergency Controls Section */}
      <AdminSection>
        <h2>Emergency Controls</h2>
        <ActionGrid>
          <ActionCard>
            <h3>Game State</h3>
            <Button
              onClick={() => handleAction(pauseGame)}
              disabled={isLoading}
              style={{ marginRight: '1rem' }}
              $variant="warning"
            >
              Pause Game
            </Button>
            <Button
              onClick={() => handleAction(unpauseGame)}
              disabled={isLoading}
              $variant="success"
            >
              Unpause Game
            </Button>
          </ActionCard>

          <ActionCard>
            <h3>Withdraw Funds</h3>
            <InputGroup>
              <Input
                label="Amount"
                type="number"
                value={inputs.withdrawAmount}
                onChange={(e) => handleInputChange('withdrawAmount', e.target.value)}
                placeholder="100"
              />
            </InputGroup>
            <Button
              onClick={() => handleAction(withdrawFunds, inputs.withdrawAmount)}
              disabled={isLoading}
              $variant="danger"
            >
              Withdraw Funds
            </Button>
          </ActionCard>
        </ActionGrid>
      </AdminSection>
    </AdminContainer>
  );
} 