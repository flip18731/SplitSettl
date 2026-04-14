/**
 * HashKey Chain network configurations.
 * Switch between testnet and mainnet via NEXT_PUBLIC_CHAIN_ID env var.
 *   NEXT_PUBLIC_CHAIN_ID=133  → HashKey Chain Testnet
 *   NEXT_PUBLIC_CHAIN_ID=177  → HashKey Chain Mainnet
 */

export const HASHKEY_TESTNET_CHAIN = {
  id: 133,
  name: "HashKey Chain Testnet",
  network: "hashkey-testnet",
  nativeCurrency: { name: "HSK", symbol: "HSK", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://testnet.hsk.xyz"] },
    public: { http: ["https://testnet.hsk.xyz"] },
  },
  blockExplorers: {
    default: { name: "HashKey Explorer", url: "https://explorer.hsk.xyz" },
  },
};

export const HASHKEY_MAINNET_CHAIN = {
  id: 177,
  name: "HashKey Chain",
  network: "hashkey",
  nativeCurrency: { name: "HSK", symbol: "HSK", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://mainnet.hsk.xyz"] },
    public: { http: ["https://mainnet.hsk.xyz"] },
  },
  blockExplorers: {
    default: { name: "HashKey Explorer", url: "https://explorer.hsk.xyz" },
  },
};

export function getActiveChain() {
  return process.env.NEXT_PUBLIC_CHAIN_ID === "177"
    ? HASHKEY_MAINNET_CHAIN
    : HASHKEY_TESTNET_CHAIN;
}
