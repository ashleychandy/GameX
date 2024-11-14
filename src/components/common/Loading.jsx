import React from 'react';
import styled, { keyframes } from 'styled-components';

const Loading = ({ size = 'medium', color, fullScreen }) => {
  return (
    <LoadingWrapper fullScreen={fullScreen}>
      <Spinner size={size} color={color} />
    </LoadingWrapper>
  );
};

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const LoadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  ${({ fullScreen }) => fullScreen && `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1000;
  `}
`;

const Spinner = styled.div`
  border: 4px solid ${({ theme }) => theme.colors.backgroundAlt};
  border-top: 4px solid ${({ color, theme }) => color || theme.colors.primary};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
  
  ${({ size }) => {
    switch (size) {
      case 'small':
        return 'width: 20px; height: 20px;';
      case 'large':
        return 'width: 50px; height: 50px;';
      default:
        return 'width: 30px; height: 30px;';
    }
  }}
`;

export default Loading; 