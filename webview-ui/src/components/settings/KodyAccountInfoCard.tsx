import { EmptyRequest } from "@shared/proto/kody/common"
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import { useState } from "react"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { useKodyAuth } from "@/context/KodyAuthContext"
import { AccountServiceClient } from "@/services/grpc-client"

export const KodyAccountInfoCard = () => {
	const { kodyUser } = useKodyAuth()
	const { navigateToAccount } = useExtensionState()
	const [isLoading, setIsLoading] = useState(false)

	const user = kodyUser || undefined

	const handleLogin = () => {
		setIsLoading(true)
		AccountServiceClient.accountLoginClicked(EmptyRequest.create())
			.catch((err) => console.error("Failed to get login URL:", err))
			.finally(() => {
				setIsLoading(false)
			})
	}

	const handleShowAccount = () => {
		navigateToAccount()
	}

	return (
		<div className="max-w-[600px]">
			{user ? (
				<VSCodeButton appearance="secondary" onClick={handleShowAccount}>
					View Billing & Usage
				</VSCodeButton>
			) : (
				<div>
					<VSCodeButton className="mt-0" disabled={isLoading} onClick={handleLogin}>
						Sign Up with Kody
						{isLoading && (
							<span className="ml-1 animate-spin">
								<span className="codicon codicon-refresh" />
							</span>
						)}
					</VSCodeButton>
				</div>
			)}
		</div>
	)
}
