import { existsSync } from "node:fs"
import { join } from "node:path"

import { Router } from "express"

import { readTrace } from "../../agent/trace"
import { HttpError, notBuilt } from "../errors"
import type { Deps } from "../app"

// A run's trace, for the ticket page's timeline. Provided.
//
//   GET /api/runs/:runId   { lines: TraceLine[] } from runs/<runId>.jsonl (RD-103)

export function runsRouter(deps: Deps): Router {
  const router = Router()
  router.get("/runs/:runId", (req, res) => {
    const { runId } = req.params
    if (!/^[\w.-]+$/.test(runId)) throw new HttpError(400, "Not a run id")
    const path = join(deps.runsDir ?? "runs", `${runId}.jsonl`)
    // readTrace throws "Not built yet: RD-103" until the trace exists: a 501.
    if (!existsSync(path)) {
      try {
        readTrace(path)
      } catch (error) {
        if (notBuilt(error)) throw error
      }
      throw new HttpError(404, `No trace for ${runId} (runs/${runId}.jsonl)`)
    }
    res.json({ lines: readTrace(path) })
  })
  return router
}
