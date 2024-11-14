import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useContract } from '../../hooks/useContract';
import { useWallet } from '../../contexts/WalletContext';
import { formatEther, shortenAddress } from '../../utils/helpers';

const GameNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const contract = useContract();
  const { account } = useWallet();

  useEffect(() => {
    if (!contract || !account) return;

    const handleGameResult = (player, number, result, amount, won, event) => {
      const notification = {
        id: `${event.transactionHash}-${event.logIndex}`,
        type: 'GAME_RESULT',
        title: won ? 'You Won!' : 'Better Luck Next Time',
        message: won 
          ? `You won ${formatEther(amount)} ETH!`
          : `You lost ${formatEther(amount)} ETH`,
        timestamp: Date.now(),
        won,
        txHash: event.transactionHash
      };

      setNotifications(prev => [notification, ...prev].slice(0, 10));
    };

    const handleReward = (player, amount, event) => {
      if (player.toLowerCase() !== account.toLowerCase()) return;

      const notification = {
        id: `${event.transactionHash}-${event.logIndex}`,
        type: 'REWARD',
        title: 'Reward Received',
        message: `You received ${formatEther(amount)} ETH in rewards!`,
        timestamp: Date.now(),
        txHash: event.transactionHash
      };

      setNotifications(prev => [notification, ...prev].slice(0, 10));
    };

    contract.on('GameResult', handleGameResult);
    contract.on('RewardClaimed', handleReward);

    return () => {
      contract.off('GameResult', handleGameResult);
      contract.off('RewardClaimed', handleReward);
    };
  }, [contract, account]);

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  return (
    <>
      <NotificationIcon onClick={toggleNotifications}>
        🔔
        {notifications.length > 0 && (
          <NotificationBadge>{notifications.length}</NotificationBadge>
        )}
      </NotificationIcon>

      <AnimatePresence>
        {showNotifications && (
          <>
            <Overlay
              as={motion.div}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNotifications(false)}
            />
            <NotificationPanel
              as={motion.div}
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
            >
              <PanelHeader>
                <PanelTitle>Notifications</PanelTitle>
                <HeaderActions>
                  {notifications.length > 0 && (
                    <ClearButton onClick={clearNotifications}>
                      Clear All
                    </ClearButton>
                  )}
                  <CloseButton onClick={() => setShowNotifications(false)}>
                    &times;
                  </CloseButton>
                </HeaderActions>
              </PanelHeader>

              <NotificationList>
                <AnimatePresence>
                  {notifications.length === 0 ? (
                    <EmptyState>No notifications</EmptyState>
                  ) : (
                    notifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        as={motion.div}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        layout
                      >
                        <NotificationContent>
                          <NotificationHeader>
                            <NotificationTitle type={notification.type} won={notification.won}>
                              {notification.title}
                            </NotificationTitle>
                            <RemoveButton
                              onClick={() => removeNotification(notification.id)}
                            >
                              &times;
                            </RemoveButton>
                          </NotificationHeader>
                          <NotificationMessage>
                            {notification.message}
                          </NotificationMessage>
                          <NotificationFooter>
                            <TimeStamp>
                              {new Date(notification.timestamp).toLocaleTimeString()}
                            </TimeStamp>
                            <ViewTransaction
                              href={`https://sepolia.etherscan.io/tx/${notification.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              View Transaction
                            </ViewTransaction>
                          </NotificationFooter>
                        </NotificationContent>
                      </NotificationItem>
                    ))
                  )}
                </AnimatePresence>
              </NotificationList>
            </NotificationPanel>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

const NotificationIcon = styled.div`
  position: fixed;
  bottom: ${({ theme }) => theme.spacing.xl};
  right: ${({ theme }) => theme.spacing.xl};
  width: 50px;
  height: 50px;
  background: ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.shadows.medium};
  z-index: 98;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.1);
  }
`;

const NotificationBadge = styled.div`
  position: absolute;
  top: -5px;
  right: -5px;
  background: ${({ theme }) => theme.colors.error};
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 99;
`;

const NotificationPanel = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  width: 100%;
  max-width: 400px;
  height: 100%;
  background: ${({ theme }) => theme.colors.background};
  box-shadow: ${({ theme }) => theme.shadows.large};
  z-index: 100;
  display: flex;
  flex-direction: column;
`;

const PanelHeader = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const PanelTitle = styled.h3`
  margin: 0;
  color: ${({ theme }) => theme.colors.primary};
`;

const HeaderActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
`;

const ClearButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textAlt};
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing.xs};
  
  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }
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

const NotificationList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing.md};
`;

const NotificationItem = styled.div`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: 8px;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  overflow: hidden;
`;

const NotificationContent = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
`;

const NotificationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const NotificationTitle = styled.div`
  font-weight: bold;
  color: ${({ type, won, theme }) => {
    if (type === 'GAME_RESULT') {
      return won ? theme.colors.success : theme.colors.error;
    }
    return theme.colors.primary;
  }};
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textAlt};
  cursor: pointer;
  padding: 0;
  
  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }
`;

const NotificationMessage = styled.div`
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const NotificationFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
`;

const TimeStamp = styled.div`
  color: ${({ theme }) => theme.colors.textAlt};
`;

const ViewTransaction = styled.a`
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  color: ${({ theme }) => theme.colors.textAlt};
  padding: ${({ theme }) => theme.spacing.xl};
`;

export default GameNotifications; 