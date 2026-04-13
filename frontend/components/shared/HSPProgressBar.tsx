"use client";

interface HSPProgressBarProps {
  /** 0 = none done, 1 = request, 2 = confirmed, 3 = receipt */
  completedSteps: number;
  showLabels?: boolean;
}

export default function HSPProgressBar({ completedSteps, showLabels = true }: HSPProgressBarProps) {
  const labels = ["Request", "Confirmed", "Receipt"];

  return (
    <div>
      <div className="flex gap-[2px]">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="flex-1 h-1 rounded-[2px]"
            style={{
              background:
                i < completedSteps
                  ? "linear-gradient(90deg, #2DD4A8, #F59E42)"
                  : "#252A38",
            }}
          />
        ))}
      </div>
      {showLabels && (
        <div className="flex gap-[2px] mt-1.5">
          {labels.map((label, i) => (
            <span
              key={label}
              className={`flex-1 text-[10px] uppercase tracking-[1px] ${
                i < completedSteps
                  ? "text-accent-teal font-semibold"
                  : "text-text-tertiary font-normal"
              }`}
            >
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
