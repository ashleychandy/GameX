import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { GAME_STATES } from '../../utils/constants';

const ProgressContainer = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background: ${({ theme }) => theme.background.secondary};
  border-radius: 12px;
`;

const ProgressStep = styled(motion.div)`
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  color: ${({ $active, theme }) => 
    $active ? theme.text.primary : theme.text.secondary};

  &:last-child {
    margin-bottom: 0;
  }
`;

const StepNumber = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${({ $active, theme }) => 
    $active ? theme.primary : theme.background.tertiary};
  color: ${({ theme }) => theme.text.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.5rem;
  font-size: 0.875rem;
`;

const StepLabel = styled.span`
  flex: 1;
`;

const RequestInfo = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.text.secondary};
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid ${({ theme }) => theme.border};
`;

const ProgressMessage = styled.div`
  font-size: 1rem;
  color: ${({ theme }) => theme.text.primary};
  margin-bottom: 0.5rem;
`;

export function GameProgress({ gameState, isActive, requestDetails }) {
  const getProgressMessage = () => {
    if (!isActive) return "Ready to play";
    
    switch (gameState) {
      case GAME_STATES.STARTED:
        return "Waiting for Chainlink VRF...";
      case GAME_STATES.WAITING_FOR_RESULT:
        return "Random number requested...";
      case GAME_STATES.READY_TO_RESOLVE:
        return "Ready to resolve game!";
      case GAME_STATES.WON:
        return "Congratulations! You won!";
      case GAME_STATES.LOST:
        return "Better luck next time!";
      default:
        return "Place your bet";
    }
  };

  return (
    <ProgressContainer>
      <ProgressMessage>{getProgressMessage()}</ProgressMessage>
      {requestDetails?.requestId > 0 && (
        <RequestInfo>
          Request ID: {requestDetails.requestId}
          {requestDetails.requestActive && " (Active)"}
          {requestDetails.requestFulfilled && " (Fulfilled)"}
        </RequestInfo>
      )}
    </ProgressContainer>
  );
} 