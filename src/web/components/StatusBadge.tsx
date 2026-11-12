import type { TicketStatus } from "../../shared/types"

// A ticket's status as a coloured label. Provided.

export function StatusBadge({ status }: { status: TicketStatus }) {
  return <span className={`badge badge-${status}`}>{status.replace("_", " ")}</span>
}
