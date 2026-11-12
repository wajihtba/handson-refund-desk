import assert from "node:assert/strict"
import { test } from "node:test"

import { addDays, daysSince, isRealDate } from "./dates"

// Date helpers. Provided: these pass from day one.

test("from 1 to 4 November is 3 days", () => {
  assert.equal(daysSince("2026-11-01", "2026-11-04"), 3)
})

test("the same date twice is 0 days", () => {
  assert.equal(daysSince("2026-11-20", "2026-11-20"), 0)
})

test("addDays crosses a month and a year", () => {
  assert.equal(addDays("2026-11-30", 1), "2026-12-01")
  assert.equal(addDays("2026-12-31", 1), "2027-01-01")
  assert.equal(addDays("2026-11-01", -1), "2026-10-31")
})

test("isRealDate refuses dates that don't exist", () => {
  assert.equal(isRealDate("2026-11-20"), true)
  assert.equal(isRealDate("2026-02-30"), false)
  assert.equal(isRealDate("20-11-2026"), false)
  assert.equal(isRealDate(20261120), false)
})
