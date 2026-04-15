"use client";

import { useState } from "react";
import { ethers } from "ethers";
import type { AIAnalysisResult } from "@/lib/ai";
import { useContract } from "@/hooks/useContract";
import {
  CONTRACT_ADDRESS,
  getUSDTAddress,
  MOCK_USDT_ADDRESS,
} from "@/lib/contract";
import { ERC20_ABI } from "@/lib/erc20";
import { splitsToBasisPoints } from "@/lib/splits";
import { connectWallet, switchToHashKeyChain } from "@/lib/wallet";
import { explorerTxUrl } from "@/lib/explorer";
import WalletAddressProvenance from "./shared/WalletAddressProvenance";
import { displayFirstName } from "@/lib/format";

const ZERO = ethers.ZeroAddress;

function isMainnet(): boolean {
  return process.env.NEXT_PUBLIC_CHAIN_ID === "177";
}

interface Props {
  result: AIAnalysisResult;
  onComplete: (txHash?: string) => void;
}

export default function OnChainSettlement({ result, onComplete }: Props) {
  const { createProject, submitPaymentERC20, getContract } = useContract();
  const [step, setStep] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [addressByName, setAddressByName] = useState<Record<string, string>>(
    () => {
      const m: Record<string, string> = {};
      for (const s of result.splits) {
        m[s.name] = s.walletAddress?.trim() ?? "";
      }
      return m;
    }
  );

  const bps = splitsToBasisPoints(result.splits);
  const tokenAddr = getUSDTAddress();
  const canMintMock = !isMainnet() && !!MOCK_USDT_ADDRESS;

  const run = async () => {
    setError(null);

    if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS === ZERO) {
      setError(
        "Deploy SplitSettl and set NEXT_PUBLIC_CONTRACT_ADDRESS in the frontend env."
      );
      return;
    }
    if (!tokenAddr) {
      setError(
        "Set NEXT_PUBLIC_MOCK_USDT_ADDRESS (testnet) or use mainnet (NEXT_PUBLIC_CHAIN_ID=177) for official USDT."
      );
      return;
    }

    const contributors: string[] = [];
    for (const s of result.splits) {
      const raw = addressByName[s.name]?.trim() ?? "";
      if (!raw || !ethers.isAddress(raw)) {
        setError(
          `Add a valid 0x address for “${displayFirstName(s.name)}” (e.g. via .splitsettle.json in the repo).`
        );
        return;
      }
      contributors.push(ethers.getAddress(raw));
    }

    try {
      setStep("Connecting wallet…");
      const addr = await connectWallet();
      if (!addr) {
        setError("Wallet connection cancelled.");
        setStep("");
        return;
      }
      await switchToHashKeyChain();

      const read = await getContract(false);
      if (!read) throw new Error("Wallet not available");

      const before = await read.projectCount();
      const projectName = `AI ${result.repository}`.slice(0, 56);

      setStep("Creating project on HashKey Chain…");
      await createProject(projectName, contributors, bps);

      const after = await read.projectCount();
      const projectId = Number(after) - 1;
      if (projectId < 0 || Number(after) <= Number(before)) {
        throw new Error("Could not determine new project id.");
      }

      const amountRaw = ethers.parseUnits(
        Number(result.invoice.total).toFixed(6),
        6
      );

      if (typeof window === "undefined" || !window.ethereum) {
        throw new Error("No wallet provider");
      }
      const provider = new ethers.BrowserProvider(
        window.ethereum as ethers.Eip1193Provider
      );
      const signer = await provider.getSigner();
      const user = await signer.getAddress();

      const token = new ethers.Contract(tokenAddr, ERC20_ABI, signer);

      if (canMintMock) {
        setStep("Ensuring Mock USDT balance (testnet mint)…");
        const bal = await token.balanceOf(user);
        if (bal < amountRaw) {
          const mintTx = await token.mint(user, amountRaw);
          await mintTx.wait();
        }
      } else {
        const bal = await token.balanceOf(user);
        if (bal < amountRaw) {
          setError("USDT balance is too low for this invoice total.");
          setStep("");
          return;
        }
      }

      setStep("Token approval…");
      const allowance = await token.allowance(user, CONTRACT_ADDRESS);
      if (allowance < amountRaw) {
        const approveTx = await token.approve(CONTRACT_ADDRESS, amountRaw);
        await approveTx.wait();
      }

      const hspRequestId = `HSP-REQ-${Date.now()}`;
      setStep("Submitting settlement (HSP + ERC20 split)…");
      const receipt = await submitPaymentERC20(
        projectId,
        tokenAddr,
        amountRaw,
        result.invoice.id,
        hspRequestId
      );

      const hash =
        receipt?.hash ??
        (receipt as { transactionHash?: string } | null)?.transactionHash;
      setStep("Complete.");
      onComplete(hash ?? undefined);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      setStep("");
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-[13px] font-semibold text-text-primary">
        On-chain settlement (USDT)
      </p>
      <p className="text-[11px] text-text-tertiary leading-relaxed">
        Creates a project with your split ratios, then calls{" "}
        <code className="text-accent-teal">submitPaymentERC20</code> — HSP
        Request → split transfer → Confirmation → Receipt in one transaction.
        Requires contributor wallets (GitHub{" "}
        <code className="text-text-secondary">.splitsettle.json</code> or manual
        entry below).
      </p>

      <div className="space-y-2">
        {result.splits.map((s) => (
          <div
            key={s.name}
            className="flex flex-col sm:flex-row sm:items-start gap-2 text-[12px]"
          >
            <span className="text-text-secondary w-32 shrink-0 sm:pt-2">
              {displayFirstName(s.name)}{" "}
              <span className="text-text-tertiary">({s.percentage}%)</span>
            </span>
            <div className="flex-1 min-w-0 flex flex-col gap-0.5">
              <input
                className="w-full bg-bg-elevated border border-border rounded px-3 py-2 font-mono text-[11px] text-text-primary placeholder:text-text-tertiary"
                placeholder="0x contributor wallet"
                value={addressByName[s.name] ?? ""}
                onChange={(e) =>
                  setAddressByName((prev) => ({
                    ...prev,
                    [s.name]: e.target.value,
                  }))
                }
              />
              <WalletAddressProvenance
                split={s}
                repoSlug={result.repository}
                compact
              />
            </div>
          </div>
        ))}
      </div>

      {error && (
        <p className="text-[12px] text-red-400 bg-red-400/10 border border-red-400/30 rounded px-3 py-2">
          {error}
        </p>
      )}

      {step && !error && (
        <p className="text-[11px] text-accent-teal animate-pulse">{step}</p>
      )}

      <button
        type="button"
        onClick={run}
        className="w-full sm:w-auto px-5 py-2.5 rounded-md bg-gradient-to-br from-accent-teal to-[#22B896] text-bg-primary text-[13px] font-bold hover:scale-[1.02] active:scale-[0.98] transition-transform"
      >
        Connect wallet & settle on-chain
      </button>

      {!canMintMock && !isMainnet() && (
        <p className="text-[10px] text-text-tertiary">
          Testnet: set NEXT_PUBLIC_MOCK_USDT_ADDRESS to enable one-click mint.
        </p>
      )}
    </div>
  );
}
