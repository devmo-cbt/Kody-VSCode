import { getWorkspaceBasename } from "@core/workspace"
import type { ToggleKodyRuleRequest } from "@shared/proto/kody/file"
import { RuleScope, ToggleKodyRules } from "@shared/proto/kody/file"
import { telemetryService } from "@/services/telemetry"
import { Logger } from "@/shared/services/Logger"
import type { Controller } from "../index"

/**
 * Toggles a Kody rule (enable or disable)
 * @param controller The controller instance
 * @param request The toggle request
 * @returns The updated Kody rule toggles
 */
export async function toggleKodyRule(controller: Controller, request: ToggleKodyRuleRequest): Promise<ToggleKodyRules> {
	const { scope, rulePath, enabled } = request

	if (!rulePath || typeof enabled !== "boolean" || scope === undefined) {
		Logger.error("toggleKodyRule: Missing or invalid parameters", {
			rulePath,
			scope,
			enabled: typeof enabled === "boolean" ? enabled : `Invalid: ${typeof enabled}`,
		})
		throw new Error("Missing or invalid parameters for toggleKodyRule")
	}

	// Handle the three different scopes
	switch (scope) {
		case RuleScope.GLOBAL: {
			const toggles = controller.stateManager.getGlobalSettingsKey("globalKodyRulesToggles")
			toggles[rulePath] = enabled
			controller.stateManager.setGlobalState("globalKodyRulesToggles", toggles)
			break
		}
		case RuleScope.LOCAL: {
			const toggles = controller.stateManager.getWorkspaceStateKey("localKodyRulesToggles")
			toggles[rulePath] = enabled
			controller.stateManager.setWorkspaceState("localKodyRulesToggles", toggles)
			break
		}
		case RuleScope.REMOTE: {
			const toggles = controller.stateManager.getGlobalStateKey("remoteRulesToggles")
			toggles[rulePath] = enabled
			controller.stateManager.setGlobalState("remoteRulesToggles", toggles)
			break
		}
		default:
			throw new Error(`Invalid scope: ${scope}`)
	}

	// Track rule toggle telemetry with current task context
	if (controller.task?.ulid) {
		// Extract just the filename for privacy (no full paths)
		const ruleFileName = getWorkspaceBasename(rulePath, "Controller.toggleKodyRule")
		const isGlobal = scope === RuleScope.GLOBAL
		telemetryService.captureKodyRuleToggled(controller.task.ulid, ruleFileName, enabled, isGlobal)
	}

	// Get the current state to return in the response
	const globalToggles = controller.stateManager.getGlobalSettingsKey("globalKodyRulesToggles")
	const localToggles = controller.stateManager.getWorkspaceStateKey("localKodyRulesToggles")
	const remoteToggles = controller.stateManager.getGlobalStateKey("remoteRulesToggles")

	return ToggleKodyRules.create({
		globalKodyRulesToggles: { toggles: globalToggles },
		localKodyRulesToggles: { toggles: localToggles },
		remoteRulesToggles: { toggles: remoteToggles },
	})
}
