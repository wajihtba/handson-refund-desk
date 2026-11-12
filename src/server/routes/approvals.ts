import { Router } from "express"

import type { Deps } from "../app"

// RD-501: the support lead's approvals, in the API. No hidden tests: your
// tests and the review check this contract. The Approvals page
// (src/web/pages/Approvals.tsx) calls these routes.
//
//   GET  /api/approvals?approverId=S-03
//     { approvals: Approval[] }: that approver's queue, pending first, each
//     with its ticket's id, the amount and the summary.
//   POST /api/approvals/:ticketId
//     Body: ApprovalDecisionSchema (src/shared/schemas.ts):
//     { approverId, decision: "approved" | "rejected", comment? }.
//     Records the decision, then moves the ticket: to "approved" once every
//     approval the amount needs is approved (data/policy.md), to
//     "rejected" when one is rejected. Answers { ticket }.
//     400 for a body that doesn't fit the schema, 404 for an unknown
//     ticket or no pending request from that approver, 409 when the ticket
//     is not pending_approval.
//   Only the approver named in the request can decide it: the support lead
//   (S-03) and finance (S-04) in data/staff.json.
//
// Until RD-501, both answer 501.

export function approvalsRouter(deps: Deps): Router {
  void deps
  const router = Router()
  router.get("/approvals", () => {
    throw new Error("Not built yet: RD-501")
  })
  router.post("/approvals/:ticketId", () => {
    throw new Error("Not built yet: RD-501")
  })
  return router
}
