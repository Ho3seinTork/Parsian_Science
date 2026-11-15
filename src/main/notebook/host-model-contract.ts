import type { RestrictedInferenceResult } from '../acp/restricted-inference-contract'

// model and provider are optional explicit choices from the configured catalog; omitted, the call
// uses the active Host LLM target.
export type HostLlmRequest =
  string | Readonly<{ prompt: string; model?: string; provider?: string }>

export type HostLlmUsage = Readonly<{
  inputTokens: number
  cacheTokens: number
  outputTokens: number
  cachedReadTokens?: number
  cachedWriteTokens?: number
  turnCount?: number
}>

export type HostLlmResult = Readonly<{
  text: string
  model: string
  stopReason: RestrictedInferenceResult['stopReason']
  usage?: HostLlmUsage
}>

export type HostLlmBatchItem = HostLlmResult | Readonly<{ error: string }>

export type HostLlmCallInput =
  | Readonly<{ request: HostLlmRequest }>
  | Readonly<{
      requests: readonly HostLlmRequest[]
      options?: Readonly<{ max_concurrency?: number }>
    }>
