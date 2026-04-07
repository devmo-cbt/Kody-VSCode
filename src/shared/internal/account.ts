/**
 * List of email domains that are considered trusted testers for Kody.
 */
const CLINE_TRUSTED_TESTER_DOMAINS = ["fibilabs.tech"]

/**
 * Checks if the given email belongs to a Kody bot user.
 * E.g. Emails ending with @kody.bot
 */
export function isKodyBotUser(email: string): boolean {
	return email.endsWith("@kody.bot")
}

export function isKodyInternalTester(email: string): boolean {
	return isKodyBotUser(email) || CLINE_TRUSTED_TESTER_DOMAINS.some((d) => email.endsWith(`@${d}`))
}
