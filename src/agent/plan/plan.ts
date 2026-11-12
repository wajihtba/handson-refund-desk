import type { ChatFn } from "../../server/llm"

// RD-404: plan first, then carry the plan out. Verify runs hidden tests
// against validatePlan and executePlan; your tests and the review check
// requestPlan. RD-405 decides which messages get a plan.
//
// A message can hold several problems: "one order is late, the other
// arrived damaged". The model writes a plan, code checks it, and code runs
// it task by task.
//
// requestPlan(message, opts): Promise<Plan | null>
//   One model call (opts.chat, or the platform model in src/server/llm.ts)
//   that asks for the plan as structured output: a responseFormat named
//   "plan". The answer is checked with validatePlan. A plan that fails gets
//   one more request that lists the errors; if that one fails too, the
//   result is null and no task runs.
//
// validatePlan(value)
//   A plan is { tasks: Task[] }. Valid when every task has a unique
//   non-empty id, a type from TaskType, an inputs object, and dependsOn
//   listing ids of other tasks in the plan, with no cycle. Returns
//   { ok: true, plan } or { ok: false, errors } with one message per
//   problem. Never throws.
//
// executePlan(plan, handlers, opts)
//   - Runs each task with handlers[task.type] once every task it depends
//     on is done. The handler gets the task and the results of its
//     dependencies, by task id. Tasks with no order between them may run
//     in any order.
//   - Reports every status change through opts.onStatus: pending ->
//     running -> done or failed.
//   - A failed task fails every task that depends on it, directly or
//     through others, without running them. The other tasks still run.
//   - Except draft_reply: one reply answers the whole message, so it always
//     runs. It starts once every task it depends on has finished, done or
//     failed. Its handler gets the result of each done dependency and, for
//     each failed one, a FailedTask with the reason, so the reply tells the
//     customer what happened to every order: decided, or not yet and why.
//   - Returns the final status of every task, the result of every done
//     task, and in errors why each failed task failed.

export type TaskType = "find_customer" | "find_order" | "check_shipment" | "decide" | "draft_reply"

export type Task = {
  id: string
  type: TaskType
  inputs: Record<string, unknown>
  dependsOn: string[]
}

export type Plan = { tasks: Task[] }

export type TaskStatus = "pending" | "running" | "done" | "failed"

export type Handlers = Record<TaskType, (task: Task, deps: Record<string, unknown>) => Promise<unknown>>

/** What draft_reply gets for a dependency that failed. */
export type FailedTask = { failed: true; error: string }

export type Execution = {
  status: Record<string, TaskStatus>
  results: Record<string, unknown>
  /** Why each failed task failed: its own error, or the dependency that failed. */
  errors: Record<string, string>
}

export async function requestPlan(message: string, opts: { chat?: ChatFn } = {}): Promise<Plan | null> {
  void message
  void opts
  throw new Error("Not built yet: RD-404")
}

export function validatePlan(value: unknown): { ok: true; plan: Plan } | { ok: false; errors: string[] } {
  void value
  throw new Error("Not built yet: RD-404")
}

export async function executePlan(
  plan: Plan,
  handlers: Handlers,
  opts: { onStatus?: (taskId: string, status: TaskStatus) => void } = {}
): Promise<Execution> {
  void plan
  void handlers
  void opts
  throw new Error("Not built yet: RD-404")
}
