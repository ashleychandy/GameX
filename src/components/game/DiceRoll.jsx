import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import diceSprite from '../../assets/dice-sprite.svg';

const DiceContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
`;

const DiceWrapper = styled(motion.div)`
  width: 100px;
  height: 100px;
  position: relative;
  perspective: 1000px;
`;

const DiceFace = styled(motion.div)`
  width: 100%;
  height: 100%;
  background-image: url(${diceSprite});
  background-size: 600px 100px;
  background-position: ${({ $face }) => `${($face - 1) * -100}px 0`};
  border-radius: 16px;
  box-shadow: ${({ theme }) => theme.shadow.md};
  transform-style: preserve-3d;
`;

const ResultText = styled(motion.p)`
  margin-top: 1rem;
  font-size: 1.2rem;
  font-weight: bold;
  color: ${({ $won, theme }) => 
    $won ? theme.success : theme.error};
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const diceVariants = {
  rolling: {
    rotate: [0, 360],
    scale: [1, 1.1, 1],
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear",
      scale: {
        duration: 0.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  },
  stopped: {
    rotate: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      type: "spring",
      stiffness: 200,
      damping: 20
    }
  }
};

const resultVariants = {
  initial: { 
    opacity: 0, 
    y: 20,
    scale: 0.9 
  },
  animate: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    scale: 0.9,
    transition: {
      duration: 0.2
    }
  }
};

export function DiceRoll({ rolling, result, won }) {
  return (
    <DiceContainer>
      <DiceWrapper
        variants={diceVariants}
        animate={rolling ? "rolling" : "stopped"}
      >
        <DiceFace $face={result || 1} />
      </DiceWrapper>

      <AnimatePresence mode="wait">
        {result && !rolling && (
          <ResultText
            $won={won}
            variants={resultVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {won ? 'You Won!' : 'Try Again!'}
          </ResultText>
        )}
      </AnimatePresence>
    </DiceContainer>
  );
} 