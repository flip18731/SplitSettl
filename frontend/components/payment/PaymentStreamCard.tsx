"use client";

interface StreamProps {
  senderLabel: string;
  totalAmount: number;
  currency: string;
  recipients: { name: string; amount: number }[];
}

export default function PaymentStreamCard({ senderLabel, totalAmount, currency, recipients }: StreamProps) {
  return (
    <div className="glass-card rounded-2xl p-5 relative overflow-hidden">
      {/* Animated background line */}
      <div className="absolute top-1/2 left-[120px] right-[120px] h-px bg-gradient-to-r from-[#00B894]/40 via-[#00B894] to-[#00B894]/40 shimmer" />

      <div className="flex items-center justify-between relative">
        {/* Sender */}
        <div className="glass-card px-4 py-3 rounded-xl text-center min-w-[100px]">
          <p className="text-[10px] text-[rgba(255,255,255,0.35)] mb-1">From</p>
          <p className="text-xs font-medium text-white">{senderLabel}</p>
          <p className="text-sm font-bold text-[#00B894] mt-1">
            ${totalAmount.toLocaleString()} {currency}
          </p>
        </div>

        {/* Split indicator */}
        <div className="w-10 h-10 rounded-full bg-[rgba(0,184,148,0.1)] border border-[#00B894]/30 flex items-center justify-center z-10">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4 8H12M8 4L12 8L8 12" stroke="#00B894" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Recipients */}
        <div className="space-y-2">
          {recipients.map((r, i) => (
            <div key={i} className="glass-card px-3 py-2 rounded-lg flex items-center gap-3 min-w-[160px]">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#00B894]/30 to-[#6C5CE7]/30 flex items-center justify-center text-[8px] font-bold text-white">
                {r.name.split(" ").map(n => n[0]).join("")}
              </div>
              <div>
                <p className="text-[10px] text-[rgba(255,255,255,0.5)]">{r.name}</p>
                <p className="text-xs font-semibold text-[#00B894]">${r.amount}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
