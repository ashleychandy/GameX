import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useGame } from '@/hooks/useGame';
import { useWallet } from '@/contexts/WalletContext';
import { Button } from '@/components/common/Button';
import { formatAmount } from '@/utils/helpers';
import { ethers } from 'ethers';
import { TOKEN_ABI } from '@/abi';
import { config } from '@/config';
import { toast } from 'react-toastify';

const Container = styled(motion.div)`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Card = styled.div`
  background: ${({ theme }) => theme.surface};
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
`;

const Title = styled.h2`
  color: ${({ theme }) => theme.text.primary};
  margin-bottom: 1.5rem;
`;

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const Stat = styled.div`
  background: ${({ theme }) => theme.surface2};
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;

  h3 {
    color: ${({ theme }) => theme.text.secondary};
    margin-bottom: 0.5rem;
  }

  p {
    color: ${({ theme }) => theme.text.primary};
    font-size: 1.5rem;
    font-weight: bold;
  }
`;

const RoleManagement = styled(Card)`
  margin-top: 2rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  background: ${({ theme }) => theme.surface2};
  color: ${({ theme }) => theme.text.primary};
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const RoleSection = styled(Card)`
  margin-top: 2rem;
`;

const AddressDisplay = styled.div`
  background: ${({ theme }) => theme.surface2};
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  word-break: break-all;
  font-family: monospace;
`;

export function AdminPage() {
  const { gameStats, isLoading } = useGame();
  const { provider, address } = useWallet();
  const [targetAddress, setTargetAddress] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasRoles, setHasRoles] = useState({
    minter: false,
    burner: false
  });

  const checkDiceGameRoles = async () => {
    try {
      const signer = await provider.getSigner();
      const tokenContract = new ethers.Contract(
        config.contracts.token,
        TOKEN_ABI,
        signer
      );

      const [minterRole, burnerRole] = await Promise.all([
        tokenContract.MINTER_ROLE(),
        tokenContract.BURNER_ROLE()
      ]);

      const [hasMinter, hasBurner] = await Promise.all([
        tokenContract.hasRole(minterRole, config.contracts.diceGame),
        tokenContract.hasRole(burnerRole, config.contracts.diceGame)
      ]);

      setHasRoles({
        minter: hasMinter,
        burner: hasBurner
      });
    } catch (error) {
      console.error('Error checking roles:', error);
    }
  };

  useEffect(() => {
    if (provider) {
      checkDiceGameRoles();
    }
  }, [provider]);

  const handleGrantRole = async (role) => {
    const targetAddr = targetAddress || config.contracts.diceGame;
    
    if (!ethers.isAddress(targetAddr)) {
      toast.error('Invalid address');
      return;
    }

    try {
      setIsProcessing(true);
      const signer = await provider.getSigner();
      const tokenContract = new ethers.Contract(
        config.contracts.token,
        TOKEN_ABI,
        signer
      );

      const roleHash = await tokenContract[role]();
      console.log(`Granting ${role} to ${targetAddr}`);
      
      const tx = await tokenContract.grantRole(roleHash, targetAddr);
      await tx.wait();

      toast.success(`${role === 'MINTER_ROLE' ? 'Minter' : 'Burner'} role granted successfully`);
      setTargetAddress('');
      await checkDiceGameRoles();
    } catch (error) {
      console.error('Error granting role:', error);
      toast.error(error.message || 'Failed to grant role');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Container
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
    >
      <Title>Game Statistics</Title>
      
      <Card>
        <StatGrid>
          <Stat>
            <h3>Total Games</h3>
            <p>{gameStats?.totalGames || 0}</p>
          </Stat>
          <Stat>
            <h3>Total Volume</h3>
            <p>{formatAmount(gameStats?.totalVolume || 0)} DICE</p>
          </Stat>
          <Stat>
            <h3>Win Rate</h3>
            <p>{gameStats?.winRate ? (gameStats.winRate / 100).toFixed(2) : 0}%</p>
          </Stat>
          <Stat>
            <h3>Total Winnings</h3>
            <p>{formatAmount(gameStats?.totalWinnings || 0)} DICE</p>
          </Stat>
        </StatGrid>
      </Card>

      <RoleSection>
        <Title>Dice Game Contract Roles</Title>
        <AddressDisplay>
          Contract Address: {config.contracts.diceGame}
        </AddressDisplay>
        <ButtonGroup>
          <Button
            variant="primary"
            onClick={() => handleGrantRole('MINTER_ROLE')}
            disabled={isProcessing || hasRoles.minter}
          >
            {hasRoles.minter ? 'Has Minter Role' : 'Grant Minter Role'}
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleGrantRole('BURNER_ROLE')}
            disabled={isProcessing || hasRoles.burner}
          >
            {hasRoles.burner ? 'Has Burner Role' : 'Grant Burner Role'}
          </Button>
        </ButtonGroup>
      </RoleSection>

      <RoleSection>
        <Title>Custom Address Role Management</Title>
        <InputGroup>
          <Input
            type="text"
            placeholder="Enter address to grant role"
            value={targetAddress}
            onChange={(e) => setTargetAddress(e.target.value)}
            disabled={isProcessing}
          />
        </InputGroup>
        <ButtonGroup>
          <Button
            variant="primary"
            onClick={() => handleGrantRole('MINTER_ROLE')}
            disabled={isProcessing || !targetAddress}
          >
            {isProcessing ? 'Granting...' : 'Grant Minter Role'}
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleGrantRole('BURNER_ROLE')}
            disabled={isProcessing || !targetAddress}
          >
            {isProcessing ? 'Granting...' : 'Grant Burner Role'}
          </Button>
        </ButtonGroup>
      </RoleSection>
    </Container>
  );
} 