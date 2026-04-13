"use client";

interface HSPStepDotsProps {
  /** 0 = none done, 1 = request, 2 = confirmed, 3 = receipt */
  completedSteps: number;
}

export default function HSPStepDots({ completedSteps }: HSPStepDotsProps) {
  return (
    <div className="flex items-center gap-0">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center">
          <div
            className="w-1 h-1 rounded-full"
            style={{
              background: i < completedSteps ? "#2DD4A8" : "#5A6275",
            }}
          />
          {i < 2 && (
            <div
              className="w-4 h-px"
              style={{
                background: i < completedSteps - 1 ? "#2DD4A8" : "#5A6275",
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
