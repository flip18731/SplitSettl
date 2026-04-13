"use client";

import { useState, useCallback } from "react";
import AIGeneratingAnimation from "@/components/invoice/AIGeneratingAnimation";
import InvoicePreview from "@/components/invoice/InvoicePreview";
import PaymentFlowAnimation from "@/components/invoice/PaymentFlowAnimation";
import type { AIAnalysisResult } from "@/lib/ai";

const SAMPLE_DATA = `## GitHub Repository: hashkey-chain/defi-sdk

### Recent Contributions (Last 30 Days)

**Alice Chen (@alice-dev)**
- 23 commits, 2,847 lines added, 892 lines removed
- Implemented core swap router logic
- Built liquidity pool factory contract
- Fixed critical reentrancy vulnerability
- Estimated hours: 48h

**Bob Kumar (@bob-k)**
- 18 commits, 1,923 lines added, 445 lines removed
- Developed price oracle integration
- Created automated market maker algorithm
- Unit tests for all pool operations
- Estimated hours: 38h

**Carol Zhang (@carol-z)**
- 12 commits, 1,204 lines added, 267 lines removed
- Frontend SDK development
- TypeScript type definitions
- Documentation and examples
- Estimated hours: 28h`;

type Stage = "input" | "generating" | "preview" | "paying" | "complete";

export default function InvoicePage() {
  const [stage, setStage] = useState<Stage>("input");
  const [contributionData, setContributionData] = useState(SAMPLE_DATA);
  const [projectName, setProjectName] = useState("HashKey DeFi SDK");
  const [result, setResult] = useState<AIAnalysisResult | null>(null);

  const handleGenerate = async () => {
    setStage("generating");

    try {
      const response = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectName, contributionData }),
      });

      if (response.ok) {
        const data = await response.json();
        setTimeout(() => {
          setResult(data);
          setStage("preview");
        }, 2500);
      } else {
        // Fallback demo result
        setTimeout(() => {
          setResult(FALLBACK_RESULT);
          setStage("preview");
        }, 2500);
      }
    } catch {
      setTimeout(() => {
        setResult(FALLBACK_RESULT);
        setStage("preview");
      }, 2500);
    }
  };

  const handleApproveAndPay = () => {
    setStage("paying");
  };

  const handlePaymentComplete = useCallback(() => {
    setStage("complete");
  }, []);

  const handleReset = () => {
    setStage("input");
    setResult(null);
  };

  return (
    <div className="space-y-6 max-w-[900px] mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6C5CE7] to-[#6C5CE7]/50 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 2L12.5 7.5L18 10L12.5 12.5L10 18L7.5 12.5L2 10L7.5 7.5L10 2Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">AI Invoice Generator</h1>
        </div>
        <p className="text-sm text-[rgba(255,255,255,0.45)]">
          Paste contribution data and let AI generate fair payment splits automatically
        </p>
      </div>

      {/* Input Stage */}
      {stage === "input" && (
        <div className="space-y-5 animate-fade-in">
          {/* Project Name */}
          <div>
            <label className="block text-xs text-[rgba(255,255,255,0.45)] uppercase tracking-wider mb-2 font-semibold">
              Project Name
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] text-white text-sm placeholder:text-[rgba(255,255,255,0.2)] focus:outline-none focus:border-[#6C5CE7]/50 transition-colors"
              placeholder="Enter project name"
            />
          </div>

          {/* Contribution Data */}
          <div>
            <label className="block text-xs text-[rgba(255,255,255,0.45)] uppercase tracking-wider mb-2 font-semibold">
              Contribution Data (GitHub commits, tasks, hours)
            </label>
            <textarea
              value={contributionData}
              onChange={(e) => setContributionData(e.target.value)}
              rows={16}
              className="w-full px-4 py-3 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] text-white text-sm font-mono placeholder:text-[rgba(255,255,255,0.2)] focus:outline-none focus:border-[#6C5CE7]/50 transition-colors resize-none leading-relaxed"
              placeholder="Paste GitHub contribution data, task completions, or hours worked..."
            />
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={!contributionData.trim() || !projectName.trim()}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#6C5CE7] to-[#6C5CE7]/80 text-white text-base font-semibold hover:opacity-90 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed glow-purple flex items-center justify-center gap-3"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 2L12.5 7.5L18 10L12.5 12.5L10 18L7.5 12.5L2 10L7.5 7.5L10 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
            Generate Invoice with AI
          </button>

          <p className="text-center text-xs text-[rgba(255,255,255,0.25)]">
            AI will analyze contributions and recommend fair payment splits
          </p>
        </div>
      )}

      {/* Generating Stage */}
      {stage === "generating" && <AIGeneratingAnimation />}

      {/* Preview Stage */}
      {stage === "preview" && result && (
        <div className="space-y-5 animate-fade-in">
          <InvoicePreview result={result} />

          <div className="flex items-center gap-4">
            <button
              onClick={handleReset}
              className="flex-1 py-3.5 rounded-xl border border-[rgba(255,255,255,0.1)] text-sm font-medium text-[rgba(255,255,255,0.6)] hover:text-white hover:border-[rgba(255,255,255,0.2)] transition-all"
            >
              Regenerate
            </button>
            <button
              onClick={handleApproveAndPay}
              className="flex-[2] py-3.5 rounded-xl bg-gradient-to-r from-[#00B894] to-[#00B894]/80 text-white text-sm font-semibold hover:opacity-90 transition-all glow-green flex items-center justify-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8L6 11L13 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Approve & Pay via HSP
            </button>
          </div>
        </div>
      )}

      {/* Payment Flow Stage */}
      {stage === "paying" && result && (
        <PaymentFlowAnimation
          steps={[
            {
              label: "Creating HSP Payment Request",
              description: `Registering payment of $${result.invoice.total.toLocaleString()} ${result.invoice.currency} on HSP protocol`,
            },
            {
              label: "HSP Payment Request Created",
              description: `Request ID: HSP-REQ-${Date.now().toString().slice(-6)} — Awaiting on-chain confirmation`,
            },
            {
              label: "Processing Payment Split On-Chain",
              description: `Splitting funds to ${result.splits.length} contributors via SplitSettl smart contract`,
            },
            {
              label: "Payment Confirmed on HashKey Chain",
              description: `$${result.invoice.total.toLocaleString()} ${result.invoice.currency} split across ${result.splits.length} contributors`,
            },
            {
              label: "HSP Receipt Generated",
              description: "Settlement receipt stored on-chain with full audit trail",
            },
          ]}
          onComplete={handlePaymentComplete}
          totalAmount={result.invoice.total}
          contributorCount={result.splits.length}
          currency={result.invoice.currency}
        />
      )}

      {/* Complete Stage */}
      {stage === "complete" && result && (
        <div className="text-center space-y-6 animate-fade-in py-8">
          <div className="w-20 h-20 rounded-full bg-[#00B894]/20 flex items-center justify-center mx-auto">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <path d="M10 20L17 27L30 13" stroke="#00B894" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Payment Complete!</h2>
            <p className="text-sm text-[rgba(255,255,255,0.45)]">
              ${result.invoice.total.toLocaleString()} {result.invoice.currency} successfully split to {result.splits.length} contributors
            </p>
          </div>

          <div className="glass-card rounded-xl p-4 max-w-md mx-auto">
            <div className="space-y-2 text-left">
              {result.splits.map((split, i) => (
                <div key={i} className="flex items-center justify-between py-1">
                  <span className="text-sm text-[rgba(255,255,255,0.6)]">{split.contributor}</span>
                  <span className="text-sm font-semibold text-[#00B894]">
                    ${((result.invoice.total * split.percentage) / 100).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-[rgba(255,255,255,0.35)]">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00B894]" />
            HSP Receipt generated — Settlement recorded on HashKey Chain
          </div>

          <button
            onClick={handleReset}
            className="px-8 py-3 rounded-xl border border-[rgba(255,255,255,0.1)] text-sm font-medium text-white hover:bg-[rgba(255,255,255,0.03)] transition-all"
          >
            Generate Another Invoice
          </button>
        </div>
      )}
    </div>
  );
}

// Fallback demo result when API is not available
const FALLBACK_RESULT: AIAnalysisResult = {
  summary:
    "Based on analysis of the contribution data, Alice leads with the highest impact through core protocol work, Bob has significant contributions in oracle and AMM development, and Carol has meaningful SDK and documentation contributions.",
  splits: [
    {
      contributor: "Alice Chen",
      address: "0x1a2B...3c4D",
      percentage: 42,
      justification:
        "Highest commit volume (23 commits, 2,847 lines). Led core swap router implementation and fixed a critical reentrancy vulnerability — the highest-impact security contribution.",
    },
    {
      contributor: "Bob Kumar",
      address: "0x2b3C...4d5E",
      percentage: 33,
      justification:
        "Strong algorithmic contributions (18 commits, 1,923 lines). Price oracle integration and AMM algorithm are complex, critical-path components. Comprehensive test coverage adds significant value.",
    },
    {
      contributor: "Carol Zhang",
      address: "0x3c4D...5e6F",
      percentage: 25,
      justification:
        "Meaningful SDK and docs contributions (12 commits, 1,204 lines). Frontend SDK and TypeScript types are essential for developer adoption. Documentation multiplies the value of the protocol.",
    },
  ],
  invoice: {
    id: `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
    date: new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
    projectName: "HashKey DeFi SDK",
    items: [
      {
        description: "Core swap router & liquidity pool factory",
        contributor: "Alice Chen",
        address: "0x1a2B...3c4D",
        hours: 48,
        rate: 75,
        amount: 3600,
      },
      {
        description: "Security audit & reentrancy fix",
        contributor: "Alice Chen",
        address: "0x1a2B...3c4D",
        hours: 8,
        rate: 100,
        amount: 800,
      },
      {
        description: "Price oracle integration & AMM algorithm",
        contributor: "Bob Kumar",
        address: "0x2b3C...4d5E",
        hours: 30,
        rate: 75,
        amount: 2250,
      },
      {
        description: "Unit tests for pool operations",
        contributor: "Bob Kumar",
        address: "0x2b3C...4d5E",
        hours: 8,
        rate: 60,
        amount: 480,
      },
      {
        description: "Frontend SDK & TypeScript definitions",
        contributor: "Carol Zhang",
        address: "0x3c4D...5e6F",
        hours: 20,
        rate: 65,
        amount: 1300,
      },
      {
        description: "Documentation & integration examples",
        contributor: "Carol Zhang",
        address: "0x3c4D...5e6F",
        hours: 8,
        rate: 50,
        amount: 400,
      },
    ],
    total: 8830,
    currency: "USDT",
  },
};
