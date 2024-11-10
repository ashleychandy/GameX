import React from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "../common/Button";

const HomeContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 4rem 2rem;
  text-align: center;
`;

const Hero = styled(motion.div)`
  margin-bottom: 4rem;
`;

const Title = styled(motion.h1)`
  font-size: 3rem;
  margin-bottom: 1rem;
  background: ${({ theme }) => theme.gradients.primary};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Subtitle = styled(motion.p)`
  font-size: 1.25rem;
  color: ${({ theme }) => theme.text.secondary};
  margin-bottom: 2rem;
`;

const Features = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 4rem;
`;

const Feature = styled(motion.div)`
  padding: 2rem;
  background: ${({ theme }) => theme.surface};
  border-radius: 16px;
  box-shadow: ${({ theme }) => theme.shadow.md};

  h2 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: ${({ theme }) => theme.text.primary};
  }

  p {
    color: ${({ theme }) => theme.text.secondary};
    line-height: 1.6;
  }
`;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export function HomePage() {
  return (
    <HomeContainer>
      <Hero
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Title variants={itemVariants}>
          GameX
        </Title>
        <Subtitle variants={itemVariants}>
          The future of decentralized gaming and rewards
        </Subtitle>
        <motion.div variants={itemVariants}>
          <Button
            as={Link}
            to="/token"
            $variant="primary"
            $size="large"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Buy GAMEX
          </Button>
        </motion.div>
      </Hero>

      <Features>
        <Feature
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
        >
          <h2>Staking Rewards</h2>
          <p>
            Stake your GameX tokens to earn passive income and unlock exclusive platform benefits.
            Up to 25% APY on staked tokens.
          </p>
        </Feature>

        <Feature
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
        >
          <h2>Gaming Utility</h2>
          <p>
            Use GameX tokens across multiple games and earn more through skilled gameplay.
            All games feature provably fair outcomes via Chainlink VRF.
          </p>
        </Feature>

        <Feature
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
        >
          <h2>GameX DAO</h2>
          <p>
            Participate in governance and shape the future of the platform.
            Token holders can vote on key protocol decisions and treasury allocations.
          </p>
        </Feature>
      </Features>

      <TokenMetrics variants={containerVariants}>
        <h2>Token Metrics</h2>
        <MetricsGrid>
          <MetricCard variants={itemVariants}>
            <h3>Total Supply</h3>
            <p>1,000,000,000 GAMEX</p>
          </MetricCard>
          <MetricCard variants={itemVariants}>
            <h3>Circulating Supply</h3>
            <p>250,000,000 GAMEX</p>
          </MetricCard>
          <MetricCard variants={itemVariants}>
            <h3>Current Price</h3>
            <p>$0.XX USD</p>
          </MetricCard>
        </MetricsGrid>
      </TokenMetrics>
    </HomeContainer>
  );
}

// Add new styled components
const TokenMetrics = styled(motion.section)`
  margin-top: 4rem;
  
  h2 {
    font-size: 2rem;
    margin-bottom: 2rem;
    color: ${({ theme }) => theme.text.primary};
  }
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
`;

const MetricCard = styled(motion.div)`
  background: ${({ theme }) => theme.surface};
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: ${({ theme }) => theme.shadow.md};

  h3 {
    color: ${({ theme }) => theme.text.secondary};
    margin-bottom: 1rem;
  }

  p {
    font-size: 1.75rem;
    font-weight: bold;
    background: ${({ theme }) => theme.gradients.primary};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;
