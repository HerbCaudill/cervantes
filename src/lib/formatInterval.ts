/** Format an interval in days as a short Spanish label, e.g. "6 d" or "1,4 meses". */
export function formatInterval(
  /** The interval length in days */
  days: number,
): string {
  if (days < 1) return "<1 d"
  if (days < 30) return `${days} d`
  const months = days / 30
  const value = months.toFixed(months < 10 ? 1 : 0).replace(".", ",")
  return `${value} ${value === "1,0" ? "mes" : "meses"}`
}
