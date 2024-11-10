import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { DiceGame } from '../../components/game/DiceGame';
import { useWallet } from '../../contexts/WalletContext';
import { WalletPrompt } from '../../components/common/WalletPrompt';
import { GameStats } from '../../components/game/GameStats';
import { GameHistory } from '../../components/game/GameHistory';
import { GameTrends } from '../../components/game/GameTrends';
import { useGame } from '../../hooks/useGame';
import { Loading } from '../../components/common/Loading';

const PageContainer = styled(motion.div)`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  display: grid;
  grid-template-columns: 1fr minmax(auto, 300px);
  gap: 2rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    padding: 1rem;
  }
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const Sidebar = styled.aside`
  display: flex;
  flex-direction: column;
  gap: 2rem;

  @media (max-width: 1024px) {
    order: 1;
  }
`;

const GameCard = styled(motion.div)`
  background: ${({ theme }) => theme.surface};
  border-radius: 24px;
  padding: 2rem;
  box-shadow: ${({ theme }) => theme.shadow.md};
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 1rem;
  background: ${({ theme }) => theme.gradients.primary};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24
    }
  }
};

const DiceGamePage = () => {
  const { isConnected, address } = useWallet();
  const { gameData, isLoading, error } = useGame();
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    // Reset UI state when wallet changes
    if (!isConnected) {
      setShowHistory(false);
    }
  }, [isConnected]);

  if (!isConnected) {
    return (
      <PageContainer
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <WalletPrompt />
      </PageContainer>
    );
  }

  if (isLoading) {
    return (
      <PageContainer>
        <Loading message="Loading game data..." />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <GameCard>
          <Title>Error Loading Game</Title>
          <p>{error}</p>
        </GameCard>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <MainContent>
        <GameCard variants={itemVariants}>
          <Title>Dice Game</Title>
          <DiceGame />
        </GameCard>

        {showHistory && (
          <GameCard variants={itemVariants}>
            <GameHistory 
              history={gameData?.previousGames || []}
              onClose={() => setShowHistory(false)}
            />
          </GameCard>
        )}
      </MainContent>

      <Sidebar>
        <GameCard variants={itemVariants}>
          <GameStats 
            stats={gameData?.stats}
            currentGame={gameData?.currentGame}
          />
        </GameCard>

        <GameCard variants={itemVariants}>
          <GameTrends 
            previousBets={gameData?.previousGames || []}
          />
        </GameCard>

        {!showHistory && (
          <GameCard 
            variants={itemVariants}
            onClick={() => setShowHistory(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{ cursor: 'pointer' }}
          >
            <Title>View Game History</Title>
            <p>Click to see your previous games</p>
          </GameCard>
        )}
      </Sidebar>
    </PageContainer>
  );
};

export default DiceGamePage;