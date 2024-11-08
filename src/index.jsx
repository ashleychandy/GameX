import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { Web3Context } from './App'; // Ensure this path is correct

const AppWrapper = () => {
  const [diceContract, setDiceContract] = useState(null);
  const [tokenContract, setTokenContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);

  // Initialize your contracts and provider here
  useEffect(() => {
    const initWeb3 = async () => {
      // Example initialization logic
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const diceContract = new ethers.Contract(DICE_ADDRESS, DICE_ABI, signer);
      const tokenContract = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, signer);
      const accounts = await provider.listAccounts();

      setProvider(provider);
      setDiceContract(diceContract);
      setTokenContract(tokenContract);
      setAccount(accounts[0]);
    };

    initWeb3();
  }, []);

  return (
    <Web3Context.Provider value={{ diceContract, tokenContract, account, provider }}>
      <App />
    </Web3Context.Provider>
  );
};

ReactDOM.render(<AppWrapper />, document.getElementById('root')); 