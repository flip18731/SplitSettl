"use client";

import type { AIAnalysisResult } from "@/lib/ai";

export default function InvoicePreview({ result }: { result: AIAnalysisResult }) {
  const { invoice, splits } = result;

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      {/* Invoice Header */}
      <div className="bg-gradient-to-r from-[rgba(0,184,148,0.08)] to-[rgba(108,92,231,0.08)] p-6 border-b border-[rgba(255,255,255,0.06)]">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00B894] to-[#6C5CE7] flex items-center justify-center text-xs font-bold text-white">
                SS
              </div>
              <span className="text-lg font-bold gradient-text">SplitSettl</span>
            </div>
            <p className="text-xs text-[rgba(255,255,255,0.35)]">AI-Generated Invoice</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-white">{invoice.id}</p>
            <p className="text-xs text-[rgba(255,255,255,0.35)]">{invoice.date}</p>
          </div>
        </div>
      </div>

      {/* Project Name */}
      <div className="px-6 py-4 border-b border-[rgba(255,255,255,0.06)]">
        <p className="text-xs text-[rgba(255,255,255,0.35)] uppercase tracking-wider mb-1">Project</p>
        <p className="text-base font-semibold text-white">{invoice.projectName}</p>
      </div>

      {/* Line Items */}
      <div className="px-6 py-4">
        <table className="w-full">
          <thead>
            <tr className="text-[10px] text-[rgba(255,255,255,0.35)] uppercase tracking-wider">
              <th className="text-left pb-3 font-semibold">Description</th>
              <th className="text-left pb-3 font-semibold">Contributor</th>
              <th className="text-right pb-3 font-semibold">Hours</th>
              <th className="text-right pb-3 font-semibold">Rate</th>
              <th className="text-right pb-3 font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {invoice.items.map((item, i) => (
              <tr key={i} className="border-t border-[rgba(255,255,255,0.04)]">
                <td className="py-3 text-white text-xs">{item.description}</td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#00B894]/30 to-[#6C5CE7]/30 flex items-center justify-center text-[7px] font-bold text-white">
                      {item.contributor.split(" ").map(n => n[0]).join("")}
                    </div>
                    <span className="text-xs text-[rgba(255,255,255,0.6)]">{item.contributor}</span>
                  </div>
                </td>
                <td className="py-3 text-right text-xs text-[rgba(255,255,255,0.6)]">{item.hours}h</td>
                <td className="py-3 text-right text-xs text-[rgba(255,255,255,0.6)]">${item.rate}/h</td>
                <td className="py-3 text-right text-xs font-semibold text-white">${item.amount.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Total */}
      <div className="px-6 py-4 border-t border-[rgba(255,255,255,0.06)] flex items-center justify-between bg-[rgba(0,184,148,0.03)]">
        <span className="text-sm font-semibold text-white">Total</span>
        <span className="text-xl font-bold text-[#00B894]">
          ${invoice.total.toLocaleString()} {invoice.currency}
        </span>
      </div>

      {/* AI Split Recommendations */}
      <div className="px-6 py-4 border-t border-[rgba(255,255,255,0.06)]">
        <p className="text-xs text-[rgba(255,255,255,0.35)] uppercase tracking-wider mb-3 font-semibold flex items-center gap-2">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 1L7.5 4.5L11 6L7.5 7.5L6 11L4.5 7.5L1 6L4.5 4.5L6 1Z" stroke="#6C5CE7" strokeWidth="1" strokeLinejoin="round" />
          </svg>
          AI-Recommended Splits
        </p>
        <div className="space-y-3">
          {splits.map((split, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)]">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6C5CE7]/30 to-[#00B894]/30 flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0">
                {split.contributor.split(" ").map(n => n[0]).join("")}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-white">{split.contributor}</span>
                  <span className="text-sm font-bold text-[#00B894]">{split.percentage}%</span>
                </div>
                <p className="text-xs text-[rgba(255,255,255,0.4)] leading-relaxed">{split.justification}</p>
                {/* Progress bar */}
                <div className="mt-2 h-1 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#6C5CE7] to-[#00B894] rounded-full"
                    style={{ width: `${split.percentage}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
