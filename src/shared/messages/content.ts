import { Anthropic } from "@anthropic-ai/sdk"
import { KodyMessageMetricsInfo, KodyMessageModelInfo } from "./metrics"

export type KodyPromptInputContent = string

export type KodyMessageRole = "user" | "assistant"

export interface KodyReasoningDetailParam {
	type: "reasoning.text" | string
	text: string
	signature: string
	format: "anthropic-claude-v1" | string
	index: number
}

interface KodySharedMessageParam {
	// The id of the response that the block belongs to
	call_id?: string
}

export const REASONING_DETAILS_PROVIDERS = ["kody", "openrouter"]

/**
 * An extension of Anthropic.MessageParam that includes Kody-specific fields: reasoning_details.
 * This ensures backward compatibility where the messages were stored in Anthropic format with additional
 * fields unknown to Anthropic SDK.
 */
export interface KodyTextContentBlock extends Anthropic.TextBlockParam, KodySharedMessageParam {
	// reasoning_details only exists for providers listed in REASONING_DETAILS_PROVIDERS
	reasoning_details?: KodyReasoningDetailParam[]
	// Thought Signature associates with Gemini
	signature?: string
}

export interface KodyImageContentBlock extends Anthropic.ImageBlockParam, KodySharedMessageParam {}

export interface KodyDocumentContentBlock extends Anthropic.DocumentBlockParam, KodySharedMessageParam {}

export interface KodyUserToolResultContentBlock extends Anthropic.ToolResultBlockParam, KodySharedMessageParam {}

/**
 * Assistant only content types
 */
export interface KodyAssistantToolUseBlock extends Anthropic.ToolUseBlockParam, KodySharedMessageParam {
	// reasoning_details only exists for providers listed in REASONING_DETAILS_PROVIDERS
	reasoning_details?: unknown[] | KodyReasoningDetailParam[]
	// Thought Signature associates with Gemini
	signature?: string
}

export interface KodyAssistantThinkingBlock extends Anthropic.ThinkingBlock, KodySharedMessageParam {
	// The summary items returned by OpenAI response API
	// The reasoning details that will be moved to the text block when finalized
	summary?: unknown[] | KodyReasoningDetailParam[]
}

export interface KodyAssistantRedactedThinkingBlock extends Anthropic.RedactedThinkingBlockParam, KodySharedMessageParam {}

export type KodyToolResponseContent = KodyPromptInputContent | Array<KodyTextContentBlock | KodyImageContentBlock>

export type KodyUserContent =
	| KodyTextContentBlock
	| KodyImageContentBlock
	| KodyDocumentContentBlock
	| KodyUserToolResultContentBlock

export type KodyAssistantContent =
	| KodyTextContentBlock
	| KodyImageContentBlock
	| KodyDocumentContentBlock
	| KodyAssistantToolUseBlock
	| KodyAssistantThinkingBlock
	| KodyAssistantRedactedThinkingBlock

export type KodyContent = KodyUserContent | KodyAssistantContent

/**
 * An extension of Anthropic.MessageParam that includes Kody-specific fields.
 * This ensures backward compatibility where the messages were stored in Anthropic format,
 * while allowing for additional metadata specific to Kody to avoid unknown fields in Anthropic SDK
 * added by ignoring the type checking for those fields.
 */
export interface KodyStorageMessage extends Anthropic.MessageParam {
	/**
	 * Response ID associated with this message
	 */
	id?: string
	role: KodyMessageRole
	content: KodyPromptInputContent | KodyContent[]
	/**
	 * NOTE: model information used when generating this message.
	 * Internal use for message conversion only.
	 * MUST be removed before sending message to any LLM provider.
	 */
	modelInfo?: KodyMessageModelInfo
	/**
	 * LLM operational and performance metrics for this message
	 * Includes token counts, costs.
	 */
	metrics?: KodyMessageMetricsInfo
	/**
	 * Timestamp of when the message was created
	 */
	ts?: number
}

/**
 * Converts KodyStorageMessage to Anthropic.MessageParam by removing Kody-specific fields
 * Kody-specific fields (like modelInfo, reasoning_details) are properly omitted.
 */
export function convertKodyStorageToAnthropicMessage(
	kodyMessage: KodyStorageMessage,
	provider = "anthropic",
): Anthropic.MessageParam {
	const { role, content } = kodyMessage

	// Handle string content - fast path
	if (typeof content === "string") {
		return { role, content }
	}

	// Removes thinking block that has no signature (invalid thinking block that's incompatible with Anthropic API)
	const filteredContent = content.filter((b) => b.type !== "thinking" || !!b.signature)

	// Handle array content - strip Kody-specific fields for non-reasoning_details providers
	const shouldCleanContent = !REASONING_DETAILS_PROVIDERS.includes(provider)
	const cleanedContent = shouldCleanContent
		? filteredContent.map(cleanContentBlock)
		: (filteredContent as Anthropic.MessageParam["content"])

	return { role, content: cleanedContent }
}

/**
 * Clean a content block by removing Kody-specific fields and returning only Anthropic-compatible fields
 */
export function cleanContentBlock(block: KodyContent): Anthropic.ContentBlock {
	// Fast path: if no Kody-specific fields exist, return as-is
	const hasKodyFields =
		"reasoning_details" in block ||
		"call_id" in block ||
		"summary" in block ||
		(block.type !== "thinking" && "signature" in block)

	if (!hasKodyFields) {
		return block as Anthropic.ContentBlock
	}

	// Removes Kody-specific fields & the signature field that's added for Gemini.
	const { reasoning_details, call_id, summary, ...rest } = block as any

	// Remove signature from non-thinking blocks that were added for Gemini
	if (block.type !== "thinking" && rest.signature) {
		rest.signature = undefined
	}

	return rest satisfies Anthropic.ContentBlock
}
