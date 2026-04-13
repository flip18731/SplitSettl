"use client";

import StatsRow from "@/components/dashboard/StatsRow";
import LivePaymentFeed from "@/components/dashboard/LivePaymentFeed";
import AIActivityIndicator from "@/components/dashboard/AIActivityIndicator";
import PaymentStreamCard from "@/components/payment/PaymentStreamCard";
import { ALL_PAYMENTS } from "@/lib/demo-data";

export default function Dashboard() {
  const latestPayment = ALL_PAYMENTS[0];

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Page title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-[rgba(255,255,255,0.45)] mt-1">
            Real-time overview of payments and settlements
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 glass-card rounded-lg">
          <div className="w-2 h-2 rounded-full bg-[#00B894] animate-pulse" />
          <span className="text-xs text-[rgba(255,255,255,0.5)]">
            Streaming on HashKey Chain
          </span>
        </div>
      </div>

      {/* Stats */}
      <StatsRow />

      {/* Latest Payment Stream */}
      {latestPayment && (
        <div>
          <h2 className="text-sm font-semibold text-[rgba(255,255,255,0.5)] uppercase tracking-wider mb-3">
            Latest Payment Stream
          </h2>
          <PaymentStreamCard
            senderLabel="Client Payment"
            totalAmount={latestPayment.amount}
            currency={latestPayment.currency}
            recipients={latestPayment.contributors}
          />
        </div>
      )}

      {/* Main content grid */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <LivePaymentFeed />
        </div>
        <div className="space-y-6">
          <AIActivityIndicator />

          {/* Quick Stats */}
          <div className="glass-card rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4">HSP Protocol Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[rgba(255,255,255,0.45)]">Requests Created</span>
                <span className="text-sm font-semibold text-[#FDCB6E]">12</span>
              </div>
              <div className="h-px bg-[rgba(255,255,255,0.04)]" />
              <div className="flex items-center justify-between">
                <span className="text-xs text-[rgba(255,255,255,0.45)]">Payments Confirmed</span>
                <span className="text-sm font-semibold text-[#74B9FF]">12</span>
              </div>
              <div className="h-px bg-[rgba(255,255,255,0.04)]" />
              <div className="flex items-center justify-between">
                <span className="text-xs text-[rgba(255,255,255,0.45)]">Receipts Generated</span>
                <span className="text-sm font-semibold text-[#00B894]">12</span>
              </div>
              <div className="h-px bg-[rgba(255,255,255,0.04)]" />
              <div className="flex items-center justify-between">
                <span className="text-xs text-[rgba(255,255,255,0.45)]">Success Rate</span>
                <span className="text-sm font-semibold text-[#00B894]">100%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
