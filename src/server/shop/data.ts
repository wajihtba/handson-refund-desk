import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

import type { ShopData } from "./types"

// Loads data/*.json, once, the first time something asks. Provided.
// Nothing reads the disk when a module is imported: tests hand the fake
// shop their own small data instead (new Shop({ data })).

export const DATA_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "data")
let cached: ShopData | undefined

function read<T>(name: string): T {
  return JSON.parse(readFileSync(join(DATA_DIR, name), "utf8")) as T
}

export function loadData(): ShopData {
  cached ??= {
    meta: read("meta.json"),
    products: read("products.json"),
    customers: read("customers.json"),
    orders: read("orders.json"),
    shipments: read("shipments.json"),
    payments: read("payments.json"),
    refunds: read("refunds.json"),
    policy: read("policy.json"),
    staff: read("staff.json"),
    inbox: read("inbox.json"),
    faults: read("faults.json"),
    redTeam: read("red-team.json"),
  }
  return cached
}
