import { useState } from "react";
import { mnemonicToSeed } from "bip39";
import { Wallet, ethers } from "ethers";

interface EthWalletProps {
    mnemonic: string;
}

export const EthWallet = ({ mnemonic }: EthWalletProps) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [wallets, setWallets] = useState<{ address: string; balance?: string }[]>([]);

    const rpcUrl = import.meta.env.VITE_ETH_URL; // Get the RPC URL from the environment variable
    const provider = rpcUrl ? new ethers.JsonRpcProvider(rpcUrl) : null;

    const addWallet = async () => {
        try {
            setLoading(true);

            const seed = await mnemonicToSeed(mnemonic);
            const derivationPath = `m/44'/60'/${currentIndex}'/0'`;
            const hdNode = ethers.HDNodeWallet.fromSeed(seed);
            const child = hdNode.derivePath(derivationPath);
            const privateKey = child.privateKey;
            const wallet = new Wallet(privateKey, provider || undefined); // Pass provider if defined

            let ethBalance: string | undefined = undefined;

            if (provider) {
                // Fetch the balance only if provider is defined
                const balance = await provider.getBalance(wallet.address);
                ethBalance = ethers.formatEther(balance); // Convert balance to Ether
            }

            // Update wallets list with the new wallet (and balance if fetched)
            setWallets((prevWallets) => [
                ...prevWallets,
                { address: wallet.address, balance: ethBalance },
            ]);
            setCurrentIndex(currentIndex + 1);
        } catch (error) {
            console.error("Error generating wallet:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="walletRepresentation">
            <button onClick={addWallet} disabled={loading}>
                {loading ? "Loading..." : "Add Wallet"}
            </button>
            {wallets.map((wallet, index) => (
                <div key={index}>
                    <p>Eth - {wallet.address}</p>
                    {wallet.balance !== undefined && (
                        <p>Balance: {wallet.balance} ETH</p> // Conditionally render the balance
                    )}
                </div>
            ))}
        </div>
    );
};
