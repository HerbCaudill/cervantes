/** Format an interval in days as a short human label, e.g. "6d" or "1.4mo". */
export function formatInterval(
  /** The interval length in days */
  days: number,
): string {
  if (days < 1) return "<1d"
  if (days < 30) return `${days}d`
  const months = days / 30
  return `${months.toFixed(months < 10 ? 1 : 0)}mo`
}
