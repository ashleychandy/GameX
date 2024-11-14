import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

const ANIMATIONS = {
  win: {
    initial: { scale: 0, rotate: -180 },
    animate: { 
      scale: 1, 
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    },
    exit: { 
      scale: 0,
      rotate: 180,
      transition: { duration: 0.3 }
    }
  },
  confetti: {
    initial: { y: -100, opacity: 0 },
    animate: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15
      }
    },
    exit: { 
      y: 100, 
      opacity: 0,
      transition: { duration: 0.5 }
    }
  },
  dice: {
    initial: { rotate: 0 },
    animate: { 
      rotate: 360 * 3,
      transition: {
        duration: 1.5,
        ease: "easeInOut"
      }
    }
  }
};

const GameAnimations = ({ type, isVisible, children }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <AnimationContainer
          as={motion.div}
          variants={ANIMATIONS[type]}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {children}
        </AnimationContainer>
      )}
    </AnimatePresence>
  );
};

const AnimationContainer = styled(motion.div)`
  position: absolute;
  pointer-events: none;
`;

export default GameAnimations; 