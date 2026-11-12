import { NotBuilt } from "../components/NotBuilt"

// RD-502: the support lead's approval queue. No hidden tests: your tests
// and the review check this contract.
//
// ApprovalsPage()   (a named export, routed at /approvals)
//   - Lists the pending approvals for the support lead (S-03) from
//     GET /api/approvals (src/server/routes/approvals.ts): the ticket id,
//     the customer, the amount as €12.34 and the summary. The summary is
//     what the lead decides from: write it (shop.requestApproval) so it
//     names the order and the reasons.
//   - Approve and Reject buttons, with a comment, call
//     POST /api/approvals/:ticketId through api.decide in src/web/api.ts.
//     A rejection needs a comment. The list updates after each decision.
//   - Shows an API error (a 409, for example) next to the approval it is
//     about.
//
// Until RD-502 it shows a placeholder.

export function ApprovalsPage() {
  return (
    <section>
      <h1>Approvals</h1>
      <NotBuilt ticket="RD-502">The support lead approves refunds above €50 here.</NotBuilt>
    </section>
  )
}
