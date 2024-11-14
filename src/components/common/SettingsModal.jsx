import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import Button from './Button';

const SettingsModal = ({ isOpen, onClose }) => {
  const { theme, toggleTheme } = useTheme();
  const [gasPrice, setGasPrice] = useState('auto');
  const [slippage, setSlippage] = useState('0.5');

  const handleSave = () => {
    // Save settings logic here
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <Overlay
            as={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <Modal
            as={motion.div}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
          >
            <ModalHeader>
              <ModalTitle>Settings</ModalTitle>
              <CloseButton onClick={onClose}>&times;</CloseButton>
            </ModalHeader>

            <SettingsContent>
              <SettingSection>
                <SettingLabel>Theme</SettingLabel>
                <ThemeToggle onClick={toggleTheme}>
                  {theme === 'light' ? '🌙' : '☀️'}
                  {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                </ThemeToggle>
              </SettingSection>

              <SettingSection>
                <SettingLabel>Gas Price</SettingLabel>
                <Select
                  value={gasPrice}
                  onChange={(e) => setGasPrice(e.target.value)}
                >
                  <option value="auto">Auto</option>
                  <option value="fast">Fast</option>
                  <option value="standard">Standard</option>
                  <option value="slow">Slow</option>
                </Select>
              </SettingSection>

              <SettingSection>
                <SettingLabel>Slippage Tolerance</SettingLabel>
                <SlippageOptions>
                  {['0.1', '0.5', '1.0'].map((value) => (
                    <SlippageButton
                      key={value}
                      selected={slippage === value}
                      onClick={() => setSlippage(value)}
                    >
                      {value}%
                    </SlippageButton>
                  ))}
                  <SlippageInput
                    type="number"
                    value={slippage}
                    onChange={(e) => setSlippage(e.target.value)}
                    placeholder="Custom"
                  />
                </SlippageOptions>
              </SettingSection>

              <ButtonGroup>
                <Button onClick={handleSave}>Save Changes</Button>
                <Button variant="secondary" onClick={onClose}>
                  Cancel
                </Button>
              </ButtonGroup>
            </SettingsContent>
          </Modal>
        </>
      )}
    </AnimatePresence>
  );
};

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 100;
`;

const Modal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: ${({ theme }) => theme.colors.background};
  border-radius: 8px;
  padding: ${({ theme }) => theme.spacing.lg};
  min-width: 320px;
  max-width: 90%;
  z-index: 101;
  box-shadow: ${({ theme }) => theme.shadows.large};
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const ModalTitle = styled.h3`
  color: ${({ theme }) => theme.colors.primary};
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  color: ${({ theme }) => theme.colors.textAlt};
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing.xs};
  
  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }
`;

const SettingsContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const SettingSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const SettingLabel = styled.label`
  color: ${({ theme }) => theme.colors.text};
  font-weight: bold;
`;

const ThemeToggle = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text};
  
  &:hover {
    background: ${({ theme }) => theme.colors.border};
  }
`;

const Select = styled.select`
  padding: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  color: ${({ theme }) => theme.colors.text};
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const SlippageOptions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const SlippageButton = styled.button`
  padding: ${({ theme }) => theme.spacing.sm};
  background: ${({ selected, theme }) =>
    selected ? theme.colors.primary : theme.colors.backgroundAlt};
  color: ${({ selected, theme }) =>
    selected ? theme.colors.white : theme.colors.text};
  border: 1px solid ${({ selected, theme }) =>
    selected ? theme.colors.primary : theme.colors.border};
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background: ${({ selected, theme }) =>
      selected ? theme.colors.primary : theme.colors.border};
  }
`;

const SlippageInput = styled.input`
  padding: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  color: ${({ theme }) => theme.colors.text};
  width: 80px;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  justify-content: flex-end;
  margin-top: ${({ theme }) => theme.spacing.lg};
`;

export default SettingsModal; 