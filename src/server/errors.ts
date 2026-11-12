// Errors the API turns into answers. Provided.
// Stubs throw new Error("Not built yet: RD-xxx") until their ticket is done:
// the API answers 501 instead of crashing.

/** An error with the HTTP status the API answers with. */
export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string
  ) {
    super(message)
    this.name = "HttpError"
  }
}

const NOT_BUILT = /Not built yet: (RD-\d{3})/

/** The ticket key a "Not built yet" error names, or undefined for any other error. */
export function notBuilt(error: unknown): string | undefined {
  const m = error instanceof Error ? NOT_BUILT.exec(error.message) : null
  return m?.[1]
}

/**
 * Runs fn. When it throws "Not built yet", records the ticket in `missing`
 * and returns undefined. Any other error is thrown.
 */
export async function ifBuilt<T>(missing: string[], fn: () => T | Promise<T>): Promise<T | undefined> {
  try {
    return await fn()
  } catch (error) {
    const key = notBuilt(error)
    if (!key) throw error
    if (!missing.includes(key)) missing.push(key)
    return undefined
  }
}
