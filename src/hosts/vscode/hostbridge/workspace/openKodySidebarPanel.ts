import * as vscode from "vscode"
import { ExtensionRegistryInfo } from "@/registry"
import { OpenKodySidebarPanelRequest, OpenKodySidebarPanelResponse } from "@/shared/proto/index.host"

export async function openKodySidebarPanel(_: OpenKodySidebarPanelRequest): Promise<OpenKodySidebarPanelResponse> {
	await vscode.commands.executeCommand(`${ExtensionRegistryInfo.views.Sidebar}.focus`)
	return {}
}
