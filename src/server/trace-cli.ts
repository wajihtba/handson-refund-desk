import { formatTimeline, readTrace } from "../agent/trace"

// npm run trace -- <runId>   prints runs/<runId>.jsonl as a timeline (RD-103).

const runId = process.argv[2]
if (!runId) {
  console.error("Usage: npm run trace -- <runId>   (the run ids are the file names in runs/)")
  process.exit(1)
}
console.log(formatTimeline(readTrace(`runs/${runId.replace(/\.jsonl$/, "")}.jsonl`)))
