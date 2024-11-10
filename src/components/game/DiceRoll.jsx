import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';

const DiceContainer = styled(motion.div)`
  perspective: 1200px;
  width: 120px;
  height: 120px;
  margin: 2rem auto;
`;

const Dice = styled(motion.div)`
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  
  .face {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 16px;
    border: 2px solid ${({ theme }) => theme.border};
    background: ${({ theme }) => theme.surface};
    display: grid;
    grid-template: repeat(3, 1fr) / repeat(3, 1fr);
    padding: 8px;
    box-shadow: inset 0 0 15px rgba(0,0,0,0.1);
  }
  
  .dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: ${({ theme }) => theme.text.primary};
    place-self: center;
  }
`;

const DiceFace = ({ number = 1 }) => {
  const getDotPositions = (num) => {
    switch (num) {
      case 1:
        return [{ gridArea: '2 / 2' }];
      case 2:
        return [
          { gridArea: '1 / 1' },
          { gridArea: '3 / 3' }
        ];
      case 3:
        return [
          { gridArea: '1 / 1' },
          { gridArea: '2 / 2' },
          { gridArea: '3 / 3' }
        ];
      case 4:
        return [
          { gridArea: '1 / 1' },
          { gridArea: '1 / 3' },
          { gridArea: '3 / 1' },
          { gridArea: '3 / 3' }
        ];
      case 5:
        return [
          { gridArea: '1 / 1' },
          { gridArea: '1 / 3' },
          { gridArea: '2 / 2' },
          { gridArea: '3 / 1' },
          { gridArea: '3 / 3' }
        ];
      case 6:
        return [
          { gridArea: '1 / 1' },
          { gridArea: '2 / 1' },
          { gridArea: '3 / 1' },
          { gridArea: '1 / 3' },
          { gridArea: '2 / 3' },
          { gridArea: '3 / 3' }
        ];
      default:
        return [];
    }
  };

  return (
    <div className="face">
      {getDotPositions(number).map((pos, idx) => (
        <div key={idx} className="dot" style={pos} />
      ))}
    </div>
  );
};

export function DiceRoll({ 
  number = 1,
  rolling = false,
  onRollComplete = () => {},
}) {
  return (
    <DiceContainer>
      <Dice
        animate={rolling ? {
          rotateX: [0, 360, 720, 1080],
          rotateY: [0, 360, 720, 1080],
          rotateZ: [0, 360, 720, 1080],
        } : {
          rotateX: 0,
          rotateY: 0,
          rotateZ: 0,
        }}
        transition={rolling ? {
          duration: 2,
          ease: "easeOut",
          onComplete: onRollComplete,
        } : {
          duration: 0.5,
          ease: "easeOut",
        }}
      >
        <DiceFace number={number} />
      </Dice>
    </DiceContainer>
  );
}

DiceRoll.propTypes = {
  number: PropTypes.number,
  rolling: PropTypes.bool,
  onRollComplete: PropTypes.func,
};

export default DiceRoll; 