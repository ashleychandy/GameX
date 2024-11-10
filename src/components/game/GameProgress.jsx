import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

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

export function GameProgress({ gameState, isActive, requestDetails }) {
  const steps = [
    { label: 'Place Bet', completed: isActive },
    { label: 'Waiting for Random Number', completed: requestDetails?.requestFulfilled },
    { label: 'Ready to Resolve', completed: gameState === 'READY_TO_RESOLVE' }
  ];

  return (
    <ProgressContainer>
      {steps.map((step, index) => (
        <ProgressStep
          key={index}
          $active={step.completed}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <StepNumber $active={step.completed}>{index + 1}</StepNumber>
          <StepLabel>{step.label}</StepLabel>
        </ProgressStep>
      ))}
      
      {requestDetails?.requestId > 0 && (
        <RequestInfo>
          Request ID: {requestDetails.requestId}
          {requestDetails.requestActive && ' (Active)'}
          {requestDetails.requestFulfilled && ' (Fulfilled)'}
        </RequestInfo>
      )}
    </ProgressContainer>
  );
} 