import { useCallback, useEffect, useState } from "react"

import type { Approval, Refund, RunResponse, Ticket, TicketDetail, TicketSummary, TraceLine } from "../shared/types"

// The typed client for the desk's API. Provided.
// Every path is relative to Vite's base, so the same code works on your
// laptop and behind the lab's preview path. Vite forwards /api to the API on
// port 3000 (vite.config.ts).

export const BASE: string = (import.meta.env?.BASE_URL ?? "/").replace(/\/?$/, "/")

/** An answer that wasn't 2xx. notBuilt names the ticket for a 501 ("RD-102"). */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly notBuilt?: string
  ) {
    super(message)
    this.name = "ApiError"
  }
}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}api/${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  })
  const body = (await res.json().catch(() => ({}))) as { error?: string; notBuilt?: string }
  if (!res.ok) throw new ApiError(res.status, body.error ?? `${res.status} ${res.statusText}`, body.notBuilt)
  return body as T
}

export const api = {
  tickets: () => call<{ tickets: TicketSummary[] }>("tickets").then((b) => b.tickets),
  ticket: (id: string) => call<TicketDetail>(`tickets/${encodeURIComponent(id)}`),
  run: (id: string) => call<RunResponse>(`tickets/${encodeURIComponent(id)}/run`, { method: "POST", body: "{}" }),
  workflow: (id: string) =>
    call<{ ticket: Ticket; stages: string[] }>(`tickets/${encodeURIComponent(id)}/workflow`, { method: "POST", body: "{}" }),
  refund: (id: string) =>
    call<{ ticket: Ticket }>(`tickets/${encodeURIComponent(id)}/refund`, { method: "POST", body: "{}" }).then((b) => b.ticket),
  trace: (runId: string) => call<{ lines: TraceLine[] }>(`runs/${encodeURIComponent(runId)}`).then((b) => b.lines),
  status: (id: string) => call<{ ticket: Ticket; refund: Refund | null }>(`status/${encodeURIComponent(id)}`),
  approvals: (approverId: string) =>
    call<{ approvals: Approval[] }>(`approvals?approverId=${encodeURIComponent(approverId)}`).then((b) => b.approvals),
  decide: (ticketId: string, body: { approverId: string; decision: "approved" | "rejected"; comment?: string }) =>
    call<{ ticket: Ticket }>(`approvals/${encodeURIComponent(ticketId)}`, { method: "POST", body: JSON.stringify(body) }).then(
      (b) => b.ticket
    ),
}

export type Loaded<T> = { data?: T; error?: ApiError | Error; loading: boolean; reload: () => void }

/** Loads data when the component mounts and whenever `key` changes. */
export function useLoad<T>(load: () => Promise<T>, key: string): Loaded<T> {
  const [state, setState] = useState<{ data?: T; error?: Error; loading: boolean }>({ loading: true })
  const [gen, setGen] = useState(0)
  useEffect(() => {
    let live = true
    setState((s) => ({ ...s, loading: true }))
    load().then(
      (data) => live && setState({ data, loading: false }),
      (error: Error) => live && setState({ error, loading: false })
    )
    return () => {
      live = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, gen])
  const reload = useCallback(() => setGen((n) => n + 1), [])
  return { ...state, reload }
}

/** 1234 -> "€12.34". */
export function euros(cents: number): string {
  return `€${(cents / 100).toFixed(2)}`
}
