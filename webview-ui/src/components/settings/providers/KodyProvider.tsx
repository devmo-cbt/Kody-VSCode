import { Mode } from "@shared/storage/types"
import { KodyAccountInfoCard } from "../KodyAccountInfoCard"
import KodyModelPicker from "../KodyModelPicker"

/**
 * Props for the KodyProvider component
 */
interface KodyProviderProps {
	showModelOptions: boolean
	isPopup?: boolean
	currentMode: Mode
	initialModelTab?: "recommended" | "free"
}

/**
 * The Kody provider configuration component
 */
export const KodyProvider = ({ showModelOptions, isPopup, currentMode, initialModelTab }: KodyProviderProps) => {
	return (
		<div>
			{/* Kody Account Info Card */}
			<div style={{ marginBottom: 14, marginTop: 4 }}>
				<KodyAccountInfoCard />
			</div>

			{showModelOptions && (
				<>
					<KodyModelPicker
						currentMode={currentMode}
						initialTab={initialModelTab}
						isPopup={isPopup}
						showProviderRouting={true}
					/>
				</>
			)}
		</div>
	)
}
