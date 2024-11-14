import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <HomeContainer>
      <HeroSection
        as={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Title>Welcome to Dice Game</Title>
        <Subtitle>Test your luck and win big with our blockchain-based dice game!</Subtitle>
        <CTAButton onClick={() => navigate('/game')}>
          Play Now
        </CTAButton>
      </HeroSection>

      <FeaturesSection>
        <FeatureGrid>
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              as={motion.div}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <FeatureIcon>{feature.icon}</FeatureIcon>
              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureDescription>{feature.description}</FeatureDescription>
            </FeatureCard>
          ))}
        </FeatureGrid>
      </FeaturesSection>

      <HowToPlaySection>
        <SectionTitle>How to Play</SectionTitle>
        <StepsList>
          {steps.map((step, index) => (
            <StepItem
              key={index}
              as={motion.div}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <StepNumber>{index + 1}</StepNumber>
              <StepText>{step}</StepText>
            </StepItem>
          ))}
        </StepsList>
      </HowToPlaySection>
    </HomeContainer>
  );
};

const features = [
  {
    icon: '🎲',
    title: 'Provably Fair',
    description: 'All game results are verified on the blockchain'
  },
  {
    icon: '💰',
    title: 'Instant Payouts',
    description: 'Receive your winnings immediately after each game'
  },
  {
    icon: '🔒',
    title: 'Secure',
    description: 'Built on Ethereum smart contracts for maximum security'
  },
  {
    icon: '🎮',
    title: 'Easy to Play',
    description: 'Simple and intuitive gameplay for everyone'
  }
];

const steps = [
  'Connect your wallet to get started',
  'Select a number between 1 and 6',
  'Place your bet in ETH',
  'Click "Roll Dice" and test your luck!',
  'Win up to 5x your bet amount!'
];

const HomeContainer = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
`;

const HeroSection = styled.section`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const Title = styled.h1`
  font-size: 3rem;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.textAlt};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const CTAButton = styled(Button)`
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.xl}`};
  font-size: 1.2rem;
`;

const FeaturesSection = styled.section`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
`;

const FeatureCard = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: 8px;
  text-align: center;
  box-shadow: ${({ theme }) => theme.shadows.medium};
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-5px);
  }
`;

const FeatureIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const FeatureTitle = styled.h3`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const FeatureDescription = styled.p`
  color: ${({ theme }) => theme.colors.textAlt};
`;

const HowToPlaySection = styled.section`
  margin-top: ${({ theme }) => theme.spacing.xl};
`;

const SectionTitle = styled.h2`
  text-align: center;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const StepsList = styled.div`
  max-width: 600px;
  margin: 0 auto;
`;

const StepItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: 8px;
  box-shadow: ${({ theme }) => theme.shadows.small};
`;

const StepNumber = styled.span`
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  border-radius: 50%;
  margin-right: ${({ theme }) => theme.spacing.md};
`;

const StepText = styled.p`
  color: ${({ theme }) => theme.colors.text};
`;

export default HomePage; 