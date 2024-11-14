import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@/hooks/useWallet';
import { useGame } from '@/hooks/useGame';
import { formatAmount } from '@/utils/helpers';
import { config } from '@/config';
import { Button } from '@/components/common/Button';
import { LoadingOverlay } from '@/components/common/LoadingOverlay';
import { WalletPrompt } from '@/components/common/WalletPrompt';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import diceSprite from '@/assets/dice-sprite.png';

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

const StyledButton = styled(motion.button)`
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  ${({ $variant, theme }) => {
    switch ($variant) {
      case 'primary':
        return `
          background: ${theme.gradients.primary};
          color: white;
          &:hover:not(:disabled) {
            opacity: 0.9;
            transform: translateY(-1px);
          }
        `;
      case 'secondary':
        return `
          background: ${theme.surface2};
          color: ${theme.text.primary};
          &:hover:not(:disabled) {
            background: ${theme.surface3};
          }
        `;
      case 'outline':
        return `
          background: transparent;
          border: 2px solid ${theme.border};
          color: ${theme.text.primary};
          &:hover:not(:disabled) {
            background: ${theme.surface2};
          }
        `;
      default:
        return `
          background: ${theme.surface};
          color: ${theme.text.primary};
          &:hover:not(:disabled) {
            background: ${theme.surface2};
          }
        `;
    }
  }}

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
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

const QuickAmount = styled.button`
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

const Spinner = styled(motion.div)`
  width: 50px;
  height: 50px;
  border: 4px solid ${({ theme }) => theme.surface};
  border-top-color: ${({ theme }) => theme.primary};
  border-radius: 50%;
`;

const NavBar = styled.nav`
  padding: 1rem 2rem;
  background: ${({ theme }) => theme.surface};
  border-bottom: 1px solid ${({ theme }) => theme.border};
  margin-bottom: 2rem;
`;

const NavContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StatusContainer = styled(motion.div)`
  padding: 1.5rem;
  background: ${({ theme }) => theme.surface2};
  border-radius: 12px;
  margin-bottom: 2rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const StatItem = styled.div`
  text-align: center;
  padding: 1rem;
  background: ${({ theme }) => theme.surface3};
  border-radius: 8px;

  h4 {
    color: ${({ theme }) => theme.text.secondary};
    font-size: 0.875rem;
    margin-bottom: 0.5rem;
  }

  p {
    color: ${({ theme }) => theme.text.primary};
    font-size: 1.25rem;
    font-weight: 600;
  }
`;

const Address = styled.p`
  color: ${({ theme }) => theme.text.secondary};
  font-size: 0.875rem;
  text-align: center;
  margin-bottom: 1rem;
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.error};
  padding: 1rem;
  border-radius: 8px;
  background: ${({ theme }) => theme.error}15;
  margin-top: 1rem;
  text-align: center;
`;

const SelectorContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
  gap: 0.5rem;
  margin: 1rem 0;
`;

const NumberButton = styled(motion.button)`
  padding: 1rem;
  border-radius: 8px;
  background: ${({ theme, $selected }) => 
    $selected ? theme.primary : theme.surface};
  color: ${({ theme, $selected }) => 
    $selected ? 'white' : theme.text.primary};
  border: 2px solid ${({ theme, $selected }) => 
    $selected ? theme.primary : theme.border};
  font-size: 1.25rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    border-color: ${({ theme }) => theme.primary};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

// Add NumberSelector component
function NumberSelector({ selectedNumber, onSelect, disabled, numbers }) {
  return (
    <SelectorContainer>
      {numbers.map(number => (
        <NumberButton
          key={number}
          $selected={selectedNumber === number}
          onClick={() => onSelect(number)}
          disabled={disabled}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {number}
        </NumberButton>
      ))}
    </SelectorContainer>
  );
}

NumberSelector.propTypes = {
  selectedNumber: PropTypes.number.isRequired,
  onSelect: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  numbers: PropTypes.arrayOf(PropTypes.number).isRequired
};

// Add BetInput component
function BetInput({ value, onChange, disabled, min, max }) {
  const quickAmounts = [min, max/4, max/2, max];

  return (
    <InputContainer>
      <InputWrapper>
        <StyledInput
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter bet amount"
          disabled={disabled}
          min={min}
          max={max}
          step="0.1"
        />
        <TokenLabel>DICE</TokenLabel>
      </InputWrapper>
      <QuickAmounts>
        {quickAmounts.map((amount) => (
          <QuickAmount
            key={amount}
            onClick={() => onChange(amount.toString())}
            disabled={disabled}
          >
            {amount} DICE
          </QuickAmount>
        ))}
      </QuickAmounts>
    </InputContainer>
  );
}

BetInput.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  min: PropTypes.string.isRequired,
  max: PropTypes.string.isRequired
};

// Add GameHistory component before the main DiceGame component
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
                <strong>{currentGame.number}</strong>
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
              $won={game.won}
            >
              <ResultHeader>
                <strong>
                  {game.won ? 'Won' : 'Lost'}
                </strong>
                <span>{formatDate(game.timestamp)}</span>
              </ResultHeader>
              <ResultNumbers>
                <NumberBox>
                  <span>Chosen</span>
                  <strong>{game.number}</strong>
                </NumberBox>
                <NumberBox>
                  <span>Amount</span>
                  <strong>{formatAmount(game.amount)} DICE</strong>
                </NumberBox>
                <NumberBox>
                  <span>Payout</span>
                  <strong>{formatAmount(game.payout)} DICE</strong>
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

GameHistory.propTypes = {
  history: PropTypes.arrayOf(PropTypes.shape({
    number: PropTypes.number,
    amount: PropTypes.string,
    timestamp: PropTypes.number,
    won: PropTypes.bool,
    payout: PropTypes.string
  })),
  currentGame: PropTypes.shape({
    number: PropTypes.number,
    amount: PropTypes.string,
    timestamp: PropTypes.number,
    isActive: PropTypes.bool
  }),
  isLoading: PropTypes.bool
};

// Main DiceGame Component
export function DiceGame() {
  const { isConnected, address } = useWallet();
  const {
    gameData,
    gameStats,
    isLoading,
    error,
    pendingTx,
    placeBet,
    refreshGameState
  } = useGame();

  const [selectedNumber, setSelectedNumber] = useState(1);
  const [betAmount, setBetAmount] = useState('');
  const [isRolling, setIsRolling] = useState(false);

  // Validate bet amount
  const validateBet = () => {
    const amount = parseFloat(betAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid bet amount');
      return false;
    }
    if (amount < parseFloat(config.game.minBet)) {
      toast.error(`Minimum bet is ${config.game.minBet} DICE`);
      return false;
    }
    if (amount > parseFloat(config.game.maxBet)) {
      toast.error(`Maximum bet is ${config.game.maxBet} DICE`);
      return false;
    }
    return true;
  };

  const handlePlaceBet = async () => {
    if (!validateBet()) return;

    try {
      setIsRolling(true);
      await placeBet(selectedNumber, betAmount);
      setBetAmount('');
      setSelectedNumber(1);
    } catch (err) {
      console.error('Bet error:', err);
      toast.error(err.message || 'Failed to place bet');
    } finally {
      setIsRolling(false);
    }
  };

  // Auto-refresh game state when transaction is pending
  useEffect(() => {
    let interval;
    if (pendingTx) {
      interval = setInterval(refreshGameState, 5000);
    }
    return () => clearInterval(interval);
  }, [pendingTx, refreshGameState]);

  return (
    <GameContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {!isConnected ? (
        <WalletPrompt />
      ) : (
        <>
          <GameControls>
            <NumberSelector
              selectedNumber={selectedNumber}
              onSelect={setSelectedNumber}
              disabled={isLoading || pendingTx}
              numbers={config.game.numbers}
            />
            <BetInput
              value={betAmount}
              onChange={setBetAmount}
              disabled={isLoading || pendingTx}
              min={config.game.minBet}
              max={config.game.maxBet}
            />
            <ButtonGroup>
              <Button
                variant="primary"
                disabled={!betAmount || isLoading || pendingTx}
                onClick={handlePlaceBet}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isRolling ? 'Rolling...' : pendingTx ? 'Waiting...' : 'Roll Dice'}
              </Button>
            </ButtonGroup>
          </GameControls>

          {error && (
            <ErrorMessage>
              {error}
            </ErrorMessage>
          )}

          <GameHistory 
            history={gameData?.history}
            currentGame={gameData?.currentGame}
            isLoading={isLoading}
          />

          {(isLoading || pendingTx) && (
            <LoadingOverlay 
              message={pendingTx ? 'Waiting for transaction...' : 'Loading...'}
            />
          )}

          <GameStatus gameData={gameData} stats={gameStats} address={address} />
        </>
      )}
    </GameContainer>
  );
}

function GameStatus({ gameData, stats, address }) {
  if (!gameData || !stats) return null;

  return (
    <StatusContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Address>
        Playing as: {address}
      </Address>
      <StatsGrid>
        <StatItem>
          <h4>Total Games</h4>
          <p>{stats.totalGames || 0}</p>
        </StatItem>
        <StatItem>
          <h4>Games Won</h4>
          <p>{stats.gamesWon || 0}</p>
        </StatItem>
        <StatItem>
          <h4>Win Rate</h4>
          <p>
            {stats.totalGames > 0
              ? ((stats.gamesWon / stats.totalGames) * 100).toFixed(1)
              : '0'}%
          </p>
        </StatItem>
        <StatItem>
          <h4>Total Winnings</h4>
          <p>{formatAmount(stats.totalWinnings || 0)} DICE</p>
        </StatItem>
      </StatsGrid>
    </StatusContainer>
  );
}

GameStatus.propTypes = {
  gameData: PropTypes.object,
  stats: PropTypes.object,
  address: PropTypes.string
}; 