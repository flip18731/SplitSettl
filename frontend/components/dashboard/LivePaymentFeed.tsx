"use client";

import { useState, useEffect } from "react";
import { ALL_PAYMENTS, type Payment } from "@/lib/demo-data";
import HSPStatusBadge from "@/components/payment/HSPStatusBadge";

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

function PaymentRow({ payment, isNew }: { payment: Payment; isNew: boolean }) {
  return (
    <div
      className={`glass-card p-4 rounded-xl transition-all duration-500 ${
        isNew ? "animate-slide-in glow-green" : ""
      } hover:border-[rgba(255,255,255,0.1)]`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00B894]/20 to-[#00B894]/5 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1V13M3 5L7 1L11 5" stroke="#00B894" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-white">{payment.projectName}</p>
            <p className="text-xs text-[rgba(255,255,255,0.35)]">{payment.invoiceRef}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-[#00B894]">
            ${payment.amount.toLocaleString()} <span className="text-xs font-normal text-[rgba(255,255,255,0.35)]">{payment.currency}</span>
          </p>
          <p className="text-[10px] text-[rgba(255,255,255,0.3)]">{formatTime(payment.timestamp)}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {payment.contributors.map((c, i) => (
            <div
              key={i}
              className="flex items-center gap-1 px-2 py-1 rounded-md bg-[rgba(255,255,255,0.03)] text-[10px]"
            >
              <span className="text-[rgba(255,255,255,0.5)]">{c.name.split(" ")[0]}</span>
              <span className="text-[#00B894] font-medium">${c.amount}</span>
            </div>
          ))}
        </div>
        <HSPStatusBadge status={payment.hspStatus} />
      </div>
    </div>
  );
}

export default function LivePaymentFeed() {
  const [payments, setPayments] = useState(ALL_PAYMENTS);
  const [newPaymentId, setNewPaymentId] = useState<string | null>(null);

  // Simulate a new payment appearing periodically
  useEffect(() => {
    const timer = setInterval(() => {
      setNewPaymentId(payments[0]?.id || null);
      setTimeout(() => setNewPaymentId(null), 3000);
    }, 15000);
    return () => clearInterval(timer);
  }, [payments]);

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-[rgba(255,255,255,0.06)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#00B894]" style={{ animation: "pulse-green 2s infinite" }} />
          <h3 className="text-sm font-semibold text-white">Live Payment Feed</h3>
        </div>
        <span className="text-xs text-[rgba(255,255,255,0.35)]">{payments.length} transactions</span>
      </div>

      <div className="p-4 space-y-3 max-h-[520px] overflow-y-auto">
        {payments.map((payment) => (
          <PaymentRow
            key={payment.id}
            payment={payment}
            isNew={payment.id === newPaymentId}
          />
        ))}
      </div>
    </div>
  );
}
