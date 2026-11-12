// RD-303: the same eval set run several times, so a change is measured
// against the model's own noise. Verify runs hidden tests against this
// contract.
//
// summariseRepeats(runs): Record<string, Spread>
//   - runs holds one passRates result (checks.ts, RD-302) per run of the
//     same eval set: check name -> pass rate between 0 and 1.
//   - For each check name seen in any run: the mean, the lowest and the
//     highest rate over the runs that have it, and how many runs that is.
//     The mean is rounded to 2 decimals.
//   - No runs: {}.
//
// isRealChange(before, after): "better" | "worse" | "unclear"
//   - before and after are the Spread of one check, before and after a
//     change.
//   - "better" when every after run beat every before run (after.min is
//     above before.max), "worse" in the opposite case, and "unclear" when
//     the two ranges overlap: those runs can't tell the change from noise.

export type Spread = { mean: number; min: number; max: number; runs: number }

export type Change = "better" | "worse" | "unclear"

export function summariseRepeats(runs: Record<string, number>[]): Record<string, Spread> {
  void runs
  throw new Error("Not built yet: RD-303")
}

export function isRealChange(before: Spread, after: Spread): Change {
  void before
  void after
  throw new Error("Not built yet: RD-303")
}
