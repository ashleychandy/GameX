import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import { ethers } from 'ethers';
import { Button } from '../components/common/Button';
import { GAME_TOKEN_ABI } from '../contracts/abis';
import { formatAmount } from '../utils/helpers';

const HomeContainer = styled(motion.div)`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Hero = styled(motion.div)`
  text-align: center;
  margin-bottom: 4rem;
  padding: 4rem 2rem;
  background: ${({ theme }) => theme.surface};
  border-radius: 1rem;
  box-shadow: ${({ theme }) => theme.shadow.lg};
`;

const Title = styled(motion.h1)`
  font-size: 3.5rem;
  margin-bottom: 1rem;
  background: ${({ theme }) => theme.gradients.primary};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const Subtitle = styled(motion.p)`
  font-size: 1.2rem;
  color: ${({ theme }) => theme.text.secondary};
  margin-bottom: 2rem;
`;

const GamesGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin: 2rem 0;
`;

const GameCard = styled(motion.div)`
  background: ${({ theme }) => theme.surface};
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: ${({ theme }) => theme.shadow.md};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: ${({ theme }) => theme.shadow.lg};
  }
`;

const StatsSection = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  margin: 4rem 0;
`;

const StatCard = styled(motion.div)`
  background: ${({ theme }) => theme.surface};
  padding: 2rem;
  border-radius: 1rem;
  text-align: center;
  box-shadow: ${({ theme }) => theme.shadow.md};
`;

const TokenSection = styled(motion.div)`
  background: ${({ theme }) => theme.surface};
  padding: 2rem;
  border-radius: 1rem;
  margin: 2rem 0;
  box-shadow: ${({ theme }) => theme.shadow.md};
`;

const HomePage = () => {
  const navigate = useNavigate();
  const { isConnected, address, provider } = useWallet();
  const [gameStats, setGameStats] = useState({
    totalPlayers: 0,
    totalBets: 0,
    totalVolume: 0,
  });
  const [tokenInfo, setTokenInfo] = useState({
    balance: '0',
    totalSupply: '0',
    price: '0',
  });

  // Load game statistics
  useEffect(() => {
    const loadGameStats = async () => {
      if (provider) {
        try {
          const diceGameAddress = import.meta.env.VITE_DICE_GAME_ADDRESS;
          const diceContract = new ethers.Contract(
            diceGameAddress,
            ['function getTotalPlayers() view returns (uint256)',
             'function getTotalBets() view returns (uint256)',
             'function getTotalVolume() view returns (uint256)'],
            provider
          );

          const [players, bets, volume] = await Promise.all([
            diceContract.getTotalPlayers(),
            diceContract.getTotalBets(),
            diceContract.getTotalVolume(),
          ]);

          setGameStats({
            totalPlayers: players.toNumber(),
            totalBets: bets.toNumber(),
            totalVolume: ethers.utils.formatEther(volume),
          });
        } catch (error) {
          console.error('Error loading game stats:', error);
        }
      }
    };

    loadGameStats();
    const interval = setInterval(loadGameStats, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [provider]);

  // Load token information
  useEffect(() => {
    const loadTokenInfo = async () => {
      if (provider && address) {
        try {
          const tokenAddress = import.meta.env.VITE_TOKEN_ADDRESS;
          const tokenContract = new ethers.Contract(
            tokenAddress,
            GAME_TOKEN_ABI,
            provider
          );

          const [balance, totalSupply] = await Promise.all([
            tokenContract.balanceOf(address),
            tokenContract.totalSupply(),
          ]);

          setTokenInfo({
            balance: ethers.utils.formatEther(balance),
            totalSupply: ethers.utils.formatEther(totalSupply),
            price: '1.00', // Add price feed integration if needed
          });
        } catch (error) {
          console.error('Error loading token info:', error);
        }
      }
    };

    loadTokenInfo();
    const interval = setInterval(loadTokenInfo, 15000); // Refresh every 15s
    return () => clearInterval(interval);
  }, [provider, address]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
    },
  };

  return (
    <HomeContainer
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Hero variants={itemVariants}>
        <Title variants={itemVariants}>
          Welcome to GameX Platform
        </Title>
        <Subtitle variants={itemVariants}>
          Experience the future of blockchain gaming with provably fair games
        </Subtitle>
        {!isConnected && (
          <Button
            variant="primary"
            size="large"
            onClick={() => navigate('/connect')}
          >
            Connect Wallet to Start Playing
          </Button>
        )}
      </Hero>

      <GamesGrid variants={itemVariants}>
        <GameCard
          onClick={() => navigate('/dice')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <h2>Dice Game</h2>
          <p>Roll the dice and multiply your tokens</p>
          <Button variant="secondary">Play Now</Button>
        </GameCard>
      </GamesGrid>

      <StatsSection variants={itemVariants}>
        <StatCard variants={itemVariants}>
          <h3>Total Players</h3>
          <p>{gameStats.totalPlayers.toLocaleString()}</p>
        </StatCard>

        <StatCard variants={itemVariants}>
          <h3>Total Bets</h3>
          <p>{gameStats.totalBets.toLocaleString()}</p>
        </StatCard>

        <StatCard variants={itemVariants}>
          <h3>Total Volume</h3>
          <p>{formatAmount(gameStats.totalVolume)} GameX</p>
        </StatCard>
      </StatsSection>

      {isConnected && (
        <TokenSection variants={itemVariants}>
          <h2>Your GameX Tokens</h2>
          <div style={{ marginTop: '1rem' }}>
            <p>Balance: {formatAmount(tokenInfo.balance)} GameX</p>
            <p>Token Price: ${tokenInfo.price}</p>
            <p>Total Supply: {formatAmount(tokenInfo.totalSupply)} GameX</p>
          </div>
          <Button
            variant="primary"
            onClick={() => window.open('https://exchange.gamex.io', '_blank')}
            style={{ marginTop: '1rem' }}
          >
            Get More Tokens
          </Button>
        </TokenSection>
      )}
    </HomeContainer>
  );
};

export default HomePage;
