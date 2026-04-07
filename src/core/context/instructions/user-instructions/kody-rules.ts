import {
	ActivatedConditionalRule,
	getRemoteRulesTotalContentWithMetadata,
	getRuleFilesTotalContentWithMetadata,
	RULE_SOURCE_PREFIX,
	RuleLoadResultWithInstructions,
	synchronizeRuleToggles,
} from "@core/context/instructions/user-instructions/rule-helpers"
import { formatResponse } from "@core/prompts/responses"
import { ensureRulesDirectoryExists, GlobalFileNames } from "@core/storage/disk"
import { StateManager } from "@core/storage/StateManager"
import { KodyRulesToggles } from "@shared/kody-rules"
import { fileExistsAtPath, isDirectory, readDirectory } from "@utils/fs"
import fs from "fs/promises"
import path from "path"
import { Controller } from "@/core/controller"
import { Logger } from "@/shared/services/Logger"
import { parseYamlFrontmatter } from "./frontmatter"
import { evaluateRuleConditionals, type RuleEvaluationContext } from "./rule-conditionals"

export const getGlobalKodyRules = async (
	globalKodyRulesFilePath: string,
	toggles: KodyRulesToggles,
	opts?: { evaluationContext?: RuleEvaluationContext },
): Promise<RuleLoadResultWithInstructions> => {
	let combinedContent = ""
	const activatedConditionalRules: ActivatedConditionalRule[] = []

	// 1. Get file-based rules
	if (await fileExistsAtPath(globalKodyRulesFilePath)) {
		if (await isDirectory(globalKodyRulesFilePath)) {
			try {
				const rulesFilePaths = await readDirectory(globalKodyRulesFilePath)
				// Note: ruleNamePrefix explicitly set to "global" for clarity (matches the default)
				const rulesFilesTotal = await getRuleFilesTotalContentWithMetadata(
					rulesFilePaths,
					globalKodyRulesFilePath,
					toggles,
					{
						evaluationContext: opts?.evaluationContext,
						ruleNamePrefix: "global",
					},
				)
				if (rulesFilesTotal.content) {
					combinedContent = rulesFilesTotal.content
					activatedConditionalRules.push(...rulesFilesTotal.activatedConditionalRules)
				}
			} catch {
				Logger.error(`Failed to read .kodyrules directory at ${globalKodyRulesFilePath}`)
			}
		} else {
			Logger.error(`${globalKodyRulesFilePath} is not a directory`)
		}
	}

	// 2. Append remote config rules
	const stateManager = StateManager.get()
	const remoteConfigSettings = stateManager.getRemoteConfigSettings()
	const remoteRules = remoteConfigSettings.remoteGlobalRules || []
	const remoteToggles = stateManager.getGlobalStateKey("remoteRulesToggles") || {}
	const remoteResult = getRemoteRulesTotalContentWithMetadata(remoteRules, remoteToggles, {
		evaluationContext: opts?.evaluationContext,
	})
	if (remoteResult.content) {
		if (combinedContent) combinedContent += "\n\n"
		combinedContent += remoteResult.content
		activatedConditionalRules.push(...remoteResult.activatedConditionalRules)
	}

	// 3. Return formatted instructions
	if (!combinedContent) {
		return { instructions: undefined, activatedConditionalRules: [] }
	}

	return {
		instructions: formatResponse.kodyRulesGlobalDirectoryInstructions(globalKodyRulesFilePath, combinedContent),
		activatedConditionalRules,
	}
}

export const getLocalKodyRules = async (
	cwd: string,
	toggles: KodyRulesToggles,
	opts?: { evaluationContext?: RuleEvaluationContext },
): Promise<RuleLoadResultWithInstructions> => {
	const kodyRulesFilePath = path.resolve(cwd, GlobalFileNames.kodyRules)

	let instructions: string | undefined
	const activatedConditionalRules: ActivatedConditionalRule[] = []

	if (await fileExistsAtPath(kodyRulesFilePath)) {
		if (await isDirectory(kodyRulesFilePath)) {
			try {
				const rulesFilePaths = await readDirectory(kodyRulesFilePath, [
					[".kodyrules", "workflows"],
					[".kodyrules", "hooks"],
					[".kodyrules", "skills"],
				])

				const rulesFilesTotal = await getRuleFilesTotalContentWithMetadata(rulesFilePaths, cwd, toggles, {
					evaluationContext: opts?.evaluationContext,
					ruleNamePrefix: "workspace",
				})
				if (rulesFilesTotal.content) {
					instructions = formatResponse.kodyRulesLocalDirectoryInstructions(cwd, rulesFilesTotal.content)
					activatedConditionalRules.push(...rulesFilesTotal.activatedConditionalRules)
				}
			} catch {
				Logger.error(`Failed to read .kodyrules directory at ${kodyRulesFilePath}`)
			}
		} else {
			try {
				if (kodyRulesFilePath in toggles && toggles[kodyRulesFilePath] !== false) {
					const raw = (await fs.readFile(kodyRulesFilePath, "utf8")).trim()
					if (raw) {
						// Keep single-file .kodyrules behavior consistent with directory/remote rules:
						// - Parse YAML frontmatter (fail-open on parse errors)
						// - Evaluate conditionals against the request's evaluation context
						const parsed = parseYamlFrontmatter(raw)
						if (parsed.hadFrontmatter && parsed.parseError) {
							// Fail-open: preserve the raw contents so the LLM can still see the author's intent.
							instructions = formatResponse.kodyRulesLocalFileInstructions(cwd, raw)
						} else {
							const { passed, matchedConditions } = evaluateRuleConditionals(
								parsed.data,
								opts?.evaluationContext ?? {},
							)
							if (passed) {
								instructions = formatResponse.kodyRulesLocalFileInstructions(cwd, parsed.body.trim())
								if (parsed.hadFrontmatter && Object.keys(matchedConditions).length > 0) {
									activatedConditionalRules.push({
										name: `${RULE_SOURCE_PREFIX.workspace}:${GlobalFileNames.kodyRules}`,
										matchedConditions,
									})
								}
							}
						}
					}
				}
			} catch {
				Logger.error(`Failed to read .kodyrules file at ${kodyRulesFilePath}`)
			}
		}
	}

	return { instructions, activatedConditionalRules }
}

export async function refreshKodyRulesToggles(
	controller: Controller,
	workingDirectory: string,
): Promise<{
	globalToggles: KodyRulesToggles
	localToggles: KodyRulesToggles
}> {
	// Global toggles
	const globalKodyRulesToggles = controller.stateManager.getGlobalSettingsKey("globalKodyRulesToggles")
	const globalKodyRulesFilePath = await ensureRulesDirectoryExists()
	const updatedGlobalToggles = await synchronizeRuleToggles(globalKodyRulesFilePath, globalKodyRulesToggles)
	controller.stateManager.setGlobalState("globalKodyRulesToggles", updatedGlobalToggles)

	// Local toggles
	const localKodyRulesToggles = controller.stateManager.getWorkspaceStateKey("localKodyRulesToggles")
	const localKodyRulesFilePath = path.resolve(workingDirectory, GlobalFileNames.kodyRules)
	const updatedLocalToggles = await synchronizeRuleToggles(localKodyRulesFilePath, localKodyRulesToggles, "", [
		[".kodyrules", "workflows"],
		[".kodyrules", "hooks"],
		[".kodyrules", "skills"],
	])
	controller.stateManager.setWorkspaceState("localKodyRulesToggles", updatedLocalToggles)

	return {
		globalToggles: updatedGlobalToggles,
		localToggles: updatedLocalToggles,
	}
}
