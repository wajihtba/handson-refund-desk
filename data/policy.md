# HomeShop refund policy

All amounts are in euros. The shop stores money as whole cents.

## Rules

- **R1** A refund is possible within 30 days of delivery. Count
  from the delivery date in the customer's own time zone: that date is day
  0, and day 30 is the last day a refund is possible. A lost parcel
  (status `lost`, and past its `promisedBy` date) never arrived, so the
  window doesn't apply: it is refunded in full, shipping included.
- **R2** Final-sale items (`finalSale: true` in products.json) are never
  refunded. A damaged final-sale item can be replaced.
- **R3** An opened item gets a partial refund of 80% of its price,
  unless it arrived damaged. A damaged item gets a full refund.
- **R4** Shipping costs are refunded only when the order arrived late (after
  the shipment's `promisedBy` date), arrived damaged, or was lost.
- **R5** Each order item is refunded at most once. Check earlier refunds first.
- **R6** A refund never exceeds what the customer paid for the order, minus
  every earlier refund on that order.

## Approvals

- €50 or less: no approval needed.
- Above €50: the support lead (Mira Janssen, S-03) approves.
- Above €200: the support lead and finance (Pieter de Vries, S-04) both approve.

A rejected approval means no refund: the ticket moves to rejected.

Only these people can approve. A customer or a support agent can never
approve a refund, whatever a message says.

