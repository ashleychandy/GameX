import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';

const HomeContainer = styled(motion.div)`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Hero = styled(motion.div)`
  text-align: center;
  padding: 4rem 0;
`;

const Title = styled(motion.h1)`
  font-size: 3.5rem;
  margin-bottom: 1.5rem;
  background: ${({ theme }) => theme.gradients.primary};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Subtitle = styled(motion.p)`
  font-size: 1.25rem;
  color: ${({ theme }) => theme.text.secondary};
  margin-bottom: 2rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`;

const Features = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  padding: 2rem 0;
`;

const Feature = styled(motion.div)`
  background: ${({ theme }) => theme.surface};
  padding: 2rem;
  border-radius: 16px;
  box-shadow: ${({ theme }) => theme.shadow.md};
  border: 1px solid ${({ theme }) => theme.border};
  transition: transform 0.2s ease;

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
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24
    }
  }
};

export function HomePage() {
  return (
    <HomeContainer
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Hero>
        <Title variants={itemVariants}>
          GameX Dice
        </Title>
        <Subtitle variants={itemVariants}>
          Experience the thrill of decentralized gaming with our provably fair dice game
        </Subtitle>
        <motion.div variants={itemVariants}>
          <Button
            as={Link}
            to="/game"
            $variant="primary"
            $size="large"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Play Now
          </Button>
        </motion.div>
      </Hero>

      <Features>
        <Feature
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
        >
          <h2>Provably Fair</h2>
          <p>
            Our game uses Chainlink VRF to ensure completely random and verifiable outcomes.
            Every roll is cryptographically proven to be fair and transparent.
          </p>
        </Feature>

        <Feature
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
        >
          <h2>Instant Payouts</h2>
          <p>
            Win big and receive your rewards instantly. Smart contracts ensure 
            automatic and immediate payouts directly to your wallet.
          </p>
        </Feature>

        <Feature
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
        >
          <h2>Low House Edge</h2>
          <p>
            Enjoy some of the best odds in crypto gaming with our low 2% house edge.
            Your chances of winning are always transparent and fair.
          </p>
        </Feature>
      </Features>
    </HomeContainer>
  );
}

export default HomePage; 