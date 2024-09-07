import './App.css';

import { useState } from 'react';
import { generateMnemonic } from 'bip39';
import { EthWallet } from './components/EthWallet';
import { SolanaWallet } from './components/SolanaWallet';

function App() {
  const [mnemonic, setMnemonic] = useState<string>("");

  return (
    <div className="App">
      <header className="App-header">
        <h1>Web-Based Wallets</h1>
      </header>

      <div className="mnemonic-section">
        {mnemonic ? <div>
          <h1>Seed Phrase</h1>
          <p className={`mnemonic ${mnemonic ? 'mnemonic-visible' : ''}`}>
            {mnemonic || "Click the button to generate a seed phrase."}
          </p>
        </div> : <div>
          <button
            className="generate-button"
            onClick={async function () {
              const mn = generateMnemonic(); // Generate the mnemonic
              setMnemonic(mn); // Update the state with the generated mnemonic
            }}
          >
            Generate Seed Phrase
          </button>
        </div>}
      </div>

      {mnemonic && (
        <div className="wallet-sections">
          <div className="wallet-section">
            <h3>Ethereum Wallets</h3>
            <EthWallet mnemonic={mnemonic} />
          </div>
          <div className="wallet-section">
            <h3>Solana Wallets</h3>
            <SolanaWallet mnemonic={mnemonic} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
