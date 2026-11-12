// npm run dev: the API on port 3000 and the web app on port 5173, together.
// Provided. The API restarts when you change a file under src/; the web app
// reloads in the browser by itself. Ctrl+C stops both.
import { spawn } from "node:child_process"
import { fileURLToPath } from "node:url"

const vite = fileURLToPath(new URL("../node_modules/vite/bin/vite.js", import.meta.url))
const apiPort = process.env.PORT ?? "3000"

const children = []
function start(name, args) {
  const child = spawn(process.execPath, args, { stdio: ["ignore", "pipe", "pipe"], env: process.env })
  const prefix = (chunk) =>
    chunk
      .toString()
      .split("\n")
      .filter((line) => line.trim())
      .map((line) => `[${name}] ${line}`)
      .join("\n") + "\n"
  child.stdout.on("data", (d) => process.stdout.write(prefix(d)))
  child.stderr.on("data", (d) => process.stderr.write(prefix(d)))
  child.on("exit", (code, signal) => {
    if (stopping) return
    console.error(`[${name}] stopped (${signal ?? `exit code ${code}`}). Stopping the other one too.`)
    stop(code ?? 1)
  })
  children.push(child)
}

let stopping = false
function stop(code = 0) {
  stopping = true
  for (const c of children) c.kill("SIGTERM")
  setTimeout(() => process.exit(code), 300)
}
process.on("SIGINT", () => stop(0))
process.on("SIGTERM", () => stop(0))

start("api", ["--import", "tsx", "--watch", "--watch-preserve-output", "src/server/index.ts"])
start("web", [vite])
console.log(`Refund Desk: API on http://localhost:${apiPort}/api, web app on http://localhost:5173/`)
console.log("In the lab, open the Preview tab (port 5173).")
