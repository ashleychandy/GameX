import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import NumberSelector from './NumberSelector';
import GameStatus from './GameStatus';
import Button from '../common/Button';
import { useGame } from '../../contexts/GameContext';
import { useWallet } from '../../contexts/WalletContext';

const DiceGame = () => {
  const { selectedNumber, betAmount, isPlaying, placeBet } = useGame();
  const { account } = useWallet();

  return (
    <GameContainer>
      <GameTitle
        as={motion.h1}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Dice Game
      </GameTitle>
      
      <GameContent>
        <NumberSelector />
        <GameStatus />
        
        <BetButton
          disabled={!account || !selectedNumber || isPlaying}
          onClick={placeBet}
          loading={isPlaying}
        >
          {isPlaying ? 'Rolling...' : 'Place Bet'}
        </BetButton>
      </GameContent>
    </GameContainer>
  );
};

const GameContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const GameTitle = styled.h1`
  text-align: center;
  margin-bottom: 2rem;
  color: ${({ theme }) => theme.colors.primary};
`;

const GameContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  align-items: center;
`;

const BetButton = styled(Button)`
  width: 200px;
`;

export default DiceGame; 