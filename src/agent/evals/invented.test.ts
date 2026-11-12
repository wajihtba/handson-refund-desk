import { test } from "node:test"

// RD-302: your tests for findInventedOrders (evals/invented.ts).
// Replace each test.todo with a real test. Cover the contract: the three
// ways an order id can be written, an id glued to other letters or digits,
// duplicates, and a text with no order id at all. Example:
//
//   test("an unknown order id is invented", () => {
//     assert.deepEqual(findInventedOrders("Your order FH-482913 was refunded.", ["FH-100231"]), ["FH-482913"])
//   })

test.todo("returns an order id that is not a known order")
test.todo("accepts FH 100231 and fh-100231, and returns them as FH-100231")
test.todo("ignores an id with a letter or digit glued to either end")
test.todo("returns each invented id once, in the order it first appears")
