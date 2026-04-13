"use client";

import { useState, useEffect } from "react";
import { connectWallet, getBalance, shortenAddress } from "@/lib/wallet";

export default function WalletConnect() {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>("0");
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum.request({ method: "eth_accounts" }).then((accounts) => {
        const accts = accounts as string[];
        if (accts.length > 0) {
          setAddress(accts[0]);
          getBalance(accts[0]).then(setBalance);
        }
      });

      const handleAccountsChanged = (...args: unknown[]) => {
        const accounts = args[0] as string[];
        if (accounts.length === 0) {
          setAddress(null);
          setBalance("0");
        } else {
          setAddress(accounts[0]);
          getBalance(accounts[0]).then(setBalance);
        }
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      return () => window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
    }
  }, []);

  const handleConnect = async () => {
    setConnecting(true);
    const addr = await connectWallet();
    if (addr) {
      setAddress(addr);
      const bal = await getBalance(addr);
      setBalance(bal);
    }
    setConnecting(false);
  };

  if (address) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-[12px] font-mono text-text-tertiary">
          {balance} HSK
        </span>
        <button className="flex items-center gap-2.5 bg-bg-surface border border-border rounded-full px-4 py-2 hover:border-border-hover transition-colors">
          <span className="w-[6px] h-[6px] rounded-full bg-accent-teal pulse-glow" />
          <span className="text-[12px] font-medium text-text-primary font-mono">
            {shortenAddress(address)}
          </span>
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      disabled={connecting}
      className="flex items-center gap-2.5 bg-bg-surface border border-border rounded-full px-4 py-2 hover:border-accent-teal transition-colors disabled:opacity-50"
    >
      <span className="w-[6px] h-[6px] rounded-full bg-text-tertiary" />
      <span className="text-[12px] font-medium text-text-tertiary">
        {connecting ? "Connecting..." : "Connect Wallet"}
      </span>
    </button>
  );
}
