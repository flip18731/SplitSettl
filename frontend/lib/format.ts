/**
 * Fixed-locale number formatting so SSR output matches the client and React
 * does not throw hydration errors (browser locale ≠ Node default locale).
 */
export function formatNumberEnUS(
  n: number,
  options?: Intl.NumberFormatOptions
): string {
  return n.toLocaleString("en-US", options);
}

/** First whitespace-delimited token — compact contributor labels (e.g. demo / invoice UI). */
export function displayFirstName(name: string): string {
  const t = name.trim();
  if (!t) return name;
  const first = t.split(/\s+/)[0];
  return first ?? t;
}
