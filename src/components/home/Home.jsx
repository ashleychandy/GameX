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
          Welcome to Crypto Dice Game
        </Title>
        <Subtitle variants={itemVariants}>
          A decentralized gambling game built on Ethereum
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
            Our game uses Chainlink VRF for verifiable random numbers,
            ensuring complete fairness and transparency.
          </p>
        </Feature>

        <Feature
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
        >
          <h2>Low Fees</h2>
          <p>
            Play with our native GAMEX token and enjoy minimal transaction
            fees on the Ethereum network.
          </p>
        </Feature>

        <Feature
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
        >
          <h2>Instant Payouts</h2>
          <p>
            Winnings are automatically sent to your wallet as soon as
            the game resolves. No delays, no hassle.
          </p>
        </Feature>
      </Features>
    </HomeContainer>
  );
}
