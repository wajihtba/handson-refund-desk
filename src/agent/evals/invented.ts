// RD-302: catch order numbers the model made up.
//
// A model with no tools still answers "your order FH-482913 was refunded".
// This check proves it invented that order. Verify runs hidden tests
// against this contract:
//
//   findInventedOrders(text, knownOrderIds): string[]
//
// - An order id is "FH-" followed by 6 digits: "FH-100231". Also accept a
//   space instead of the hyphen ("FH 100231") and lower case ("fh-100231").
// - It stands on its own: a letter or digit glued to either end makes it
//   something else ("FH-1002315" and "XFH-100231" are not order ids).
// - Write each one as "FH-" plus the 6 digits before you compare it:
//   "fh 100231" is "FH-100231".
// - Return each order id in the text that is not one of knownOrderIds, in
//   that written form, once, in the order it first appears. Return [] when
//   every order id is real, or there is none.

export function findInventedOrders(text: string, knownOrderIds: Iterable<string>): string[] {
  void text
  void knownOrderIds
  throw new Error("Not built yet: RD-302")
}
