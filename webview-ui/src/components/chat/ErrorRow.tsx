import { KodyMessage } from "@shared/ExtensionMessage"
import { memo } from "react"
import CreditLimitError from "@/components/chat/CreditLimitError"
import { Button } from "@/components/ui/button"
import { useKodyAuth, useKodySignIn } from "@/context/KodyAuthContext"
import { KodyError, KodyErrorType } from "../../../../src/services/error/KodyError"

const _errorColor = "var(--vscode-errorForeground)"

interface ErrorRowProps {
	message: KodyMessage
	errorType: "error" | "mistake_limit_reached" | "diff_error" | "kodyignore_error"
	apiRequestFailedMessage?: string
	apiReqStreamingFailedMessage?: string
}

const ErrorRow = memo(({ message, errorType, apiRequestFailedMessage, apiReqStreamingFailedMessage }: ErrorRowProps) => {
	const { kodyUser } = useKodyAuth()
	const rawApiError = apiRequestFailedMessage || apiReqStreamingFailedMessage

	const { isLoginLoading, handleSignIn } = useKodySignIn()

	const renderErrorContent = () => {
		switch (errorType) {
			case "error":
			case "mistake_limit_reached":
				// Handle API request errors with special error parsing
				if (rawApiError) {
					// FIXME: KodyError parsing should not be applied to non-Kody providers, but it seems we're using kodyErrorMessage below in the default error display
					const kodyError = KodyError.parse(rawApiError)
					const errorMessage = kodyError?._error?.message || kodyError?.message || rawApiError
					const requestId = kodyError?._error?.request_id
					const providerId = kodyError?.providerId || kodyError?._error?.providerId
					const isKodyProvider = providerId === "kody"
					const errorCode = kodyError?._error?.code

					if (kodyError?.isErrorType(KodyErrorType.Balance)) {
						const errorDetails = kodyError._error?.details
						return (
							<CreditLimitError
								buyCreditsUrl={errorDetails?.buy_credits_url}
								currentBalance={errorDetails?.current_balance}
								message={errorDetails?.message}
								totalPromotions={errorDetails?.total_promotions}
								totalSpent={errorDetails?.total_spent}
							/>
						)
					}

					if (kodyError?.isErrorType(KodyErrorType.RateLimit)) {
						return (
							<p className="m-0 whitespace-pre-wrap text-error wrap-anywhere">
								{errorMessage}
								{requestId && <div>Request ID: {requestId}</div>}
							</p>
						)
					}

					if (kodyError?.isErrorType(KodyErrorType.Auth) && isKodyProvider) {
						return !kodyUser ? (
							// User is using Kody provider and is not logged in
							<div className="flex flex-col gap-3">
								<div className="flex items-center justify-center rounded border border-neutral-500/30 bg-vscode-editor-background p-6 text-center text-vscode-foreground">
									Whoops looks like you're logged out – click below to sign in
								</div>
								<Button className="w-full" disabled={isLoginLoading} onClick={handleSignIn}>
									Sign in to Kody
									{isLoginLoading && (
										<span className="ml-1 animate-spin">
											<span className="codicon codicon-refresh" />
										</span>
									)}
								</Button>
							</div>
						) : (
							// Don't show sign in button after the user has logged in, just ask them to retry
							<div className="mt-4">
								<span className="text-description">(Click "Retry" below)</span>
							</div>
						)
					}

					return (
						<p className="m-0 whitespace-pre-wrap text-error wrap-anywhere flex flex-col gap-3">
							{/* Display the well-formatted error extracted from the KodyError instance */}

							<header>
								{providerId && <span className="uppercase">[{providerId}] </span>}
								{errorCode && <span>{errorCode}</span>}
								{errorMessage}
								{requestId && <div>Request ID: {requestId}</div>}
							</header>

							{/* Windows Powershell Issue */}
							{errorMessage?.toLowerCase()?.includes("powershell") && (
								<div>
									It seems like you're having Windows PowerShell issues, please see this{" "}
									<a
										className="underline text-inherit"
										href="https://github.com/kody/kody/wiki/TroubleShooting-%E2%80%90-%22PowerShell-is-not-recognized-as-an-internal-or-external-command%22">
										troubleshooting guide
									</a>
									.
								</div>
							)}

							{/* Display raw API error if different from parsed error message */}
							{errorMessage !== rawApiError && <div>{rawApiError}</div>}

							<div className="mt-4">
								<span className="text-description">(Click "Retry" below)</span>
							</div>
						</p>
					)
				}

				// Regular error message
				return <p className="m-0 mt-0 whitespace-pre-wrap text-error wrap-anywhere">{message.text}</p>

			case "diff_error":
				return (
					<div className="flex flex-col p-2 rounded text-xs opacity-80 bg-quote text-foreground">
						<div>The model used search patterns that don't match anything in the file. Retrying...</div>
					</div>
				)

			case "kodyignore_error":
				return (
					<div className="flex flex-col p-2 rounded text-xs opacity-80 bg-quote text-foreground">
						<div>
							Kody tried to access <code>{message.text}</code> which is blocked by the <code>.kodyignore</code>
							file.
						</div>
					</div>
				)

			default:
				return null
		}
	}

	// For diff_error and kodyignore_error, we don't show the header separately
	if (errorType === "diff_error" || errorType === "kodyignore_error") {
		return renderErrorContent()
	}

	// For other error types, show header + content
	return renderErrorContent()
})

export default ErrorRow
