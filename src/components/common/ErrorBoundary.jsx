import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Button } from './Button';

const ErrorContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 2rem;
  text-align: center;
`;

const ErrorIcon = styled(motion.div)`
  font-size: 4rem;
  color: ${({ theme }) => theme.error};
  margin-bottom: 1rem;
`;

const ErrorTitle = styled(motion.h1)`
  font-size: 2rem;
  margin-bottom: 1rem;
  background: ${({ theme }) => theme.gradients.error};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const ErrorMessage = styled(motion.p)`
  color: ${({ theme }) => theme.text.secondary};
  margin-bottom: 2rem;
  max-width: 600px;
  line-height: 1.6;
`;

const ErrorDetails = styled(motion.pre)`
  background: ${({ theme }) => theme.background};
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  max-width: 100%;
  overflow-x: auto;
  color: ${({ theme }) => theme.text.secondary};
  font-size: 0.875rem;
  border: 1px solid ${({ theme }) => theme.border};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
`;

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null 
    };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    });
    
    // Add error logging service integration
    console.error('Error caught by boundary:', error, errorInfo);
    // Example: reportError(error, errorInfo);
  }

  handleRefresh = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorContainer>
          <ErrorDetails>
            {this.state.error?.toString()}
            <pre>{this.state.errorInfo?.componentStack}</pre>
          </ErrorDetails>
          <ButtonGroup>
            <Button
              $variant="primary"
              onClick={this.handleReset}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Try Again
            </Button>
            <Button
              $variant="outline"
              onClick={this.handleRefresh}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Refresh Page
            </Button>
          </ButtonGroup>
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
} 