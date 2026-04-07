import { useEffect, useState } from "react"
import { refreshKodyRecommendedModels } from "@/core/controller/models/refreshKodyRecommendedModels"
import {
	type FeaturedModel,
	getAllFeaturedModels,
	mapRecommendedModelsToFeaturedModels,
	withFeaturedModelFallback,
} from "../constants/featured-models"

export function useKodyFeaturedModels(): FeaturedModel[] {
	const [featuredModels, setFeaturedModels] = useState<FeaturedModel[]>(() => getAllFeaturedModels())

	useEffect(() => {
		let cancelled = false
		void (async () => {
			try {
				const recommendedModels = await refreshKodyRecommendedModels()
				const mappedModels = mapRecommendedModelsToFeaturedModels(recommendedModels)
				const modelsWithFallback = withFeaturedModelFallback(mappedModels)
				if (!cancelled) {
					setFeaturedModels(getAllFeaturedModels(modelsWithFallback))
				}
			} catch {
				// Keep local fallback models on error.
			}
		})()

		return () => {
			cancelled = true
		}
	}, [])

	return featuredModels
}
