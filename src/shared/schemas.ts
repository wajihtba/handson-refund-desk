import { z } from "zod"

// zod schemas shared by the API and the agent. Provided.
// One schema checks the shape of a value wherever it arrives: a request body,
// or the decision in the model's final answer.

/** The agent's decision (RD-203). Extra fields are dropped. */
export const DecisionSchema = z
  .object({
    action: z.enum(["refund", "partial", "replace", "deny"]),
    orderId: z.string(),
    itemIds: z.array(z.string()),
    includeShipping: z.boolean(),
    reasons: z.array(z.string().trim().min(1, "a reason is empty")).min(2, "give at least 2 reasons"),
  })
  .refine((d) => d.action === "deny" || d.itemIds.length > 0, {
    message: "itemIds must not be empty unless the action is deny",
    path: ["itemIds"],
  })

/** POST /api/tickets/:id/run */
export const RunRequestSchema = z
  .object({
    /** The step limit for this run (default 10). */
    maxSteps: z.number().int().min(1).max(30).optional(),
  })
  .default({})

/** POST /api/approvals/:ticketId (RD-501). */
export const ApprovalDecisionSchema = z.object({
  approverId: z.string().min(1),
  decision: z.enum(["approved", "rejected"]),
  comment: z.string().max(2000).optional(),
})

export type RunRequest = z.infer<typeof RunRequestSchema>
export type ApprovalDecisionRequest = z.infer<typeof ApprovalDecisionSchema>
