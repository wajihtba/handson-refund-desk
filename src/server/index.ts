import { createApp } from "./app"
import { openDb } from "./db"
import { Shop } from "./shop/api"
import { loadData } from "./shop/data"

// Starts the API: npm run dev starts it together with the web app, or run
// it alone with npm run api. Provided.

const port = Number(process.env.PORT ?? 3000)
const shop = new Shop()
const db = openDb(undefined, { inbox: loadData().inbox })
const app = createApp({ db, shop })

const server = app.listen(port, () => {
  console.log(`Refund Desk API on http://localhost:${port}/api (try /api/tickets)`)
})
server.on("error", (error) => {
  console.error(`The API could not start on port ${port}: ${error.message}`)
  process.exit(1)
})
for (const signal of ["SIGINT", "SIGTERM"] as const)
  process.on(signal, () => {
    server.close()
    db.close()
    process.exit(0)
  })
