import { useState } from 'react';
import { useWallet } from '../../contexts/WalletContext';
import { formatAmount, parseAmount } from '../../utils/format';
import { GAME_CONFIG } from '../../utils/constants';

export function BetForm({ onSubmit, disabled }) {
  const { balance } = useWallet();
  const [amount, setAmount] = useState('');
  const [number, setNumber] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || !number) return;

    const parsedAmount = parseAmount(amount);
    if (parsedAmount.gt(balance)) {
      toast.error('Insufficient balance');
      return;
    }

    onSubmit({
      amount: parsedAmount,
      number: parseInt(number)
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Amount (GameX)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min={formatAmount(GAME_CONFIG.MIN_BET)}
          max={formatAmount(GAME_CONFIG.MAX_BET)}
          step="0.01"
          disabled={disabled}
        />
      </div>
      {/* Rest of the form */}
    </form>
  );
} 