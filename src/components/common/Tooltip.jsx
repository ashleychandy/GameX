import styled from 'styled-components';
import { motion } from 'framer-motion';

const TooltipContainer = styled(motion.div)`
  position: relative;
  display: inline-block;
`;

const TooltipContent = styled(motion.div)`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.5rem 1rem;
  background: ${({ theme }) => theme.surface};
  border-radius: 8px;
  box-shadow: ${({ theme }) => theme.shadow.lg};
  font-size: 0.875rem;
  color: ${({ theme }) => theme.text.primary};
  white-space: nowrap;
  z-index: 10;
  
  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 8px solid transparent;
    border-top-color: ${({ theme }) => theme.surface};
  }
`;

export function Tooltip({ children, content, ...props }) {
  return (
    <TooltipContainer {...props}>
      {children}
      <TooltipContent
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
      >
        {content}
      </TooltipContent>
    </TooltipContainer>
  );
} 