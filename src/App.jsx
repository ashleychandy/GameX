import { useState, useEffect, useCallback, useRef } from 'react';
import { ethers } from 'ethers';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import { ToastContainer, toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate, UNSAFE_DataRouterContext, UNSAFE_DataRouterStateContext } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import DiceABI from './abi/Dice.json';
import TokenABI from './abi/Token.json';
import { ErrorBoundary } from 'react-error-boundary';

// Theme Configuration
const lightTheme = {
  background: '#E3FDFD',
  cardBackground: '#CBF1F5',
  text: '#222831',
  textSecondary: '#393E46',
  primary: '#71C9CE',
  secondary: '#A6E3E9',
  buttonBackground: '#CBF1F5',
  border: '#A6E3E9',
  success: '#71C9CE',
  error: '#FF6B6B',
  warning: '#FFD93D',
};

const darkTheme = {
  background: '#222831',
  cardBackground: '#393E46',
  text: '#EEEEEE',
  textSecondary: '#A6E3E9',
  primary: '#00ADB5',
  secondary: '#A6E3E9',
  buttonBackground: '#393E46',
  border: '#00ADB5',
  success: '#71C9CE',
  error: '#FF6B6B',
  warning: '#FFD93D',
};

// Global Styles
const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    background: ${({ theme }) => theme.background};
    color: ${({ theme }) => theme.text};
    transition: all 0.3s ease;
  }

  // Add these additional global styles for better theme integration
  button {
    color: ${({ theme }) => theme.text};
  }

  input {
    color: ${({ theme }) => theme.text};
    background: ${({ theme }) => theme.cardBackground};
    border: 1px solid ${({ theme }) => theme.border};
    
    &::placeholder {
      color: ${({ theme }) => theme.textSecondary};
    }
  }

  // Add smooth scrolling
  html {
    scroll-behavior: smooth;
  }

  // Improve scrollbar appearance
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.background};
  }

  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.primary};
    border-radius: 4px;
    
    &:hover {
      background: ${({ theme }) => theme.secondary};
    }
  }
`;

// Styled Components for Navigation
const Nav = styled.nav`
  background: ${({ theme }) => theme.cardBackground};
  padding: 1.25rem 3rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: fixed;
  width: 100%;
  top: 0;
  z-index: 100;

  @media (max-width: 768px) {
    padding: 1rem 1.5rem;
  }
`;

const NavContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const NavLinks = styled.div`
  display: flex;
  gap: 2.5rem;
  align-items: center;

  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLink = styled(Link)`
  color: ${({ theme, $isActive }) => 
    $isActive ? theme.primary : theme.text};
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) => theme.buttonBackground};
  }
`;

// Styled Components for Home Page
const HomeContainer = styled.div`
  padding-top: 80px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Hero = styled.div`
  text-align: center;
  padding: 4rem 2rem;
`;

const Title = styled(motion.h1)`
  font-size: 3.5rem;
  margin-bottom: 1.5rem;
  background: linear-gradient(135deg, ${({ theme }) => theme.primary}, ${({ theme }) => theme.secondary});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: ${({ theme }) => theme.textSecondary};
  max-width: 600px;
  margin: 0 auto;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  padding: 2rem;
`;

const FeatureCard = styled(motion.div)`
  background: ${({ theme }) => theme.cardBackground};
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

// Home Component
const Home = () => {
  return (
    <HomeContainer>
      <Hero>
        <Title
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Welcome to GameX
        </Title>
        <Subtitle>
          Experience the future of gaming with our decentralized casino platform
        </Subtitle>
      </Hero>

      <FeaturesGrid>
        <FeatureCard
          whileHover={{ y: -5 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3>Custom Token</h3>
          <p>Play with our native ERC20 token with built-in features for seamless gaming</p>
        </FeatureCard>

        <FeatureCard
          whileHover={{ y: -5 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3>Provably Fair</h3>
          <p>All games use Chainlink VRF for verifiable random outcomes</p>
        </FeatureCard>

        <FeatureCard
          whileHover={{ y: -5 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3>Multiple Games</h3>
          <p>Choose from various games including Dice and Roulette</p>
        </FeatureCard>
      </FeaturesGrid>
    </HomeContainer>
  );
};

// Styled Components for Admin
const AdminContainer = styled.div`
  padding-top: 80px;
  max-width: 1200px;
  margin: 0 auto;
`;

const AdminCard = styled.div`
  background: ${({ theme }) => theme.cardBackground};
  padding: 2rem;
  border-radius: 16px;
  margin: 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

const AdminButton = styled.button`
  background: ${({ theme }) => theme.primary};
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  margin: 0.5rem;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Add these new styled components for Admin
const AdminGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2.5rem;
  padding: 2.5rem;

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const AdminSection = styled(AdminCard)`
  display: flex;
  flex-direction: column;
  gap: 2rem;

  h2 {
    color: ${({ theme }) => theme.primary};
    font-size: 1.6rem;
    margin-bottom: 1.5rem;
    border-bottom: 2px solid ${({ theme }) => theme.border};
    padding-bottom: 0.75rem;
  }
`;

const AdminInputGroup = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;

  input {
    flex: 1;
    padding: 0.75rem;
    border-radius: 8px;
    border: 1px solid ${({ theme }) => theme.border};
    background: ${({ theme }) => theme.background};
    color: ${({ theme }) => theme.text};
    font-size: 1rem;

    &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.primary};
    }
  }
`;

const RoleList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 250px;
  overflow-y: auto;
  padding-right: 1rem;

  .role-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    background: ${({ theme }) => theme.background};
    border-radius: 8px;
    
    span {
      font-family: monospace;
      font-size: 0.95rem;
    }
  }
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  
  &::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${({ $active, theme }) => 
      $active ? theme.success : theme.error};
  }
`;

// Admin Component
const Admin = ({ diceContract, tokenContract, isAdmin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [gameStats, setGameStats] = useState({
    totalGames: 0,
    totalPaid: '0',
    activeGame: null,
    isPaused: false
  });
  const [roles, setRoles] = useState({
    minters: [],
    burners: []
  });
  const [newAddress, setNewAddress] = useState('');
  const [callbackGasLimit, setCallbackGasLimit] = useState('');
  const [newGasLimit, setNewGasLimit] = useState('');

  // Add new state for token minting
  const [mintAddress, setMintAddress] = useState('');
  const [mintAmount, setMintAmount] = useState('');

  useEffect(() => {
    if (diceContract && tokenContract && isAdmin) {
      loadData();
    }
  }, [diceContract, tokenContract, isAdmin]);

  const loadData = async () => {
    try {
      const [stats, isPaused] = await Promise.all([
        diceContract.getGameStats(),
        diceContract.paused()
      ]);

      const { minters, burners } = await tokenContract.getMinterBurnerAddresses();
      const gasLimit = await diceContract.getCallbackGasLimit();

      setGameStats({
        totalGames: stats.totalGames.toString(),
        totalPaid: ethers.utils.formatEther(stats.totalPaid),
        activeGame: stats.activeGame,
        isPaused
      });

      setRoles({ minters, burners });
      setCallbackGasLimit(gasLimit.toString());
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    }
  };

  const handlePause = async () => {
    try {
      setIsLoading(true);
      const tx = await diceContract.pause();
      await tx.wait();
      toast.success('Game paused successfully');
      await loadData();
    } catch (error) {
      console.error('Error pausing game:', error);
      toast.error('Failed to pause game');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnpause = async () => {
    try {
      setIsLoading(true);
      const tx = await diceContract.unpause();
      await tx.wait();
      toast.success('Game unpaused successfully');
      await loadData();
    } catch (error) {
      console.error('Error unpausing game:', error);
      toast.error('Failed to unpause game');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForceStopGame = async () => {
    try {
      setIsLoading(true);
      const tx = await diceContract.forceStopGame();
      await tx.wait();
      toast.success('Game forcefully stopped');
      await loadData();
    } catch (error) {
      console.error('Error stopping game:', error);
      toast.error('Failed to stop game');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGrantRole = async (role) => {
    if (!ethers.utils.isAddress(newAddress)) {
      toast.error('Invalid address');
      return;
    }

    try {
      setIsLoading(true);
      const tx = await tokenContract.grantRole(
        ethers.utils.id(role),
        newAddress
      );
      await tx.wait();
      toast.success(`${role} role granted successfully`);
      await loadData();
      setNewAddress('');
    } catch (error) {
      console.error('Error granting role:', error);
      toast.error('Failed to grant role');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokeRole = async (role, address) => {
    try {
      setIsLoading(true);
      const tx = await tokenContract.revokeRole(
        ethers.utils.id(role),
        address
      );
      await tx.wait();
      toast.success(`${role} role revoked successfully`);
      await loadData();
    } catch (error) {
      console.error('Error revoking role:', error);
      toast.error('Failed to revoke role');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateGasLimit = async () => {
    try {
      setIsLoading(true);
      const tx = await diceContract.updateCallbackGasLimit(Number(newGasLimit));
      await tx.wait();
      toast.success('Gas limit updated successfully');
      await loadData();
      setNewGasLimit('');
    } catch (error) {
      console.error('Error updating gas limit:', error);
      toast.error('Failed to update gas limit');
    } finally {
      setIsLoading(false);
    }
  };

  // Add handleMint function
  const handleMint = async () => {
    if (!ethers.utils.isAddress(mintAddress)) {
      toast.error('Invalid address');
      return;
    }

    if (!mintAmount || parseFloat(mintAmount) <= 0) {
      toast.error('Invalid amount');
      return;
    }

    try {
      setIsLoading(true);
      const amount = ethers.utils.parseEther(mintAmount);
      const tx = await tokenContract.mint(mintAddress, amount);
      await tx.wait();
      toast.success(`Successfully minted ${mintAmount} tokens to ${mintAddress}`);
      setMintAddress('');
      setMintAmount('');
    } catch (error) {
      console.error('Error minting tokens:', error);
      toast.error('Failed to mint tokens');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <AdminContainer>
        <AdminSection>
          <h2>Access Denied</h2>
          <p>You must be an admin to view this page.</p>
        </AdminSection>
      </AdminContainer>
    );
  }

  return (
    <AdminContainer>
      <AdminGrid>
        <AdminSection>
          <h2>Game Controls</h2>
          <StatusIndicator $active={!gameStats.isPaused}>
            {gameStats.isPaused ? 'Game Paused' : 'Game Active'}
          </StatusIndicator>
          <AdminInputGroup>
            <AdminButton 
              onClick={gameStats.isPaused ? handleUnpause : handlePause}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : (gameStats.isPaused ? 'Unpause Game' : 'Pause Game')}
            </AdminButton>
            <AdminButton 
              onClick={handleForceStopGame}
              disabled={isLoading}
            >
              Force Stop Game
            </AdminButton>
          </AdminInputGroup>
        </AdminSection>

        <AdminSection>
          <h2>Token Management</h2>
          <div>
            <h3>Mint Tokens</h3>
            <AdminInputGroup>
              <input
                type="text"
                placeholder="Recipient Address"
                value={mintAddress}
                onChange={(e) => setMintAddress(e.target.value)}
              />
              <input
                type="number"
                placeholder="Amount"
                value={mintAmount}
                onChange={(e) => setMintAmount(e.target.value)}
              />
              <AdminButton 
                onClick={handleMint}
                disabled={isLoading}
              >
                Mint
              </AdminButton>
            </AdminInputGroup>
          </div>
        </AdminSection>

        <AdminSection>
          <h2>Role Management</h2>
          <AdminInputGroup>
            <input
              type="text"
              placeholder="Address"
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
            />
            <AdminButton 
              onClick={() => handleGrantRole('MINTER_ROLE')}
              disabled={isLoading}
            >
              Grant Minter
            </AdminButton>
            <AdminButton 
              onClick={() => handleGrantRole('BURNER_ROLE')}
              disabled={isLoading}
            >
              Grant Burner
            </AdminButton>
          </AdminInputGroup>

          <div>
            <h3>Current Minters</h3>
            <RoleList>
              {roles.minters.map((address) => (
                <div key={address} className="role-item">
                  <span>{address}</span>
                  <AdminButton 
                    onClick={() => handleRevokeRole('MINTER_ROLE', address)}
                    disabled={isLoading}
                  >
                    Revoke
                  </AdminButton>
                </div>
              ))}
            </RoleList>
          </div>

          <div>
            <h3>Current Burners</h3>
            <RoleList>
              {roles.burners.map((address) => (
                <div key={address} className="role-item">
                  <span>{address}</span>
                  <AdminButton 
                    onClick={() => handleRevokeRole('BURNER_ROLE', address)}
                    disabled={isLoading}
                  >
                    Revoke
                  </AdminButton>
                </div>
              ))}
            </RoleList>
          </div>
        </AdminSection>

        <AdminSection>
          <h2>Game Statistics</h2>
          <div>
            <p>Total Games Played: {gameStats.totalGames}</p>
            <p>Total Paid Out: {gameStats.totalPaid} tokens</p>
            <p>Current Callback Gas Limit: {callbackGasLimit}</p>
          </div>
          
          {gameStats.activeGame && gameStats.activeGame.isActive && (
            <div>
              <h3>Active Game</h3>
              <p>Player: {gameStats.activeGame.player}</p>
              <p>Amount: {ethers.utils.formatEther(gameStats.activeGame.amount)} tokens</p>
              <p>Chosen Number: {gameStats.activeGame.chosenNumber.toString()}</p>
              <p>Time: {new Date(gameStats.activeGame.timestamp.toNumber() * 1000).toLocaleString()}</p>
            </div>
          )}
        </AdminSection>

        <AdminSection>
          <h2>Gas Limit Configuration</h2>
          <AdminInputGroup>
            <input
              type="number"
              placeholder="New Gas Limit"
              value={newGasLimit}
              onChange={(e) => setNewGasLimit(e.target.value)}
            />
            <AdminButton 
              onClick={handleUpdateGasLimit}
              disabled={isLoading}
            >
              Update Gas Limit
            </AdminButton>
          </AdminInputGroup>
        </AdminSection>
      </AdminGrid>
    </AdminContainer>
  );
};

// Updated styled components for Dice Game
const GameContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 100px auto 2rem;
`;

const GameSection = styled.div`
  background: ${({ theme }) => theme.cardBackground};
  border-radius: 24px;
  padding: 2.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  margin-bottom: 2.5rem;
  border: 1px solid ${({ theme }) => theme.border};

  h3 {
    margin-bottom: 1.5rem;
    font-size: 1.4rem;
  }
`;

const GameHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const DiceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 1.25rem;
  margin: 2.5rem 0;

  @media (max-width: 600px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }
`;

// Add AllowanceDisplay here, with other styled components
const AllowanceDisplay = styled.div`
  margin-top: 1rem;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.textSecondary};
  text-align: center;
  padding: 0.5rem;
  border-radius: 8px;
  background: ${({ theme }) => theme.buttonBackground}10;
`;

const DiceButton = styled(motion.button)`
  aspect-ratio: 1;
  background: ${({ selected, theme }) => 
    selected ? theme.primary : theme.cardBackground};
  color: ${({ selected, theme }) => 
    selected ? theme.cardBackground : theme.text};
  border: 2px solid ${({ selected, theme }) => 
    selected ? theme.primary : theme.border};
  border-radius: 12px;
  font-size: 1.5rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.primary};
    transform: translateY(-2px);
  }
`;

const BetInput = styled.div`
  position: relative;
  margin: 2rem 0;

  input {
    width: 100%;
    padding: 1rem;
    padding-right: 4rem;
    border: 2px solid ${({ theme }) => theme.border};
    border-radius: 12px;
    background: transparent;
    color: ${({ theme }) => theme.text};
    font-size: 1.1rem;
    transition: all 0.2s ease;

    &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.primary};
    }
  }

  span {
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: ${({ theme }) => theme.textSecondary};
  }
`;

const ActionButton = styled(motion.button)`
  width: 100%;
  padding: 1rem;
  background: ${({ variant, theme }) => 
    variant === 'secondary' 
      ? 'transparent'
      : `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`};
  color: ${({ variant, theme }) => variant === 'secondary' ? theme.text : 'white'};
  border: ${({ variant, theme }) => 
    variant === 'secondary' ? `2px solid ${theme.border}` : 'none'};
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const ButtonGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-top: 1rem;
`;

const HistoryTable = styled.div`
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  
  .header {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    padding: 1rem;
    background: ${({ theme }) => theme.buttonBackground};
    font-weight: bold;
  }

  .row {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    padding: 1rem;
    border-bottom: 1px solid ${({ theme }) => theme.border};
    
    &:last-child {
      border-bottom: none;
    }
  }
`;

const StatsCard = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatItem = styled.div`
  padding: 1rem;
  background: ${({ theme }) => theme.buttonBackground};
  border-radius: 12px;
  text-align: center;

  h4 {
    color: ${({ theme }) => theme.textSecondary};
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
  }

  p {
    font-size: 1.2rem;
    font-weight: bold;
  }
`;

// New styled components for game state visualization
const GameStateContainer = styled.div`
  background: ${({ theme }) => theme.cardBackground};
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
`;

const StateTimeline = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 2rem 0;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    top: 50%;
    height: 2px;
    background: ${({ theme }) => theme.border};
    z-index: 0;
  }
`;

const StateNode = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1;
  
  .node {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: ${({ $active, $completed, theme }) => 
      $completed ? theme.success :
      $active ? theme.primary :
      theme.buttonBackground};
    color: ${({ $active, $completed, theme }) => 
      ($active || $completed) ? 'white' : theme.textSecondary};
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 0.5rem;
    border: 2px solid ${({ $active, $completed, theme }) => 
      $completed ? theme.success :
      $active ? theme.primary :
      theme.border};
    transition: all 0.3s ease;
  }

  .label {
    font-size: 0.875rem;
    color: ${({ $active, theme }) => $active ? theme.primary : theme.textSecondary};
    text-align: center;
    font-weight: ${({ $active }) => $active ? '600' : '400'};
  }
`;

const GameStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;

  .status-icon {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: ${({ $status, theme }) => 
      $status === 'pending' ? theme.warning :
      $status === 'active' ? theme.success :
      $status === 'error' ? theme.error :
      theme.buttonBackground};
  }

  .status-text {
    font-size: 0.875rem;
    color: ${({ theme }) => theme.textSecondary};
  }

  .status-action {
    margin-left: auto;
    padding: 0.5rem 1rem;
    background: ${({ theme }) => theme.primary};
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.875rem;
    transition: all 0.2s ease;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &:hover:not(:disabled) {
      transform: translateY(-2px);
    }
  }
`;

// Game State Roadmap Component
const GameStateRoadmap = ({ gameState, contract, onResolve, isLoading: parentIsLoading }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const lastAttemptRef = useRef(0);

  // Add handleResolve function
  const handleResolve = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get gas estimate first
      const gasEstimate = await contract.estimateGas.resolveGame();
      
      // Add 20% buffer to gas estimate
      const gasLimit = gasEstimate.mul(120).div(100);

      // Call resolveGame with explicit gas limit
      const tx = await contract.resolveGame({
        gasLimit: gasLimit
      });
      
      await tx.wait();

      if (onResolve) {
        await onResolve();
      }
    } catch (error) {
      console.error('Error resolving game:', error);
      setError(error.reason || 'Failed to resolve game');
    } finally {
      setIsLoading(false);
    }
  };

  // Add this useEffect to automatically resolve the game
  useEffect(() => {
    const autoResolve = async () => {
      // Check if game is ready to be resolved
      if (gameState.isActive && 
          gameState.randomFulfilled && 
          !isLoading && 
          !parentIsLoading) {
        
        // Prevent multiple rapid attempts
        const now = Date.now();
        if (now - lastAttemptRef.current < 5000) { // 5 second cooldown
          return;
        }
        lastAttemptRef.current = now;

        await handleResolve(); // Use the handleResolve function here
      }
    };

    autoResolve();
  }, [gameState.isActive, gameState.randomFulfilled, contract, onResolve, isLoading, parentIsLoading]);

  const states = [
    { id: 'init', label: 'Initialized', icon: '🎲' },
    { id: 'bet', label: 'Bet Placed', icon: '💰' },
    { id: 'random', label: 'Random Generated', icon: '🎯' },
    { id: 'resolve', label: 'Game Resolved', icon: '🏆' }
  ];

  const getCurrentStateIndex = () => {
    if (!gameState.isActive) return 0;
    if (!gameState.randomFulfilled) return 1;
    if (gameState.result === 0) return 2;
    return 3;
  };

  const currentIndex = getCurrentStateIndex();

  return (
    <GameStateContainer>
      <GameStatus $status={gameState.randomFulfilled ? 'pending' : 'active'}>
        <div className="status-icon" />
        <span className="status-text">
          {gameState.randomFulfilled ? 'Ready to Resolve' : 
           gameState.isActive ? 'Game in Progress' : 
           'Waiting for New Game'}
        </span>
        {gameState.isActive && (
          <button
            className="status-action"
            onClick={handleResolve}
            disabled={isLoading || parentIsLoading || !gameState.randomFulfilled}
          >
            {isLoading ? 'Resolving...' : 'Resolve Now'}
          </button>
        )}
      </GameStatus>

      <StateTimeline>
        {states.map((state, index) => (
          <StateNode
            key={state.id}
            $active={index === currentIndex}
            $completed={index < currentIndex}
          >
            <div className="node">
              {state.icon}
            </div>
            <span className="label">{state.label}</span>
          </StateNode>
        ))}
      </StateTimeline>

      {error && (
        <div style={{ 
          color: 'red', 
          marginTop: '1rem', 
          fontSize: '0.9rem',
          textAlign: 'center',
          padding: '0.5rem',
          background: 'rgba(255, 0, 0, 0.1)',
          borderRadius: '8px'
        }}>
          {error}
        </div>
      )}
    </GameStateContainer>
  );
};

// Updated DiceGame Component
const DiceGame = ({ contract, tokenContract, account }) => {
  // State declarations
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [betAmount, setBetAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showRandomGeneration, setShowRandomGeneration] = useState(false);
  const [gameHistory, setGameHistory] = useState([]);
  const [userStats, setUserStats] = useState({
    totalGames: 0,
    totalBets: '0',
    totalWinnings: '0',
    totalLosses: '0',
    lastPlayed: 0,
    rollHistory: []
  });
  const [tokenAllowance, setTokenAllowance] = useState('0');
  const [isApproving, setIsApproving] = useState(false);
  const [needsApproval, setNeedsApproval] = useState(false);
  const [currentGame, setCurrentGame] = useState(null);

  // Define loadUserStats first
  const loadUserStats = useCallback(async () => {
    if (!contract || !account) return;

    try {
      const stats = await contract.getUserStats(account);
      setUserStats({
        totalGames: stats.totalGames.toString(),
        totalBets: ethers.utils.formatEther(stats.totalBets),
        totalWinnings: ethers.utils.formatEther(stats.totalWinnings),
        totalLosses: ethers.utils.formatEther(stats.totalLosses),
        lastPlayed: stats.lastPlayed.toNumber(),
        rollHistory: stats.personalRollHistory.map(roll => roll.toString())
      });
    } catch (error) {
      console.error('Error loading user stats:', error);
      toast.error('Failed to load user statistics');
    }
  }, [contract, account]);

  // Define loadHistoricalData
  const loadHistoricalData = useCallback(async () => {
    if (!contract || !account) return;

    try {
      const filter = contract.filters.GameCompleted(account);
      const events = await contract.queryFilter(filter, -10000);
      
      const history = await Promise.all(events.map(async (event) => {
        const { player, chosenNumber, result, betAmount, payout, timestamp } = event.args;
        const block = await event.getBlock();
        
        return {
          txHash: event.transactionHash,
          number: chosenNumber.toString(),
          result: result.toString(),
          amount: ethers.utils.formatEther(betAmount),
          payout: ethers.utils.formatEther(payout),
          timestamp: block.timestamp * 1000,
          won: payout.gt(0)
        };
      }));

      setGameHistory(history.sort((a, b) => b.timestamp - a.timestamp));
    } catch (error) {
      console.error('Error loading historical data:', error);
      toast.error('Failed to load game history');
    }
  }, [contract, account]);

  // Add handleGameResolved function
  const handleGameResolved = useCallback(async () => {
    try {
      await loadUserStats();
      await loadHistoricalData();
      // Reset current game
      setCurrentGame(null);
      setShowRandomGeneration(false);
    } catch (error) {
      console.error('Error refreshing data after game resolution:', error);
      toast.error('Failed to refresh game data');
    }
  }, [loadUserStats, loadHistoricalData]);

  // Define event handlers
  const handleGameStarted = useCallback((player, chosenNumber, betAmount, event) => {
    if (player.toLowerCase() === account?.toLowerCase()) {
      toast.info('Game started! Waiting for random number...');
      setShowRandomGeneration(true);
    }
  }, [account]);

  const handleGameCompleted = useCallback(async (
    player,
    chosenNumber,
    result,
    betAmount,
    payout,
    timestamp,
    event
  ) => {
    if (player.toLowerCase() === account?.toLowerCase()) {
      const block = await event.getBlock();
      const newGame = {
        txHash: event.transactionHash,
        number: chosenNumber.toString(),
        result: result.toString(),
        amount: ethers.utils.formatEther(betAmount),
        payout: ethers.utils.formatEther(payout),
        timestamp: block.timestamp * 1000,
        won: payout.gt(0)
      };

      setGameHistory(prev => [newGame, ...prev]);
      
      // Reload user stats after game completion
      await loadUserStats();

      const payoutFormatted = ethers.utils.formatEther(payout);
      const won = payout.gt(0);
      toast[won ? 'success' : 'error'](
        won 
          ? `You won ${payoutFormatted} tokens!` 
          : 'Better luck next time!'
      );
    }
  }, [account, loadUserStats]);

  const handleRandomFulfilled = useCallback(async () => {
    setShowRandomGeneration(false);
    toast.info('Random number generated! Game will be resolved automatically...');
    
    // Wait a short moment before checking game state
    setTimeout(async () => {
      try {
        const stats = await contract.getGameStats();
        if (stats.activeGame?.isActive && stats.activeGame?.randomFulfilled) {
          // Game state will be handled by GameStateRoadmap's autoResolve
          console.log('Game ready for resolution');
        }
      } catch (error) {
        console.error('Error checking game state after random fulfillment:', error);
      }
    }, 2000);
  }, [contract]);

  // Main useEffect for initialization and event subscription
  useEffect(() => {
    if (!contract || !account) return;

    const gameStartedFilter = contract.filters.GameStarted(account);
    const gameCompletedFilter = contract.filters.GameCompleted(account);
    const randomFulfilledFilter = contract.filters.RandomWordsFulfilled();

    // Initial load
    loadUserStats();
    loadHistoricalData();

    // Subscribe to events
    contract.on(gameStartedFilter, handleGameStarted);
    contract.on(gameCompletedFilter, handleGameCompleted);
    contract.on(randomFulfilledFilter, handleRandomFulfilled);

    return () => {
      contract.off(gameStartedFilter, handleGameStarted);
      contract.off(gameCompletedFilter, handleGameCompleted);
      contract.off(randomFulfilledFilter, handleRandomFulfilled);
    };
  }, [
    contract, 
    account, 
    loadUserStats, 
    loadHistoricalData, 
    handleGameStarted, 
    handleGameCompleted, 
    handleRandomFulfilled
  ]);

  // First, define checkIfNeedsApproval
  const checkIfNeedsApproval = useCallback((betAmount, currentAllowance) => {
    if (!currentAllowance || !betAmount) return true;
    try {
      const allowanceBN = ethers.BigNumber.from(currentAllowance);
      const requiredAmount = ethers.utils.parseEther(betAmount.toString());
      return allowanceBN.lt(requiredAmount);
    } catch (error) {
      console.error('Error checking approval:', error);
      return true;
    }
  }, []); // No dependencies needed as it's a pure function

  // Then use it in the useEffect
  useEffect(() => {
    const checkAllowance = async () => {
      if (!contract || !account || !tokenContract) return;
      try {
        const allowance = await tokenContract.allowance(account, contract.address);
        setTokenAllowance(allowance);
        
        // Check if current bet needs approval
        if (betAmount) {
          setNeedsApproval(checkIfNeedsApproval(betAmount, allowance));
        }
      } catch (error) {
        console.error('Error checking allowance:', error);
        toast.error('Failed to check token allowance');
      }
    };

    checkAllowance();
    const intervalId = setInterval(checkAllowance, 10000);
    return () => clearInterval(intervalId);
  }, [contract, account, tokenContract, betAmount, checkIfNeedsApproval]);

  // Update bet amount handler
  const handleBetAmountChange = (e) => {
    const newAmount = e.target.value;
    setBetAmount(newAmount);
    setNeedsApproval(checkIfNeedsApproval(newAmount, tokenAllowance));
  };

  // Refresh allowance function
  const refreshAllowance = async () => {
    if (!contract || !account || !tokenContract) return;
    try {
      const allowance = await tokenContract.allowance(account, contract.address);
      setTokenAllowance(allowance);
      if (betAmount) {
        setNeedsApproval(checkIfNeedsApproval(betAmount, allowance));
      }
    } catch (error) {
      console.error('Error refreshing allowance:', error);
    }
  };

  // Handle approve function
  const handleApprove = async () => {
    if (!contract || !account || !betAmount) {
      toast.error('Please enter a bet amount first');
      return;
    }
    
    try {
      setIsApproving(true);
      
      // Calculate exact approve amount based on bet amount
      const approveAmount = ethers.utils.parseEther(betAmount);
      const tx = await tokenContract.approve(contract.address, approveAmount);
      
      toast.info('Approving tokens...');
      await tx.wait();
      
      // Refresh allowance after approval
      await refreshAllowance();
      toast.success(`Approved ${betAmount} tokens for betting`);
    } catch (error) {
      console.error('Error approving tokens:', error);
      toast.error('Failed to approve tokens');
    } finally {
      setIsApproving(false);
    }
  };

  // Update handlePlay function
  const handlePlay = async () => {
    if (!selectedNumber || !betAmount || !contract || !tokenContract) {
      toast.error('Please select a number and enter bet amount');
      return;
    }

    if (needsApproval) {
      toast.error('Please approve tokens first');
      return;
    }

    try {
      setIsLoading(true);
      const parsedAmount = ethers.utils.parseEther(betAmount);
      const tx = await contract.playDice(selectedNumber, parsedAmount);
      
      toast.info('Transaction submitted. Waiting for confirmation...');
      await tx.wait();
      
      // Refresh allowance immediately after successful bet
      await refreshAllowance();
      
      setSelectedNumber(null);
      setBetAmount('');
      setNeedsApproval(false);
    } catch (error) {
      console.error('Error placing bet:', error);
      toast.error(error.reason || 'Failed to place bet');
      setShowRandomGeneration(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Update useEffect to include refreshAllowance
  useEffect(() => {
    const checkAllowance = async () => {
      if (!contract || !account || !tokenContract) return;
      try {
        const allowance = await tokenContract.allowance(account, contract.address);
        setTokenAllowance(allowance.toString());
      } catch (error) {
        console.error('Error checking allowance:', error);
      }
    };

    checkAllowance();
    const intervalId = setInterval(checkAllowance, 5000);
    return () => clearInterval(intervalId);
  }, [contract, account, tokenContract, betAmount]);

  // Add this useEffect to monitor game state
  useEffect(() => {
    const checkGameState = async () => {
      if (!contract || !account) return;
      
      try {
        const stats = await contract.getGameStats();
        console.log('Game Stats:', stats);
        
        if (stats.activeGame) {
          const activeGame = {
            isActive: stats.activeGame.isActive,
            randomFulfilled: stats.activeGame.randomFulfilled,
            result: stats.activeGame.result?.toString() || '0',
            player: stats.activeGame.player,
            amount: stats.activeGame.amount?.toString() || '0'
          };
          console.log('Active Game:', activeGame);
          setCurrentGame(activeGame);
        } else {
          setCurrentGame(null);
        }
      } catch (error) {
        console.error('Error checking game state:', error);
      }
    };

    checkGameState();
    const interval = setInterval(checkGameState, 5000);
    return () => clearInterval(interval);
  }, [contract, account]);

  // Add this effect to refresh allowance periodically and after state changes
  useEffect(() => {
    const checkAllowance = async () => {
      if (!contract || !account || !tokenContract) return;
      try {
        const allowance = await tokenContract.allowance(account, contract.address);
        setTokenAllowance(allowance.toString());
      } catch (error) {
        console.error('Error checking allowance:', error);
      }
    };

    // Check immediately
    checkAllowance();

    // Set up periodic checking
    const intervalId = setInterval(checkAllowance, 5000); // Check every 5 seconds

    // Also check when betAmount changes
    if (betAmount) {
      checkAllowance();
    }

    return () => clearInterval(intervalId);
  }, [contract, account, tokenContract, betAmount]);

  // Add quick bet amounts
  const quickBetAmounts = ['10', '50', '100', '500'];

  return (
    <DiceGameWrapper>
      <div>
        <MainGameSection>
          <h2>Roll the Dice</h2>
          
          <DiceDisplay>
            {selectedNumber ? `🎲 ${selectedNumber}` : '🎲'}
          </DiceDisplay>

          <BetControls>
            <DiceGrid>
              {[1, 2, 3, 4, 5, 6].map((number) => (
                <DiceButton
                  key={number}
                  selected={selectedNumber === number}
                  onClick={() => setSelectedNumber(number)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {number}
                </DiceButton>
              ))}
            </DiceGrid>

            <BetInput>
              <input
                type="number"
                value={betAmount}
                onChange={handleBetAmountChange}
                placeholder="Enter bet amount"
                min="0"
                step="0.1"
              />
              <span>Tokens</span>
            </BetInput>

            <QuickBetButtons>
              {quickBetAmounts.map(amount => (
                <QuickBetButton
                  key={amount}
                  onClick={() => setBetAmount(amount)}
                >
                  {amount}
                </QuickBetButton>
              ))}
            </QuickBetButtons>

            <BetInfoCard>
              <div className="info-item">
                <h4>Potential Win</h4>
                <p>{betAmount ? (Number(betAmount) * 6).toFixed(2) : '0'} Tokens</p>
              </div>
              <div className="info-item">
                <h4>Win Chance</h4>
                <p>16.67%</p>
              </div>
            </BetInfoCard>

            {needsApproval ? (
              <ActionButton
                onClick={handleApprove}
                disabled={isApproving}
                variant="secondary"
              >
                {isApproving ? 'Approving...' : 'Approve Tokens'}
              </ActionButton>
            ) : (
              <ActionButton
                onClick={handlePlay}
                disabled={isLoading || !selectedNumber || !betAmount}
              >
                {isLoading ? 'Processing...' : 'Place Bet'}
              </ActionButton>
            )}
          </BetControls>
        </MainGameSection>

        <GameSection>
          <h3>Game Status</h3>
          <GameStateRoadmap 
            gameState={{
              isActive: currentGame?.isActive || false,
              randomFulfilled: currentGame?.randomFulfilled || false,
              result: currentGame?.result ? currentGame.result.toString() : '0',
              player: currentGame?.player || '',
              amount: currentGame?.amount ? ethers.utils.formatEther(currentGame.amount) : '0'
            }}
            contract={contract}
            onResolve={handleGameResolved}
            isLoading={isLoading}
          />
        </GameSection>
      </div>

      <div>
        <GameSection>
          <h3>Your Stats</h3>
          <StatsGrid>
            <StatCard>
              <h4>Total Games</h4>
              <p>{userStats.totalGames}</p>
            </StatCard>
            <StatCard>
              <h4>Total Bets</h4>
              <p>{Number(userStats.totalBets).toFixed(2)}</p>
            </StatCard>
            <StatCard>
              <h4>Total Winnings</h4>
              <p>{Number(userStats.totalWinnings).toFixed(2)}</p>
            </StatCard>
            <StatCard>
              <h4>Win Rate</h4>
              <p>
                {userStats.totalGames > 0
                  ? ((Number(userStats.totalWinnings) / Number(userStats.totalBets)) * 100).toFixed(1)
                  : '0'}%
              </p>
            </StatCard>
          </StatsGrid>
        </GameSection>

        <GameSection>
          <h3>Recent Rolls</h3>
          <RollHistoryContainer>
            {userStats.rollHistory.slice(-10).map((roll, index) => (
              <RollItem key={index}>
                {roll}
              </RollItem>
            ))}
          </RollHistoryContainer>
        </GameSection>

        <GameSection>
          <h3>Game History</h3>
          <HistoryTable>
            <div className="header">
              <span>Result</span>
              <span>Bet</span>
              <span>Payout</span>
              <span>Time</span>
            </div>
            {gameHistory.slice(0, 5).map((game) => (
              <div 
                key={game.txHash} 
                className={`row ${game.won ? 'won' : 'lost'}`}
              >
                <span>{game.result}</span>
                <span>{Number(game.amount).toFixed(2)}</span>
                <span>{Number(game.payout).toFixed(2)}</span>
                <span>{new Date(game.timestamp).toLocaleString()}</span>
              </div>
            ))}
          </HistoryTable>
        </GameSection>
      </div>
    </DiceGameWrapper>
  );
};

// Additional styled components for the main App
const AppContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.background};
  transition: all 0.3s ease;
`;

const ConnectButton = styled(motion.button)`
  background: linear-gradient(135deg, ${({ theme }) => theme.primary}, ${({ theme }) => theme.secondary});
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
`;

const LoadingOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
`;

const ThemeToggle = styled(motion.button)`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ theme }) => theme.buttonBackground};
  }
`;

// Navbar Component with Navigation
const Navbar = ({ isAdmin, account, onConnect, isDarkMode, onThemeToggle }) => {
  const location = useLocation();

  return (
    <Nav>
      <NavContainer>
        <NavLink to="/">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            GameX
          </motion.div>
        </NavLink>

        <NavLinks>
          <NavLink to="/" $isActive={location.pathname === '/'}>
            Home
          </NavLink>
          <NavLink to="/dice" $isActive={location.pathname === '/dice'}>
            Dice
          </NavLink>
          {isAdmin && (
            <NavLink to="/admin" $isActive={location.pathname === '/admin'}>
              Admin
            </NavLink>
          )}
          <ThemeToggle 
            onClick={onThemeToggle}
            aria-label="Toggle theme"
          >
            {isDarkMode ? '🌞' : '🌙'}
          </ThemeToggle>
          {!account ? (
            <ConnectButton
              onClick={onConnect}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Connect Wallet
            </ConnectButton>
          ) : (
            <span>{`${account.slice(0, 6)}...${account.slice(-4)}`}</span>
          )}
        </NavLinks>
      </NavContainer>
    </Nav>
  );
};

// Main App Component
function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState('');
  const [diceContract, setDiceContract] = useState(null);
  const [tokenContract, setTokenContract] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize Web3 and contracts
  useEffect(() => {
    const init = async () => {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(provider);

        // Check if already connected
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          const signer = provider.getSigner();
          setSigner(signer);
          setAccount(accounts[0]);
          initializeContracts(signer);
        }

        // Listen for account changes
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', () => window.location.reload());
      }
    };

    init();

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  // Check admin status whenever account changes
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (tokenContract && account) {
        try {
          const DEFAULT_ADMIN_ROLE = '0x0000000000000000000000000000000000000000000000000000000000000000';
          const hasAdminRole = await tokenContract.hasRole(DEFAULT_ADMIN_ROLE, account);
          setIsAdmin(hasAdminRole);
        } catch (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
        }
      }
    };

    checkAdminStatus();
  }, [tokenContract, account]);

  const handleAccountsChanged = async (accounts) => {
    if (accounts.length === 0) {
      // User disconnected
      setAccount('');
      setSigner(null);
      setIsAdmin(false);
    } else {
      // Account changed
      const newAccount = accounts[0];
      setAccount(newAccount);
      const newSigner = provider.getSigner();
      setSigner(newSigner);
      initializeContracts(newSigner);
    }
  };

  const initializeContracts = (signer) => {
    const dice = new ethers.Contract(
      import.meta.env.VITE_DICE_GAME_ADDRESS,
      DiceABI.abi,
      signer
    );
    
    const token = new ethers.Contract(
      import.meta.env.VITE_TOKEN_ADDRESS,
      TokenABI.abi,
      signer
    );

    setDiceContract(dice);
    setTokenContract(token);
  };

  const connectWallet = async () => {
    try {
      setIsLoading(true);
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const account = await signer.getAddress();

      setProvider(provider);
      setSigner(signer);
      setAccount(account);
      initializeContracts(signer);

      toast.success('Wallet connected successfully!');
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast.error('Failed to connect wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const handleThemeToggle = () => {
    setIsDarkMode(prevMode => {
      const newMode = !prevMode;
      localStorage.setItem('theme', newMode ? 'dark' : 'light');
      return newMode;
    });
  };

  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
        <GlobalStyle />
        <ErrorBoundary
          FallbackComponent={ErrorFallback}
          onReset={() => window.location.reload()}
        >
          <AppContainer>
            <Navbar
              isAdmin={isAdmin}
              account={account}
              onConnect={connectWallet}
              isDarkMode={isDarkMode}
              onThemeToggle={handleThemeToggle}
            />

            <Routes>
              <Route path="/" element={<Home />} />
              <Route
                path="/dice"
                element={
                  <DiceGame
                    contract={diceContract}
                    tokenContract={tokenContract}
                    account={account}
                  />
                }
              />
              <Route
                path="/admin"
                element={
                  isAdmin ? (
                    <Admin
                      diceContract={diceContract}
                      tokenContract={tokenContract}
                      isAdmin={isAdmin}
                    />
                  ) : (
                    <Navigate to="/" replace />
                  )
                }
              />
            </Routes>

            <AnimatePresence>
              {isLoading && (
                <LoadingOverlay
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    style={{
                      width: '64px',
                      height: '64px',
                      border: '4px solid white',
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                    }}
                  />
                </LoadingOverlay>
              )}
            </AnimatePresence>

            <ToastContainer
              position="bottom-right"
              theme={isDarkMode ? 'dark' : 'light'}
              toastStyle={{
                background: isDarkMode ? darkTheme.cardBackground : lightTheme.cardBackground,
                color: isDarkMode ? darkTheme.text : lightTheme.text,
                borderRadius: '12px',
                border: `1px solid ${isDarkMode ? darkTheme.border : lightTheme.border}`,
              }}
            />
          </AppContainer>
        </ErrorBoundary>
      </ThemeProvider>
    </Router>
  );
}

// Error Fallback Component
const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <div role="alert" style={{ padding: '20px' }}>
    <h2>Something went wrong:</h2>
    <pre>{error.message}</pre>
    <button onClick={resetErrorBoundary}>Try again</button>
  </div>
);

// Add these new styled components before the existing ones
const RollHistoryContainer = styled.div`
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  padding: 1rem;
  margin: 1rem 0;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    height: 6px;
  }

  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.buttonBackground};
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.primary};
    border-radius: 3px;
  }
`;

const RollItem = styled.div`
  min-width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.cardBackground};
  border: 2px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  font-weight: bold;
  font-size: 1.2rem;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    border-color: ${({ theme }) => theme.primary};
  }
`;

// Add these styled components after the existing ones
const RandomGenerationOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
`;

const GenerationCard = styled(motion.div)`
  background: ${({ theme }) => theme.cardBackground};
  padding: 2rem;
  border-radius: 24px;
  text-align: center;
  max-width: 400px;
  width: 90%;
`;

const DiceAnimation = styled(motion.div)`
  font-size: 4rem;
  margin: 2rem 0;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background: ${({ theme }) => theme.buttonBackground};
  border-radius: 2px;
  margin: 1rem 0;
  overflow: hidden;

  .progress {
    height: 100%;
    background: linear-gradient(
      90deg,
      ${({ theme }) => theme.primary},
      ${({ theme }) => theme.secondary}
    );
    width: ${({ $progress }) => `${$progress}%`};
    transition: width 0.3s ease;
  }
`;

const EstimatedTime = styled.p`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 0.9rem;
  margin-top: 1rem;
`;

// Add this component after the styled components
const RandomGenerationStatus = ({ isVisible, onComplete }) => {
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(null); // Add this ref to track the interval
  const startTimeRef = useRef(null); // Add this ref to track start time
  
  useEffect(() => {
    if (isVisible) {
      // Only start new progress if there isn't one already running
      if (!startTimeRef.current) {
        startTimeRef.current = Date.now();
        setProgress(0);
        
        const duration = 30000; // 30 seconds
        const interval = 100; // Update every 100ms
        
        progressRef.current = setInterval(() => {
          const elapsed = Date.now() - startTimeRef.current;
          const currentProgress = Math.min((elapsed / duration) * 100, 100);
          
          setProgress(currentProgress);
          
          if (currentProgress >= 100) {
            clearInterval(progressRef.current);
            startTimeRef.current = null;
            progressRef.current = null;
            onComplete?.();
          }
        }, interval);
      }
    } else {
      // Reset everything when overlay is hidden
      if (progressRef.current) {
        clearInterval(progressRef.current);
      }
      progressRef.current = null;
      startTimeRef.current = null;
      setProgress(0);
    }

    // Cleanup on unmount or when visibility changes
    return () => {
      if (progressRef.current) {
        clearInterval(progressRef.current);
      }
    };
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  const remainingSeconds = Math.ceil((100 - progress) * 0.3);

  return (
    <RandomGenerationOverlay
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <GenerationCard
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h2>Generating Random Number</h2>
        <DiceAnimation
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          🎲
        </DiceAnimation>
        <p>Waiting for Chainlink VRF...</p>
        <ProgressBar $progress={progress}>
          <div className="progress" />
        </ProgressBar>
        <EstimatedTime>
          Estimated time: {remainingSeconds} seconds
        </EstimatedTime>
      </GenerationCard>
    </RandomGenerationOverlay>
  );
};

// Add these styled components
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin: 1rem 0;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  background: ${({ theme }) => theme.background}40;
  padding: 1rem;
  border-radius: 12px;
  text-align: center;

  h4 {
    color: ${({ theme }) => theme.textSecondary};
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
  }

  p {
    font-size: 1.2rem;
    font-weight: bold;
    color: ${({ theme }) => theme.text};
  }
`;


// Add these utility functions at the top of the file
const formatError = (error) => {
  if (error.reason) return error.reason;
  if (error.message && error.message.includes('overflow')) {
    return 'Error: Payout calculation failed. Please contact support.';
  }
  return 'An unexpected error occurred';
};

const validateGameState = (gameState) => {
  if (!gameState.isActive) {
    throw new Error('No active game to resolve');
  }
  if (!gameState.randomFulfilled) {
    throw new Error('Waiting for random number generation');
  }
  return true;
};

// New styled components for improved Dice UI
const DiceGameWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  padding: 120px 2rem 2rem 2rem; // Added top padding to account for navbar

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
    padding: 100px 1.5rem 2rem 1.5rem;
  }
`;

const MainGameSection = styled(GameSection)`
  position: relative;
  overflow: hidden;
  padding: 2rem;
  
  h2 {
    font-size: 1.8rem;
    margin-bottom: 1.5rem;
    text-align: center;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, 
      ${({ theme }) => theme.primary}, 
      ${({ theme }) => theme.secondary}
    );
    border-radius: 4px 4px 0 0;
  }
`;

const BetControls = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const QuickBetButtons = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.8rem;
`;

const QuickBetButton = styled.button`
  background: ${({ theme }) => theme.buttonBackground};
  border: 1px solid ${({ theme }) => theme.border};
  padding: 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.text};

  &:hover {
    border-color: ${({ theme }) => theme.primary};
    transform: translateY(-2px);
  }
`;

const DiceDisplay = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  margin: 1.5rem 0;
  min-height: 100px;
  background: ${({ theme }) => theme.background}40;
  border-radius: 12px;
  padding: 1rem;
`;

const BetInfoCard = styled.div`
  background: ${({ theme }) => theme.cardBackground}40;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 12px;
  padding: 1.5rem;
  margin: 1rem 0;
  backdrop-filter: blur(5px);

  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;

  .info-item {
    text-align: center;
    
    h4 {
      color: ${({ theme }) => theme.textSecondary};
      font-size: 0.9rem;
      margin-bottom: 0.5rem;
    }
    
    p {
      font-size: 1.3rem;
      font-weight: bold;
      color: ${({ theme }) => theme.text};
    }
  }
`;

export default App;