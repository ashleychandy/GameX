import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useWallet } from "../contexts/WalletContext";
import { GameCard } from "../components/game/GameCard";
import { Loading } from "../components/common/Loading";
import { formatAmount, formatNumber } from "../utils/helpers";
import { Button } from "../components/common/Button";
import { toast } from "react-toastify";
import { ethers } from "ethers";
import { MotionLink } from '../components/common/MotionLink';

const HomeContainer = styled(motion.div)`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  min-height: calc(100vh - 200px); // Account for header/footer
`;

const Hero = styled(motion.section)`
  text-align: center;
  margin: 4rem 0 6rem;
  padding: 0 1rem;

  h1 {
    font-size: clamp(2.5rem, 5vw, 4rem);
    line-height: 1.2;
    background: ${({ theme }) => theme.gradients.primary};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 1.5rem;
  }

  p {
    color: ${({ theme }) => theme.text.secondary};
    font-size: clamp(1rem, 2vw, 1.25rem);
    max-width: 600px;
    margin: 0 auto 2rem;
    line-height: 1.6;
  }
`;

const StatsGrid = styled(motion.section)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 4rem;
  padding: 0 1rem;
`;

const StatCard = styled(motion.div)`
  background: ${({ theme }) => theme.surface};
  padding: 2rem;
  border-radius: 1rem;
  text-align: center;
  box-shadow: ${({ theme }) => theme.shadow.md};
  border: 1px solid ${({ theme }) => theme.border};
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-4px);
  }

  h3 {
    color: ${({ theme }) => theme.text.secondary};
    font-size: 1rem;
    margin-bottom: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  p {
    font-size: clamp(1.5rem, 3vw, 2rem);
    font-weight: bold;
    background: ${({ theme }) => theme.gradients.primary};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const GamesSection = styled(motion.section)`
  margin: 4rem 0;
  padding: 0 1rem;

  h2 {
    text-align: center;
    font-size: 2rem;
    margin-bottom: 2rem;
    color: ${({ theme }) => theme.text.primary};
  }
`;

const GamesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
`;

const GameItem = styled(motion.div)`
  position: relative;
  height: 100%;
  min-height: 320px;
  border-radius: 1rem;
  overflow: hidden;
  background: ${({ theme }) => theme.surface};
  border: 1px solid ${({ theme }) => theme.border};
  transition: all 0.3s ease;
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};

  &:hover {
    transform: ${({ $disabled }) => ($disabled ? 'none' : 'translateY(-4px)')};
    box-shadow: ${({ theme, $disabled }) => ($disabled ? 'none' : theme.shadow.lg)};
  }
`;

const GameContent = styled.div`
  padding: 2rem;
  text-align: center;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  .icon {
    font-size: 4rem;
    margin-bottom: 1.5rem;
  }

  h3 {
    font-size: 1.75rem;
    margin-bottom: 1rem;
    color: ${({ theme }) => theme.text.primary};
  }

  p {
    color: ${({ theme }) => theme.text.secondary};
    margin-bottom: 2rem;
    line-height: 1.6;
  }
`;

const GameStatus = styled.span`
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
  background: ${({ $live, theme }) =>
    $live ? theme.success + '20' : theme.warning + '20'};
  color: ${({ $live, theme }) =>
    $live ? theme.success : theme.warning};
`;

const PlayButton = styled(Button)`
  width: auto;
  min-width: 150px;
`;

const CTAButton = styled(motion.button)`
  padding: 1rem 2.5rem;
  font-size: 1.2rem;
  margin-top: 2rem;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadow.lg};
  }
`;

const StatsWrapper = styled(motion.div)`
  opacity: ${({ $loading }) => ($loading ? 0.7 : 1)};
  transition: opacity 0.3s ease;
`;

const LoadingOverlay = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  border-radius: 1rem;
`;

const TokenomicsSection = styled(motion.section)`
  margin: 4rem 0;
  padding: 0 1rem;
  text-align: center;

  h2 {
    font-size: 2rem;
    margin-bottom: 2rem;
    color: ${({ theme }) => theme.text.primary};
  }
`;

const TokenomicsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
`;

const TokenomicsCard = styled(motion.div)`
  background: ${({ theme }) => theme.surface};
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: ${({ theme }) => theme.shadow.md};
  border: 1px solid ${({ theme }) => theme.border};

  h3 {
    color: ${({ theme }) => theme.text.secondary};
    margin-bottom: 1rem;
  }

  p {
    font-size: 1.5rem;
    font-weight: bold;
    background: ${({ theme }) => theme.gradients.primary};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

export function HomePage() {
  const { isConnected, tokenContract: token, diceContract: dice } = useWallet();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      if (!isConnected || !token || !dice) {
        setStats(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        const totalSupplyPromise = token.totalSupply?.() || Promise.resolve(BigInt(0));
        const diceBalancePromise = token.balanceOf?.(dice?.address || ethers.ZeroAddress) || Promise.resolve(BigInt(0));
        const totalGamesPromise = dice.totalGamesPlayed?.() || Promise.resolve(BigInt(0));
        const totalPayoutPromise = dice.totalPayoutAmount?.() || Promise.resolve(BigInt(0));

        const [totalSupply, diceBalance, totalGames, totalPayout] = await Promise.all([
          totalSupplyPromise,
          diceBalancePromise,
          totalGamesPromise,
          totalPayoutPromise,
        ]);

        if (totalSupply === undefined || diceBalance === undefined || 
            totalGames === undefined || totalPayout === undefined) {
          throw new Error("Invalid data received from contracts");
        }

        setStats({
          totalSupply: formatAmount(totalSupply),
          diceBalance: formatAmount(diceBalance),
          totalGames: formatNumber(totalGames.toString()),
          totalPayout: formatAmount(totalPayout),
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
        toast.error("Failed to load game statistics");
        setStats(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => {
      clearInterval(interval);
      setIsLoading(false);
    };
  }, [isConnected, token, dice]);

  return (
    <HomeContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Hero
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1 }
        }}
      >
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          GameX
        </motion.h1>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          The next generation gaming token with real utility. 
          Play games and earn rewards - all powered by GameX.
        </motion.p>
        <CTAButton
          as={motion(Link)}
          to="/token"
          $variant="primary"
          animate={{ opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Buy GAMEX
        </CTAButton>
      </Hero>

      <StatsWrapper $loading={isLoading}>
        <StatsGrid
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {isConnected ? (
            isLoading ? (
              <StatCard style={{ gridColumn: '1 / -1', minHeight: '200px' }}>
                <Loading size="medium" message="Loading token statistics..." />
              </StatCard>
            ) : stats ? (
              <>
                <StatCard>
                  <h3>Total Supply</h3>
                  <p>{stats.totalSupply} GAMEX</p>
                </StatCard>
                <StatCard>
                  <h3>Staking Pool</h3>
                  <p>{stats.diceBalance} GAMEX</p>
                </StatCard>
                <StatCard>
                  <h3>Token Price</h3>
                  <p>$0.XX USD</p>
                </StatCard>
                <StatCard>
                  <h3>Market Cap</h3>
                  <p>$XXX,XXX USD</p>
                </StatCard>
              </>
            ) : (
              <StatCard style={{ gridColumn: '1 / -1' }}>
                <h3>Error Loading Stats</h3>
                <p>Unable to fetch game statistics. Please try again later.</p>
                <Button 
                  onClick={() => window.location.reload()} 
                  $variant="secondary"
                  style={{ marginTop: '1rem' }}
                >
                  Retry
                </Button>
              </StatCard>
            )
          ) : (
            <StatCard style={{ gridColumn: '1 / -1' }}>
              <h3>Connect Wallet</h3>
              <p>Connect your wallet to view token statistics and start using GameX</p>
            </StatCard>
          )}
        </StatsGrid>
      </StatsWrapper>

      <GamesSection
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <h2>Token Utilities</h2>
        <GamesGrid>
          <GameItem>
            <GameContent>
              <div className="icon">💰</div>
              <h3>Staking</h3>
              <p>Stake your GameX tokens to earn passive rewards and exclusive benefits.</p>
              <PlayButton as={Link} to="/staking" $variant="primary">
                Stake Now
              </PlayButton>
            </GameContent>
          </GameItem>

          <GameItem>
            <GameContent>
              <div className="icon">🎮</div>
              <h3>Gaming</h3>
              <p>Use GameX tokens to play games and win more tokens through skilled gameplay.</p>
              <PlayButton as={Link} to="/games" $variant="primary">
                Play Games
              </PlayButton>
            </GameContent>
          </GameItem>

          <GameItem>
            <GameContent>
              <div className="icon">🏛️</div>
              <h3>Governance</h3>
              <p>Participate in GameX DAO and vote on important protocol decisions.</p>
              <PlayButton as={Link} to="/governance" $variant="primary">
                View Proposals
              </PlayButton>
            </GameContent>
          </GameItem>
        </GamesGrid>
      </GamesSection>

      <TokenomicsSection>
        <h2>GameX Tokenomics</h2>
        <TokenomicsGrid>
          <TokenomicsCard>
            <h3>Total Supply</h3>
            <p>1,000,000,000 GAMEX</p>
          </TokenomicsCard>
          <TokenomicsCard>
            <h3>Staking APY</h3>
            <p>Up to 25% APY</p>
          </TokenomicsCard>
          <TokenomicsCard>
            <h3>Gaming Rewards</h3>
            <p>15% of Supply</p>
          </TokenomicsCard>
          <TokenomicsCard>
            <h3>DAO Treasury</h3>
            <p>10% of Supply</p>
          </TokenomicsCard>
        </TokenomicsGrid>
      </TokenomicsSection>
    </HomeContainer>
  );
}

export default HomePage;
