import { mkdirSync } from "node:fs"
import { dirname, join } from "node:path"
import { DatabaseSync } from "node:sqlite"
import { fileURLToPath } from "node:url"

import type { InboxMessage, Ticket } from "../shared/types"

// The desk's database: SQLite through Node's built-in node:sqlite, in
// .data/refund-desk.db. Provided. No server to run: the file is the
// database. npm run db:reset deletes it; the next start creates it again
// with one "new" ticket per message in data/inbox.json.
//
// Tests open their own database in memory: openDb(":memory:", { inbox }).

export const DB_PATH = join(dirname(fileURLToPath(import.meta.url)), "..", "..", ".data", "refund-desk.db")

// Each migration runs once, in order. Add new ones at the end; never edit
// one that already ran (PRAGMA user_version counts them).
const MIGRATIONS = [
  `CREATE TABLE tickets (
     id TEXT PRIMARY KEY,
     status TEXT NOT NULL,
     data TEXT NOT NULL,          -- the whole Ticket, as JSON
     updated_at TEXT NOT NULL
   )`,
  // RD-501: the support lead's queue, when you keep it in the database.
  `CREATE TABLE approvals (
     ticket_id TEXT NOT NULL,
     approver_id TEXT NOT NULL,
     amount_cents INTEGER NOT NULL,
     summary TEXT NOT NULL,
     status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
     comment TEXT,
     requested_at TEXT NOT NULL,
     decided_at TEXT,
     PRIMARY KEY (ticket_id, approver_id)
   )`,
]

export type Db = {
  /** Every ticket, oldest message first. */
  listTickets(): Ticket[]
  getTicket(id: string): Ticket | undefined
  /** Inserts the ticket, or replaces the saved one with the same id. */
  saveTicket(ticket: Ticket): void
  /** The underlying connection, for your own queries (RD-402, RD-501). */
  sql: DatabaseSync
  close(): void
}

export function openDb(path: string = DB_PATH, opts: { inbox?: InboxMessage[] } = {}): Db {
  if (path !== ":memory:") mkdirSync(dirname(path), { recursive: true })
  const sql = new DatabaseSync(path)
  sql.exec("PRAGMA journal_mode = WAL")
  const done = Number((sql.prepare("PRAGMA user_version").get() as { user_version: number }).user_version)
  for (let i = done; i < MIGRATIONS.length; i++) {
    sql.exec("BEGIN")
    sql.exec(MIGRATIONS[i])
    sql.exec(`PRAGMA user_version = ${i + 1}`)
    sql.exec("COMMIT")
  }

  const db: Db = {
    sql,
    listTickets() {
      const rows = sql.prepare("SELECT data FROM tickets").all() as { data: string }[]
      return rows
        .map((r) => JSON.parse(r.data) as Ticket)
        .sort((a, b) => a.message.receivedAt.localeCompare(b.message.receivedAt) || a.id.localeCompare(b.id))
    },
    getTicket(id) {
      const row = sql.prepare("SELECT data FROM tickets WHERE id = ?").get(id) as { data: string } | undefined
      return row ? (JSON.parse(row.data) as Ticket) : undefined
    },
    saveTicket(ticket) {
      sql
        .prepare(
          `INSERT INTO tickets (id, status, data, updated_at) VALUES (?, ?, ?, ?)
           ON CONFLICT (id) DO UPDATE SET status = excluded.status, data = excluded.data, updated_at = excluded.updated_at`
        )
        .run(ticket.id, ticket.status, JSON.stringify(ticket), ticket.updatedAt)
    },
    close() {
      sql.close()
    },
  }

  const count = (sql.prepare("SELECT COUNT(*) AS n FROM tickets").get() as { n: number }).n
  if (Number(count) === 0 && opts.inbox) {
    sql.exec("BEGIN")
    for (const m of opts.inbox) db.saveTicket({ id: m.id, status: "new", message: m, history: [], updatedAt: m.receivedAt })
    sql.exec("COMMIT")
  }
  return db
}
