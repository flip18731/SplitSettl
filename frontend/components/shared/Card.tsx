"use client";

import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  accent?: "teal" | "orange" | "none";
  className?: string;
}

export default function Card({ children, accent = "none", className = "" }: CardProps) {
  const topBorder =
    accent === "teal"
      ? "before:absolute before:top-0 before:left-0 before:right-0 before:h-[2px] before:bg-gradient-to-r before:from-accent-teal before:to-transparent"
      : accent === "orange"
      ? "before:absolute before:top-0 before:left-0 before:right-0 before:h-[2px] before:bg-gradient-to-r before:from-accent-orange before:to-transparent"
      : "";

  return (
    <div
      className={`relative bg-bg-surface border border-border rounded-lg overflow-hidden ${topBorder} ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`px-5 py-4 border-b border-border ${className}`}>
      {children}
    </div>
  );
}

export function CardBody({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`px-5 py-4 ${className}`}>{children}</div>;
}
