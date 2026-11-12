import assert from "node:assert/strict"
import { test } from "node:test"

import { renderToStaticMarkup } from "react-dom/server"
import { MemoryRouter } from "react-router"

import type { TicketDetail } from "../../shared/types"
import { InboxTable } from "./Inbox"
import { TicketView } from "./Ticket"

// The provided pages, rendered to HTML without a browser. Provided: these
// pass from day one. Test your own components the same way.

const message = {
  id: "T-001",
  from: { email: "fleurvisser@mail.example", name: "Fleur <b>Visser</b>" },
  receivedAt: "2026-11-18T08:39:00Z",
  subject: "Kettle arrived broken",
  body: "My pressure cooker from order FH-100231 arrived broken.",
}

test("the inbox shows one row per ticket, with names as text", () => {
  const html = renderToStaticMarkup(
    <MemoryRouter>
      <InboxTable
        tickets={[{ id: "T-001", status: "new", from: message.from, subject: message.subject, receivedAt: message.receivedAt, waitingDays: 2 }]}
      />
    </MemoryRouter>
  )
  assert.match(html, /T-001/)
  assert.match(html, /2 days/)
  assert.match(html, /Fleur &lt;b&gt;Visser&lt;\/b&gt;/)
  assert.equal((html.match(/<tr>/g) ?? []).length, 2)
})

test("a ticket without agent output says which ticket builds it", () => {
  const detail: TicketDetail = {
    ticket: { id: "T-001", status: "new", message, history: [], updatedAt: message.receivedAt },
    customer: null,
    order: null,
  }
  const html = renderToStaticMarkup(
    <MemoryRouter>
      <TicketView detail={detail} timeline={{ noRun: true }} />
    </MemoryRouter>
  )
  assert.match(html, /Not built yet: RD-203/)
  assert.match(html, /No run yet/)
  assert.match(html, /FH-100231/)
})

test("a ticket whose run ended without a decision doesn't say RD-203 is missing", () => {
  const detail: TicketDetail = {
    ticket: { id: "T-001", status: "investigating", message, runId: "run-T-001-1", reply: "Which order do you mean?", history: [], updatedAt: message.receivedAt },
    customer: null,
    order: null,
  }
  const html = renderToStaticMarkup(
    <MemoryRouter>
      <TicketView detail={detail} timeline={{ lines: [] }} />
    </MemoryRouter>
  )
  assert.doesNotMatch(html, /Not built yet: RD-203/)
  assert.match(html, /without a valid decision/)
})
