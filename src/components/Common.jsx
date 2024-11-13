import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, Navigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { Button } from './Button';
import { useWallet } from '../contexts/WalletContext';

// Animation keyframes
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
`;

// Animation variants
const toastVariants = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 50 }
};

const tooltipVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 }
};

// Loading Components
const LoadingContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: ${({ $size }) => $size === 'small' ? '100px' : '200px'};
  gap: 1rem;
  ${({ $fullScreen }) => $fullScreen && `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${({ $transparent }) => $transparent ? 'transparent' : 'rgba(0, 0, 0, 0.5)'};
    z-index: 9999;
  `}
`;

const LoadingSpinner = styled.div`
  width: ${({ $size }) => {
    switch ($size) {
      case 'small': return '24px';
      case 'large': return '48px';
      default: return '32px';
    }
  }};
  height: ${({ $size }) => {
    switch ($size) {
      case 'small': return '24px';
      case 'large': return '48px';
      default: return '32px';
    }
  }};
  border: 3px solid ${({ theme }) => theme.background};
  border-top: 3px solid ${({ theme }) => theme.primary};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const LoadingText = styled.p`
  color: ${({ theme }) => theme.text.secondary};
  font-size: ${({ $size }) => $size === 'small' ? '0.875rem' : '1rem'};
  text-align: center;
  margin: 0;
`;

export function Loading({ 
  size = 'medium', 
  message = 'Loading...', 
  fullScreen = false,
  transparent = false 
}) {
  return (
    <LoadingContainer
      $size={size}
      $fullScreen={fullScreen}
      $transparent={transparent}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <LoadingSpinner $size={size} />
      {message && <LoadingText $size={size}>{message}</LoadingText>}
    </LoadingContainer>
  );
}

Loading.propTypes = {
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  message: PropTypes.string,
  fullScreen: PropTypes.bool,
  transparent: PropTypes.bool
};

// Loading Overlay Component
const OverlayContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${({ $transparent }) => 
    $transparent ? 'transparent' : 'rgba(0, 0, 0, 0.7)'};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
`;

export function LoadingOverlay({ 
  message = 'Loading...', 
  transparent = false 
}) {
  return (
    <OverlayContainer $transparent={transparent}>
      <LoadingSpinner size="large" />
      <LoadingText>{message}</LoadingText>
    </OverlayContainer>
  );
}

LoadingOverlay.propTypes = {
  message: PropTypes.string,
  transparent: PropTypes.bool
};

// Error Components
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
  max-width: 600px;
  width: 100%;
  margin: 2rem auto;
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
  line-height: 1.5;
`;

const ErrorDetails = styled.pre`
  background: ${({ theme }) => theme.background};
  padding: 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  overflow-x: auto;
  margin: 1rem 0;
  max-width: 100%;
  white-space: pre-wrap;
  word-wrap: break-word;
`;

const ErrorActions = styled.div`
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
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <ErrorFallback 
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          resetErrorBoundary={() => {
            this.setState({ hasError: false });
            this.props.onReset?.();
          }}
        />
      );
    }
    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  onReset: PropTypes.func,
  fallback: PropTypes.node
};

export function ErrorFallback({ error, errorInfo, resetErrorBoundary }) {
  return (
    <ErrorContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
    >
      <ErrorTitle>Something went wrong</ErrorTitle>
      <ErrorMessage>
        {error?.message || 'An unexpected error occurred'}
      </ErrorMessage>
      {errorInfo && (
        <ErrorDetails>
          {errorInfo.componentStack}
        </ErrorDetails>
      )}
      <ErrorActions>
        <Button onClick={resetErrorBoundary} variant="primary">
          Try Again
        </Button>
        <Button onClick={() => window.location.reload()} variant="secondary">
          Refresh Page
        </Button>
      </ErrorActions>
    </ErrorContainer>
  );
}

ErrorFallback.propTypes = {
  error: PropTypes.instanceOf(Error),
  errorInfo: PropTypes.object,
  resetErrorBoundary: PropTypes.func.isRequired
};

// Portal Component
export function Portal({ children, containerId = 'portal-root' }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    let element = document.getElementById(containerId);
    if (!element) {
      element = document.createElement('div');
      element.setAttribute('id', containerId);
      document.body.appendChild(element);
    }
    return () => {
      if (element?.parentNode) {
        element.parentNode.removeChild(element);
      }
    };
  }, [containerId]);

  if (!mounted) return null;
  return createPortal(children, document.getElementById(containerId));
}

Portal.propTypes = {
  children: PropTypes.node.isRequired,
  containerId: PropTypes.string
};

// Protected Route Component
export function ProtectedRoute({ 
  children, 
  requireAdmin = false,
  redirectPath = '/',
  message = "You don't have access to view this page"
}) {
  const { isConnected, isAdmin, isLoading, error } = useWallet();

  if (error) {
    return <ErrorFallback error={error} resetErrorBoundary={() => window.location.reload()} />;
  }

  if (isLoading) {
    return <Loading />;
  }

  if (!isConnected) {
    return <Navigate to={redirectPath} replace state={{ error: "Please connect your wallet" }} />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to={redirectPath} replace state={{ error: message }} />;
  }

  return <>{children}</>;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  requireAdmin: PropTypes.bool,
  redirectPath: PropTypes.string,
  message: PropTypes.string
};

// Toast Component
const ToastContainer = styled(motion.div)`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: ${({ theme, $type }) => {
    switch ($type) {
      case 'error': return `${theme.error}10`;
      case 'success': return `${theme.success}10`;
      case 'warning': return `${theme.warning}10`;
      default: return theme.surface;
    }
  }};
  border-left: 4px solid ${({ theme, $type }) => {
    switch ($type) {
      case 'error': return theme.error;
      case 'success': return theme.success;
      case 'warning': return theme.warning;
      default: return theme.primary;
    }
  }};
  border-radius: 8px;
  max-width: 400px;
  width: 100%;
  box-shadow: ${({ theme }) => theme.shadow.md};
`;

const ToastWrapper = styled.div`
  position: fixed;
  ${({ $position }) => {
    switch ($position) {
      case 'top-left':
        return 'top: 1rem; left: 1rem;';
      case 'top-right':
        return 'top: 1rem; right: 1rem;';
      case 'bottom-left':
        return 'bottom: 1rem; left: 1rem;';
      case 'bottom-right':
        return 'bottom: 1rem; right: 1rem;';
      default:
        return 'top: 1rem; right: 1rem;';
    }
  }}
  z-index: 1000;
`;

const IconContainer = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme, $type }) => {
    switch ($type) {
      case 'error': return theme.error;
      case 'success': return theme.success;
      case 'warning': return theme.warning;
      default: return theme.primary;
    }
  }};
`;

const ToastContent = styled.div`
  flex: 1;

  .title {
    font-weight: 600;
    margin-bottom: 0.25rem;
  }

  .message {
    color: ${({ theme }) => theme.text.secondary};
    font-size: 0.875rem;
  }
`;

export function Toast({ 
  type = 'info', 
  title, 
  message,
  duration = 5000,
  position = 'top-right',
  onClose
}) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <ToastWrapper $position={position}>
      <ToastContainer
        $type={type}
        variants={toastVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <IconContainer $type={type}>
          {type === 'success' && '✓'}
          {type === 'error' && '✕'}
          {type === 'warning' && '⚠'}
          {type === 'info' && 'ℹ'}
        </IconContainer>
        <ToastContent>
          {title && <div className="title">{title}</div>}
          {message && <div className="message">{message}</div>}
        </ToastContent>
      </ToastContainer>
    </ToastWrapper>
  );
}

Toast.propTypes = {
  type: PropTypes.oneOf(['info', 'success', 'warning', 'error']),
  title: PropTypes.string,
  message: PropTypes.string.isRequired,
  duration: PropTypes.number,
  position: PropTypes.oneOf(['top-right', 'top-left', 'bottom-right', 'bottom-left']),
  onClose: PropTypes.func.isRequired
};

// Tooltip Component
const TooltipContainer = styled(motion.div)`
  position: relative;
  display: inline-block;
`;

const TooltipContent = styled(motion.div)`
  position: absolute;
  ${({ $placement = 'top', $offset = 8 }) => {
    switch ($placement) {
      case 'bottom':
        return `
          top: calc(100% + ${$offset}px);
          left: 50%;
          transform: translateX(-50%);
        `;
      case 'left':
        return `
          right: calc(100% + ${$offset}px);
          top: 50%;
          transform: translateY(-50%);
        `;
      case 'right':
        return `
          left: calc(100% + ${$offset}px);
          top: 50%;
          transform: translateY(-50%);
        `;
      default: // top
        return `
          bottom: calc(100% + ${$offset}px);
          left: 50%;
          transform: translateX(-50%);
        `;
    }
  }}
  padding: 0.5rem 1rem;
  background: ${({ theme }) => theme.surface};
  border-radius: 8px;
  box-shadow: ${({ theme }) => theme.shadow.lg};
  font-size: 0.875rem;
  color: ${({ theme }) => theme.text.primary};
  white-space: nowrap;
  z-index: 1000;
`;

const TooltipArrow = styled.div`
  position: absolute;
  width: 8px;
  height: 8px;
  background: inherit;
  transform: rotate(45deg);
  ${({ $placement = 'top' }) => {
    switch ($placement) {
      case 'bottom': return 'top: -4px; left: 50%; margin-left: -4px;';
      case 'left': return 'right: -4px; top: 50%; margin-top: -4px;';
      case 'right': return 'left: -4px; top: 50%; margin-top: -4px;';
      default: return 'bottom: -4px; left: 50%; margin-left: -4px;';
    }
  }}
`;

export function Tooltip({ 
  children, 
  content,
  placement = 'top',
  delay = 0,
  offset = 8,
  ...props 
}) {
  const [isVisible, setIsVisible] = useState(false);
  
  const showTooltip = () => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  };

  return (
    <TooltipContainer 
      onMouseEnter={showTooltip}
      onMouseLeave={() => setIsVisible(false)}
      {...props}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <TooltipContent
            $placement={placement}
            $offset={offset}
            variants={tooltipVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {content}
            <TooltipArrow $placement={placement} />
          </TooltipContent>
        )}
      </AnimatePresence>
    </TooltipContainer>
  );
}

Tooltip.propTypes = {
  children: PropTypes.node.isRequired,
  content: PropTypes.node.isRequired,
  placement: PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
  delay: PropTypes.number,
  offset: PropTypes.number
};

// Badge Component
const BadgeContainer = styled.span`
  display: inline-flex;
  align-items: center;
  padding: ${({ $size }) => {
    switch ($size) {
      case 'small': return '0.125rem 0.375rem';
      case 'large': return '0.375rem 0.75rem';
      default: return '0.25rem 0.5rem';
    }
  }};
  border-radius: ${({ $pill }) => $pill ? '9999px' : '4px'};
  font-size: ${({ $size }) => {
    switch ($size) {
      case 'small': return '0.75rem';
      case 'large': return '1rem';
      default: return '0.875rem';
    }
  }};
  font-weight: 500;
  background: ${({ theme, $variant, $outline }) => 
    $outline ? 'transparent' : `${theme[$variant] || theme.primary}20`};
  color: ${({ theme, $variant }) => theme[$variant] || theme.primary};
  border: ${({ theme, $variant, $outline }) => 
    $outline ? `1px solid ${theme[$variant] || theme.primary}` : 'none'};
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme, $variant, $outline }) => 
      $outline ? `${theme[$variant] || theme.primary}10` : `${theme[$variant] || theme.primary}30`};
  }
`;

export function Badge({ 
  children, 
  variant = 'primary',
  size = 'medium',
  outline = false,
  pill = false,
  className,
  ...props 
}) {
  return (
    <BadgeContainer 
      $variant={variant}
      $size={size}
      $outline={outline}
      $pill={pill}
      className={className}
      {...props}
    >
      {children}
    </BadgeContainer>
  );
}

Badge.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.string,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  outline: PropTypes.bool,
  pill: PropTypes.bool,
  className: PropTypes.string
};

// Switch Component
const SwitchContainer = styled.label`
  position: relative;
  display: inline-flex;
  align-items: center;
  cursor: ${({ $disabled }) => $disabled ? 'not-allowed' : 'pointer'};
  opacity: ${({ $disabled }) => $disabled ? 0.5 : 1};
  user-select: none;
`;

const SwitchInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;
  position: absolute;

  &:checked + span {
    background: ${({ theme }) => theme.primary};
  }

  &:checked + span:before {
    transform: translateX(24px);
  }

  &:focus + span {
    box-shadow: 0 0 0 2px ${({ theme }) => `${theme.primary}40`};
  }

  &:disabled + span {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SwitchSlider = styled.span`
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
  background: ${({ theme }) => theme.border};
  border-radius: 24px;
  transition: all 0.2s ease;

  &:before {
    content: '';
    position: absolute;
    height: 20px;
    width: 20px;
    left: 2px;
    bottom: 2px;
    background: white;
    border-radius: 50%;
    transition: all 0.2s ease;
  }
`;

const SwitchLabel = styled.span`
  margin-left: 0.5rem;
  color: ${({ theme }) => theme.text.secondary};
`;

export function Switch({ 
  checked, 
  onChange, 
  id,
  label,
  disabled = false,
  className,
  ...props 
}) {
  const handleChange = (event) => {
    if (!disabled) {
      onChange(event.target.checked);
    }
  };

  return (
    <SwitchContainer $disabled={disabled} className={className}>
      <SwitchInput
        type="checkbox"
        id={id}
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
        aria-label={label}
        {...props}
      />
      <SwitchSlider />
      {label && <SwitchLabel>{label}</SwitchLabel>}
    </SwitchContainer>
  );
}

Switch.propTypes = {
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  id: PropTypes.string,
  label: PropTypes.string,
  disabled: PropTypes.bool,
  className: PropTypes.string
};

// Motion Link Component
export const MotionLink = styled(motion(Link))`
  text-decoration: none;
  color: inherit;
  display: inline-block;
  transition: all 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.primary};
  }
`;

// Animation Variants
export const animations = {
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 }
  },
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 }
  }
};

// Export all components
export {
  ErrorBoundary,
  Loading,
  LoadingOverlay,
  Portal,
  ProtectedRoute,
  Toast,
  Tooltip,
  Badge,
  Switch,
  MotionLink
};

// Export animation variants
export const commonAnimations = {
  fadeInUp: animations.fadeInUp,
  fadeIn: animations.fadeIn,
  scaleIn: animations.scaleIn,
  toastVariants,
  tooltipVariants
};