import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const Spinner = styled(motion.div)`
  width: 50px;
  height: 50px;
  border: 4px solid ${({ theme }) => theme.surface};
  border-top-color: ${({ theme }) => theme.primary};
  border-radius: 50%;
`;

const Message = styled.p`
  color: ${({ theme }) => theme.text.primary};
  margin-top: 1rem;
  font-size: 1.1rem;
`;

export function LoadingOverlay({ message }) {
  return (
    <Overlay
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Spinner
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      {message && <Message>{message}</Message>}
    </Overlay>
  );
}

LoadingOverlay.propTypes = {
  message: PropTypes.string
}; 