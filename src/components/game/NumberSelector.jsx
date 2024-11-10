import React from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "../../hooks/useGame";
import { GAME_CONFIG } from "../../utils/constants";

const SelectorContainer = styled(motion.div)`
  padding: 2rem;
  text-align: center;
`;

const Title = styled.h3`
  color: ${({ theme }) => theme.text.secondary};
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
  font-weight: 500;
`;

const NumbersGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  max-width: 400px;
  margin: 0 auto;

  @media (max-width: 480px) {
    gap: 0.75rem;
  }
`;

const NumberButton = styled(motion.button)`
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 16px;
  border: 2px solid
    ${({ theme, $selected }) => ($selected ? theme.primary : theme.border)};
  background: ${({ theme, $selected }) =>
    $selected ? `${theme.primary}15` : theme.surface};
  color: ${({ theme, $selected }) =>
    $selected ? theme.primary : theme.text.primary};
  font-size: 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  overflow: hidden;

  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.primary};
    background: ${({ theme }) => `${theme.primary}10`};
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${({ theme }) => theme.primary};
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  ${({ $selected, theme }) =>
    $selected &&
    `
    box-shadow: 0 0 0 2px ${theme.primary}40;
  `}
`;

const WinMultiplier = styled(motion.span)`
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.text.secondary};
  font-weight: 500;
`;

export function NumberSelector() {
  const {
    handleNumberSelect,
    selectedNumber,
    canSelectNumber,
    hasActiveGame,
    isLoading,
  } = useGame();

  return (
    <SelectorContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Title>Select a Number (1-6)</Title>
      <NumbersGrid>
        <AnimatePresence mode="wait">
          {Array.from({ length: GAME_CONFIG.MAX_NUMBER }, (_, i) => i + 1).map(
            (number) => (
              <NumberButton
                key={number}
                onClick={() => handleNumberSelect(number)}
                $selected={selectedNumber === number}
                disabled={
                  !canSelectNumber(number) || hasActiveGame || isLoading
                }
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                }}
              >
                {number}
                <WinMultiplier
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  6x
                </WinMultiplier>
              </NumberButton>
            )
          )}
        </AnimatePresence>
      </NumbersGrid>
    </SelectorContainer>
  );
}
