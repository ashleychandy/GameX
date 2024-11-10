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

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${({ theme }) => theme.shadow.lg};
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

const CTAButton = styled(Button)`
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

export function HomePage() {
  const { isConnected, tokenContract: token, diceContract: dice } = useWallet();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      if (!isConnected || !token || !dice) {
        setStats(null);
        return;
      }

      try {
        setIsLoading(true);
        const [totalSupply, diceBalance, totalGames, totalPayout] =
          await Promise.all([
            token.totalSupply(),
            token.balanceOf(dice.address),
            dice.totalGamesPlayed(),
            dice.totalPayoutAmount(),
          ]);

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
    // Set up polling for stats updates
    const interval = setInterval(fetchStats, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [isConnected, token, dice]);

  const games = [
    {
      id: "dice",
      name: "Dice Game",
      description: "Roll the dice and multiply your tokens! Choose your number and place your bet.",
      icon: "🎲",
      path: "/game",
      live: true,
    },
    {
      id: "roulette",
      name: "Roulette",
      description: "Classic casino roulette with multiple betting options. Coming soon!",
      icon: "🎰",
      path: "/roulette",
      live: false,
    },
    {
      id: "blackjack",
      name: "Blackjack",
      description: "Test your luck against the dealer in this classic card game. Coming soon!",
      icon: "🃏",
      path: "/blackjack",
      live: false,
    },
  ];

  return (
    <HomeContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Hero>
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Decentralized Casino
        </motion.h1>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Experience provably fair gaming powered by blockchain technology. 
          Play, win, and earn crypto tokens in a transparent environment.
        </motion.p>
        <CTAButton
          as={Link}
          to="/game"
          $variant="primary"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Start Playing Now
        </CTAButton>
      </Hero>

      <StatsWrapper $loading={isLoading}>
        <StatsGrid
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {isConnected ? (
            stats ? (
              <>
                <StatCard>
                  <h3>Total Supply</h3>
                  <p>{stats.totalSupply} DICE</p>
                </StatCard>
                <StatCard>
                  <h3>Prize Pool</h3>
                  <p>{stats.diceBalance} DICE</p>
                </StatCard>
                <StatCard>
                  <h3>Total Games</h3>
                  <p>{stats.totalGames}</p>
                </StatCard>
                <StatCard>
                  <h3>Total Payouts</h3>
                  <p>{stats.totalPayout} DICE</p>
                </StatCard>
              </>
            ) : (
              <LoadingOverlay
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Loading message="Loading stats..." />
              </LoadingOverlay>
            )
          ) : (
            <StatCard>
              <h3>Connect Wallet</h3>
              <p>Connect your wallet to view game statistics</p>
            </StatCard>
          )}
        </StatsGrid>
      </StatsWrapper>

      <GamesSection
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <h2>Available Games</h2>
        <GamesGrid>
          {games.map((game, index) => (
            <GameItem
              key={game.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 * index }}
            >
              <GameStatus $live={game.live}>
                {game.live ? "Live" : "Coming Soon"}
              </GameStatus>
              <GameContent>
                <div className="icon">{game.icon}</div>
                <h3>{game.name}</h3>
                <p>{game.description}</p>
                <PlayButton
                  as={Link}
                  to={game.path}
                  $variant={game.live ? "primary" : "secondary"}
                  disabled={!game.live}
                >
                  {game.live ? "Play Now" : "Coming Soon"}
                </PlayButton>
              </GameContent>
            </GameItem>
          ))}
        </GamesGrid>
      </GamesSection>
    </HomeContainer>
  );
}

export default HomePage;
