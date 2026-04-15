"use client";

import type { AIAnalysisResult } from "@/lib/ai";
import { displayFirstName, formatNumberEnUS } from "@/lib/format";

export default function InvoicePreview({ result }: { result: AIAnalysisResult }) {
  const { invoice, splits } = result;
  const date = new Date(invoice.generatedAt);
  const dateStr = date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="bg-bg-surface border border-border rounded-lg overflow-hidden animate-fade-in">
      {/* Invoice header */}
      <div className="px-6 py-5 border-b border-border">
        {/* Repository header */}
        <div className="flex items-center gap-2 mb-3">
          <a
            href={`https://github.com/${invoice.project}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[13px] font-mono text-accent-teal hover:underline"
          >
            {invoice.project}
          </a>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-bg-elevated border border-border text-text-tertiary font-mono">
            {result.branch}
          </span>
          <span className="text-[10px] text-text-tertiary">
            {result.commitsAnalyzed} commits analyzed
          </span>
        </div>

        <div className="flex items-start justify-between">
          <div>
            <p className="text-[28px] font-bold text-text-primary leading-none mb-1">
              <span className="text-accent-teal">$</span>
              {formatNumberEnUS(invoice.total)}
              <span className="text-[14px] font-normal text-text-tertiary ml-2">
                {invoice.currency}
              </span>
            </p>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-[11px] font-semibold uppercase tracking-[1px] bg-accent-orange-bg text-accent-orange px-2 py-0.5 rounded-full">
                AI-generated
              </span>
              <span className="text-[11px] text-text-tertiary">{dateStr}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[13px] font-mono font-semibold text-text-primary">
              {invoice.id}
            </p>
            <p className="text-[11px] text-text-tertiary mt-0.5">HSP Settlement</p>
          </div>
        </div>
      </div>

      {/* Line items table */}
      <div className="px-6 py-4">
        <table className="w-full">
          <thead>
            <tr className="text-[10px] font-semibold uppercase tracking-[1px] text-text-tertiary">
              <th className="text-left pb-3 pr-4">Contributor</th>
              <th className="text-left pb-3 pr-4">Work Summary</th>
              <th className="text-right pb-3 pr-4">Impact</th>
              <th className="text-right pb-3">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, i) => (
              <tr key={i} className="border-t border-bg-elevated align-top">
                <td className="py-3 pr-4">
                  <p className="text-[13px] font-semibold text-text-primary">
                    {displayFirstName(item.contributor)}
                  </p>
                  <p className="text-[11px] text-text-secondary mt-0.5">
                    {item.commits} commits · +{formatNumberEnUS(item.linesAdded)} / -{formatNumberEnUS(item.linesDeleted)}
                  </p>
                </td>
                <td className="py-3 pr-4">
                  <p className="text-[12px] text-text-secondary">
                    {item.description}
                  </p>
                  {/* Top files as pills */}
                  {item.topFiles && item.topFiles.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      {item.topFiles.map((f, fi) => (
                        <span
                          key={fi}
                          className="text-[10px] font-mono text-text-secondary bg-bg-elevated rounded px-2 py-0.5"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  )}
                </td>
                <td className="py-3 pr-4 text-right">
                  <span className="text-[12px] text-text-secondary">
                    {formatNumberEnUS(item.linesAdded + item.linesDeleted)}
                  </span>
                </td>
                <td className="py-3 text-right">
                  <span className="text-[13px] font-semibold text-accent-teal">
                    ${item.amount}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Total row */}
        <div className="flex items-center justify-between pt-3 mt-1 border-t-2 border-accent-teal">
          <span className="text-[13px] font-semibold text-text-primary">Total</span>
          <span className="text-[20px] font-bold text-accent-teal">
            ${formatNumberEnUS(invoice.total)} {invoice.currency}
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
            <div key={i}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[13px] font-semibold text-text-primary">
                  {displayFirstName(split.name)}
                </span>
                <span className="text-[12px] font-bold text-accent-teal">
                  {split.percentage}%
                </span>
              </div>
              <p className="text-[12px] text-text-secondary italic leading-relaxed">
                {split.justification}
              </p>
              {split.keyContributions && split.keyContributions.length > 0 && (
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  {split.keyContributions.map((kc, ki) => (
                    <span
                      key={ki}
                      className="text-[10px] text-text-tertiary bg-bg-elevated rounded px-2 py-0.5"
                    >
                      {kc}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
