import { Router } from "express"

import { issueRefund, RefundRefusedError } from "../../agent/refunds/issue"
import { HttpError } from "../errors"
import type { Deps } from "../app"
import { findTicket } from "./tickets"

// Refunds and the customer's status page. Provided: it calls your code.
//
//   POST /api/tickets/:id/refund   issues the ticket's refund (RD-503); 409 when refused
//   GET  /api/refunds              the refunds this server issued
//   GET  /api/status/:id           what the customer's status page shows (RD-702)

export function refundsRouter(deps: Deps): Router {
  const router = Router()

  router.post("/tickets/:id/refund", async (req, res) => {
    const ticket = findTicket(deps.db, req.params.id)
    try {
      const refunded = await issueRefund(ticket, deps.shop)
      deps.db.saveTicket(refunded)
      res.json({ ticket: refunded })
    } catch (error) {
      if (error instanceof RefundRefusedError) throw new HttpError(409, error.message)
      throw error
    }
  })

  router.get("/refunds", (_req, res) => {
    res.json({ refunds: deps.shop.refundsIssued() })
  })

  router.get("/status/:id", (req, res) => {
    const ticket = findTicket(deps.db, req.params.id)
    const refund = deps.shop.refundsIssued().find((r) => r.id === ticket.refundId) ?? null
    res.json({ ticket, refund })
  })

  return router
}
