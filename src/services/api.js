import { ethers } from 'ethers';
import { DICE_GAME_ABI, DICE_GAME_ADDRESS } from '../config/contracts';
import { ContractError } from '../utils/errors';

class ApiService {
  constructor() {
    this.provider = null;
    this.contract = null;
  }

  initialize(provider) {
    this.provider = provider;
    if (provider) {
      this.contract = new ethers.Contract(
        DICE_GAME_ADDRESS,
        DICE_GAME_ABI,
        provider
      );
    }
  }

  async getGameStats(address) {
    try {
      if (!this.contract) throw new ContractError('Contract not initialized');
      
      const stats = await this.contract.getPlayerStats(address);
      return {
        gamesPlayed: stats.gamesPlayed.toString(),
        totalWins: stats.wins.toString(),
        totalLosses: stats.losses.toString(),
        totalWinnings: ethers.formatEther(stats.winnings)
      };
    } catch (error) {
      throw new ContractError(error.message);
    }
  }

  async getMinBet() {
    try {
      if (!this.contract) throw new ContractError('Contract not initialized');
      
      const minBet = await this.contract.minBet();
      return ethers.formatEther(minBet);
    } catch (error) {
      throw new ContractError(error.message);
    }
  }

  async getMaxBet() {
    try {
      if (!this.contract) throw new ContractError('Contract not initialized');
      
      const maxBet = await this.contract.maxBet();
      return ethers.formatEther(maxBet);
    } catch (error) {
      throw new ContractError(error.message);
    }
  }

  async placeBet(number, amount) {
    try {
      if (!this.contract) throw new ContractError('Contract not initialized');
      
      const tx = await this.contract.placeBet(number, {
        value: ethers.parseEther(amount.toString())
      });
      
      return await tx.wait();
    } catch (error) {
      throw new ContractError(error.message);
    }
  }

  async getGameHistory(address, limit = 10) {
    try {
      if (!this.contract) throw new ContractError('Contract not initialized');
      
      const filter = this.contract.filters.GameResult(address);
      const events = await this.contract.queryFilter(filter, -10000, 'latest');
      
      return events
        .map(event => ({
          txHash: event.transactionHash,
          number: event.args.number,
          result: event.args.result,
          amount: ethers.formatEther(event.args.amount),
          won: event.args.won,
          timestamp: new Date(event.block.timestamp * 1000)
        }))
        .slice(0, limit);
    } catch (error) {
      throw new ContractError(error.message);
    }
  }
}

export const apiService = new ApiService();
export default apiService; 