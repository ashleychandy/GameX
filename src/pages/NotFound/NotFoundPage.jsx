import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/common';

const Container = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
  padding: 2rem;
`;

const Title = styled.h1`
  font-size: 4rem;
  margin-bottom: 1rem;
  background: ${({ theme }) => theme.gradients.primary};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Message = styled.p`
  font-size: 1.2rem;
  color: ${({ theme }) => theme.text.secondary};
  margin-bottom: 2rem;
`;

export function NotFoundPage() {
  return (
    <Container
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Title>404</Title>
      <Message>Oops! The page you're looking for doesn't exist.</Message>
      <Button as={Link} to="/" $variant="primary">
        Go Home
      </Button>
    </Container>
  );
}

export default NotFoundPage; 