// RD-204: survive the shop's timeouts and server errors.
// Verify runs hidden tests against this contract.
//
// callWithRetry(fn, opts): Promise<T>
//   - Calls fn. When it throws a ShopApiError whose code is "timeout" or
//     "server_error", waits opts.delayMs (default 200) and calls it again,
//     up to opts.retries more times (default 1).
//   - Any other error is thrown at once, without a retry.
//   - When every attempt fails, throws the last error.
//   - opts.sleep, when given, is used to wait instead of a timer (tests
//     pass one that returns at once).
//
// Until RD-204 it calls fn once, with no retry, so runTool can already call
// the shop through it.

export type RetryOptions = {
  retries?: number
  delayMs?: number
  sleep?: (ms: number) => Promise<void>
}

export async function callWithRetry<T>(fn: () => Promise<T>, opts: RetryOptions = {}): Promise<T> {
  void opts
  return fn()
}
