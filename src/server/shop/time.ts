// Time zone helpers. Instants in the data are UTC ("2026-10-20T23:30:00Z").
// Customers live in their own time zone (customer.timeZone), and the refund
// window (R1) counts days in that zone. Provided.

const DAY = 86_400_000

/** The calendar date (YYYY-MM-DD) of an instant in a time zone. */
export function localDate(instant: string, timeZone: string): string {
  // From the parts, not format(): Node builds with small ICU (Alpine) only
  // know the "en" locales, so a locale's date order can't be relied on.
  const parts = new Intl.DateTimeFormat("en-US", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(
    new Date(instant)
  )
  const part = (type: string) => parts.find((p) => p.type === type)?.value
  return `${part("year")}-${part("month")}-${part("day")}`
}

/** The time (HH:MM, 24 hours) of an instant in a time zone. */
export function localTime(instant: string, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(
    new Date(instant)
  )
  const part = (type: string) => parts.find((p) => p.type === type)?.value
  return `${part("hour")}:${part("minute")}`
}

/**
 * R1: whether a refund is still possible today. The window counts whole days
 * from the delivery date in the customer's time zone to `today`
 * (YYYY-MM-DD): the delivery date itself is day 0, day `days` is the last
 * day inside the window, and a `today` before the delivery date is outside
 * it. RD-401's policy check (R1) uses it.
 */
export function withinRefundWindow(deliveredAt: string, today: string, timeZone: string, days = 30): boolean {
  const delivered = localDate(deliveredAt, timeZone)
  const elapsed = Math.round((Date.parse(`${today}T00:00:00Z`) - Date.parse(`${delivered}T00:00:00Z`)) / DAY)
  return elapsed >= 0 && elapsed <= days
}
