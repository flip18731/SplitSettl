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
