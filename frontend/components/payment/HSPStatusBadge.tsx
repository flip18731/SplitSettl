"use client";

type HSPStatus = "requested" | "confirmed" | "receipt";

const statusConfig: Record<HSPStatus, { label: string; color: string; bg: string }> = {
  requested: {
    label: "Requested",
    color: "#FDCB6E",
    bg: "rgba(253, 203, 110, 0.1)",
  },
  confirmed: {
    label: "Confirmed",
    color: "#74B9FF",
    bg: "rgba(116, 185, 255, 0.1)",
  },
  receipt: {
    label: "Receipt",
    color: "#00B894",
    bg: "rgba(0, 184, 148, 0.1)",
  },
};

export default function HSPStatusBadge({ status }: { status: HSPStatus }) {
  const config = statusConfig[status];

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-semibold"
      style={{ background: config.bg, color: config.color }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{
          background: config.color,
          boxShadow: status === "requested" ? `0 0 4px ${config.color}` : "none",
        }}
      />
      HSP: {config.label}
    </span>
  );
}
