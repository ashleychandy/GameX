import React from 'react';
import styled from 'styled-components';
import { useGame } from '../../contexts/GameContext';
import { ethers } from 'ethers';

const GameStatus = () => {
  const { betAmount, setBetAmount, gameHistory } = useGame();

  const handleBetChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setBetAmount(value);
    }
  };

  return (
    <Container>
      <BetSection>
        <Label>Bet Amount (ETH)</Label>
        <Input
          type="text"
          value={betAmount}
          onChange={handleBetChange}
          placeholder="Enter bet amount"
        />
      </BetSection>

      {gameHistory.length > 0 && (
        <HistorySection>
          <Label>Recent Games</Label>
          <History>
            {gameHistory.slice(-5).map((game, index) => (
              <HistoryItem key={index} won={game.won}>
                <span>Number: {game.number}</span>
                <span>Result: {game.result}</span>
                <span>
                  {game.won ? 'Won' : 'Lost'}: {ethers.formatEther(game.amount)} ETH
                </span>
              </HistoryItem>
            ))}
          </History>
        </HistorySection>
      )}
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
`;

const BetSection = styled.div`
  margin-bottom: 2rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.colors.text};
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem;
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  font-size: 1rem;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    outline: none;
  }
`;

const HistorySection = styled.div`
  margin-top: 2rem;
`;

const History = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const HistoryItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.5rem;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: 4px;
  color: ${({ won, theme }) => won ? theme.colors.success : theme.colors.error};
`;

export default GameStatus; 