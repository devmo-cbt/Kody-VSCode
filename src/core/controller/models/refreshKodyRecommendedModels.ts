import { ensureCacheDirectoryExists, GlobalFileNames } from "@core/storage/disk"
import axios from "axios"
import fs from "fs/promises"
import path from "path"
import { KodyEnv } from "@/config"
import { featureFlagsService } from "@/services/feature-flags"
import { CLINE_RECOMMENDED_MODELS_FALLBACK } from "@/shared/kody/recommended-models"
import { getAxiosSettings } from "@/shared/net"
import { FeatureFlag } from "@/shared/services/feature-flags/feature-flags"
import { Logger } from "@/shared/services/Logger"

export interface KodyRecommendedModelData {
	id: string
	name: string
	description: string
	tags: string[]
}

export interface KodyRecommendedModelsData {
	recommended: KodyRecommendedModelData[]
	free: KodyRecommendedModelData[]
}

const RECOMMENDED_MODELS_CACHE_TTL_MS = 60 * 60 * 1000

let pendingRefresh: Promise<KodyRecommendedModelsData> | null = null
let inMemoryCache: { data: KodyRecommendedModelsData; timestamp: number } | null = null

function getHardcodedRecommendedModels(): KodyRecommendedModelsData {
	return CLINE_RECOMMENDED_MODELS_FALLBACK
}

function useUpstreamRecommendedModels(): boolean {
	return featureFlagsService.getBooleanFlagEnabled(FeatureFlag.CLINE_RECOMMENDED_MODELS_UPSTREAM)
}

function normalizeRecommendedModel(raw: unknown): KodyRecommendedModelData | null {
	if (!raw || typeof raw !== "object") {
		return null
	}

	const data = raw as Record<string, unknown>
	if (typeof data.id !== "string" || data.id.length === 0) {
		return null
	}

	return {
		id: data.id,
		name: typeof data.name === "string" && data.name.length > 0 ? data.name : data.id,
		description: typeof data.description === "string" ? data.description : "",
		tags: Array.isArray(data.tags) ? data.tags.filter((tag): tag is string => typeof tag === "string") : [],
	}
}

function normalizeRecommendedModelsResponse(raw: unknown): KodyRecommendedModelsData | null {
	if (!raw || typeof raw !== "object") {
		return null
	}

	const data = raw as Record<string, unknown>
	if (
		(data.recommended !== undefined && !Array.isArray(data.recommended)) ||
		(data.free !== undefined && !Array.isArray(data.free))
	) {
		return null
	}

	const recommendedRaw = Array.isArray(data.recommended) ? data.recommended : []
	const freeRaw = Array.isArray(data.free) ? data.free : []

	const recommended = recommendedRaw
		.map((model) => normalizeRecommendedModel(model))
		.filter((model): model is KodyRecommendedModelData => model !== null)

	const free = freeRaw
		.map((model) => normalizeRecommendedModel(model))
		.filter((model): model is KodyRecommendedModelData => model !== null)

	return { recommended, free }
}

export async function refreshKodyRecommendedModels(): Promise<KodyRecommendedModelsData> {
	if (!useUpstreamRecommendedModels()) {
		return getHardcodedRecommendedModels()
	}

	if (inMemoryCache && Date.now() - inMemoryCache.timestamp <= RECOMMENDED_MODELS_CACHE_TTL_MS) {
		return inMemoryCache.data
	}

	if (pendingRefresh) {
		return pendingRefresh
	}

	pendingRefresh = (async () => {
		try {
			return await fetchAndCacheKodyRecommendedModels()
		} finally {
			pendingRefresh = null
		}
	})()

	return pendingRefresh
}

export function resetKodyRecommendedModelsCacheForTests(): void {
	pendingRefresh = null
	inMemoryCache = null
}

async function fetchAndCacheKodyRecommendedModels(): Promise<KodyRecommendedModelsData> {
	const kodyRecommendedModelsFilePath = path.join(await ensureCacheDirectoryExists(), GlobalFileNames.kodyRecommendedModels)
	let result: KodyRecommendedModelsData = { recommended: [], free: [] }

	try {
		const apiBaseUrl = KodyEnv.config().apiBaseUrl
		const response = await axios.get(`${apiBaseUrl}/api/v1/ai/kody/recommended-models`, getAxiosSettings())
		const normalized = normalizeRecommendedModelsResponse(response.data)
		if (!normalized) {
			throw new Error("Invalid response data when fetching Kody recommended models")
		}

		result = normalized
		await fs.writeFile(kodyRecommendedModelsFilePath, JSON.stringify(result))
		Logger.log("Kody recommended models fetched and saved")
	} catch (error) {
		Logger.error("Error fetching Kody recommended models:", error)

		try {
			const fileExists = await fs
				.access(kodyRecommendedModelsFilePath)
				.then(() => true)
				.catch(() => false)
			if (fileExists) {
				const fileContents = await fs.readFile(kodyRecommendedModelsFilePath, "utf8")
				const parsed = JSON.parse(fileContents)
				if (parsed) {
					result = parsed
					Logger.log("Loaded Kody recommended models from cache")
				}
			}
		} catch (cacheError) {
			Logger.error("Error reading Kody recommended models from cache:", cacheError)
		}
	}

	// Avoid pinning empty results in memory for the full TTL after a transient API/cache miss.
	if (result.recommended.length > 0 || result.free.length > 0) {
		inMemoryCache = { data: result, timestamp: Date.now() }
	}
	return result
}
