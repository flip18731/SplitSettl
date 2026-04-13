"use client";

interface TimelineStep {
  label: string;
  description: string;
  status: "completed" | "active" | "pending";
  timestamp?: string;
}

export default function TransactionTimeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <div className="space-y-0">
      {steps.map((step, i) => (
        <div key={i} className="flex gap-3">
          {/* Timeline line and dot */}
          <div className="flex flex-col items-center">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                step.status === "completed"
                  ? "bg-[#00B894]/20"
                  : step.status === "active"
                  ? "bg-[#6C5CE7]/20"
                  : "bg-[rgba(255,255,255,0.05)]"
              }`}
            >
              {step.status === "completed" ? (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M3 6L5 8L9 4" stroke="#00B894" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : step.status === "active" ? (
                <div className="w-2 h-2 rounded-full bg-[#6C5CE7]" style={{ animation: "pulse-dot 1.5s infinite" }} />
              ) : (
                <div className="w-2 h-2 rounded-full bg-[rgba(255,255,255,0.15)]" />
              )}
            </div>
            {i < steps.length - 1 && (
              <div
                className={`w-px h-8 ${
                  step.status === "completed" ? "bg-[#00B894]/30" : "bg-[rgba(255,255,255,0.06)]"
                }`}
              />
            )}
          </div>

          {/* Content */}
          <div className="pb-6">
            <p
              className={`text-sm font-medium ${
                step.status === "completed"
                  ? "text-white"
                  : step.status === "active"
                  ? "text-[#6C5CE7]"
                  : "text-[rgba(255,255,255,0.3)]"
              }`}
            >
              {step.label}
            </p>
            <p className="text-xs text-[rgba(255,255,255,0.35)] mt-0.5">{step.description}</p>
            {step.timestamp && (
              <p className="text-[10px] text-[rgba(255,255,255,0.2)] mt-1">{step.timestamp}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
