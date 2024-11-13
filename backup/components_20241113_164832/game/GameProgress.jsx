import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { GAME_STATES } from '../../utils/constants';
import { Loading } from '../common/Loading';

const ProgressContainer = styled(motion.div)`
  padding: 2rem;
  text-align: center;
  color: ${({ theme }) => theme.text.primary};
`;

const StatusText = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.text.primary};
`;

const ProgressBar = styled(motion.div)`
  width: 100%;
  height: 4px;
  background: ${({ theme }) => theme.background};
  border-radius: 2px;
  overflow: hidden;
  margin: 1rem 0;
`;

const ProgressFill = styled(motion.div)`
  height: 100%;
  background: ${({ theme }) => theme.primary};
  width: ${({ $progress }) => `${$progress}%`};
`;

const RequestInfo = styled.div`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.text.secondary};
  margin-top: 1rem;
`;

const getStatusMessage = (status) => {
  switch (status) {
    case GAME_STATES.WAITING_FOR_APPROVAL:
      return 'Waiting for approval...';
    case GAME_STATES.PLACING_BET:
      return 'Placing your bet...';
    case GAME_STATES.WAITING_FOR_RESULT:
      return 'Waiting for random number...';
    case GAME_STATES.RESOLVING:
      return 'Resolving game...';
    default:
      return 'Processing...';
  }
};

export function GameProgress({ gameState, requestDetails }) {
  const progress = React.useMemo(() => {
    switch (gameState) {
      case GAME_STATES.WAITING_FOR_APPROVAL:
        return 25;
      case GAME_STATES.PLACING_BET:
        return 50;
      case GAME_STATES.WAITING_FOR_RESULT:
        return 75;
      case GAME_STATES.RESOLVING:
        return 90;
      default:
        return 0;
    }
  }, [gameState]);

  if (!gameState) return null;

  return (
    <ProgressContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <StatusText>{getStatusMessage(gameState)}</StatusText>
      
      <ProgressBar>
        <ProgressFill 
          $progress={progress}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </ProgressBar>

      <Loading size="small" message={getStatusMessage(gameState)} />

      {requestDetails && (
        <RequestInfo>
          Request ID: {requestDetails.requestId}
          <br />
          Block Number: {requestDetails.blockNumber}
        </RequestInfo>
      )}
    </ProgressContainer>
  );
} 