import { useWallet } from '../../contexts/WalletContext';
import { formatAmount } from '../../utils/format';

export function GameInfo({ gameData }) {
  const { balance } = useWallet();

  return (
    <div className="game-info">
      <div className="balance-info">
        <span>Your Balance:</span>
        <span>{formatAmount(balance)} GameX</span>
      </div>
      {/* Rest of the component */}
    </div>
  );
} 