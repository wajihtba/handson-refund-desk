import type { TraceLine } from "../shared/types"
import type { Step } from "./loop"

// RD-103: a trace of every run, so you can see what the agent did.
// Verify runs hidden tests against this contract. The ticket page shows it
// with src/web/components/RunTimeline.tsx (RD-103).
//
// toTraceLine(runId, index, step): TraceLine
//   - index is the step's 1-based position in the run. It becomes the
//     line's `step`.
//   - A tool step's line has the tool name in `tool`, and in `args` the
//     arguments parsed from their JSON string (or the raw string when it
//     isn't valid JSON).
//   - summary is one short line, never empty and at most 120 characters:
//     what the step returned, or why it failed.
//   - durationMs is the step's own duration.
//
// writeTrace(runId, lines, dir = "runs"): string
//   - Writes dir/<runId>.jsonl, one JSON object per line, in order, and
//     returns that path. Creates dir if it doesn't exist.
//
// readTrace(path): TraceLine[]
//   - Reads that file back, in order.
//
// formatTimeline(lines): string
//   - One text line per trace line, in order, nothing else.
//   - Each line starts with the step number, names the tool on tool steps,
//     and shows the summary and the duration as "<n>ms".
//   `npm run trace -- <runId>` prints it.
//
// TraceLine (src/shared/types.ts) already has room for what later tickets
// add to the same file: "task" lines (RD-404), "stage" lines (RD-403) and a
// model step's token counts in `usage` (RD-701). toTraceLine makes only
// "model" and "tool" lines; formatTimeline prints any line it is given.

export type { TraceLine }

export function toTraceLine(runId: string, index: number, step: Step): TraceLine {
  void runId
  void index
  void step
  throw new Error("Not built yet: RD-103")
}

export function writeTrace(runId: string, lines: TraceLine[], dir = "runs"): string {
  void runId
  void lines
  void dir
  throw new Error("Not built yet: RD-103")
}

export function readTrace(path: string): TraceLine[] {
  void path
  throw new Error("Not built yet: RD-103")
}

export function formatTimeline(lines: TraceLine[]): string {
  void lines
  throw new Error("Not built yet: RD-103")
}
