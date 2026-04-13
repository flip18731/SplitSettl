"use client";

import type { AIAnalysisResult } from "@/lib/ai";

export default function InvoicePreview({ result }: { result: AIAnalysisResult }) {
  const { invoice, splits } = result;

  return (
    <div className="bg-bg-surface border border-border rounded-lg overflow-hidden animate-fade-in">
      {/* Invoice header */}
      <div className="px-6 py-5 border-b border-border flex items-start justify-between">
        <div>
          <p className="text-[28px] font-bold text-text-primary leading-none mb-1">
            <span className="text-accent-teal">$</span>
            {invoice.total.toLocaleString()}
            <span className="text-[14px] font-normal text-text-tertiary ml-2">{invoice.currency}</span>
          </p>
          <p className="text-[14px] font-semibold text-text-primary mt-2">{invoice.projectName}</p>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-[11px] font-semibold uppercase tracking-[1px] bg-accent-orange-bg text-accent-orange px-2 py-0.5 rounded-full">
              AI-generated
            </span>
            <span className="text-[11px] text-text-tertiary">{invoice.date}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[13px] font-mono font-semibold text-text-primary">{invoice.id}</p>
          <p className="text-[11px] text-text-tertiary mt-0.5">HSP Settlement</p>
        </div>
      </div>

      {/* Line items table */}
      <div className="px-6 py-4">
        <table className="w-full">
          <thead>
            <tr className="text-[10px] font-semibold uppercase tracking-[1px] text-text-tertiary">
              <th className="text-left pb-3 pr-4">Contributor</th>
              <th className="text-left pb-3 pr-4">Work Summary</th>
              <th className="text-right pb-3 pr-4">Hours</th>
              <th className="text-right pb-3">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, i) => (
              <tr key={i} className="border-t border-bg-elevated">
                <td className="py-3 pr-4">
                  <p className="text-[13px] font-semibold text-text-primary">{item.contributor}</p>
                  <p className="text-[10px] font-mono text-text-tertiary">{item.address}</p>
                </td>
                <td className="py-3 pr-4">
                  <p className="text-[12px] text-text-secondary">{item.description}</p>
                </td>
                <td className="py-3 pr-4 text-right">
                  <span className="text-[12px] text-text-secondary">{item.hours}h</span>
                </td>
                <td className="py-3 text-right">
                  <span className="text-[13px] font-semibold text-accent-teal">${item.amount}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Total row */}
        <div className="flex items-center justify-between pt-3 mt-1 border-t-2 border-accent-teal">
          <span className="text-[13px] font-semibold text-text-primary">Total</span>
          <span className="text-[20px] font-bold text-accent-teal">
            ${invoice.total.toLocaleString()} {invoice.currency}
          </span>
        </div>
      </div>

      {/* AI justifications */}
      <div className="px-6 py-4 border-t border-border">
        <p className="text-[10px] font-semibold uppercase tracking-[1px] text-text-tertiary mb-3 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-orange" />
          AI Split Rationale
        </p>
        <div className="space-y-3">
          {splits.map((split, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="flex items-center gap-2 min-w-[120px] flex-shrink-0">
                <span className="text-[13px] font-semibold text-text-primary">{split.contributor}</span>
                <span className="text-[12px] font-bold text-accent-teal">{split.percentage}%</span>
              </div>
              <p className="text-[12px] text-text-secondary italic leading-relaxed">
                {split.justification}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
