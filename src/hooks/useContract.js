import { useMemo } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../contexts/WalletContext';
import DiceABI from '../abi/Dice.json';
import TokenABI from '../abi/Token.json';

const contracts = {
  dice: {
    address: import.meta.env.VITE_DICE_GAME_ADDRESS,
    abi: DiceABI.abi
  },
  token: {
    address: import.meta.env.VITE_TOKEN_ADDRESS,
    abi: TokenABI.abi
  }
};

export function useContract(contractName) {
  const { signer } = useWallet();

  return useMemo(() => {
    if (!signer || !contracts[contractName]) {
      return null;
    }

    const { address, abi } = contracts[contractName];
    return new ethers.Contract(address, abi, signer);
  }, [signer, contractName]);
} 