import assert from "node:assert/strict"
import { test } from "node:test"

import { localDate, localTime, withinRefundWindow } from "./time"

// Time zone helpers. Provided: these pass from day one.

test("an instant has a local date and time in each zone", () => {
  assert.equal(localDate("2026-11-10T12:00:00Z", "Europe/Lisbon"), "2026-11-10")
  assert.equal(localTime("2026-11-10T12:00:00Z", "Europe/Lisbon"), "12:00")
  assert.equal(localTime("2026-11-10T12:00:00Z", "Europe/Athens"), "14:00")
  assert.equal(localDate("2026-11-10T23:30:00Z", "Europe/Athens"), "2026-11-11")
})

test("a parcel delivered at midday 10 days ago is inside the window", () => {
  assert.equal(withinRefundWindow("2026-11-10T12:00:00Z", "2026-11-20", "Europe/Berlin"), true)
})

test("a parcel delivered at midday 31 days ago is outside the window", () => {
  assert.equal(withinRefundWindow("2026-10-20T12:00:00Z", "2026-11-20", "Europe/Madrid"), false)
})

test("the window length can change", () => {
  assert.equal(withinRefundWindow("2026-11-10T12:00:00Z", "2026-11-20", "Europe/Paris", 7), false)
})

test("a delivery late in the evening UTC counts from the customer's local date", () => {
  // 23:30 UTC on 20 October is 21 October in Berlin, so 20 November is day 30.
  assert.equal(withinRefundWindow("2026-10-20T23:30:00Z", "2026-11-20", "Europe/Berlin"), true)
  assert.equal(withinRefundWindow("2026-10-20T23:30:00Z", "2026-11-21", "Europe/Berlin"), false)
})
