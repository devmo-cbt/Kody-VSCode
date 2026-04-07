import { synchronizeRuleToggles } from "@core/context/instructions/user-instructions/rule-helpers"
import { ensureWorkflowsDirectoryExists, GlobalFileNames } from "@core/storage/disk"
import { KodyRulesToggles } from "@shared/kody-rules"
import path from "path"
import { Controller } from "@/core/controller"

/**
 * Refresh the workflow toggles
 */
export async function refreshWorkflowToggles(
	controller: Controller,
	workingDirectory: string,
): Promise<{
	globalWorkflowToggles: KodyRulesToggles
	localWorkflowToggles: KodyRulesToggles
}> {
	// Global workflows
	const globalWorkflowToggles = controller.stateManager.getGlobalSettingsKey("globalWorkflowToggles")
	const globalKodyWorkflowsFilePath = await ensureWorkflowsDirectoryExists()
	const updatedGlobalWorkflowToggles = await synchronizeRuleToggles(globalKodyWorkflowsFilePath, globalWorkflowToggles)
	controller.stateManager.setGlobalState("globalWorkflowToggles", updatedGlobalWorkflowToggles)

	const workflowRulesToggles = controller.stateManager.getWorkspaceStateKey("workflowToggles")
	const workflowsDirPath = path.resolve(workingDirectory, GlobalFileNames.workflows)
	const updatedWorkflowToggles = await synchronizeRuleToggles(workflowsDirPath, workflowRulesToggles)
	controller.stateManager.setWorkspaceState("workflowToggles", updatedWorkflowToggles)

	return {
		globalWorkflowToggles: updatedGlobalWorkflowToggles,
		localWorkflowToggles: updatedWorkflowToggles,
	}
}
