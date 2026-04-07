import * as os from "os"
import * as path from "path"
import { isMultiRootWorkspace } from "@/core/workspace/utils/workspace-detection"
import { HostProvider } from "@/hosts/host-provider"
import { ExtensionRegistryInfo } from "@/registry"
import { GetWorkspacePathsRequest } from "@/shared/proto/index.host"
import { EmptyRequest } from "@/shared/proto/kody/common"
import { Logger } from "@/shared/services/Logger"

// Canonical header names for extra client/host context
export const KodyHeaders = {
	PLATFORM: "X-PLATFORM",
	PLATFORM_VERSION: "X-PLATFORM-VERSION",
	CLIENT_VERSION: "X-CLIENT-VERSION",
	CLIENT_TYPE: "X-CLIENT-TYPE",
	CORE_VERSION: "X-CORE-VERSION",
	IS_MULTIROOT: "X-IS-MULTIROOT",
} as const
export type KodyHeaderName = (typeof KodyHeaders)[keyof typeof KodyHeaders]

export function buildExternalBasicHeaders(): Record<string, string> {
	return {
		"User-Agent": `Kody/${ExtensionRegistryInfo.version}`,
		"X-User": os.userInfo().username,
	}
}

export async function buildBasicKodyHeaders(): Promise<Record<string, string>> {
	const headers: Record<string, string> = buildExternalBasicHeaders()
	try {
		const host = await HostProvider.env.getHostVersion(EmptyRequest.create({}))
		headers[KodyHeaders.PLATFORM] = host.platform || "unknown"
		headers[KodyHeaders.PLATFORM_VERSION] = host.version || "unknown"
		headers[KodyHeaders.CLIENT_TYPE] = host.kodyType || "unknown"
		headers[KodyHeaders.CLIENT_VERSION] = host.kodyVersion || "unknown"
	} catch (error) {
		Logger.log("Failed to get IDE/platform info via HostBridge EnvService.getHostVersion", error)
		headers[KodyHeaders.PLATFORM] = "unknown"
		headers[KodyHeaders.PLATFORM_VERSION] = "unknown"
		headers[KodyHeaders.CLIENT_TYPE] = "unknown"
		headers[KodyHeaders.CLIENT_VERSION] = "unknown"
	}
	headers[KodyHeaders.CORE_VERSION] = ExtensionRegistryInfo.version

	return headers
}

export async function buildKodyExtraHeaders(): Promise<Record<string, string>> {
	const headers = await buildBasicKodyHeaders()

	try {
		const isMultiRoot = await isMultiRootWorkspace()
		headers[KodyHeaders.IS_MULTIROOT] = isMultiRoot ? "true" : "false"
	} catch (error) {
		Logger.log("Failed to detect multi-root workspace", error)
		headers[KodyHeaders.IS_MULTIROOT] = "false"
	}

	try {
		const wsResponse = await HostProvider.workspace.getWorkspacePaths(GetWorkspacePathsRequest.create({}))
		const firstPath = wsResponse.paths?.[0]
		headers["X-Workspace"] = firstPath ? path.basename(firstPath) : "unknown"
	} catch (error) {
		Logger.log("Failed to get workspace path for X-Workspace header", error)
		headers["X-Workspace"] = "unknown"
	}

	return headers
}
