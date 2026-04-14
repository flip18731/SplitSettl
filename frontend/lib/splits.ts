import type { AISplit } from "./ai";

/** Convert percentage splits (e.g. 40.5) to basis points (sum exactly 10000). */
export function splitsToBasisPoints(splits: AISplit[]): number[] {
  const raw = splits.map((s) => Math.round(s.percentage * 100));
  const sum = raw.reduce((a, b) => a + b, 0);
  const diff = 10000 - sum;
  if (diff !== 0 && raw.length > 0) {
    raw[raw.length - 1] += diff;
  }
  return raw;
}
