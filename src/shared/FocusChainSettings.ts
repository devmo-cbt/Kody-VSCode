export interface FocusChainSettings {
	// Enable/disable the focus chain feature
	enabled: boolean
	// Interval (in messages) to remind Kody about focus chain
	remindKodyInterval: number
}

export const DEFAULT_FOCUS_CHAIN_SETTINGS: FocusChainSettings = {
	enabled: true,
	remindKodyInterval: 6,
}
