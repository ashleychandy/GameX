export const NETWORKS = {
  SEPOLIA: {
    chainId: 11155111,
    contracts: {
      dice: import.meta.env.VITE_DICE_ADDRESS,
      token: import.meta.env.VITE_TOKEN_ADDRESS
    }
  }
}; 

export const DICE_GAME_ADDRESS = '0x...'; // Your contract address

export const DICE_GAME_ABI = [
  // Your contract ABI here
  {
    "inputs": [
      {
        "internalType": "uint8",
        "name": "number",
        "type": "uint8"
      }
    ],
    "name": "placeBet",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "player",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint8",
        "name": "number",
        "type": "uint8"
      },
      {
        "indexed": false,
        "internalType": "uint8",
        "name": "result",
        "type": "uint8"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "won",
        "type": "bool"
      }
    ],
    "name": "GameResult",
    "type": "event"
  }
]; 