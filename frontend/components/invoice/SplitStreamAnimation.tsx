"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import type { AISplit } from "@/lib/ai";
import { displayFirstName, formatNumberEnUS } from "@/lib/format";

const RANK_COLORS = ["#2DD4A8", "#F59E42", "#8B93A8", "rgba(45,212,168,0.5)", "#5A6275"];

interface Props {
  splits: AISplit[];
  total: number;
  currency: string;
  onComplete: () => void;
}

function getY(index: number, count: number, height: number): number {
  const padding = 45;
  const available = height - 2 * padding;
  if (count === 1) return height / 2;
  return padding + (index / (count - 1)) * available;
}

export default function SplitStreamAnimation({
  splits,
  total,
  currency,
  onComplete,
}: Props) {
  const [visibleStreams, setVisibleStreams] = useState<number[]>([]);
  const [showCenter, setShowCenter] = useState(false);
  const [showEndpoints, setShowEndpoints] = useState(false);
  const completeFired = useRef(false);

  // Sort by percentage descending (memoized so effect deps stay stable)
  const sorted = useMemo(
    () => [...splits].sort((a, b) => b.percentage - a.percentage),
    [splits]
  );
  const svgHeight = Math.max(240, sorted.length * 80 + 60);
  const centerY = svgHeight / 2;

  // Stagger stream appearance
  useEffect(() => {
    const timers = sorted.map((_, i) =>
      setTimeout(() => {
        setVisibleStreams((prev) => [...prev, i]);
      }, 400 + i * 400)
    );

    const centerTimer = setTimeout(
      () => setShowCenter(true),
      400 + sorted.length * 400 + 300
    );

    const endpointTimer = setTimeout(
      () => setShowEndpoints(true),
      400 + sorted.length * 400 + 800
    );

    const completeTimer = setTimeout(() => {
      if (!completeFired.current) {
        completeFired.current = true;
        onComplete();
      }
    }, 400 + sorted.length * 400 + 6500);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(centerTimer);
      clearTimeout(endpointTimer);
      clearTimeout(completeTimer);
    };
  }, [sorted, onComplete]);

  return (
    <div className="space-y-4 animate-fade-slide-in">
      <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-text-tertiary">
        Payment Split Flow
      </p>

      <div className="bg-bg-surface border border-border rounded-lg p-4 overflow-hidden">
        <svg
          viewBox={`0 0 900 ${svgHeight}`}
          className="w-full"
          style={{ height: svgHeight }}
        >
          {/* Streams */}
          {sorted.map((split, i) => {
            const leftY = getY(i, sorted.length, svgHeight);
            const rightY = getY(i, sorted.length, svgHeight);
            const color = RANK_COLORS[Math.min(i, RANK_COLORS.length - 1)];
            const sw = Math.max(4, split.percentage * 0.5);
            const isVisible = visibleStreams.includes(i);
            const amount = Math.round((total * split.percentage) / 100);

            return (
              <g
                key={split.name}
                style={{
                  opacity: isVisible ? 1 : 0,
                  transition: "opacity 0.5s ease-out",
                }}
              >
                {/* Flow path */}
                <path
                  d={`M 130,${leftY} Q 290,${leftY} 450,${centerY} Q 610,${rightY} 770,${rightY}`}
                  stroke={color}
                  strokeWidth={sw}
                  fill="none"
                  strokeLinecap="round"
                  opacity={0.5}
                  className="flow-stream"
                />

                {/* Left label: name + percentage */}
                <text
                  x="10"
                  y={leftY - 6}
                  fill="#8B93A8"
                  fontSize="12"
                  fontWeight="600"
                  fontFamily="Plus Jakarta Sans, sans-serif"
                >
                  {displayFirstName(split.name)}
                </text>
                <text
                  x="10"
                  y={leftY + 10}
                  fill="#5A6275"
                  fontSize="10"
                  fontFamily="Plus Jakarta Sans, sans-serif"
                >
                  {split.percentage}%
                </text>

                {/* Right label: amount */}
                {showEndpoints && (
                  <g
                    style={{
                      opacity: showEndpoints ? 1 : 0,
                      transition: "opacity 0.5s ease-out",
                    }}
                  >
                    <text
                      x="790"
                      y={rightY - 6}
                      fill={color}
                      fontSize="15"
                      fontWeight="700"
                      fontFamily="Plus Jakarta Sans, sans-serif"
                    >
                      ${formatNumberEnUS(amount)}
                    </text>
                    <text
                      x="790"
                      y={rightY + 10}
                      fill="#8B93A8"
                      fontSize="11"
                      fontFamily="Plus Jakarta Sans, sans-serif"
                    >
                      {displayFirstName(split.name)}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Center merge node */}
          {showCenter && (
            <g
              style={{
                opacity: showCenter ? 1 : 0,
                transition: "opacity 0.5s ease-out",
              }}
            >
              <circle
                cx="450"
                cy={centerY}
                r="38"
                fill="#171A24"
                stroke="#252A38"
                strokeWidth="2"
              />
              <text
                x="450"
                y={centerY - 2}
                textAnchor="middle"
                fill="#E8ECF0"
                fontSize="16"
                fontWeight="700"
                fontFamily="Plus Jakarta Sans, sans-serif"
              >
                ${formatNumberEnUS(total)}
              </text>
              <text
                x="450"
                y={centerY + 14}
                textAnchor="middle"
                fill="#5A6275"
                fontSize="10"
                fontFamily="Plus Jakarta Sans, sans-serif"
              >
                {currency}
              </text>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}
