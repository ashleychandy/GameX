import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { formatEther } from 'ethers';
import { GAME_STATES } from '../../utils/constants';

const StatusContainer = styled.div`
  padding: 1.5rem;
  background: ${({ theme }) => theme.surface2};
  border-radius: 12px;
  text-align: center;
`;

const StatusText = styled(motion.p)`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ theme, $type }) => {
    switch ($type) {
      case 'success': return theme.success;
      case 'warning': return theme.warning;
      case 'error': return theme.error;
      default: return theme.text.primary;
    }
  }};
`;

const DetailText = styled.p`
  margin-top: 0.5rem;
  color: ${({ theme }) => theme.text.secondary};
`;

export function GameStatus({ gameData, contractState, requestDetails, pendingRequest }) {
  const getStatusMessage = () => {
    if (contractState.paused) {
      return {
        message: 'Game is currently paused',
        type: 'warning'
      };
    }

    if (pendingRequest) {
      return {
        message: 'Waiting for random number...',
        type: 'warning'
      };
    }

    if (gameData?.isActive) {
      return {
        message: `Active game: You chose ${gameData.chosenNumber}`,
        type: 'primary'
      };
    }

    if (gameData?.result) {
      const won = parseFloat(gameData.payout) > 0;
      return {
        message: won ? 'You Won!' : 'Better luck next time!',
        type: won ? 'success' : 'error'
      };
    }

    return {
      message: 'Ready to play',
      type: 'primary'
    };
  };

  const { message, type } = getStatusMessage();

  return (
    <StatusContainer>
      <StatusText
        $type={type}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {message}
      </StatusText>
      
      {gameData?.isActive && (
        <DetailText>
          Bet Amount: {formatEther(gameData.amount)} DICE
        </DetailText>
      )}
      
      {requestDetails?.requestId && (
        <DetailText>
          Request ID: {requestDetails.requestId}
        </DetailText>
      )}
    </StatusContainer>
  );
} 