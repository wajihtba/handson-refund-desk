// The model, behind one thin wrapper so the provider can change. Provided.
//
// Outside the lab you can put LAB_LLM_API_KEY and LAB_LLM_BASE_URL in a .env
// file at the repository root (see .env.example). In the lab, don't.
//
// In your workspace the platform proxy holds the real provider key: the
// lab's login shell sets LAB_LLM_API_KEY and LAB_LLM_BASE_URL. Never put a
// real provider key here or in .env. The proxy speaks the OpenAI chat
// completions format, with tools, and does not stream.

export type ToolCall = { id: string; name: string; arguments: string }

export type Message =
  | { role: "system" | "user"; content: string }
  | { role: "assistant"; content: string | null; tool_calls?: { id: string; type: "function"; function: { name: string; arguments: string } }[] }
  | { role: "tool"; tool_call_id: string; content: string }

/** A tool the model may call: the OpenAI function-tool format. */
export type ToolDefinition = {
  type: "function"
  function: { name: string; description: string; parameters: Record<string, unknown> }
}

/**
 * Structured output: the model answers with JSON in this shape (a JSON
 * schema, such as z.toJSONSchema(SomeZodSchema)). Its reply's `text` is
 * then that JSON. Check it in code anyway: a schema makes a wrong shape
 * rare, not impossible, and it can't express every rule.
 */
export type ResponseFormat = { name: string; schema: Record<string, unknown> }

export type ChatRequest = {
  messages: Message[]
  tools?: ToolDefinition[]
  maxTokens?: number
  responseFormat?: ResponseFormat
}

export type ChatReply = {
  /** The model's text; null when it only asks for tools. */
  text: string | null
  toolCalls: ToolCall[]
  usage: { promptTokens: number; completionTokens: number }
}

export type ChatFn = (request: ChatRequest) => Promise<ChatReply>

try {
  process.loadEnvFile()
} catch {
  // No .env file: the lab's login shell sets the variables.
}

export const chat: ChatFn = async ({ messages, tools, maxTokens = 1024, responseFormat }) => {
  const apiKey = process.env.LAB_LLM_API_KEY
  const baseURL = process.env.LAB_LLM_BASE_URL
  if (!apiKey || !baseURL) {
    throw new Error(
      "Model access is not switched on for this lab (LAB_LLM_API_KEY and LAB_LLM_BASE_URL are empty). This is not a bug in your code. If you just opened the lab, open a new terminal; otherwise tell your instructor. Do not use your own provider key."
    )
  }
  const send = (format: unknown, sent: Message[]) =>
    fetch(`${baseURL.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "platform-default",
        messages: sent,
        ...(tools?.length ? { tools } : {}),
        ...(format ? { response_format: format } : {}),
        max_tokens: maxTokens,
      }),
      signal: AbortSignal.timeout(120_000),
    })
  let response = await send(
    responseFormat ? { type: "json_schema", json_schema: { name: responseFormat.name, schema: responseFormat.schema, strict: true } } : undefined,
    messages
  )
  // Some models behind the proxy take JSON mode but not a schema: ask for
  // JSON and put the schema in the instructions instead.
  if (responseFormat && response.status === 400)
    response = await send({ type: "json_object" }, [
      { role: "system", content: `Answer with one JSON object that follows this JSON schema:\n${JSON.stringify(responseFormat.schema)}` },
      ...messages,
    ])
  if (response.status === 429)
    throw new Error("Model budget for today is used up (429). It resets tomorrow; the fake model in your tests still works.")
  if (!response.ok)
    throw new Error(`Model proxy failed (${response.status}). Retry, or tell your instructor; never paste API keys into chat.`)
  const data = (await response.json()) as {
    choices?: { message?: { content?: unknown; tool_calls?: { id?: string; function?: { name?: string; arguments?: string } }[] } }[]
    usage?: { prompt_tokens?: number; completion_tokens?: number }
  }
  const message = data.choices?.[0]?.message
  if (!message) throw new Error("Model proxy returned no message. Retry the request.")
  return {
    text: typeof message.content === "string" && message.content.trim() ? message.content : null,
    toolCalls: (message.tool_calls ?? []).map((c, i) => ({
      id: c.id ?? `call_${i}`,
      name: c.function?.name ?? "",
      arguments: c.function?.arguments ?? "{}",
    })),
    usage: {
      promptTokens: data.usage?.prompt_tokens ?? 0,
      completionTokens: data.usage?.completion_tokens ?? 0,
    },
  }
}
