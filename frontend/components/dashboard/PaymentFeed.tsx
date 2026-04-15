"use client";

import { usePayments } from "@/hooks/usePayments";
import { displayFirstName, formatNumberEnUS } from "@/lib/format";
import StatusBadge from "@/components/shared/StatusBadge";
import HSPStepDots from "@/components/shared/HSPStepDots";
import Card, { CardHeader } from "@/components/shared/Card";

function formatTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

function contributorNames(contribs: { name: string }[]): string {
  return contribs.map((c) => displayFirstName(c.name)).join(", ");
}

export default function PaymentFeed() {
  const { payments: all, source, loading } = usePayments();
  const payments = all.slice(0, 5);

  return (
    <Card accent="teal">
      <CardHeader>
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-semibold text-text-primary">Payment feed</span>
          <div className="flex items-center gap-2">
            <span className="w-[6px] h-[6px] rounded-full bg-accent-teal pulse-glow" />
            <span className="text-[11px] font-medium text-accent-teal">
              {loading ? "…" : source === "chain" ? "Chain" : "Demo"}
            </span>
          </div>
        </div>
      </CardHeader>

      <div>
        {payments.map((payment, i) => (
          <div
            key={payment.id}
            className={`px-5 py-3.5 flex items-center gap-4 hover:bg-bg-elevated transition-colors cursor-pointer ${
              i < payments.length - 1 ? "border-b border-bg-elevated" : ""
            }`}
          >
            {/* Left: project info */}
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-text-primary truncate">
                {payment.projectName}
              </p>
              <p className="text-[11px] text-text-tertiary truncate">
                Split to {contributorNames(payment.contributors)}
              </p>
            </div>

            {/* Center: HSP dots */}
            <HSPStepDots completedSteps={payment.hspSteps} />

            {/* Right: amount + meta */}
            <div className="text-right flex-shrink-0">
              <p className="text-[14px] font-semibold text-accent-teal">
                ${formatNumberEnUS(payment.amount)}
              </p>
              <div className="flex items-center gap-2 justify-end mt-0.5">
                <span className="text-[10px] text-text-tertiary">{formatTime(payment.timestamp)}</span>
                <StatusBadge status={payment.hspStatus} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
