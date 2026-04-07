import { EmptyRequest } from "@shared/proto/kody/common"
import { KodyRecommendedModel, KodyRecommendedModelsResponse } from "@shared/proto/kody/models"
import type { Controller } from "../index"
import { refreshKodyRecommendedModels } from "./refreshKodyRecommendedModels"

export async function refreshKodyRecommendedModelsRpc(
	_controller: Controller,
	_request: EmptyRequest,
): Promise<KodyRecommendedModelsResponse> {
	const models = await refreshKodyRecommendedModels()
	return KodyRecommendedModelsResponse.create({
		recommended: models.recommended.map((model) =>
			KodyRecommendedModel.create({
				id: model.id,
				name: model.name,
				description: model.description,
				tags: model.tags,
			}),
		),
		free: models.free.map((model) =>
			KodyRecommendedModel.create({
				id: model.id,
				name: model.name,
				description: model.description,
				tags: model.tags,
			}),
		),
	})
}
