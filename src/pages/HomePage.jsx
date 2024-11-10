import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useWallet } from "../contexts/WalletContext";
import { GameCard } from "../components/game/GameCard";
import { Loading } from "../components/common/Loading";
import { formatAmount } from "../utils/helpers";

const HomeContainer = styled(motion.div)`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Hero = styled(motion.div)`
  text-align: center;
  margin-bottom: 4rem;

  h1 {
    font-size: 3.5rem;
    background: ${({ theme }) => theme.gradients.primary};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 1rem;
  }

  p {
    color: ${({ theme }) => theme.text.secondary};
    font-size: 1.25rem;
    max-width: 600px;
    margin: 0 auto;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  margin-bottom: 4rem;
`;

const StatCard = styled(motion.div)`
  background: ${({ theme }) => theme.surface};
  padding: 2rem;
  border-radius: 16px;
  text-align: center;
  box-shadow: ${({ theme }) => theme.shadow.md};

  h3 {
    color: ${({ theme }) => theme.text.secondary};
    font-size: 0.875rem;
    margin-bottom: 0.5rem;
  }

  p {
    font-size: 2rem;
    font-weight: bold;
    background: ${({ theme }) => theme.gradients.primary};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const GamesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 4rem;
`;

const GameLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-4px);
  }
`;

const GameThumbnail = styled(GameCard)`
  height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 2rem;

  h2 {
    font-size: 2rem;
    margin-bottom: 1rem;
  }

  p {
    color: ${({ theme }) => theme.text.secondary};
    margin-bottom: 2rem;
  }

  .icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  .status {
    padding: 0.5rem 1rem;
    border-radius: 9999px;
    font-size: 0.875rem;
    background: ${({ $live, theme }) =>
      $live ? theme.gradients.success : theme.gradients.warning};
    color: ${({ theme }) => theme.text.inverse};
  }
`;

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
  visible: { opacity: 1, y: 0 },
};

export function HomePage() {
  const { isConnected, tokenContract: token, diceContract: dice } = useWallet();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!token || !dice) return;

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
          totalGames: totalGames.toString(),
          totalPayout: formatAmount(totalPayout),
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [token, dice]);

  if (isLoading) {
    return <Loading message="Loading game stats..." />;
  }

  const games = [
    {
      id: "dice",
      name: "Dice Game",
      description: "Roll the dice and multiply your tokens!",
      icon: "🎲",
      path: "/game",
      live: true,
    },
    {
      id: "roulette",
      name: "Roulette",
      description: "Classic casino roulette with multiple betting options",
      icon: "🎰",
      path: "/roulette",
      live: false,
    },
    {
      id: "blackjack",
      name: "Blackjack",
      description: "Coming soon - Test your luck against the dealer",
      icon: "🃏",
      path: "/blackjack",
      live: false,
    },
  ];

  return (
    <HomeContainer
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Hero variants={itemVariants}>
        <h1>Decentralized Casino</h1>
        <p>Experience provably fair gaming with blockchain technology</p>
      </Hero>

      {stats && (
        <StatsGrid>
          <StatCard variants={itemVariants}>
            <h3>Total Supply</h3>
            <p>{stats.totalSupply} TOKENS</p>
          </StatCard>
          <StatCard variants={itemVariants}>
            <h3>Prize Pool</h3>
            <p>{stats.diceBalance} TOKENS</p>
          </StatCard>
          <StatCard variants={itemVariants}>
            <h3>Total Games</h3>
            <p>{stats.totalGames}</p>
          </StatCard>
          <StatCard variants={itemVariants}>
            <h3>Total Payouts</h3>
            <p>{stats.totalPayout} TOKENS</p>
          </StatCard>
        </StatsGrid>
      )}

      <GamesGrid>
        {games.map((game) => (
          <GameLink key={game.id} to={game.path}>
            <GameThumbnail variants={itemVariants} $live={game.live}>
              <div className="icon">{game.icon}</div>
              <h2>{game.name}</h2>
              <p>{game.description}</p>
              <span className="status">
                {game.live ? "Live" : "Coming Soon"}
              </span>
            </GameThumbnail>
          </GameLink>
        ))}
      </GamesGrid>
    </HomeContainer>
  );
}

export default { HomePage };
