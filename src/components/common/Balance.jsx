import { useWallet } from '../../contexts/WalletContext';
import { formatAmount } from '../../utils/format';

export function Balance() {
  const { balance } = useWallet();
  
  return (
    <div className="balance">
      Balance: {formatAmount(balance)} GameX
    </div>
  );
} 