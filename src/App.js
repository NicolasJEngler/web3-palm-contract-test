import { useState, useEffect } from 'react';
import './App.css';
import Web3 from 'web3';
import WalletService from './services/WalletService';

// This could be taken from Etherscan https://explorer.palm-uat.xyz/address/0xA0931d84d4e242C55C308C9D558588A6a7b84743 once the contract is verified, resulting file should be placed inside the "ABIs" folder with the name "casablanca-paris.json", then should be imported (L7) and instantiated (L53)
import contractABI from './ABIs/casablanca-paris.json'

function App() {
  const [walletAddress, setWalletAddress] = useState(null),
        [currentChain, setCurrentChain] = useState(null);

  /*
   * Web3 instatiation section ⬇️ 
   */

  const web3 = new Web3(Web3.givenProvider); // If you're not using something like Metamask (which injects a provider in the window object), point to a Web3 provider like Infura
  
  /*
   * Wallet connection section ⬇️ 
   */

  // Fire up Metamask modal to connect a wallet
  // Check WalletService.js to look into the function that adds this functionality
  // A library like Onboard.js takes care of all of this
  const connectWallet = () => {
    WalletService.attemptWalletConnection()
      .then((address) => {
        setWalletAddress(address);
      });
  }

  // Detect on which chain the user is active (Ethereum Mainnet, Rinkeby, PALM testnet...)
  const detectChain = () => {
    web3.eth.net.getId().then((chain) => {
      setCurrentChain(chain);
    });
  }

  const addPalmTestnet = () => {
    WalletService.addPalmTestnetRPC()
      .then((error) => {
        detectChain();
      });
  };

  /*
   * Contract interaction section ⬇️ 
   */

  // Check https://web3js.readthedocs.io/en/v1.2.11/web3-eth-contract.html
  // Here we set up a contract interface to interact with, requires an ABI and a contract address
  const contract = new web3.eth.Contract(contractABI, '0xA0931d84d4e242C55C308C9D558588A6a7b84743');

  // Roles:
  // - Admin: Can grant and revoke roles, also has the ability to define the 'vault_address'
  // - Minter: Can call the mint function
  // - Redeemer: Can call the redeem function

  // Config:
  // - 'vault_address' is a variable defined in the contract, this address is where the NFTs will be minted to.
  // - The 'vault_address' can only be assigned by the Administrator.

  // Methods:
  // - mint(string tokenURI, bool _redeemable)
  // -- tokenURI: IPFS URI with the following format: ipfs://{hash}
  // -- _redeemable: Toggles the ability to redeem a token; also serves as an informative attribute.
  // - setVaultAddress(address _vaultAddress)
  // - setRedemption(uint256 tokenId): Changes the state of a token to 'redeemed' (Can not be rolled back)

  // We create a mint function to call from our front-end which then calls the mint function in the contract
  const mint = (tokenURI, redeemable) => {
    contract.methods.mint(tokenURI, redeemable)
      .send({
        from: walletAddress
      });
  };

  // We create a function to set the vault address from our front-end which then calls the same function in the contract
  const setVaultAddress = (vaultWalletAddress) => {
    contract.methods.setVaultAddress(vaultWalletAddress)
      .send({
        from: walletAddress
      });
  };

  // We create a function to toggle the redeemed status of tokenID 1 to true, which will then do the same at a contract level
  const setRedemption = (tokenID) => {
    contract.methods.setRedemption(tokenID)
      .send({
        from: walletAddress
      });
  };

  /*
   * useEffect() hooks section ⬇️ 
   */

  useEffect(() => {
    detectChain();
    connectWallet();

    if (window.ethereum) {
      window.ethereum.on('chainChanged', (chainId) => {
        setCurrentChain(web3.utils.hexToBytes(chainId));
      });
    }
  }, []);

  return (
    <div className="App">
      <h4>You're currently on chain ID: {currentChain}</h4>

      <p><button onClick={detectChain}>Detect chain again!</button></p>

      <ul style={{maxWidth: 320, margin: 'auto', textAlign: 'left'}}>
        <li>Ethereum Mainnet - 1</li>
        <li>Ethereum Testnet Rinkeby - 4</li>
        <li>PALM Mainnet - 11297108109</li>
        <li>PALM Testnet - 11297108099</li>
      </ul>

      <p><button onClick={addPalmTestnet}>Add RPC for PALM Testnet</button></p>

      <hr />

      {
        walletAddress ? 
          <h4>Connected wallet address: {walletAddress}</h4> :
          <h4>Please, connect your wallet</h4>
      }

      {
        !walletAddress ?
          <button onClick={connectWallet}>Connect wallet!</button> : 
          null
      }

      {
        walletAddress ? 
          <button onClick={() => {mint(1, false)}}>Mint tokenURI 1 with redeemed `false`</button> :
          null
      }
      

      {
        walletAddress ? 
          <button onClick={() => {setVaultAddress(walletAddress)}}>Set vault address to my current wallet address</button> :
          null
      }
      

      {
        walletAddress ? 
          <button onClick={() => {setRedemption(1, true)}}>Set token ID 1 to redeemed</button> :
          null
      }
    </div>
  );
}

export default App;