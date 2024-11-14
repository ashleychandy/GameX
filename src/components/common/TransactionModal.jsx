import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import Loading from './Loading';
import { TRANSACTION_STATES } from '../../utils/constants';

const TransactionModal = ({ isOpen, state, hash, message, onClose }) => {
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
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <ModalContent>
              {state === TRANSACTION_STATES.PENDING && (
                <>
                  <Loading size="large" />
                  <StatusMessage>Transaction Pending...</StatusMessage>
                  <SubMessage>Please wait while your transaction is being processed</SubMessage>
                </>
              )}

              {state === TRANSACTION_STATES.CONFIRMED && (
                <>
                  <SuccessIcon>✓</SuccessIcon>
                  <StatusMessage>Transaction Confirmed!</StatusMessage>
                  {hash && (
                    <TransactionLink 
                      href={`https://sepolia.etherscan.io/tx/${hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View on Etherscan
                    </TransactionLink>
                  )}
                </>
              )}

              {state === TRANSACTION_STATES.FAILED && (
                <>
                  <ErrorIcon>✕</ErrorIcon>
                  <StatusMessage>Transaction Failed</StatusMessage>
                  <ErrorMessage>{message}</ErrorMessage>
                </>
              )}

              {state !== TRANSACTION_STATES.PENDING && (
                <CloseButton onClick={onClose}>Close</CloseButton>
              )}
            </ModalContent>
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
  border-radius: 8px;
  padding: ${({ theme }) => theme.spacing.xl};
  min-width: 320px;
  max-width: 90%;
  z-index: 101;
  box-shadow: ${({ theme }) => theme.shadows.large};
`;

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const StatusMessage = styled.h3`
  color: ${({ theme }) => theme.colors.text};
  margin: ${({ theme }) => theme.spacing.lg} 0;
`;

const SubMessage = styled.p`
  color: ${({ theme }) => theme.colors.textAlt};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const SuccessIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.success};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
`;

const ErrorIcon = styled(SuccessIcon)`
  background: ${({ theme }) => theme.colors.error};
`;

const ErrorMessage = styled.p`
  color: ${({ theme }) => theme.colors.error};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const TransactionLink = styled.a`
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  
  &:hover {
    text-decoration: underline;
  }
`;

const CloseButton = styled.button`
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.lg}`};
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.secondary};
  }
`;

export default TransactionModal; 