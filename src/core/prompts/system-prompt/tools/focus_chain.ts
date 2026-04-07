import { ModelFamily } from "@/shared/prompts"
import { KodyDefaultTool } from "@/shared/tools"
import type { KodyToolSpec } from "../spec"

// HACK: Placeholder to act as tool dependency
const generic: KodyToolSpec = {
	variant: ModelFamily.GENERIC,
	id: KodyDefaultTool.TODO,
	name: "focus_chain",
	description: "",
	contextRequirements: (context) => context.focusChainSettings?.enabled === true,
}

export const focus_chain_variants = [generic]
