import crypto from "crypto";

/** RFC 8785–style key sorting for canonical JSON (HSP HMAC + cart hash). */
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
