import { Mode } from "../storage/types"

export interface KodyMessageModelInfo {
	modelId: string
	providerId: string
	mode: Mode
}

interface KodyTokensInfo {
	prompt: number // Total input tokens (includes cached + non-cached)
	completion: number // Total output tokens
	cached: number // Subset of prompt_tokens that were cache hits
}

export interface KodyMessageMetricsInfo {
	tokens?: KodyTokensInfo
	cost?: number // Monetary cost for this turn
}
