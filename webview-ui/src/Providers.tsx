import { HeroUIProvider } from "@heroui/react"
import { type ReactNode } from "react"
import { CustomPostHogProvider } from "./CustomPostHogProvider"
import { ExtensionStateContextProvider } from "./context/ExtensionStateContext"
import { KodyAuthProvider } from "./context/KodyAuthContext"
import { PlatformProvider } from "./context/PlatformContext"

export function Providers({ children }: { children: ReactNode }) {
	return (
		<PlatformProvider>
			<ExtensionStateContextProvider>
				<CustomPostHogProvider>
					<KodyAuthProvider>
						<HeroUIProvider>{children}</HeroUIProvider>
					</KodyAuthProvider>
				</CustomPostHogProvider>
			</ExtensionStateContextProvider>
		</PlatformProvider>
	)
}
