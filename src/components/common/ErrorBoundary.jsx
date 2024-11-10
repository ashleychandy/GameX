import React from 'react';
import styled from 'styled-components';

const ErrorContainer = styled.div`
  padding: 2rem;
  margin: 2rem;
  background: ${({ theme }) => theme.error};
  border-radius: 12px;
  text-align: center;

  h2 {
    color: ${({ theme }) => theme.text.primary};
    margin-bottom: 1rem;
  }

  p {
    color: ${({ theme }) => theme.text.secondary};
  }

  button {
    margin-top: 1rem;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    border: none;
    background: ${({ theme }) => theme.primary};
    color: white;
    cursor: pointer;

    &:hover {
      opacity: 0.9;
    }
  }
`;

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorContainer>
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message || 'An unexpected error occurred'}</p>
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}

export { ErrorBoundary };
export default ErrorBoundary; 