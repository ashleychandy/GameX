import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useGame } from '@/hooks/useGame';
import { Button } from '@/components/common/Button';
import { formatAmount, isValidAddress } from '@/utils/helpers';
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

const RoleManagement = styled.div`
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid ${({ theme }) => theme.border};
`;

const InputGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const Input = styled.input`
  flex: 1;
  padding: 0.75rem 1rem;
  border: 2px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text.primary};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
  }
`;

const AdminList = styled.div`
  margin-top: 2rem;
`;

const AdminItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: ${({ theme }) => theme.surface2};
  border-radius: 8px;
  margin-bottom: 0.5rem;

  p {
    color: ${({ theme }) => theme.text.primary};
    font-family: monospace;
  }
`;

export function AdminPage() {
  const { 
    gameStats, 
    isLoading, 
    withdrawFees, 
    grantAdminRole, 
    revokeAdminRole,
    getAdminList,
    isAdmin 
  } = useGame();
  
  const [newAdminAddress, setNewAdminAddress] = useState('');
  const [adminList, setAdminList] = useState([]);

  const handleGrantRole = async () => {
    if (!isValidAddress(newAdminAddress)) {
      toast.error('Please enter a valid address');
      return;
    }

    try {
      await grantAdminRole(newAdminAddress);
      toast.success('Admin role granted successfully');
      setNewAdminAddress('');
      refreshAdminList();
    } catch (error) {
      toast.error(error.message || 'Failed to grant admin role');
    }
  };

  const handleRevokeRole = async (address) => {
    try {
      await revokeAdminRole(address);
      toast.success('Admin role revoked successfully');
      refreshAdminList();
    } catch (error) {
      toast.error(error.message || 'Failed to revoke admin role');
    }
  };

  const refreshAdminList = async () => {
    try {
      const admins = await getAdminList();
      setAdminList(admins);
    } catch (error) {
      console.error('Failed to fetch admin list:', error);
    }
  };

  React.useEffect(() => {
    refreshAdminList();
  }, []);

  if (!isAdmin) {
    return (
      <Container>
        <Title>Access Denied</Title>
        <p>You don't have permission to access this page.</p>
      </Container>
    );
  }

  return (
    <Container
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
    >
      <Title>Admin Dashboard</Title>
      
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
            <h3>House Edge</h3>
            <p>{gameStats?.houseEdge || 0}%</p>
          </Stat>
          <Stat>
            <h3>Collected Fees</h3>
            <p>{formatAmount(gameStats?.collectedFees || 0)} DICE</p>
          </Stat>
        </StatGrid>

        <Button
          variant="primary"
          onClick={withdrawFees}
          disabled={isLoading}
        >
          Withdraw Fees
        </Button>

        <RoleManagement>
          <Title>Role Management</Title>
          <InputGroup>
            <Input
              type="text"
              placeholder="Enter address to grant admin role"
              value={newAdminAddress}
              onChange={(e) => setNewAdminAddress(e.target.value)}
            />
            <Button
              variant="primary"
              onClick={handleGrantRole}
              disabled={isLoading || !newAdminAddress}
            >
              Grant Admin Role
            </Button>
          </InputGroup>

          <AdminList>
            <h3>Current Admins</h3>
            {adminList.map((admin) => (
              <AdminItem key={admin}>
                <p>{admin}</p>
                <Button
                  variant="error"
                  onClick={() => handleRevokeRole(admin)}
                  disabled={isLoading}
                >
                  Revoke Role
                </Button>
              </AdminItem>
            ))}
          </AdminList>
        </RoleManagement>
      </Card>
    </Container>
  );
} 