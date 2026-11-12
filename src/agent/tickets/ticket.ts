import type { Db } from "../../server/db"
import type { Ticket, TicketStatus } from "../../shared/types"

// RD-402: a ticket moves through clear statuses and is saved in the
// database. No hidden tests: your tests and the review check this contract.
//
// transition(ticket, to, note?, at?): Ticket
//   - Returns a new ticket in status `to`, with { from, to, at, note } added
//     to its history and updatedAt set to `at` (an ISO instant). The ticket
//     passed in is not changed.
//   - Only these changes are allowed. Any other throws an
//     InvalidTransitionError naming both statuses:
//       new              -> investigating | closed
//       investigating    -> proposed | replied | closed
//       proposed         -> pending_approval | approved | rejected | investigating
//       pending_approval -> approved | rejected
//       approved         -> refunded | replied
//       refunded         -> replied
//       rejected         -> investigating | replied
//       replied          -> closed
//   - The approval rule (data/policy.md): a refund of €50 or less needs no
//     approval, so proposed -> approved is allowed for it, and for "replace"
//     and "deny", which move no money. Above €50 the support lead approves,
//     and above €200 finance approves too: those go through
//     pending_approval. A rejected approval moves the ticket to rejected.
//   - RD-504 adds one change: approved -> pending_approval. A refund whose
//     amount went up after it was approved is not paid: the ticket waits for
//     a new approval of the new amount. Leave it out until RD-504.
//
// saveTicket(ticket, db): Ticket
//   Saves the ticket through db.saveTicket (src/server/db.ts) and returns
//   it. When the database already holds the ticket in another status, that
//   status must be able to move to ticket.status, or it throws an
//   InvalidTransitionError and saves nothing.
//
// loadTicket(id, db): Ticket | undefined
//   The saved ticket, or undefined when there is none. A ticket loaded back
//   equals the one saved.

export class InvalidTransitionError extends Error {
  constructor(
    readonly from: TicketStatus,
    readonly to: TicketStatus
  ) {
    super(`A ticket can't go from ${from} to ${to}`)
    this.name = "InvalidTransitionError"
  }
}

export function transition(ticket: Ticket, to: TicketStatus, note?: string, at: Date = new Date()): Ticket {
  void ticket
  void to
  void note
  void at
  throw new Error("Not built yet: RD-402")
}

export function saveTicket(ticket: Ticket, db: Db): Ticket {
  void ticket
  void db
  throw new Error("Not built yet: RD-402")
}

export function loadTicket(id: string, db: Db): Ticket | undefined {
  void id
  void db
  throw new Error("Not built yet: RD-402")
}
