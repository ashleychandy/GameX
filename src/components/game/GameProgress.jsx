import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

const ProgressContainer = styled.div`
  padding: 1rem;
  border-radius: 12px;
  background: ${({ theme }) => theme.surface};
  border: 1px solid ${({ theme }) => theme.border};
`;

const ProgressStep = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
  color: ${({ $active, theme }) => $active ? theme.text.primary : theme.text.secondary};

  &:last-child {
    margin-bottom: 0;
  }
`;

const StepIndicator = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $active, theme }) => $active ? theme.primary : theme.surface};
  border: 2px solid ${({ $active, theme }) => $active ? theme.primary : theme.border};
  color: ${({ $active, theme }) => $active ? theme.text.inverse : theme.text.secondary};
`;

export function GameProgress({ gameState }) {
  const steps = [
    { id: 'PENDING', label: 'Place Your Bet' },
    { id: 'WAITING_FOR_RANDOM', label: 'Waiting for Random Number' },
    { id: 'READY_TO_RESOLVE', label: 'Ready to Resolve' },
    { id: 'COMPLETED', label: 'Game Completed' }
  ];

  const currentStepIndex = steps.findIndex(step => step.id === gameState);

  return (
    <ProgressContainer>
      {steps.map((step, index) => (
        <ProgressStep 
          key={step.id}
          $active={index <= currentStepIndex}
        >
          <StepIndicator $active={index <= currentStepIndex}>
            {index + 1}
          </StepIndicator>
          {step.label}
        </ProgressStep>
      ))}
    </ProgressContainer>
  );
}

GameProgress.propTypes = {
  gameState: PropTypes.oneOf(['PENDING', 'WAITING_FOR_RANDOM', 'READY_TO_RESOLVE', 'COMPLETED']).isRequired
};

export default GameProgress; 