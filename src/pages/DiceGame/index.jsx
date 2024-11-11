import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useWallet } from '../../contexts/WalletContext';
import { useGame } from '../../hooks/useGame';
import { useContractState } from '../../hooks/useContractState';
import { WalletPrompt } from '../../components/common/WalletPrompt';
import { GameCard } from '../../components/game/GameCard';
import { DiceSelector } from '../../components/game/DiceSelector';
import { BetInput } from '../../components/game/BetInput';
import { GameStatus } from '../../components/game/GameStatus';
import { GameHistory } from '../../components/game/GameHistory';
import { UserStats } from '../../components/game/UserStats';
import { Loading } from '../../components/common/Loading';
import { ErrorHandler } from '../../components/common/ErrorHandler';

const PageContainer = styled(motion.div)`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const GameContainer = styled(GameCard)`
  margin-bottom: 2rem;
`;

const GameGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const DiceGamePage = () => {
  const { isConnected, address } = useWallet();
  const { 
    gameData, 
    previousBets, 
    pendingRequest,
    userData,
    requestDetails,
    canStart,
    isLoading, 
    error, 
    refreshGameState 
  } = useGame();
  const { state: contractState } = useContractState();

  if (!isConnected) {
    return <WalletPrompt />;
  }

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <ErrorHandler error={error} />;
  }

  const canPlay = !gameData?.isActive && !contractState.paused && canStart && !pendingRequest;

  return (
    <PageContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <GameGrid>
        <GameContainer>
          <GameStatus 
            gameData={gameData}
            contractState={contractState}
            requestDetails={requestDetails}
            pendingRequest={pendingRequest}
          />
          <DiceSelector 
            selectedNumber={gameData?.chosenNumber}
            disabled={!canPlay}
          />
          <BetInput
            disabled={!canPlay}
            maxBet={contractState.maxBet}
          />
          {userData && (
            <UserStats 
              userData={userData}
              playerStats={contractState.playerStats}
            />
          )}
        </GameContainer>
        
        <GameHistory 
          previousBets={previousBets}
          onRefresh={refreshGameState}
          isLoading={isLoading}
          historySize={contractState.defaultHistorySize}
        />
      </GameGrid>
    </PageContainer>
  );
};

export default DiceGamePage; 