"use client";

const HSP_STATES = [
  { key: "payment-required", label: "Awaiting" },
  { key: "payment-submitted", label: "Submitted" },
  { key: "payment-verified", label: "Verified" },
  { key: "payment-processing", label: "Processing" },
  { key: "payment-included", label: "On-chain" },
  { key: "payment-successful", label: "Complete" },
] as const;

function normalizeStatus(raw: string | null): string {
  if (!raw) return "payment-required";
  let s = raw.trim().toLowerCase().replace(/\s+/g, "-");
  if (!s.startsWith("payment-")) s = `payment-${s}`;
  return s;
}

interface Props {
  status: string | null;
  failed?: boolean;
}

export default function HspPaymentLifecycle({ status, failed }: Props) {
  const n = normalizeStatus(status);
  if (failed || n.includes("failed")) {
    return (
      <div className="rounded-lg border border-accent-orange/30 bg-accent-orange-bg px-3 py-2 text-[11px] text-accent-orange">
        Payment failed — retry HSP checkout or use direct wallet settlement.
      </div>
    );
  }

  let step = HSP_STATES.findIndex(({ key }) => n === key);
  if (step < 0) step = 0;

  return (
    <div className="space-y-2">
      <p className="text-[9px] font-semibold uppercase tracking-[1px] text-text-tertiary">
        HSP lifecycle
      </p>
      <div className="flex flex-wrap gap-1 items-center">
        {HSP_STATES.map((s, i) => {
          const done = i < step;
          const current = i === step;
          return (
            <div key={s.key} className="flex items-center gap-1">
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full border ${
                  done
                    ? "border-accent-teal/40 bg-accent-teal/10 text-accent-teal"
                    : current
                    ? "border-accent-orange/40 bg-accent-orange-bg text-accent-orange"
                    : "border-border text-text-tertiary"
                }`}
              >
                {s.label}
              </span>
              {i < HSP_STATES.length - 1 && (
                <span className="text-text-tertiary text-[10px]">→</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
