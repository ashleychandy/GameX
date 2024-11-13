import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import ReactDOM from 'react-dom';
import { useWallet } from '../contexts/WalletContext';
import { formatAmount, formatAddress, formatDate } from '../utils/helpers';
import { GAME_STATES, ERROR_MESSAGES } from '../utils/constants';

// Common Components
export const Button = styled(motion.button)`
  padding: ${({ $size }) => {
    switch ($size) {
      case 'small': return '0.5rem 1rem';
      case 'large': return '1rem 2rem';
      default: return '0.75rem 1.5rem';
    }
  }};
  font-size: ${({ $size }) => {
    switch ($size) {
      case 'small': return '0.875rem';
      case 'large': return '1.125rem';
      default: return '1rem';
    }
  }};
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  background: ${({ theme, $variant }) => {
    switch ($variant) {
      case 'secondary': return theme.surface;
      case 'outline': return 'transparent';
      default: return theme.primary;
    }
  }};
  color: ${({ theme, $variant }) => {
    switch ($variant) {
      case 'secondary': return theme.text.primary;
      case 'outline': return theme.primary;
      default: return theme.text.button;
    }
  }};
  border: 2px solid ${({ theme, $variant }) => 
    $variant === 'outline' ? theme.primary : 'transparent'
  };
`;

export const Input = styled.input`
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  background: ${({ theme }) => theme.surface};
  color: ${({ theme }) => theme.text.primary};
  width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'auto')};
`;

// Loading Components
export const LoadingSpinner = styled(motion.div)`
  border: 4px solid ${({ theme }) => theme.background};
  border-top: 4px solid ${({ theme }) => theme.primary};
  border-radius: 50%;
  width: ${({ size }) => size || '40px'};
  height: ${({ size }) => size || '40px'};
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Layout Components
export const Layout = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: ${({ theme }) => theme.background};
`;

export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  width: 100%;
`;

export const Navbar = ({ onConnect, onDisconnect, isConnected, address, balance }) => {
  const location = useLocation();
  
  return (
    <Nav>
      <NavContainer>
        <NavLinks>
          <Logo to="/">
            <span>GameX</span>Platform
          </Logo>
          <NavLink to="/" $active={location.pathname === '/'}>
            Home
          </NavLink>
          <NavLink to="/game" $active={location.pathname === '/game'}>
            Play
          </NavLink>
        </NavLinks>
        <WalletInfo>
          {isConnected ? (
            <>
              <Balance>
                <span>Balance:</span>
                {formatAmount(balance)} GameX
              </Balance>
              <Address onClick={() => {
                navigator.clipboard.writeText(address);
                toast.success('Address copied!');
              }}>
                {formatAddress(address)}
              </Address>
              <Button onClick={onDisconnect} $variant="outline">
                Disconnect
              </Button>
            </>
          ) : (
            <Button onClick={onConnect} $variant="primary">
              Connect Wallet
            </Button>
          )}
        </WalletInfo>
      </NavContainer>
    </Nav>
  );
};

// Game Components
export const GameCard = styled.div`
  background: ${({ theme }) => theme.surface};
  border-radius: 24px;
  padding: 2rem;
  box-shadow: ${({ theme }) => theme.shadow.md};
`;

export const DiceDisplay = styled(motion.div)`
  font-size: 4rem;
  text-align: center;
  margin: 2rem 0;
`;

export const GameStats = ({ stats }) => {
  return (
    <StatsContainer>
      {Object.entries(stats).map(([key, value]) => (
        <StatItem key={key}>
          <h4>{key}</h4>
          <p>{value}</p>
        </StatItem>
      ))}
    </StatsContainer>
  );
};

export const BetControls = ({ 
  amount, 
  onAmountChange, 
  onBet, 
  isLoading 
}) => {
  return (
    <BetControlsWrapper>
      <Input
        type="number"
        value={amount}
        onChange={onAmountChange}
        placeholder="Enter bet amount"
        $fullWidth
      />
      <Button 
        onClick={onBet}
        disabled={isLoading}
        $variant="primary"
        $size="large"
      >
        {isLoading ? <LoadingSpinner size="24px" /> : 'Place Bet'}
      </Button>
    </BetControlsWrapper>
  );
};

// Modal Component
export const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  
  return (
    <Portal>
      <ModalOverlay
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <ModalContent
          onClick={e => e.stopPropagation()}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
        >
          {children}
        </ModalContent>
      </ModalOverlay>
    </Portal>
  );
};

// Notification Component
export const Notification = ({ type, message }) => {
  return (
    <NotificationWrapper $type={type}>
      <NotificationIcon $type={type} />
      <NotificationMessage>{message}</NotificationMessage>
    </NotificationWrapper>
  );
};

// GameProgress Component
export const GameProgress = ({ currentState, amount, result }) => {
  return (
    <GameProgressWrapper>
      <StateIndicator $state={currentState}>
        {GAME_STATES[currentState]}
      </StateIndicator>
      {amount && <Amount>Bet Amount: {formatAmount(amount)} GameX</Amount>}
      {result && <Result>Result: {result}</Result>}
    </GameProgressWrapper>
  );
};

// Tooltip Component
export const Tooltip = ({ content, children }) => {
  const [isVisible, setIsVisible] = React.useState(false);
  
  return (
    <TooltipWrapper 
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && <TooltipContent>{content}</TooltipContent>}
    </TooltipWrapper>
  );
};

// Portal Component
export const Portal = ({ children }) => {
  const [mounted, setMounted] = React.useState(false);
  
  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  return mounted
    ? ReactDOM.createPortal(
        children,
        document.querySelector('#portal-root') || document.body
      )
    : null;
};

// Error Boundary Component
export const ErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    if (hasError) {
      console.error('Error caught by boundary');
    }
  }, [hasError]);

  if (hasError) {
    return <div>Something went wrong</div>;
  }

  return children;
};

// Animation variants
export const pageTransition = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

export const modalTransition = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 },
};

export const diceAnimation = {
  initial: { rotate: 0 },
  animate: { rotate: 360 },
  transition: { duration: 0.5 }
};

// Admin Components
export const AdminPanel = () => {
  const { isConnected, isAdmin, contract } = useWallet();
  const [houseEdge, setHouseEdge] = useState('');
  const [mintAmount, setMintAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleMint = async () => {
    try {
      setIsLoading(true);
      await contract.mintTokens(ethers.utils.parseEther(mintAmount));
      toast.success('Tokens minted successfully');
    } catch (error) {
      toast.error('Failed to mint tokens');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetHouseEdge = async () => {
    try {
      setIsLoading(true);
      await contract.setHouseEdge(Number(houseEdge));
      toast.success('House edge updated successfully');
    } catch (error) {
      toast.error('Failed to update house edge');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected || !isAdmin) {
    return (
      <AdminContainer>
        <AdminSection>
          <h2>Admin Access Required</h2>
          <p>Please connect with an admin wallet to access this section.</p>
        </AdminSection>
      </AdminContainer>
    );
  }

  return (
    <AdminContainer>
      <AdminSection>
        <h2>Game Settings</h2>
        <AdminForm>
          <FormGroup>
            <Label>House Edge (%)</Label>
            <Input
              type="number"
              value={houseEdge}
              onChange={(e) => setHouseEdge(e.target.value)}
              placeholder="Enter house edge percentage"
            />
            <Button
              onClick={handleSetHouseEdge}
              disabled={isLoading}
              $variant="primary"
            >
              Update House Edge
            </Button>
          </FormGroup>
          
          <FormGroup>
            <Label>Mint Tokens</Label>
            <Input
              type="number"
              value={mintAmount}
              onChange={(e) => setMintAmount(e.target.value)}
              placeholder="Enter amount to mint"
            />
            <Button
              onClick={handleMint}
              disabled={isLoading}
              $variant="primary"
            >
              Mint Tokens
            </Button>
          </FormGroup>
        </AdminForm>
      </AdminSection>
    </AdminContainer>
  );
};

// Auth Components
export const ConnectWallet = () => {
  const { connectWallet, isConnecting } = useWallet();
  const navigate = useNavigate();

  const handleConnect = async () => {
    try {
      await connectWallet();
      navigate('/game');
    } catch (error) {
      toast.error('Failed to connect wallet');
    }
  };

  return (
    <ConnectContainer>
      <Title>Connect Your Wallet</Title>
      <Description>
        Please connect your wallet to access the game.
      </Description>
      <Button
        onClick={handleConnect}
        disabled={isConnecting}
        $variant="primary"
        $size="large"
      >
        {isConnecting ? <LoadingSpinner size="24px" /> : 'Connect Wallet'}
      </Button>
    </ConnectContainer>
  );
};

// Home Components
export const HomePage = () => {
  const { isConnected } = useWallet();
  const [gameStats, setGameStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch game statistics
        setGameStats({
          totalGames: 1000,
          totalWagered: '100000',
          totalWon: '95000'
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <HomeContainer
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
    >
      <HeroSection>
        <Title>Welcome to GameX Platform</Title>
        <Description>
          Experience the thrill of decentralized gaming with our provably fair dice game.
        </Description>
        {!isConnected && (
          <Button
            as={Link}
            to="/connect"
            $variant="primary"
            $size="large"
          >
            Get Started
          </Button>
        )}
      </HeroSection>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <StatsGrid>
          <StatCard>
            <StatValue>{gameStats?.totalGames}</StatValue>
            <StatLabel>Total Games</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{formatAmount(gameStats?.totalWagered)} GameX</StatValue>
            <StatLabel>Total Wagered</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{formatAmount(gameStats?.totalWon)} GameX</StatValue>
            <StatLabel>Total Won</StatLabel>
          </StatCard>
        </StatsGrid>
      )}

      <FeaturesSection>
        <FeatureCard>
          <FeatureIcon>🎲</FeatureIcon>
          <FeatureTitle>Provably Fair</FeatureTitle>
          <FeatureDescription>
            All game outcomes are verifiable on the blockchain
          </FeatureDescription>
        </FeatureCard>
        {/* Add more feature cards */}
      </FeaturesSection>
    </HomeContainer>
  );
};

// Leaderboard Components
export const Leaderboard = () => {
  const [leaders, setLeaders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        // Fetch leaderboard data
        setLeaders([
          { address: '0x123...', wins: 50, totalWon: '1000' },
          // ... more entries
        ]);
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <LeaderboardContainer>
      <Title>Top Players</Title>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <LeaderboardTable>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Player</th>
              <th>Wins</th>
              <th>Total Won</th>
            </tr>
          </thead>
          <tbody>
            {leaders.map((leader, index) => (
              <LeaderboardRow key={leader.address}>
                <td>{index + 1}</td>
                <td>{formatAddress(leader.address)}</td>
                <td>{leader.wins}</td>
                <td>{formatAmount(leader.totalWon)} GameX</td>
              </LeaderboardRow>
            ))}
          </tbody>
        </LeaderboardTable>
      )}
    </LeaderboardContainer>
  );
};

// Settings Components
export const Settings = () => {
  const { updateSettings, settings } = useWallet();
  const [formData, setFormData] = useState({
    soundEnabled: true,
    notifications: true,
    // ... other settings
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateSettings(formData);
      toast.success('Settings updated successfully');
    } catch (error) {
      toast.error('Failed to update settings');
    }
  };

  return (
    <SettingsContainer>
      <Title>Game Settings</Title>
      <SettingsForm onSubmit={handleSubmit}>
        <FormGroup>
          <Label>
            <Input
              type="checkbox"
              checked={formData.soundEnabled}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                soundEnabled: e.target.checked
              }))}
            />
            Enable Sound Effects
          </Label>
        </FormGroup>
        <FormGroup>
          <Label>
            <Input
              type="checkbox"
              checked={formData.notifications}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                notifications: e.target.checked
              }))}
            />
            Enable Notifications
          </Label>
        </FormGroup>
        <Button type="submit" $variant="primary">
          Save Settings
        </Button>
      </SettingsForm>
    </SettingsContainer>
  );
};

// Export styled components
export {
  Nav,
  NavContainer,
  NavLinks,
  Logo,
  NavLink,
  WalletInfo,
  Balance,
  Address,
  GameContainer,
  StatsContainer,
  StatItem,
  ModalOverlay,
  ModalContent,
  NotificationWrapper,
  NotificationIcon,
  NotificationMessage,
  GameProgressWrapper,
  StateIndicator,
  Amount,
  Result,
  TooltipWrapper,
  TooltipContent,
  BetControlsWrapper,
  GameHistoryWrapper,
  HistoryItem,
  Badge,
  Card
} from './styles'; 