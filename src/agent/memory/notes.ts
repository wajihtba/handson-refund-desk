import type { Db } from "../../server/db"

// RD-604: what a returning customer told us, kept per customer. No hidden
// tests: your tests and the review check this contract. The workflow
// (RD-403) reads the notes in its investigate stage.
//
// rememberNote(db, customerId, text, opts): NoteResult
//   Saves a short note for one customer, in the database (add a migration
//   in src/server/db.ts). When the note stops being true is yours to
//   decide and store.
//   - Refuses, and saves nothing, a note that holds payment details (a card
//     number or an IBAN) or a password: { saved: false, reason }.
//
// notesFor(db, customerId, today): string[]
//   The notes of that customer that are still true on `today`
//   (YYYY-MM-DD), oldest first. Never another customer's.
//
// customerId is always the customer your code found for the ticket
// (RD-202), never an id or a name the model wrote. A note is customer
// text: the model gets it as data, never as an instruction (RD-601).

export type NoteResult = { saved: true } | { saved: false; reason: string }

export function rememberNote(db: Db, customerId: string, text: string, opts: { at: string; until?: string }): NoteResult {
  void db
  void customerId
  void text
  void opts
  throw new Error("Not built yet: RD-604")
}

export function notesFor(db: Db, customerId: string, today: string): string[] {
  void db
  void customerId
  void today
  throw new Error("Not built yet: RD-604")
}
