import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '../../contexts/WalletContext';
import { SUPPORTED_NETWORKS } from '../../config';
import Button from './Button';

const NetworkSwitch = ({ isOpen, onClose }) => {
  const { switchNetwork, network } = useWallet();

  const handleNetworkSwitch = async (chainId) => {
    await switchNetwork(chainId);
    onClose();
  };

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
              <ModalTitle>Switch Network</ModalTitle>
              <CloseButton onClick={onClose}>&times;</CloseButton>
            </ModalHeader>

            <NetworkList>
              {Object.entries(SUPPORTED_NETWORKS).map(([chainId, networkInfo]) => (
                <NetworkItem key={chainId}>
                  <NetworkInfo>
                    <NetworkName>{networkInfo.chainName}</NetworkName>
                    <NetworkDetails>Chain ID: {chainId}</NetworkDetails>
                  </NetworkInfo>
                  <SwitchButton
                    onClick={() => handleNetworkSwitch(parseInt(chainId))}
                    disabled={network?.chainId === parseInt(chainId)}
                    variant={network?.chainId === parseInt(chainId) ? "secondary" : "primary"}
                  >
                    {network?.chainId === parseInt(chainId) ? 'Connected' : 'Switch'}
                  </SwitchButton>
                </NetworkItem>
              ))}
            </NetworkList>
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
  padding: ${({ theme }) => theme.spacing.lg};
  min-width: 320px;
  max-width: 90%;
  z-index: 101;
  box-shadow: ${({ theme }) => theme.shadows.large};
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const ModalTitle = styled.h3`
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

const NetworkList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const NetworkItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: 4px;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateX(5px);
  }
`;

const NetworkInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const NetworkName = styled.span`
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text};
`;

const NetworkDetails = styled.span`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textAlt};
`;

const SwitchButton = styled(Button)`
  min-width: 100px;
`;

export default NetworkSwitch; 