import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const Card = styled(motion.div)`
  background: ${({ theme }) => theme.surface};
  border-radius: 24px;
  padding: 2rem;
  box-shadow: ${({ theme }) => theme.shadow.md};
  backdrop-filter: blur(8px);
  border: 1px solid ${({ theme }) => theme.border};
  transition: transform 0.2s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${({ theme }) => theme.gradients.primary};
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  &:hover {
    transform: translateY(-2px);
    border-color: ${({ theme }) => theme.primary};

    &::before {
      opacity: 1;
    }
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;

  h2 {
    font-size: 1.5rem;
    font-weight: 600;
    background: ${({ theme }) => theme.gradients.primary};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const CardContent = styled.div`
  position: relative;
`;

const cardVariants = {
  hidden: { 
    opacity: 0,
    y: 20,
    scale: 0.95
  },
  visible: { 
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30
    }
  },
  hover: {
    scale: 1.02,
    transition: {
      duration: 0.2
    }
  }
};

export function GameCard({ children, title, className }) {
  return (
    <Card
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className={className}
    >
      {title && (
        <CardHeader>
          <h2>{title}</h2>
        </CardHeader>
      )}
      <CardContent>{children}</CardContent>
    </Card>
  );
} 