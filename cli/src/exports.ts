/**
 * Kody Library Exports
 *
 * This file exports the public API for programmatic use of Kody.
 * Use these classes and types to embed Kody into your applications.
 *
 * @example
 * ```typescript
 * import { KodyAgent } from "kody"
 *
 * const agent = new KodyAgent()
 * await agent.initialize({ clientCapabilities: {} })
 * const session = await agent.newSession({ cwd: process.cwd() })
 * ```
 * @module kody
 */

export { KodyAgent } from "./agent/KodyAgent.js"
export { KodySessionEmitter } from "./agent/KodySessionEmitter.js"
export type {
	AcpAgentOptions,
	AcpSessionState,
	AcpSessionStatus,
	Agent,
	AgentSideConnection,
	AudioContent,
	CancelNotification,
	ClientCapabilities,
	ContentBlock,
	ImageContent,
	InitializeRequest,
	InitializeResponse,
	KodyAcpSession,
	KodyAgentCapabilities,
	KodyAgentInfo,
	KodyAgentOptions,
	KodyPermissionOption,
	KodySessionEvents,
	LoadSessionRequest,
	LoadSessionResponse,
	McpServer,
	ModelInfo,
	NewSessionRequest,
	NewSessionResponse,
	PermissionHandler,
	PermissionOption,
	PermissionOptionKind,
	PromptRequest,
	PromptResponse,
	RequestPermissionRequest,
	RequestPermissionResponse,
	SessionConfigOption,
	SessionModelState,
	SessionNotification,
	SessionUpdate,
	SessionUpdatePayload,
	SessionUpdateType,
	SetSessionConfigOptionRequest,
	SetSessionConfigOptionResponse,
	SetSessionModelRequest,
	SetSessionModelResponse,
	SetSessionModeRequest,
	SetSessionModeResponse,
	StopReason,
	TextContent,
	ToolCall,
	ToolCallStatus,
	ToolCallUpdate,
	ToolKind,
	TranslatedMessage,
} from "./agent/public-types.js"
