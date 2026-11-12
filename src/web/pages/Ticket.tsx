import { useState } from "react"
import type { ReactNode } from "react"
import { Link, useParams } from "react-router"

import type { TicketDetail, TraceLine } from "../../shared/types"
import { ApiError, api, euros, useLoad } from "../api"
import { NotBuilt } from "../components/NotBuilt"
import { RunTimeline } from "../components/RunTimeline"
import { StatusBadge } from "../components/StatusBadge"

// One ticket: the customer's message, the agent's decision, the draft reply
// and the run's timeline. Provided. Parts whose code isn't built yet show
// which ticket builds them.

const ACTIONS = { refund: "Full refund", partial: "Partial refund", replace: "Replacement", deny: "Refund declined" }

/** The timeline section: loaded trace lines, or why there are none. */
export type TimelineState = { lines: TraceLine[] } | { notBuilt: string } | { error: string } | { noRun: true }

export function TicketView({
  detail,
  timeline,
  actions,
}: {
  detail: TicketDetail
  timeline: TimelineState
  actions?: ReactNode
}) {
  const { ticket, customer, order } = detail
  const m = ticket.message
  return (
    <article className="ticket">
      <p>
        <Link to="/">Inbox</Link> / {ticket.id}
      </p>
      <h1>
        {m.subject} <StatusBadge status={ticket.status} />
      </h1>
      <p className="muted">
        From {m.from.name} &lt;{m.from.email}&gt;, received {m.receivedAt.replace("T", " ").replace("Z", " UTC")}
      </p>
      {actions}

      <div className="grid">
        <section className="card">
          <h2>Message</h2>
          <p className="message">{m.body}</p>
        </section>
        <section className="card">
          <h2>Customer</h2>
          {customer ? (
            <dl>
              <dt>Customer</dt>
              <dd>
                {customer.name} ({customer.id})
              </dd>
              <dt>Postcode</dt>
              <dd>
                {customer.postcode}, {customer.country}
              </dd>
              <dt>Time zone</dt>
              <dd>{customer.timeZone}</dd>
            </dl>
          ) : (
            <p className="empty">No customer has this email address.</p>
          )}
          {order ? (
            <p>
              Order {order.id}: {order.items.length} item(s), {euros(order.totalCents)}, {order.channel}
            </p>
          ) : null}
        </section>
      </div>

      <section className="card">
        <h2>Decision</h2>
        {ticket.decision ? (
          <>
            <p>
              <strong>{ACTIONS[ticket.decision.action]}</strong> for {ticket.decision.orderId}
              {ticket.decision.itemIds.length ? ` (${ticket.decision.itemIds.join(", ")})` : ""}
              {ticket.decision.includeShipping ? ", with shipping" : ""}
              {ticket.amountCents !== undefined ? `: ${euros(ticket.amountCents)}` : ""}
            </p>
            <ul>
              {ticket.decision.reasons.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </>
        ) : ticket.runId ? (
          <p className="empty">
            The last run ended without a valid decision, for example because the agent asked the customer a question. Until RD-203 is
            built, every run ends this way.
          </p>
        ) : (
          <NotBuilt ticket="RD-203">
            The agent's decision and its amount appear here once RD-203 is built and the agent has run.
          </NotBuilt>
        )}
      </section>

      <section className="card">
        <h2>Draft reply</h2>
        {ticket.reply ? <p className="message">{ticket.reply}</p> : <p className="empty">No reply yet. Run the agent first.</p>}
      </section>

      <section className="card">
        <h2>Timeline</h2>
        {"lines" in timeline ? <RunTimeline lines={timeline.lines} /> : null}
        {"notBuilt" in timeline ? <NotBuilt ticket={timeline.notBuilt}>Every run's steps appear here once traces exist.</NotBuilt> : null}
        {"error" in timeline ? <p className="error">{timeline.error}</p> : null}
        {"noRun" in timeline ? <p className="empty">No run yet.</p> : null}
      </section>
    </article>
  )
}

export function TicketPage() {
  const { id = "" } = useParams()
  const detail = useLoad(() => api.ticket(id), id)
  const runId = detail.data?.ticket.runId
  const trace = useLoad<TimelineState>(async () => {
    if (!runId) return { noRun: true }
    try {
      return { lines: await api.trace(runId) }
    } catch (e) {
      if (e instanceof ApiError && e.notBuilt) return { notBuilt: e.notBuilt }
      return { error: (e as Error).message }
    }
  }, runId ?? "none")
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ kind: "error" | "info"; text: string } | null>(null)

  async function act(what: "run" | "workflow" | "refund") {
    setBusy(true)
    setMessage(null)
    try {
      if (what === "run") {
        const r = await api.run(id)
        const skipped = r.notBuilt.length ? ` Skipped, not built yet: ${r.notBuilt.join(", ")}.` : ""
        setMessage({ kind: "info", text: `The agent stopped (${r.run.stopReason}) after ${r.run.steps} steps.${skipped}` })
      } else if (what === "workflow") {
        const r = await api.workflow(id)
        setMessage({ kind: "info", text: `The workflow ran ${r.stages.join(", ") || "no stage"}. The ticket is ${r.ticket.status}.` })
      } else {
        await api.refund(id)
        setMessage({ kind: "info", text: "Refund issued." })
      }
      detail.reload()
    } catch (e) {
      setMessage({ kind: "error", text: (e as Error).message })
    } finally {
      setBusy(false)
    }
  }

  if (detail.loading && !detail.data) return <p className="empty">Loading...</p>
  if (detail.error || !detail.data) return <p className="error">{detail.error?.message ?? "No ticket"}</p>
  const actions = (
    <div className="actions">
      <button onClick={() => act("run")} disabled={busy}>
        {busy ? "Working..." : "Run the agent"}
      </button>
      <button onClick={() => act("workflow")} disabled={busy}>
        Run the workflow
      </button>
      <button onClick={() => act("refund")} disabled={busy || detail.data.ticket.status !== "approved"}>
        Issue the refund
      </button>
      <Link to={`/status/${id}`}>Customer's status page</Link>
      <span className="muted">Running the agent or the workflow uses real model tokens.</span>
      {message ? <p className={message.kind}>{message.text}</p> : null}
    </div>
  )
  return <TicketView detail={detail.data} timeline={trace.data ?? { noRun: true }} actions={actions} />
}
