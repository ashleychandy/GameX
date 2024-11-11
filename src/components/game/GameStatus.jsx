import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { GAME_STATES } from '../../utils/constants';

const StatusContainer = styled(motion.div)`
  padding: 1rem;
  border-radius: 12px;
  background: ${({ theme, $status }) => {
    switch ($status) {
      case GAME_STATES.COMPLETED:
        return theme.success + '20';
      case GAME_STATES.FAILED:
        return theme.error + '20';
      case GAME_STATES.PENDING_VRF:
        return theme.warning + '20';
      default:
        return theme.background.secondary;
    }
  }};
  border: 1px solid ${({ theme, $status }) => {
    switch ($status) {
      case GAME_STATES.COMPLETED:
        return theme.success;
      case GAME_STATES.FAILED:
        return theme.error;
      case GAME_STATES.PENDING_VRF:
        return theme.warning;
      default:
        return theme.border;
    }
  }};
`;

const StatusText = styled.span`
  color: ${({ theme, $status }) => {
    switch ($status) {
      case GAME_STATES.COMPLETED:
        return theme.success;
      case GAME_STATES.FAILED:
        return theme.error;
      case GAME_STATES.PENDING_VRF:
        return theme.warning;
      default:
        return theme.text.primary;
    }
  }};
  font-weight: 500;
`;

const StatusMessage = styled.p`
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.text.secondary};
`;

const getStatusMessage = (status) => {
  switch (status) {
    case GAME_STATES.INACTIVE:
      return 'Ready to start a new game';
    case GAME_STATES.ACTIVE:
      return 'Game in progress';
    case GAME_STATES.PENDING_VRF:
      return 'Waiting for random number verification';
    case GAME_STATES.COMPLETED:
      return 'Game completed successfully';
    case GAME_STATES.FAILED:
      return 'Game failed to complete';
    default:
      return 'Unknown game state';
  }
};

export function GameStatus({ status, gameData }) {
  return (
    <StatusContainer
      $status={status}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <StatusText $status={status}>
        {status ? getStatusMessage(status) : 'Loading game status...'}
      </StatusText>
      <StatusMessage>
        {status === GAME_STATES.PENDING_VRF && 
          'Please wait while we verify the random number...'}
        {status === GAME_STATES.COMPLETED && gameData?.payout && 
          `You won ${gameData.payout} tokens!`}
      </StatusMessage>
    </StatusContainer>
  );
} 