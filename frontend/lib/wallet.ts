import { HASHKEY_TESTNET, HASHKEY_MAINNET, getActiveChainConfig } from "./contract";

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, callback: (...args: unknown[]) => void) => void;
      removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
      isMetaMask?: boolean;
    };
  }
}

export async function connectWallet(): Promise<string | null> {
  if (typeof window === "undefined" || !window.ethereum) {
    alert("Please install MetaMask to use SplitSettl");
    return null;
  }

  try {
    const accounts = (await window.ethereum.request({
      method: "eth_requestAccounts",
    })) as string[];

    await switchToHashKeyChain();
    return accounts[0] || null;
  } catch {
    return null;
  }
}

/** Switch MetaMask to the active HashKey Chain (testnet or mainnet based on env). */
export async function switchToHashKeyChain(): Promise<void> {
  if (!window.ethereum) return;
  const chain = getActiveChainConfig();

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: chain.chainIdHex }],
    });
  } catch (switchError: unknown) {
    const err = switchError as { code?: number };
    if (err.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: chain.chainIdHex,
            chainName: chain.name,
            rpcUrls: [chain.rpcUrl],
            blockExplorerUrls: [chain.explorer],
            nativeCurrency: chain.nativeCurrency,
          },
        ],
      });
    }
  }
}

/** Backward-compatible alias. */
export const switchToHashKeyTestnet = switchToHashKeyChain;

/** Add HashKey Chain Testnet to MetaMask (always testnet, used in network selector UI). */
export async function addHashKeyTestnet(): Promise<void> {
  if (!window.ethereum) return;
  await window.ethereum.request({
    method: "wallet_addEthereumChain",
    params: [
      {
        chainId: HASHKEY_TESTNET.chainIdHex,
        chainName: HASHKEY_TESTNET.name,
        rpcUrls: [HASHKEY_TESTNET.rpcUrl],
        blockExplorerUrls: [HASHKEY_TESTNET.explorer],
        nativeCurrency: HASHKEY_TESTNET.nativeCurrency,
      },
    ],
  });
}

/** Add HashKey Chain Mainnet to MetaMask. */
export async function addHashKeyMainnet(): Promise<void> {
  if (!window.ethereum) return;
  await window.ethereum.request({
    method: "wallet_addEthereumChain",
    params: [
      {
        chainId: HASHKEY_MAINNET.chainIdHex,
        chainName: HASHKEY_MAINNET.name,
        rpcUrls: [HASHKEY_MAINNET.rpcUrl],
        blockExplorerUrls: [HASHKEY_MAINNET.explorer],
        nativeCurrency: HASHKEY_MAINNET.nativeCurrency,
      },
    ],
  });
}

export async function getBalance(address: string): Promise<string> {
  if (!window.ethereum) return "0";
  const balance = (await window.ethereum.request({
    method: "eth_getBalance",
    params: [address, "latest"],
  })) as string;
  const wei = BigInt(balance);
  const eth = Number(wei) / 1e18;
  return eth.toFixed(4);
}

export function shortenAddress(addr: string): string {
  if (addr.length < 10) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}
