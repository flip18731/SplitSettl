"use client";

interface Props {
  rating: "HIGH" | "MEDIUM" | "LOW";
}

const STYLES: Record<string, { bg: string; color: string; border: string }> = {
  HIGH: { bg: "#2DD4A818", color: "#2DD4A8", border: "#2DD4A844" },
  MEDIUM: { bg: "#F59E4218", color: "#F59E42", border: "#F59E4244" },
  LOW: { bg: "#5A627518", color: "#5A6275", border: "#5A627544" },
};

export default function ImpactBadge({ rating }: Props) {
  const s = STYLES[rating];
  return (
    <span
      className="inline-block text-[10px] font-bold tracking-[1px] px-2 py-0.5 rounded"
      style={{
        backgroundColor: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
      }}
    >
      {rating}
    </span>
  );
}
