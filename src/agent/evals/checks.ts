// RD-302: a pass rate per check, so you can see which part of the agent
// fails, not only how often. Verify runs hidden tests against this contract.
//
// passRates(results): Record<string, number>
//   results holds one object per case: check name -> passed or not. A case
//   may leave a check out (it didn't apply).
//   - For each check name seen in any case: passed / cases that have it.
//   - "all": the share of cases where every check they have passed.
//   - Rates are between 0 and 1, rounded to 2 decimals. No cases -> { all: 0 }.

export function passRates(results: Record<string, boolean>[]): Record<string, number> {
  void results
  throw new Error("Not built yet: RD-302")
}
