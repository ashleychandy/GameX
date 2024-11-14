import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@/hooks/useWallet';
import { useGame } from '@/hooks/useGame';
import { formatAmount } from '@/utils/helpers';
import { GAME_STATES } from '@/utils/constants';
import { LoadingOverlay, WalletPrompt } from '@/components/common';
import { GameStatus, DiceSelector, BetInput } from '@/components/game';
import { toast } from 'react-toastify';
import diceSprite from '@/assets/images/dice-sprite.png';
import PropTypes from 'prop-types';

// Styled Components
const GameContainer = styled(motion.div)`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const GameControls = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 2rem;
  background: ${({ theme }) => theme.surface2};
  border-radius: 12px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const Button = styled(motion.button)`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: none;
  background: ${({ theme, $variant }) => 
    $variant === 'primary' ? theme.primary : theme.surface3};
  color: ${({ theme }) => theme.text.primary};
  font-weight: 600;
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  opacity: ${({ disabled }) => disabled ? 0.5 : 1};
`;

const HistoryContainer = styled.div`
  padding: 1.5rem;
  background: ${({ theme }) => theme.surface2};
  border-radius: 12px;
  margin-top: 2rem;
`;

const Title = styled.h3`
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.text.primary};
`;

const HistoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 300px;
  overflow-y: auto;
`;

const ResultItem = styled(motion.div)`
  padding: 1rem;
  background: ${({ theme }) => theme.surface3};
  border-radius: 8px;
  border-left: 4px solid ${({ theme, $won }) => 
    $won ? theme.success : theme.error};
  margin-bottom: 1rem;
`;

const ResultHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
`;

const ResultNumbers = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
`;

const NumberBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  
  span {
    color: ${({ theme }) => theme.text.secondary};
    font-size: 0.875rem;
  }
  
  strong {
    color: ${({ theme }) => theme.text.primary};
    font-size: 1.25rem;
  }
`;

const NoHistory = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.text.secondary};
  padding: 1rem;
`;

const DiceContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
`;

const DiceWrapper = styled(motion.div)`
  width: 100px;
  height: 100px;
  position: relative;
  perspective: 1000px;
`;

const DiceFace = styled(motion.div)`
  width: 100%;
  height: 100%;
  background-image: url(${diceSprite});
  background-size: 600px 100px;
  background-position: ${({ $face }) => `${($face - 1) * -100}px 0`};
  border-radius: 16px;
  box-shadow: ${({ theme }) => theme.shadow.md};
  transform-style: preserve-3d;
`;

const ResultText = styled(motion.p)`
  margin-top: 1rem;
  font-size: 1.2rem;
  font-weight: bold;
  color: ${({ $won, theme }) => 
    $won ? theme.success : theme.error};
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const diceVariants = {
  rolling: {
    rotate: [0, 360],
    scale: [1, 1.1, 1],
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear",
      scale: {
        duration: 0.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  },
  stopped: {
    rotate: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      type: "spring",
      stiffness: 200,
      damping: 20
    }
  }
};

const resultVariants = {
  initial: { 
    opacity: 0, 
    y: 20,
    scale: 0.9 
  },
  animate: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    scale: 0.9,
    transition: {
      duration: 0.2
    }
  }
};

const InputContainer = styled.div`
  margin: 2rem 0;
`;

const InputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 1rem 1.5rem;
  padding-right: 4rem;
  border: 2px solid ${({ theme }) => theme.border};
  border-radius: 12px;
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text.primary};
  font-size: 1.25rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
    box-shadow: 0 0 0 4px ${({ theme }) => theme.primary}20;
  }

  &::placeholder {
    color: ${({ theme }) => theme.text.secondary};
  }
`;

const TokenLabel = styled.span`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.text.secondary};
  font-weight: 500;
`;

const QuickAmounts = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const QuickAmount = styled(motion.button)`
  padding: 0.5rem 1rem;
  border-radius: 8px;
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text.primary};
  border: 1px solid ${({ theme }) => theme.border};
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.surface};
    border-color: ${({ theme }) => theme.primary};
  }
`;

// Component Functions

// DiceRoll Component
function DiceRoll({ rolling, result, won }) {
  return (
    <DiceContainer>
      <DiceWrapper
        variants={diceVariants}
        animate={rolling ? "rolling" : "stopped"}
      >
        <DiceFace $face={result || 1} />
      </DiceWrapper>

      <AnimatePresence mode="wait">
        {result && !rolling && (
          <ResultText
            $won={won}
            variants={resultVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {won ? 'You Won!' : 'Try Again!'}
          </ResultText>
        )}
      </AnimatePresence>
    </DiceContainer>
  );
}

// Game Status Component
function GameStatus({ gameData, requestInfo }) {
  const getStatusMessage = () => {
    if (!gameData) return { message: "Ready to play", type: "primary" };

    if (gameData.isActive) {
      return {
        message: `Active game: You chose ${gameData.chosenNumber}`,
        type: "primary"
      };
    }

    if (gameData.result) {
      const won = parseFloat(gameData.payout) > 0;
      return {
        message: won ? "You Won!" : "Better luck next time!",
        type: won ? "success" : "error"
      };
    }

    return { message: "Ready to play", type: "primary" };
  };

  const { message, type } = getStatusMessage();

  return (
    <StatusContainer>
      <StatusText $type={type}>
        {message}
      </StatusText>
      {gameData?.isActive && (
        <DetailText>
          Bet Amount: {formatAmount(gameData.amount)} DICE
        </DetailText>
      )}
      {requestInfo?.requestId && (
        <DetailText>Request ID: {requestInfo.requestId}</DetailText>
      )}
    </StatusContainer>
  );
}

// Game History Component
function GameHistory({ history, currentGame, isLoading }) {
  if (isLoading) {
    return (
      <HistoryContainer>
        <Title>Game History</Title>
        <NoHistory>Loading history...</NoHistory>
      </HistoryContainer>
    );
  }

  return (
    <HistoryContainer>
      <Title>Game History</Title>
      <HistoryList>
        {currentGame?.isActive && (
          <ResultItem $won={false}>
            <ResultHeader>
              <strong>Current Game</strong>
              <span>{formatDate(currentGame.timestamp)}</span>
            </ResultHeader>
            <ResultNumbers>
              <NumberBox>
                <span>Chosen</span>
                <strong>{currentGame.chosenNumber}</strong>
              </NumberBox>
              <NumberBox>
                <span>Amount</span>
                <strong>{formatAmount(currentGame.amount)} DICE</strong>
              </NumberBox>
            </ResultNumbers>
          </ResultItem>
        )}

        {history?.length > 0 ? (
          history.map((game, index) => (
            <ResultItem
              key={`${game.timestamp}-${index}`}
              $won={game.chosenNumber === game.rolledNumber}
            >
              <ResultHeader>
                <strong>
                  {game.chosenNumber === game.rolledNumber ? 'Won' : 'Lost'}
                </strong>
                <span>{formatDate(game.timestamp)}</span>
              </ResultHeader>
              <ResultNumbers>
                <NumberBox>
                  <span>Chosen</span>
                  <strong>{game.chosenNumber}</strong>
                </NumberBox>
                <NumberBox>
                  <span>Rolled</span>
                  <strong>{game.rolledNumber}</strong>
                </NumberBox>
                <NumberBox>
                  <span>Amount</span>
                  <strong>{formatAmount(game.amount)} DICE</strong>
                </NumberBox>
              </ResultNumbers>
            </ResultItem>
          ))
        ) : (
          <NoHistory>No games played yet</NoHistory>
        )}
      </HistoryList>
    </HistoryContainer>
  );
}

// DiceSelector Component
function DiceSelector({ selectedNumber, onSelect, disabled }) {
  return (
    <SelectorContainer>
      {[1, 2, 3, 4, 5, 6].map((number) => (
        <DiceButton
          key={number}
          $selected={selectedNumber === number}
          disabled={disabled}
          onClick={() => onSelect(number)}
          whileTap={{ scale: 0.95 }}
        >
          {number}
        </DiceButton>
      ))}
    </SelectorContainer>
  );
}

// BetInput Component
function BetInput({ value, onChange, disabled }) {
  const quickAmounts = [10, 50, 100, 500];

  const handleChange = (e) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      onChange(value);
    }
  };

  return (
    <InputContainer>
      <InputWrapper>
        <StyledInput
          type="text"
          value={value}
          onChange={handleChange}
          placeholder="0.00"
          disabled={disabled}
        />
        <TokenLabel>DICE</TokenLabel>
      </InputWrapper>
      <QuickAmounts>
        {quickAmounts.map(amount => (
          <QuickAmount
            key={amount}
            onClick={() => onChange(amount.toString())}
            disabled={disabled}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {amount}
          </QuickAmount>
        ))}
      </QuickAmounts>
    </InputContainer>
  );
}

// Main Game Component
export function DiceGame() {
  const { isConnected } = useWallet();
  const {
    gameData,
    userStats,
    history,
    isLoading,
    error,
    placeBet,
    updateGameState
  } = useGame();

  const [selectedNumber, setSelectedNumber] = useState(1);
  const [betAmount, setBetAmount] = useState('');

  if (!isConnected) {
    return <WalletPrompt />;
  }

  // ... rest of the component logic using the consolidated hook ...
}

// Add PropTypes
DiceRoll.propTypes = {
  rolling: PropTypes.bool.isRequired,
  result: PropTypes.number,
  won: PropTypes.bool
};

GameStatus.propTypes = {
  gameData: PropTypes.object,
  requestInfo: PropTypes.object
}; 