import { formatAmount } from '../../utils/format';

export function GameHistory({ history }) {
  return (
    <div className="game-history">
      {history.map((game, index) => (
        <div key={index} className="game-record">
          <span>Bet: {formatAmount(game.amount)} GameX</span>
          <span>Number: {game.chosenNumber}</span>
          <span>Result: {game.rolledNumber}</span>
          <span>Payout: {formatAmount(game.payout)} GameX</span>
        </div>
      ))}
    </div>
  );
} 