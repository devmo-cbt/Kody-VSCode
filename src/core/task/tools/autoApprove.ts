import { resolveWorkspacePath } from "@core/workspace"
import { isMultiRootEnabled } from "@core/workspace/multi-root-utils"
import { KodyDefaultTool } from "@shared/tools"
import { StateManager } from "@/core/storage/StateManager"
import { HostProvider } from "@/hosts/host-provider"
import { getCwd, getDesktopDir, isLocatedInPath, isLocatedInWorkspace } from "@/utils/path"

export class AutoApprove {
	private stateManager: StateManager
	// Cache for workspace paths - populated on first access and reused for the task lifetime
	// NOTE: This assumes that the task has a fixed set of workspace roots(which is currently true).
	private workspacePathsCache: { paths: string[] } | null = null
	private isMultiRootScenarioCache: boolean | null = null

	constructor(stateManager: StateManager) {
		this.stateManager = stateManager
	}

	/**
	 * Get workspace information with caching to avoid repeated API calls
	 * Cache is task-scoped since each task gets a new AutoApprove instance
	 */
	private async getWorkspaceInfo(): Promise<{
		workspacePaths: { paths: string[] }
		isMultiRootScenario: boolean
	}> {
		// Check if we already have cached values
		if (this.workspacePathsCache === null || this.isMultiRootScenarioCache === null) {
			// First time - fetch and cache for the lifetime of this task
			this.workspacePathsCache = await HostProvider.workspace.getWorkspacePaths({})
			this.isMultiRootScenarioCache = isMultiRootEnabled(this.stateManager) && this.workspacePathsCache.paths.length > 1
		}

		return {
			workspacePaths: this.workspacePathsCache,
			isMultiRootScenario: this.isMultiRootScenarioCache,
		}
	}

	// Check if the tool should be auto-approved based on the settings
	// Returns bool for most tools, and tuple for tools with nested settings
	shouldAutoApproveTool(toolName: KodyDefaultTool): boolean | [boolean, boolean] {
		if (this.stateManager.getGlobalSettingsKey("yoloModeToggled")) {
			switch (toolName) {
				case KodyDefaultTool.FILE_READ:
				case KodyDefaultTool.LIST_FILES:
				case KodyDefaultTool.LIST_CODE_DEF:
				case KodyDefaultTool.SEARCH:
				case KodyDefaultTool.NEW_RULE:
				case KodyDefaultTool.FILE_NEW:
				case KodyDefaultTool.FILE_EDIT:
				case KodyDefaultTool.APPLY_PATCH:
				case KodyDefaultTool.BASH:
				case KodyDefaultTool.USE_SUBAGENTS:
					return [true, true]

				case KodyDefaultTool.BROWSER:
				case KodyDefaultTool.WEB_FETCH:
				case KodyDefaultTool.WEB_SEARCH:
				case KodyDefaultTool.MCP_ACCESS:
				case KodyDefaultTool.MCP_USE:
					return true
			}
		}

		if (this.stateManager.getGlobalSettingsKey("autoApproveAllToggled")) {
			switch (toolName) {
				case KodyDefaultTool.FILE_READ:
				case KodyDefaultTool.LIST_FILES:
				case KodyDefaultTool.LIST_CODE_DEF:
				case KodyDefaultTool.SEARCH:
				case KodyDefaultTool.NEW_RULE:
				case KodyDefaultTool.FILE_NEW:
				case KodyDefaultTool.FILE_EDIT:
				case KodyDefaultTool.APPLY_PATCH:
				case KodyDefaultTool.BASH:
				case KodyDefaultTool.USE_SUBAGENTS:
					return [true, true]
				case KodyDefaultTool.BROWSER:
				case KodyDefaultTool.WEB_FETCH:
				case KodyDefaultTool.WEB_SEARCH:
				case KodyDefaultTool.MCP_ACCESS:
				case KodyDefaultTool.MCP_USE:
					return true
			}
		}

		const autoApprovalSettings = this.stateManager.getGlobalSettingsKey("autoApprovalSettings")

		switch (toolName) {
			case KodyDefaultTool.FILE_READ:
			case KodyDefaultTool.LIST_FILES:
			case KodyDefaultTool.LIST_CODE_DEF:
			case KodyDefaultTool.SEARCH:
			case KodyDefaultTool.USE_SUBAGENTS:
				return [autoApprovalSettings.actions.readFiles, autoApprovalSettings.actions.readFilesExternally ?? false]
			case KodyDefaultTool.NEW_RULE:
			case KodyDefaultTool.FILE_NEW:
			case KodyDefaultTool.FILE_EDIT:
			case KodyDefaultTool.APPLY_PATCH:
				return [autoApprovalSettings.actions.editFiles, autoApprovalSettings.actions.editFilesExternally ?? false]
			case KodyDefaultTool.BASH:
				return [
					autoApprovalSettings.actions.executeSafeCommands ?? false,
					autoApprovalSettings.actions.executeAllCommands ?? false,
				]
			case KodyDefaultTool.BROWSER:
				return autoApprovalSettings.actions.useBrowser
			case KodyDefaultTool.WEB_FETCH:
			case KodyDefaultTool.WEB_SEARCH:
				return autoApprovalSettings.actions.useBrowser
			case KodyDefaultTool.MCP_ACCESS:
			case KodyDefaultTool.MCP_USE:
				return autoApprovalSettings.actions.useMcp
		}
		return false
	}

	// Check if the tool should be auto-approved based on the settings
	// and the path of the action. Returns true if the tool should be auto-approved
	// based on the user's settings and the path of the action.
	async shouldAutoApproveToolWithPath(blockname: KodyDefaultTool, autoApproveActionpath: string | undefined): Promise<boolean> {
		if (this.stateManager.getGlobalSettingsKey("yoloModeToggled")) {
			return true
		}
		if (this.stateManager.getGlobalSettingsKey("autoApproveAllToggled")) {
			return true
		}

		let isLocalRead = false
		if (autoApproveActionpath) {
			// Use cached workspace info instead of fetching every time
			const { isMultiRootScenario } = await this.getWorkspaceInfo()

			if (isMultiRootScenario) {
				// Multi-root: check if file is in ANY workspace
				isLocalRead = await isLocatedInWorkspace(autoApproveActionpath)
			} else {
				// Single-root: use existing logic
				const cwd = await getCwd(getDesktopDir())
				// When called with a string cwd, resolveWorkspacePath returns a string
				const absolutePath = resolveWorkspacePath(
					cwd,
					autoApproveActionpath,
					"AutoApprove.shouldAutoApproveToolWithPath",
				) as string
				isLocalRead = isLocatedInPath(cwd, absolutePath)
			}
		} else {
			// If we do not get a path for some reason, default to a (safer) false return
			isLocalRead = false
		}

		// Get auto-approve settings for local and external edits
		const autoApproveResult = this.shouldAutoApproveTool(blockname)
		const [autoApproveLocal, autoApproveExternal] = Array.isArray(autoApproveResult)
			? autoApproveResult
			: [autoApproveResult, false]

		if ((isLocalRead && autoApproveLocal) || (!isLocalRead && autoApproveLocal && autoApproveExternal)) {
			return true
		}
		return false
	}
}
