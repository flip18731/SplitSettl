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
        <div className="glass-card px-3 py-1.5 rounded-lg flex items-center gap-2">
          <span className="text-xs text-[#00B894] font-medium">{balance} HSK</span>
        </div>
        <button className="glass-card px-3 py-1.5 rounded-lg flex items-center gap-2 hover:bg-[rgba(255,255,255,0.06)] transition-colors">
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#00B894] to-[#6C5CE7]" />
          <span className="text-xs text-white font-medium">{shortenAddress(address)}</span>
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      disabled={connecting}
      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00B894] to-[#00B894]/80 text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
    >
      {connecting ? "Connecting..." : "Connect Wallet"}
    </button>
  );
}
