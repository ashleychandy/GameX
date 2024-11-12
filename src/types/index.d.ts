interface GameData {
  isActive: boolean;
  chosenNumber: number;
  amount: string;
  status: number;
  timestamp: string;
  result: string;
  payout: string;
  randomWord: string;
}

interface ContractState {
  paused: boolean;
  houseEdge: string;
  minBet: string;
  maxBet: string;
  balance: string;
  playerStats: PlayerStats;
} 