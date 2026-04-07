import { KodyAsk as AppKodyAsk, KodyMessage as AppKodyMessage, KodySay as AppKodySay } from "@shared/ExtensionMessage"
import { KodyAsk, KodyMessageType, KodySay, KodyMessage as ProtoKodyMessage } from "@shared/proto/kody/ui"

// Helper function to convert KodyAsk string to enum
function convertKodyAskToProtoEnum(ask: AppKodyAsk | undefined): KodyAsk | undefined {
	if (!ask) {
		return undefined
	}

	const mapping: Record<AppKodyAsk, KodyAsk> = {
		followup: KodyAsk.FOLLOWUP,
		plan_mode_respond: KodyAsk.PLAN_MODE_RESPOND,
		act_mode_respond: KodyAsk.ACT_MODE_RESPOND,
		command: KodyAsk.COMMAND,
		command_output: KodyAsk.COMMAND_OUTPUT,
		completion_result: KodyAsk.COMPLETION_RESULT,
		tool: KodyAsk.TOOL,
		api_req_failed: KodyAsk.API_REQ_FAILED,
		resume_task: KodyAsk.RESUME_TASK,
		resume_completed_task: KodyAsk.RESUME_COMPLETED_TASK,
		mistake_limit_reached: KodyAsk.MISTAKE_LIMIT_REACHED,
		browser_action_launch: KodyAsk.BROWSER_ACTION_LAUNCH,
		use_mcp_server: KodyAsk.USE_MCP_SERVER,
		new_task: KodyAsk.NEW_TASK,
		condense: KodyAsk.CONDENSE,
		summarize_task: KodyAsk.SUMMARIZE_TASK,
		report_bug: KodyAsk.REPORT_BUG,
		use_subagents: KodyAsk.USE_SUBAGENTS,
	}

	const result = mapping[ask]
	if (result === undefined) {
	}
	return result
}

// Helper function to convert KodyAsk enum to string
function convertProtoEnumToKodyAsk(ask: KodyAsk): AppKodyAsk | undefined {
	if (ask === KodyAsk.UNRECOGNIZED) {
		return undefined
	}

	const mapping: Record<Exclude<KodyAsk, KodyAsk.UNRECOGNIZED>, AppKodyAsk> = {
		[KodyAsk.FOLLOWUP]: "followup",
		[KodyAsk.PLAN_MODE_RESPOND]: "plan_mode_respond",
		[KodyAsk.ACT_MODE_RESPOND]: "act_mode_respond",
		[KodyAsk.COMMAND]: "command",
		[KodyAsk.COMMAND_OUTPUT]: "command_output",
		[KodyAsk.COMPLETION_RESULT]: "completion_result",
		[KodyAsk.TOOL]: "tool",
		[KodyAsk.API_REQ_FAILED]: "api_req_failed",
		[KodyAsk.RESUME_TASK]: "resume_task",
		[KodyAsk.RESUME_COMPLETED_TASK]: "resume_completed_task",
		[KodyAsk.MISTAKE_LIMIT_REACHED]: "mistake_limit_reached",
		[KodyAsk.BROWSER_ACTION_LAUNCH]: "browser_action_launch",
		[KodyAsk.USE_MCP_SERVER]: "use_mcp_server",
		[KodyAsk.NEW_TASK]: "new_task",
		[KodyAsk.CONDENSE]: "condense",
		[KodyAsk.SUMMARIZE_TASK]: "summarize_task",
		[KodyAsk.REPORT_BUG]: "report_bug",
		[KodyAsk.USE_SUBAGENTS]: "use_subagents",
	}

	return mapping[ask]
}

// Helper function to convert KodySay string to enum
function convertKodySayToProtoEnum(say: AppKodySay | undefined): KodySay | undefined {
	if (!say) {
		return undefined
	}

	const mapping: Record<AppKodySay, KodySay> = {
		task: KodySay.TASK,
		error: KodySay.ERROR,
		api_req_started: KodySay.API_REQ_STARTED,
		api_req_finished: KodySay.API_REQ_FINISHED,
		text: KodySay.TEXT,
		reasoning: KodySay.REASONING,
		completion_result: KodySay.COMPLETION_RESULT_SAY,
		user_feedback: KodySay.USER_FEEDBACK,
		user_feedback_diff: KodySay.USER_FEEDBACK_DIFF,
		api_req_retried: KodySay.API_REQ_RETRIED,
		command: KodySay.COMMAND_SAY,
		command_output: KodySay.COMMAND_OUTPUT_SAY,
		tool: KodySay.TOOL_SAY,
		shell_integration_warning: KodySay.SHELL_INTEGRATION_WARNING,
		shell_integration_warning_with_suggestion: KodySay.SHELL_INTEGRATION_WARNING,
		browser_action_launch: KodySay.BROWSER_ACTION_LAUNCH_SAY,
		browser_action: KodySay.BROWSER_ACTION,
		browser_action_result: KodySay.BROWSER_ACTION_RESULT,
		mcp_server_request_started: KodySay.MCP_SERVER_REQUEST_STARTED,
		mcp_server_response: KodySay.MCP_SERVER_RESPONSE,
		mcp_notification: KodySay.MCP_NOTIFICATION,
		use_mcp_server: KodySay.USE_MCP_SERVER_SAY,
		diff_error: KodySay.DIFF_ERROR,
		deleted_api_reqs: KodySay.DELETED_API_REQS,
		kodyignore_error: KodySay.CLINEIGNORE_ERROR,
		command_permission_denied: KodySay.COMMAND_PERMISSION_DENIED,
		checkpoint_created: KodySay.CHECKPOINT_CREATED,
		load_mcp_documentation: KodySay.LOAD_MCP_DOCUMENTATION,
		info: KodySay.INFO,
		task_progress: KodySay.TASK_PROGRESS,
		error_retry: KodySay.ERROR_RETRY,
		hook_status: KodySay.HOOK_STATUS,
		hook_output_stream: KodySay.HOOK_OUTPUT_STREAM,
		conditional_rules_applied: KodySay.CONDITIONAL_RULES_APPLIED,
		subagent: KodySay.SUBAGENT_STATUS,
		use_subagents: KodySay.USE_SUBAGENTS_SAY,
		subagent_usage: KodySay.SUBAGENT_USAGE,
		generate_explanation: KodySay.GENERATE_EXPLANATION,
	}

	const result = mapping[say]

	return result
}

// Helper function to convert KodySay enum to string
function convertProtoEnumToKodySay(say: KodySay): AppKodySay | undefined {
	if (say === KodySay.UNRECOGNIZED) {
		return undefined
	}

	const mapping: Record<Exclude<KodySay, KodySay.UNRECOGNIZED>, AppKodySay> = {
		[KodySay.TASK]: "task",
		[KodySay.ERROR]: "error",
		[KodySay.API_REQ_STARTED]: "api_req_started",
		[KodySay.API_REQ_FINISHED]: "api_req_finished",
		[KodySay.TEXT]: "text",
		[KodySay.REASONING]: "reasoning",
		[KodySay.COMPLETION_RESULT_SAY]: "completion_result",
		[KodySay.USER_FEEDBACK]: "user_feedback",
		[KodySay.USER_FEEDBACK_DIFF]: "user_feedback_diff",
		[KodySay.API_REQ_RETRIED]: "api_req_retried",
		[KodySay.COMMAND_SAY]: "command",
		[KodySay.COMMAND_OUTPUT_SAY]: "command_output",
		[KodySay.TOOL_SAY]: "tool",
		[KodySay.SHELL_INTEGRATION_WARNING]: "shell_integration_warning",
		[KodySay.BROWSER_ACTION_LAUNCH_SAY]: "browser_action_launch",
		[KodySay.BROWSER_ACTION]: "browser_action",
		[KodySay.BROWSER_ACTION_RESULT]: "browser_action_result",
		[KodySay.MCP_SERVER_REQUEST_STARTED]: "mcp_server_request_started",
		[KodySay.MCP_SERVER_RESPONSE]: "mcp_server_response",
		[KodySay.MCP_NOTIFICATION]: "mcp_notification",
		[KodySay.USE_MCP_SERVER_SAY]: "use_mcp_server",
		[KodySay.DIFF_ERROR]: "diff_error",
		[KodySay.DELETED_API_REQS]: "deleted_api_reqs",
		[KodySay.CLINEIGNORE_ERROR]: "kodyignore_error",
		[KodySay.COMMAND_PERMISSION_DENIED]: "command_permission_denied",
		[KodySay.CHECKPOINT_CREATED]: "checkpoint_created",
		[KodySay.LOAD_MCP_DOCUMENTATION]: "load_mcp_documentation",
		[KodySay.INFO]: "info",
		[KodySay.TASK_PROGRESS]: "task_progress",
		[KodySay.ERROR_RETRY]: "error_retry",
		[KodySay.GENERATE_EXPLANATION]: "generate_explanation",
		[KodySay.HOOK_STATUS]: "hook_status",
		[KodySay.HOOK_OUTPUT_STREAM]: "hook_output_stream",
		[KodySay.CONDITIONAL_RULES_APPLIED]: "conditional_rules_applied",
		[KodySay.SUBAGENT_STATUS]: "subagent",
		[KodySay.USE_SUBAGENTS_SAY]: "use_subagents",
		[KodySay.SUBAGENT_USAGE]: "subagent_usage",
	}

	return mapping[say]
}

/**
 * Convert application KodyMessage to proto KodyMessage
 */
export function convertKodyMessageToProto(message: AppKodyMessage): ProtoKodyMessage {
	// For sending messages, we need to provide values for required proto fields
	const askEnum = message.ask ? convertKodyAskToProtoEnum(message.ask) : undefined
	const sayEnum = message.say ? convertKodySayToProtoEnum(message.say) : undefined

	// Determine appropriate enum values based on message type
	let finalAskEnum: KodyAsk = KodyAsk.FOLLOWUP // Proto default
	let finalSayEnum: KodySay = KodySay.TEXT // Proto default

	if (message.type === "ask") {
		finalAskEnum = askEnum ?? KodyAsk.FOLLOWUP // Use FOLLOWUP as default for ask messages
	} else if (message.type === "say") {
		finalSayEnum = sayEnum ?? KodySay.TEXT // Use TEXT as default for say messages
	}

	const protoMessage: ProtoKodyMessage = {
		ts: message.ts,
		type: message.type === "ask" ? KodyMessageType.ASK : KodyMessageType.SAY,
		ask: finalAskEnum,
		say: finalSayEnum,
		text: message.text ?? "",
		reasoning: message.reasoning ?? "",
		images: message.images ?? [],
		files: message.files ?? [],
		partial: message.partial ?? false,
		lastCheckpointHash: message.lastCheckpointHash ?? "",
		isCheckpointCheckedOut: message.isCheckpointCheckedOut ?? false,
		isOperationOutsideWorkspace: message.isOperationOutsideWorkspace ?? false,
		conversationHistoryIndex: message.conversationHistoryIndex ?? 0,
		conversationHistoryDeletedRange: message.conversationHistoryDeletedRange
			? {
					startIndex: message.conversationHistoryDeletedRange[0],
					endIndex: message.conversationHistoryDeletedRange[1],
				}
			: undefined,
		// Additional optional fields for specific ask/say types
		sayTool: undefined,
		sayBrowserAction: undefined,
		browserActionResult: undefined,
		askUseMcpServer: undefined,
		planModeResponse: undefined,
		askQuestion: undefined,
		askNewTask: undefined,
		apiReqInfo: undefined,
		modelInfo: message.modelInfo ?? undefined,
	}

	return protoMessage
}

/**
 * Convert proto KodyMessage to application KodyMessage
 */
export function convertProtoToKodyMessage(protoMessage: ProtoKodyMessage): AppKodyMessage {
	const message: AppKodyMessage = {
		ts: protoMessage.ts,
		type: protoMessage.type === KodyMessageType.ASK ? "ask" : "say",
	}

	// Convert ask enum to string
	if (protoMessage.type === KodyMessageType.ASK) {
		const ask = convertProtoEnumToKodyAsk(protoMessage.ask)
		if (ask !== undefined) {
			message.ask = ask
		}
	}

	// Convert say enum to string
	if (protoMessage.type === KodyMessageType.SAY) {
		const say = convertProtoEnumToKodySay(protoMessage.say)
		if (say !== undefined) {
			message.say = say
		}
	}

	// Convert other fields - preserve empty strings as they may be intentional
	if (protoMessage.text !== "") {
		message.text = protoMessage.text
	}
	if (protoMessage.reasoning !== "") {
		message.reasoning = protoMessage.reasoning
	}
	if (protoMessage.images.length > 0) {
		message.images = protoMessage.images
	}
	if (protoMessage.files.length > 0) {
		message.files = protoMessage.files
	}
	if (protoMessage.partial) {
		message.partial = protoMessage.partial
	}
	if (protoMessage.lastCheckpointHash !== "") {
		message.lastCheckpointHash = protoMessage.lastCheckpointHash
	}
	if (protoMessage.isCheckpointCheckedOut) {
		message.isCheckpointCheckedOut = protoMessage.isCheckpointCheckedOut
	}
	if (protoMessage.isOperationOutsideWorkspace) {
		message.isOperationOutsideWorkspace = protoMessage.isOperationOutsideWorkspace
	}
	if (protoMessage.conversationHistoryIndex !== 0) {
		message.conversationHistoryIndex = protoMessage.conversationHistoryIndex
	}

	// Convert conversationHistoryDeletedRange from object to tuple
	if (protoMessage.conversationHistoryDeletedRange) {
		message.conversationHistoryDeletedRange = [
			protoMessage.conversationHistoryDeletedRange.startIndex,
			protoMessage.conversationHistoryDeletedRange.endIndex,
		]
	}

	return message
}
