import React from 'react';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
`;

const LoadingContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: ${({ $fullscreen }) => ($fullscreen ? '100vh' : '200px')};
  gap: 1rem;
  position: ${({ $fullscreen }) => ($fullscreen ? 'fixed' : 'relative')};
  top: ${({ $fullscreen }) => ($fullscreen ? '0' : 'auto')};
  left: ${({ $fullscreen }) => ($fullscreen ? '0' : 'auto')};
  right: ${({ $fullscreen }) => ($fullscreen ? '0' : 'auto')};
  bottom: ${({ $fullscreen }) => ($fullscreen ? '0' : 'auto')};
  background: ${({ $fullscreen, theme }) => 
    $fullscreen ? `${theme.background}ee` : 'transparent'};
  z-index: ${({ $fullscreen }) => ($fullscreen ? '9999' : '1')};
`;

const LoadingSpinner = styled.div`
  border: 4px solid ${({ theme }) => theme.background};
  border-top: 4px solid ${({ theme }) => theme.primary};
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: ${spin} 1s linear infinite;
`;

const LoadingText = styled.p`
  color: ${({ theme }) => theme.text.secondary};
  font-size: 1.1rem;
  text-align: center;
  animation: ${pulse} 2s ease-in-out infinite;
`;

export function Loading({ 
  message = 'Loading...', 
  fullscreen = false 
}) {
  return (
    <LoadingContainer $fullscreen={fullscreen}>
      <LoadingSpinner />
      <LoadingText>{message}</LoadingText>
    </LoadingContainer>
  );
}

Loading.propTypes = {
  message: PropTypes.string,
  fullscreen: PropTypes.bool
};

export default Loading; 