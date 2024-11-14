import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { MIN_BET, MAX_BET } from '../../utils/constants';

const GameRules = () => {
  return (
    <RulesContainer
      as={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <RulesTitle>How to Play</RulesTitle>
      
      <RulesList>
        <RuleItem>
          <RuleNumber>1</RuleNumber>
          <RuleContent>
            <RuleHeading>Select a Number</RuleHeading>
            <RuleDescription>Choose any number between 1 and 6</RuleDescription>
          </RuleContent>
        </RuleItem>

        <RuleItem>
          <RuleNumber>2</RuleNumber>
          <RuleContent>
            <RuleHeading>Place Your Bet</RuleHeading>
            <RuleDescription>
              Bet between {MIN_BET} and {MAX_BET} ETH
            </RuleDescription>
          </RuleContent>
        </RuleItem>

        <RuleItem>
          <RuleNumber>3</RuleNumber>
          <RuleContent>
            <RuleHeading>Roll the Dice</RuleHeading>
            <RuleDescription>
              If your number matches the roll, you win 5x your bet!
            </RuleDescription>
          </RuleContent>
        </RuleItem>
      </RulesList>

      <OddsSection>
        <OddsTitle>Winning Odds</OddsTitle>
        <OddsList>
          <OddsItem>
            <OddsLabel>Chance to Win:</OddsLabel>
            <OddsValue>16.67%</OddsValue>
          </OddsItem>
          <OddsItem>
            <OddsLabel>Payout Multiplier:</OddsLabel>
            <OddsValue>5x</OddsValue>
          </OddsItem>
        </OddsList>
      </OddsSection>
    </RulesContainer>
  );
};

const RulesContainer = styled.div`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: 8px;
  padding: ${({ theme }) => theme.spacing.xl};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  box-shadow: ${({ theme }) => theme.shadows.medium};
`;

const RulesTitle = styled.h2`
  color: ${({ theme }) => theme.colors.primary};
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const RulesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const RuleItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.md};
`;

const RuleNumber = styled.div`
  width: 30px;
  height: 30px;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
`;

const RuleContent = styled.div`
  flex: 1;
`;

const RuleHeading = styled.h3`
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const RuleDescription = styled.p`
  color: ${({ theme }) => theme.colors.textAlt};
  font-size: 0.9rem;
`;

const OddsSection = styled.div`
  margin-top: ${({ theme }) => theme.spacing.xl};
  padding-top: ${({ theme }) => theme.spacing.lg};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const OddsTitle = styled.h3`
  color: ${({ theme }) => theme.colors.primary};
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const OddsList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
`;

const OddsItem = styled.div`
  background: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: 4px;
  text-align: center;
`;

const OddsLabel = styled.div`
  color: ${({ theme }) => theme.colors.textAlt};
  font-size: 0.9rem;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const OddsValue = styled.div`
  color: ${({ theme }) => theme.colors.primary};
  font-weight: bold;
  font-size: 1.2rem;
`;

export default GameRules; 