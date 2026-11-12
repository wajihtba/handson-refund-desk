import { Router } from "express"

import { refundAmountCents, requestDecision } from "../../agent/decide"
import { runAgent } from "../../agent/loop"
import { transition } from "../../agent/tickets/ticket"
import { toTraceLine, writeTrace } from "../../agent/trace"
import { runWorkflow } from "../../agent/workflow"
import { RunRequestSchema } from "../../shared/schemas"
import type { RunResponse, Ticket, TicketDetail, TicketStatus, TicketSummary } from "../../shared/types"
import type { Deps } from "../app"
import type { Db } from "../db"
import { HttpError, ifBuilt } from "../errors"
import { daysSince } from "../shop/dates"

// The inbox and the agent runs. Provided: it calls your agent code, and
// skips the parts that are not built yet.
//
//   GET  /api/tickets               the inbox, oldest message first
//   GET  /api/tickets/:id           one ticket, its customer and its order
//   POST /api/tickets/:id/run       runs the agent on the message (RD-102; real model tokens)
//                                   and records its decision (RD-203) when the order and items are real
//   POST /api/tickets/:id/workflow  runs the full workflow (RD-403; real model tokens): the
//                                   ticket page's "Run the workflow" button

export function findTicket(db: Db, id: string): Ticket {
  const ticket = db.getTicket(id)
  if (!ticket) throw new HttpError(404, `No ticket ${id}`)
  return ticket
}

/**
 * Moves the ticket to `to` with transition (RD-402). Until RD-402 is built
 * it sets the status directly and records the change in the history.
 */
export async function advance(ticket: Ticket, to: TicketStatus, note: string, missing: string[]): Promise<Ticket> {
  if (ticket.status === to) return ticket
  const moved = await ifBuilt(missing, () => transition(ticket, to, note))
  if (moved) return moved
  const at = new Date().toISOString()
  return { ...ticket, status: to, updatedAt: at, history: [...ticket.history, { from: ticket.status, to, at, note }] }
}

/** The message as the agent reads it. */
export function messageText(ticket: Ticket): string {
  return `Subject: ${ticket.message.subject}\n\n${ticket.message.body}`
}

export function ticketsRouter(deps: Deps): Router {
  const router = Router()
  const data = deps.shop.data

  router.get("/tickets", (_req, res) => {
    const tickets: TicketSummary[] = deps.db.listTickets().map((t) => ({
      id: t.id,
      status: t.status,
      from: t.message.from,
      subject: t.message.subject,
      receivedAt: t.message.receivedAt,
      waitingDays: daysSince(t.message.receivedAt.slice(0, 10), data.meta.today),
      orderId: t.orderId,
      amountCents: t.amountCents,
    }))
    res.json({ tickets })
  })

  router.get("/tickets/:id", (req, res) => {
    const ticket = findTicket(deps.db, req.params.id)
    const email = ticket.message.from.email.trim().toLowerCase()
    const detail: TicketDetail = {
      ticket,
      customer: data.customers.find((c) => c.email.toLowerCase() === email) ?? null,
      order: data.orders.find((o) => o.id === ticket.orderId) ?? null,
    }
    res.json(detail)
  })

  router.post("/tickets/:id/run", async (req, res) => {
    let ticket = findTicket(deps.db, req.params.id)
    const { maxSteps } = RunRequestSchema.parse(req.body ?? {})
    const missing: string[] = []

    // Throws "Not built yet: RD-102" until the loop exists: the answer is a 501.
    const result = await runAgent(messageText(ticket), {
      shop: deps.shop,
      chat: deps.chat,
      customerEmail: ticket.message.from.email,
      maxSteps,
    })

    const runId = `run-${ticket.id}-${new Date().toISOString().replace(/[:.]/g, "-")}`
    await ifBuilt(missing, () =>
      writeTrace(
        runId,
        result.steps.map((s, i) => toTraceLine(runId, i + 1, s)),
        deps.runsDir
      )
    )

    if (ticket.status === "new") ticket = await advance(ticket, "investigating", "The agent looked into it", missing)
    // Asks the model for the decision as structured output (RD-203).
    const parsed = await ifBuilt(missing, () => requestDecision(messageText(ticket), result, { chat: deps.chat }))
    if (parsed?.ok) {
      const decision = parsed.value
      const order = data.orders.find((o) => o.id === decision.orderId)
      // A decision about an order the shop doesn't have, or an item that
      // isn't in the order (refundAmountCents throws), is not a proposal:
      // the run and its trace are still saved, so you can see what happened.
      let real = order !== undefined
      let amountCents: number | undefined
      if (order) {
        try {
          amountCents = await ifBuilt(missing, () => refundAmountCents(decision, order, data.policy))
        } catch {
          real = false
        }
      }
      if (real) {
        ticket = { ...ticket, decision, orderId: decision.orderId, amountCents }
        if (ticket.status === "investigating") ticket = await advance(ticket, "proposed", `Proposed: ${decision.action}`, missing)
      }
    }
    const reply = result.text.trim()
    ticket = { ...ticket, runId, reply: reply || ticket.reply, updatedAt: new Date().toISOString() }
    deps.db.saveTicket(ticket)

    const body: RunResponse = { ticket, run: { runId, stopReason: result.stopReason, steps: result.steps.length }, notBuilt: missing }
    res.json(body)
  })

  router.post("/tickets/:id/workflow", async (req, res) => {
    const ticket = findTicket(deps.db, req.params.id)
    const result = await runWorkflow(ticket, { shop: deps.shop, chat: deps.chat, db: deps.db })
    deps.db.saveTicket(result.ticket)
    res.json(result)
  })

  return router
}
