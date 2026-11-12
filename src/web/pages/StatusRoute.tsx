import { useParams } from "react-router"

import { api, useLoad } from "../api"
import { NotBuilt } from "../components/NotBuilt"
import StatusPage, { toStatusView } from "./Status"
import type { StatusView } from "./Status"

// /status/:id: loads the ticket and its refund, then renders the customer's
// status page (RD-702). Provided.

export function StatusRoute() {
  const { id = "" } = useParams()
  const { data, error, loading } = useLoad(() => api.status(id), id)
  if (loading) return <p className="empty">Loading...</p>
  if (error || !data) return <p className="error">{error?.message ?? "Nothing to show"}</p>
  let view: StatusView
  try {
    view = toStatusView(data.ticket, data.refund)
  } catch (e) {
    return <NotBuilt ticket="RD-702">{(e as Error).message}</NotBuilt>
  }
  return <StatusPage view={view} />
}
