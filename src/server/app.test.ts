import assert from "node:assert/strict"
import type { Server } from "node:http"
import type { AddressInfo } from "node:net"
import { after, before, test } from "node:test"

import express from "express"

import { createApp, handleErrors } from "./app"
import { openDb } from "./db"
import { Shop } from "./shop/api"
import { loadData } from "./shop/data"
import { scriptedChat } from "./testing/fake-chat"

// The API on a database in memory and the fake model. Provided: these pass
// from day one, before any agent code exists, and keep passing as you build
// each ticket.

const db = openDb(":memory:", { inbox: loadData().inbox })
const app = createApp({ db, shop: new Shop(), chat: scriptedChat([{ text: "ok" }], { repeatLast: true }) })
let base = ""
let server: ReturnType<typeof app.listen>

before(async () => {
  await new Promise<void>((resolve) => {
    server = app.listen(0, "127.0.0.1", () => resolve())
  })
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api`
})
after(() => {
  server.close()
  db.close()
})

test("the inbox lists every message as a new ticket", async () => {
  const res = await fetch(`${base}/tickets`)
  assert.equal(res.status, 200)
  const { tickets } = (await res.json()) as { tickets: { id: string; status: string }[] }
  assert.equal(tickets.length, 40)
  assert.equal(tickets[0].id, "T-001")
  assert.ok(tickets.every((t) => t.status === "new"))
})

test("a ticket comes with its customer", async () => {
  const res = await fetch(`${base}/tickets/T-001`)
  assert.equal(res.status, 200)
  const body = (await res.json()) as { ticket: { id: string; message: { body: string } }; customer: { id: string } | null }
  assert.equal(body.ticket.id, "T-001")
  assert.match(body.ticket.message.body, /kettle/)
  assert.ok(body.customer?.id.startsWith("C-"))
})

test("an unknown ticket is a 404", async () => {
  const res = await fetch(`${base}/tickets/T-999`)
  assert.equal(res.status, 404)
  assert.match(((await res.json()) as { error: string }).error, /T-999/)
})

// Through a route of its own, so the test still holds once every ticket is built.
test("code that isn't built yet answers 501, and the server keeps running", async () => {
  const stub = express()
  stub.get("/stub", () => {
    throw new Error("Not built yet: RD-999")
  })
  stub.use(handleErrors)
  const server = await new Promise<Server>((resolve) => {
    const s = stub.listen(0, "127.0.0.1", () => resolve(s))
  })
  try {
    const url = `http://127.0.0.1:${(server.address() as AddressInfo).port}/stub`
    const res = await fetch(url)
    assert.equal(res.status, 501)
    assert.deepEqual(await res.json(), { error: "Not built yet: RD-999", notBuilt: "RD-999" })
    assert.equal((await fetch(url)).status, 501)
  } finally {
    server.close()
  }
  assert.equal((await fetch(`${base}/health`)).status, 200)
})

test("a body that doesn't fit its schema is a 400", async () => {
  const res = await fetch(`${base}/tickets/T-001/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ maxSteps: "many" }),
  })
  assert.equal(res.status, 400)
  assert.match(((await res.json()) as { error: string }).error, /maxSteps/)
})
