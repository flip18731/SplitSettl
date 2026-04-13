"use client";

type Status = "receipt" | "confirmed" | "pending";

const config: Record<Status, { label: string; bg: string; text: string }> = {
  receipt: {
    label: "Receipt",
    bg: "bg-accent-teal-bg",
    text: "text-accent-teal",
  },
  confirmed: {
    label: "Confirmed",
    bg: "bg-accent-orange-bg",
    text: "text-accent-orange",
  },
  pending: {
    label: "Pending",
    bg: "bg-[#5A627518]",
    text: "text-text-tertiary",
  },
};

export default function StatusBadge({ status }: { status: Status }) {
  const c = config[status];
  return (
    <span
      className={`inline-flex items-center px-2.5 py-[3px] rounded-full text-[10px] font-semibold ${c.bg} ${c.text}`}
    >
      {c.label}
    </span>
  );
}
