"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";
import type { AISplit } from "@/lib/ai";

const RANK_COLORS = ["#2DD4A8", "#F59E42", "#8B93A8", "rgba(45,212,168,0.5)", "#5A6275"];

const AXIS_LABELS: Record<string, string> = {
  complexity: "Complexity",
  featureImpact: "Feature Impact",
  scopeBreadth: "Scope",
  consistency: "Consistency",
  volume: "Volume",
};

const AXES = ["complexity", "featureImpact", "scopeBreadth", "consistency", "volume"] as const;

interface Props {
  splits: AISplit[];
  aiSummary: string;
  onComplete: () => void;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function useAnimatedProgress(duration: number, staggerMs: number) {
  const [progress, setProgress] = useState(0);
  const startRef = useRef(Date.now());

  useEffect(() => {
    startRef.current = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startRef.current;
      const total = duration + staggerMs * (AXES.length - 1);
      if (elapsed >= total) {
        setProgress(1);
        clearInterval(interval);
        return;
      }
      setProgress(Math.min(1, elapsed / duration));
    }, 16);
    return () => clearInterval(interval);
  }, [duration, staggerMs]);

  const getAxisProgress = useCallback(
    (axisIndex: number) => {
      const delay = (staggerMs * axisIndex) / 2000;
      const adjusted = Math.max(0, Math.min(1, (progress - delay) / (1 - delay)));
      return easeOutCubic(adjusted);
    },
    [progress, staggerMs]
  );

  return { progress, getAxisProgress };
}

export default function ImpactRadar({ splits, aiSummary, onComplete }: Props) {
  const { getAxisProgress } = useAnimatedProgress(2000, 200);
  const [typedChars, setTypedChars] = useState(0);
  const [showScores, setShowScores] = useState(false);
  const completeFired = useRef(false);

  // Sort by percentage descending for color assignment
  const sorted = [...splits].sort((a, b) => b.percentage - a.percentage);

  // Show scores after radar animation
  useEffect(() => {
    const t = setTimeout(() => setShowScores(true), 2500);
    return () => clearTimeout(t);
  }, []);

  // Typewriter effect for AI summary
  useEffect(() => {
    if (!showScores || !aiSummary) return;
    const interval = setInterval(() => {
      setTypedChars((prev) => {
        if (prev >= aiSummary.length) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 20);
    return () => clearInterval(interval);
  }, [showScores, aiSummary]);

  // Fire onComplete after full animation
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!completeFired.current) {
        completeFired.current = true;
        onComplete();
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="space-y-4 animate-fade-slide-in">
      <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-text-tertiary">
        Impact Analysis
      </p>

      {/* Radar cards row */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${Math.min(sorted.length, 3)}, 1fr)` }}>
        {sorted.map((split, idx) => {
          const color = RANK_COLORS[Math.min(idx, RANK_COLORS.length - 1)];

          // Build animated data
          const radarData = AXES.map((axis, ai) => ({
            axis: AXIS_LABELS[axis],
            value: split.impactScores[axis] * getAxisProgress(ai),
            fullMark: 100,
          }));

          // Compute weighted score
          const score = Math.round(
            split.impactScores.complexity * 0.3 +
            split.impactScores.featureImpact * 0.3 +
            split.impactScores.scopeBreadth * 0.15 +
            split.impactScores.consistency * 0.15 +
            split.impactScores.volume * 0.1
          );

          const isTop = idx === 0;

          return (
            <div
              key={split.name}
              className="bg-bg-surface border rounded-lg p-4 transition-all duration-500"
              style={{
                borderColor: isTop && showScores ? `${color}66` : "#252A38",
                boxShadow: isTop && showScores ? `0 0 20px ${color}15` : "none",
              }}
            >
              {/* Name */}
              <p className="text-[13px] font-semibold text-text-primary text-center mb-1">
                {split.name.split(" ")[0]}
              </p>
              <p className="text-[10px] text-text-tertiary text-center mb-2">
                {split.percentage}% split
              </p>

              {/* Radar chart */}
              <div className="animate-radar-grow">
                <ResponsiveContainer width="100%" height={180}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#252A38" />
                    <PolarAngleAxis
                      dataKey="axis"
                      tick={{ fill: "#5A6275", fontSize: 10 }}
                    />
                    <Radar
                      dataKey="value"
                      fill={color}
                      fillOpacity={0.2}
                      stroke={color}
                      strokeWidth={2}
                      isAnimationActive={false}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Score */}
              <div
                className="text-center transition-all duration-500"
                style={{
                  opacity: showScores ? 1 : 0,
                  transform: showScores ? "translateY(0)" : "translateY(8px)",
                }}
              >
                <p
                  className="text-[28px] font-light leading-none"
                  style={{ color }}
                >
                  {score}
                </p>
                <p className="text-[10px] text-text-tertiary mt-1">
                  Impact Score
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Summary with typewriter */}
      {showScores && aiSummary && (
        <div className="bg-bg-surface border border-border rounded-lg px-5 py-4">
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-orange mt-1.5 flex-shrink-0" />
            <p className="text-[12px] text-text-secondary italic leading-relaxed">
              {aiSummary.substring(0, typedChars)}
              {typedChars < aiSummary.length && (
                <span className="typewriter-cursor" />
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
