import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Button } from './Button';

const ErrorContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  margin: 2rem;
  background: ${({ theme }) => theme.surface};
  border-radius: 16px;
  box-shadow: ${({ theme }) => theme.shadow.md};
  text-align: center;
`;

const ErrorTitle = styled.h2`
  color: ${({ theme }) => theme.error};
  margin-bottom: 1rem;
  font-size: 1.5rem;
`;

const ErrorMessage = styled.p`
  color: ${({ theme }) => theme.text.secondary};
  margin-bottom: 2rem;
  max-width: 500px;
`;

const ErrorDetails = styled.pre`
  background: ${({ theme }) => theme.background};
  padding: 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  overflow-x: auto;
  margin: 1rem 0;
  max-width: 100%;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log to error reporting service
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    this.props.onReset?.();
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo } = this.state;
      const isDev = import.meta.env.DEV;

      return (
        <ErrorContainer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <ErrorTitle>Oops! Something went wrong</ErrorTitle>
          <ErrorMessage>
            {error?.message || 'An unexpected error occurred'}
          </ErrorMessage>

          {isDev && errorInfo && (
            <ErrorDetails>
              {error?.stack}
              <br />
              {errorInfo.componentStack}
            </ErrorDetails>
          )}

          <ButtonGroup>
            <Button onClick={this.handleReset} $variant="primary">
              Try Again
            </Button>
            <Button onClick={this.handleReload} $variant="outline">
              Reload Page
            </Button>
          </ButtonGroup>
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}

// Fallback component for Suspense
export const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <ErrorContainer>
    <ErrorTitle>Loading Error</ErrorTitle>
    <ErrorMessage>{error?.message || 'Failed to load component'}</ErrorMessage>
    <Button onClick={resetErrorBoundary} $variant="primary">
      Retry
    </Button>
  </ErrorContainer>
);

// Add default export at the end of the file
export default ErrorBoundary; 