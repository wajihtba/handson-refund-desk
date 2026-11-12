import { Link } from "react-router"

import type { TicketSummary } from "../../shared/types"
import { api, euros, useLoad } from "../api"
import { StatusBadge } from "../components/StatusBadge"

// The support inbox: every customer message and its ticket's status.
// Provided.

export function InboxTable({ tickets }: { tickets: TicketSummary[] }) {
  if (!tickets.length) return <p className="empty">The inbox is empty.</p>
  return (
    <table className="inbox">
      <thead>
        <tr>
          <th>Ticket</th>
          <th>From</th>
          <th>Subject</th>
          <th>Waiting</th>
          <th>Order</th>
          <th>Amount</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {tickets.map((t) => (
          <tr key={t.id}>
            <td>
              <Link to={`/tickets/${t.id}`}>{t.id}</Link>
            </td>
            <td>{t.from.name}</td>
            <td>
              <Link to={`/tickets/${t.id}`}>{t.subject}</Link>
            </td>
            <td>{t.waitingDays === 1 ? "1 day" : `${t.waitingDays} days`}</td>
            <td>{t.orderId ?? "-"}</td>
            <td>{t.amountCents === undefined ? "-" : euros(t.amountCents)}</td>
            <td>
              <StatusBadge status={t.status} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export function InboxPage() {
  const { data, error, loading } = useLoad(api.tickets, "inbox")
  return (
    <section>
      <h1>Inbox</h1>
      {loading && !data ? <p className="empty">Loading...</p> : null}
      {error ? <p className="error">Could not load the inbox: {error.message}. Is the API running (npm run dev)?</p> : null}
      {data ? <InboxTable tickets={data} /> : null}
    </section>
  )
}
