import crypto from "crypto";

/** Canonical JSON for HSP HMAC body hash + JWT `cart_hash` — matches Merchant “All-in-One” pseudocode (sorted keys + compact JSON.stringify). */
export function sortKeys(val: unknown): unknown {
  if (val === null || typeof val !== "object") return val;
  if (Array.isArray(val)) return val.map(sortKeys);
  const sorted: Record<string, unknown> = {};
  for (const key of Object.keys(val as object).sort()) {
    sorted[key] = sortKeys((val as Record<string, unknown>)[key]);
  }
  return sorted;
}

export function canonicalJSON(obj: unknown): string {
  return JSON.stringify(sortKeys(obj));
}

export function sha256hex(input: string): string {
  return crypto.createHash("sha256").update(input, "utf8").digest("hex");
}
