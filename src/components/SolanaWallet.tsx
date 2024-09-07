import { useState } from "react";
import { mnemonicToSeed } from "bip39";
import { derivePath } from "ed25519-hd-key";
import { Keypair, PublicKey, Connection } from "@solana/web3.js";
import nacl from "tweetnacl";

interface SolanaWalletProps {
    mnemonic: string;
}

export function SolanaWallet({ mnemonic }: SolanaWalletProps) {
    const [loading, setLoading] = useState<boolean>(false);
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [wallets, setWallets] = useState<{ publicKey: PublicKey; balance?: number }[]>([]);

    const customRpcUrl = import.meta.env.VITE_SOL_URL;
    const connection = customRpcUrl ? new Connection(customRpcUrl) : null;

    const addWallet = async () => {
        try {
            setLoading(true);

            const seed = await mnemonicToSeed(mnemonic);
            const path = `m/44'/501'/${currentIndex}'/0'`;
            const derivedSeed = derivePath(path, seed.toString("hex")).key;
            const secret = nacl.sign.keyPair.fromSeed(derivedSeed).secretKey;
            const keypair = Keypair.fromSecretKey(secret);

            let solBalance: number | undefined = undefined;

            if (connection) {
                // Fetch the balance only if the connection is defined
                const balance = await connection.getBalance(keypair.publicKey);
                solBalance = balance / 1e9; // Convert lamports to SOL
            }

            // Update wallets list with the new wallet (and balance if fetched)
            setWallets((prevWallets) => [
                ...prevWallets,
                { publicKey: keypair.publicKey, balance: solBalance },
            ]);
            setCurrentIndex(currentIndex + 1);
        } catch (error) {
            console.error("Error deriving wallet:", error);
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
                    Sol - {wallet.publicKey.toBase58()}
                    {wallet.balance !== undefined && (
                        <>
                            <br />
                            Balance: {wallet.balance.toFixed(5)} SOL
                        </>
                    )}
                </div>
            ))}
        </div>
    );
}
