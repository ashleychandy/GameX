import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useWallet } from '../../contexts/WalletContext';
import { useContract } from '../../hooks/useContract';
import GameStats from '../../components/game/GameStats';
import GameHistory from '../../components/game/GameHistory';
import Loading from '../../components/common/Loading';
import { notify } from '../../services/notifications';
import { shortenAddress } from '../../utils/helpers';

const ProfilePage = () => {
  const { account } = useWallet();
  const contract = useContract();
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!account || !contract) return;

      try {
        setLoading(true);
        const [playerStats, gameHistory] = await Promise.all([
          contract.getPlayerStats(account),
          contract.getPlayerHistory(account, 10)
        ]);

        setStats(playerStats);
        setHistory(gameHistory);
      } catch (error) {
        notify.error('Failed to load profile data');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [account, contract]);

  if (!account) {
    return (
      <Container>
        <Message>Please connect your wallet to view your profile</Message>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container>
        <Loading />
      </Container>
    );
  }

  return (
    <Container
      as={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <ProfileHeader>
        <ProfileTitle>Player Profile</ProfileTitle>
        <Address>{shortenAddress(account)}</Address>
      </ProfileHeader>

      <ContentGrid>
        <StatsSection>
          <GameStats stats={stats} />
        </StatsSection>

        <HistorySection>
          <GameHistory history={history} />
        </HistorySection>
      </ContentGrid>
    </Container>
  );
};

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.xl};
`;

const ProfileHeader = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const ProfileTitle = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const Address = styled.div`
  display: inline-block;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: 20px;
  color: ${({ theme }) => theme.colors.textAlt};
  font-family: monospace;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${({ theme }) => theme.spacing.xl};
  
  @media (min-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-template-columns: 1fr 2fr;
  }
`;

const StatsSection = styled.section`
  order: 2;
  
  @media (min-width: ${({ theme }) => theme.breakpoints.tablet}) {
    order: 1;
  }
`;

const HistorySection = styled.section`
  order: 1;
  
  @media (min-width: ${({ theme }) => theme.breakpoints.tablet}) {
    order: 2;
  }
`;

const Message = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xl};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.textAlt};
`;

export default ProfilePage; 