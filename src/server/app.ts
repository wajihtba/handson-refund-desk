import express from "express"
import type { NextFunction, Request, Response } from "express"
import { ZodError } from "zod"

import type { Db } from "./db"
import type { ChatFn } from "./llm"
import { HttpError, notBuilt } from "./errors"
import { approvalsRouter } from "./routes/approvals"
import { refundsRouter } from "./routes/refunds"
import { runsRouter } from "./routes/runs"
import { ticketsRouter } from "./routes/tickets"
import type { Shop } from "./shop/api"

// The desk's HTTP API, an Express 5 app. Provided.
// src/server/index.ts starts it on PORT (3000). Tests build one with their
// own database, shop and fake model: createApp({ db, shop, chat }).
//
// Every answer is JSON. Errors are { error } with a status code:
//   400 a request body that doesn't fit its schema (src/shared/schemas.ts)
//   404 no such ticket or run
//   409 the request conflicts with the ticket's state (a refused refund, a
//       status change transition() refuses)
//   501 the code behind it is not built yet: { error: "Not built yet: RD-102", notBuilt: "RD-102" }
//   500 anything else

export type Deps = {
  db: Db
  /** One shop for the server's lifetime: approvals and refunds live in it. */
  shop: Shop
  /** The model. Defaults to the platform model in llm.ts. */
  chat?: ChatFn
  /** Where traces are written (RD-103). Defaults to "runs". */
  runsDir?: string
}

export function createApp(deps: Deps) {
  const app = express()
  app.use(express.json({ limit: "100kb" }))

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true })
  })
  app.use("/api", ticketsRouter(deps))
  app.use("/api", approvalsRouter(deps))
  app.use("/api", refundsRouter(deps))
  app.use("/api", runsRouter(deps))
  app.use("/api", (_req, res) => {
    res.status(404).json({ error: "No such API route" })
  })

  app.use(handleErrors)
  return app
}

/** Turns an error into its JSON answer (the codes at the top of this file). Express 5 sends errors from async handlers here. */
export function handleErrors(error: unknown, _req: Request, res: Response, next: NextFunction) {
  void next
  const key = notBuilt(error)
  if (key) {
    res.status(501).json({ error: `Not built yet: ${key}`, notBuilt: key })
  } else if (error instanceof Error && error.name === "InvalidTransitionError") {
    res.status(409).json({ error: error.message })
  } else if (error instanceof HttpError) {
    res.status(error.status).json({ error: error.message })
  } else if (error instanceof ZodError) {
    res.status(400).json({ error: error.issues.map((i) => `${i.path.join(".") || "body"}: ${i.message}`).join("; ") })
  } else if (error instanceof SyntaxError && "body" in error) {
    res.status(400).json({ error: "The request body is not valid JSON" })
  } else {
    console.error(error)
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) })
  }
}
