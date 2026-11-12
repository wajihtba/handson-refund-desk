import { readFileSync } from "node:fs"
import { join } from "node:path"

// RD-505: HomeShop's help centre, and a keyword search over it, so the
// agent can look up the rule it applies and the reply can cite it (RD-506
// puts it behind a tool). Verify runs hidden tests against searchHelp, with
// sections of its own.
//
// loadHelp(dir) is provided: it reads the refund rules R1 to R6 from
// data/policy.md and the questions F1 to F10 from data/help/faq.md, one
// section each. A section's id is what a reply cites ("R4", "F2").
//
// searchHelp(query, sections, k = 3): HelpHit[]
//   Keyword search: no model, no embeddings.
//   - Words are compared without case, and a word also matches the same
//     word with a trailing "s" ("refunds" finds "refund"). Words in
//     STOP_WORDS never count.
//   - A section that shares more of the query's words scores higher, and a
//     word in a section's title counts for more than the same word in its
//     text.
//   - A section id written in the query ("R4", "f2") puts that section
//     first.
//   - Returns at most k hits, best first, each one the section with its
//     score (higher is better, always above 0). A section that matches
//     nothing is never returned. Equal scores keep the order of `sections`.
//   - An empty query, or one with only stop words, returns [].

export type HelpSection = {
  /** What a reply cites: "R1" to "R6", "F1" to "F10". */
  id: string
  title: string
  text: string
  /** The file it came from: "policy.md" or "faq.md". */
  source: string
}

export type HelpHit = HelpSection & { score: number }

export const STOP_WORDS = new Set(
  "a an and are as at be but by can could do does did for from get got had has have how i if in into is it its me my no not of on or our so than that the their them then there they this to us was we were what when where which who why will with would you your".split(
    " "
  )
)

export function loadHelp(dir = "data"): HelpSection[] {
  const sections: HelpSection[] = []
  const policy = readFileSync(join(dir, "policy.md"), "utf8")
  const rules = policy.split("## Approvals")[0]
  for (const m of rules.matchAll(/^- \*\*(R\d+)\*\* ([\s\S]*?)(?=^- \*\*R\d+\*\*|^## |$(?![\s\S]))/gm)) {
    const text = m[2].replace(/\s+/g, " ").trim()
    sections.push({ id: m[1], title: text.split(/(?<=\.) /)[0], text, source: "policy.md" })
  }
  const faq = readFileSync(join(dir, "help", "faq.md"), "utf8")
  for (const part of faq.split(/^## /m).slice(1)) {
    const [head, ...body] = part.split("\n")
    const m = head.match(/^(F\d+) (.+)$/)
    if (!m) continue
    sections.push({ id: m[1], title: m[2].trim(), text: body.join(" ").replace(/\s+/g, " ").trim(), source: "faq.md" })
  }
  return sections
}

export function searchHelp(query: string, sections: HelpSection[], k = 3): HelpHit[] {
  void query
  void sections
  void k
  throw new Error("Not built yet: RD-505")
}
