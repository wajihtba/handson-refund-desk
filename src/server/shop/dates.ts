// Date helpers for refunds. Dates are YYYY-MM-DD strings, with no time and
// no time zone.
//
// Provided.

const DAY = 86_400_000
const DATE = /^\d{4}-\d{2}-\d{2}$/

/** Whether s is a real calendar date written as YYYY-MM-DD ("2026-02-30" is not). */
export function isRealDate(s: unknown): s is string {
  if (typeof s !== "string" || !DATE.test(s)) return false
  const d = new Date(`${s}T00:00:00Z`)
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s
}

/** date + n days, as YYYY-MM-DD. */
export function addDays(date: string, n: number): string {
  const d = new Date(`${date}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

/** Whole days from date `from` to date `to`. */
export function daysSince(from: string, to: string): number {
  const ms = new Date(`${to}T00:00:00Z`).getTime() - new Date(`${from}T00:00:00Z`).getTime()
  return Math.round(ms / DAY)
}
