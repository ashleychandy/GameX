import styled from 'styled-components';
import { motion } from 'framer-motion';

const InputWrapper = styled(motion.div)`
  position: relative;
  width: 100%;
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid ${({ theme, $error }) => 
    $error ? theme.error : theme.border};
  border-radius: 12px;
  background: ${({ theme }) => theme.surface};
  color: ${({ theme }) => theme.text.primary};
  font-size: 1rem;
  transition: all 0.2s ease-in-out;

  &:focus {
    outline: none;
    border-color: ${({ theme, $error }) => 
      $error ? theme.error : theme.primary};
    box-shadow: 0 0 0 4px ${({ theme, $error }) => 
      $error ? `${theme.error}20` : `${theme.primary}20`};
  }

  &:disabled {
    background: ${({ theme }) => theme.disabled};
    cursor: not-allowed;
  }

  &::placeholder {
    color: ${({ theme }) => theme.text.secondary};
  }
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: ${({ theme, $error }) => 
    $error ? theme.error : theme.text.secondary};
  font-size: 0.875rem;
  font-weight: 500;
`;

const ErrorMessage = styled(motion.p)`
  color: ${({ theme }) => theme.error};
  font-size: 0.75rem;
  margin-top: 0.25rem;
`;

export function Input({
  label,
  error,
  ...props
}) {
  return (
    <InputWrapper>
      {label && <Label $error={error}>{label}</Label>}
      <StyledInput $error={error} {...props} />
      {error && (
        <ErrorMessage
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </ErrorMessage>
      )}
    </InputWrapper>
  );
} 