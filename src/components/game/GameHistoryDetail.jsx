import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { formatEther, shortenAddress } from '../../utils/helpers';

const GameHistoryDetail = ({ game, isOpen, onClose }) => {
  if (!game) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <Overlay
            as={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <Modal
            as={motion.div}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
          >
            <ModalHeader>
              <Title>Game Details</Title>
              <CloseButton onClick={onClose}>&times;</CloseButton>
            </ModalHeader>

            <Content>
              <ResultSection won={game.won}>
                <ResultIcon>{game.won ? '🎉' : '😢'}</ResultIcon>
                <ResultText>{game.won ? 'Winner!' : 'Better luck next time!'}</ResultText>
              </ResultSection>

              <DetailsList>
                <DetailItem>
                  <DetailLabel>Transaction Hash</DetailLabel>
                  <DetailValue>
                    <HashLink 
                      href={`https://sepolia.etherscan.io/tx/${game.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {shortenAddress(game.txHash)}
                    </HashLink>
                  </DetailValue>
                </DetailItem>

                <DetailItem>
                  <DetailLabel>Player</DetailLabel>
                  <DetailValue>
                    <HashLink 
                      href={`https://sepolia.etherscan.io/address/${game.player}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {shortenAddress(game.player)}
                    </HashLink>
                  </DetailValue>
                </DetailItem>

                <DetailItem>
                  <DetailLabel>Selected Number</DetailLabel>
                  <DetailValue>{game.guess}</DetailValue>
                </DetailItem>

                <DetailItem>
                  <DetailLabel>Result</DetailLabel>
                  <DetailValue>{game.result}</DetailValue>
                </DetailItem>

                <DetailItem>
                  <DetailLabel>Bet Amount</DetailLabel>
                  <DetailValue>{formatEther(game.amount)} ETH</DetailValue>
                </DetailItem>

                <DetailItem>
                  <DetailLabel>Payout</DetailLabel>
                  <DetailValue highlight={game.won}>
                    {game.won ? `+${formatEther(game.payout)} ETH` : '0 ETH'}
                  </DetailValue>
                </DetailItem>

                <DetailItem>
                  <DetailLabel>Time</DetailLabel>
                  <DetailValue>
                    {new Date(game.timestamp).toLocaleString()}
                  </DetailValue>
                </DetailItem>
              </DetailsList>

              <BlockchainInfo>
                <BlockNumber>Block #{game.blockNumber}</BlockNumber>
                <GasUsed>{game.gasUsed} Gas Used</GasUsed>
              </BlockchainInfo>
            </Content>
          </Modal>
        </>
      )}
    </AnimatePresence>
  );
};

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 100;
`;

const Modal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: ${({ theme }) => theme.colors.background};
  border-radius: 12px;
  padding: ${({ theme }) => theme.spacing.xl};
  width: 90%;
  max-width: 600px;
  z-index: 101;
  box-shadow: ${({ theme }) => theme.shadows.large};
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const Title = styled.h3`
  color: ${({ theme }) => theme.colors.primary};
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  color: ${({ theme }) => theme.colors.textAlt};
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing.xs};
  
  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const ResultSection = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ won, theme }) => 
    won ? `${theme.colors.success}15` : `${theme.colors.error}15`};
  border-radius: 8px;
`;

const ResultIcon = styled.div`
  font-size: 3rem;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const ResultText = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text};
`;

const DetailsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const DetailItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.sm} 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const DetailLabel = styled.div`
  color: ${({ theme }) => theme.colors.textAlt};
`;

const DetailValue = styled.div`
  color: ${({ highlight, theme }) => 
    highlight ? theme.colors.success : theme.colors.text};
  font-weight: ${({ highlight }) => highlight ? 'bold' : 'normal'};
`;

const HashLink = styled.a`
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

const BlockchainInfo = styled.div`
  display: flex;
  justify-content: space-between;
  padding-top: ${({ theme }) => theme.spacing.md};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.textAlt};
  font-size: 0.9rem;
`;

const BlockNumber = styled.div``;

const GasUsed = styled.div``;

export default GameHistoryDetail; 