export interface GameState {
  isActive: boolean;
  chosenNumber: string;
  result: string;
  amount: string;
  timestamp: string;
  payout: string;
  randomWord: string;
  status: string;
}

export interface GameStats {
  winRate: string;
  averageBet: string;
  totalGamesWon: string;
  totalGamesLost: string;
}

export interface RequestInfo {
  isPending: boolean;
  requestId: string;
  timestamp: number;
}
