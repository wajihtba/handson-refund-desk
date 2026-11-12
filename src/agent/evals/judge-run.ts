import { readFileSync } from "node:fs"

import { agreement, judgeReply } from "./judge"
import type { ReplyToJudge, Verdict } from "./judge"

// npm run judge: your judge (RD-304) against your own hand labels.
// Provided.
//
//   npm run judge                              evals/replies.jsonl
//   npm run judge -- --file evals/my-replies.jsonl
//
// Each line is a drafted reply and the decision behind it. Add your own
// label to a line before you run this: "human": true when you would send
// the reply as it is, false when you wouldn't. Lines without a label are
// skipped. This spends real model tokens: one or two calls per line.

const args = process.argv.slice(2)
const i = args.indexOf("--file")
const file = i >= 0 ? args[i + 1] : "evals/replies.jsonl"

type Row = ReplyToJudge & { id: string; human?: boolean }
const rows: Row[] = readFileSync(file, "utf8")
  .split("\n")
  .filter((l) => l.trim())
  .map((l) => JSON.parse(l) as Row)
const labelled = rows.filter((r) => typeof r.human === "boolean")
if (!labelled.length) {
  console.error(`No line in ${file} has a "human" label yet. Label the replies by hand first.`)
  process.exit(1)
}

const results: { verdict: Verdict | null; human: boolean }[] = []
for (const r of labelled) {
  const verdict = await judgeReply({ message: r.message, decision: r.decision, reply: r.reply })
  results.push({ verdict, human: r.human as boolean })
  const said = verdict ? (verdict.pass ? "pass" : `fail (${Object.entries(verdict.criteria).filter(([, ok]) => !ok).map(([c]) => c).join(", ")})`) : "judge failed"
  const flag = verdict && verdict.pass !== r.human ? "  <- you said " + (r.human ? "pass" : "fail") : ""
  console.log(`${r.id}  ${said}${flag}${verdict ? `  ${verdict.reason}` : ""}`)
}
const a = agreement(results)
console.log(`\n${labelled.length} labelled replies · agreement ${a.agreement} · judge passed what you failed: ${a.falsePass} · judge failed what you passed: ${a.falseFail} · judge failed to answer: ${a.failed}`)
if (labelled.length < rows.length) console.log(`${rows.length - labelled.length} lines had no label and were skipped.`)
