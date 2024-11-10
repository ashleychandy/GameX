import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';

// ... (styled components remain the same)

const HomePage = () => {
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
        {/* ... Features content remains the same ... */}
      </Features>
    </HomeContainer>
  );
};

export default HomePage; 