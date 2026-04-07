import "should"
import { openRouterDefaultModelInfo } from "@shared/api"
import sinon from "sinon"
import { KodyAccountService } from "@/services/account/KodyAccountService"
import { AuthService } from "@/services/auth/AuthService"
import { KodyHandler } from "../kody"

describe("KodyHandler", () => {
	afterEach(() => {
		sinon.restore()
	})

	const createAsyncIterable = (data: any[] = []) => ({
		[Symbol.asyncIterator]: async function* () {
			yield* data
		},
	})

	const createHandler = (options: ConstructorParameters<typeof KodyHandler>[0]) => {
		sinon.stub(KodyAccountService, "getInstance").returns({} as any)
		sinon.stub(AuthService, "getInstance").returns({} as any)
		return new KodyHandler(options)
	}

	it("should handle usage-only chunks when delta is missing", async () => {
		const handler = createHandler({})
		const fakeClient = {
			chat: {
				completions: {
					create: sinon.stub().resolves(
						createAsyncIterable([
							{
								choices: [{}],
								usage: {
									prompt_tokens: 17,
									completion_tokens: 9,
								},
							},
						]),
					),
				},
			},
		}
		sinon.stub(handler as any, "ensureClient").resolves(fakeClient as any)
		sinon.stub(handler, "getModel").returns({
			id: "openai/gpt-4o-mini",
			info: openRouterDefaultModelInfo,
		})

		const chunks: any[] = []
		for await (const chunk of handler.createMessage("system", [{ role: "user", content: "hi" }])) {
			chunks.push(chunk)
		}

		chunks.should.deepEqual([
			{
				type: "usage",
				cacheWriteTokens: 0,
				cacheReadTokens: 0,
				inputTokens: 17,
				outputTokens: 9,
				totalCost: 0,
			},
		])
	})

	it("should forward enableParallelToolCalling to OpenRouter payload", async () => {
		const handler = createHandler({ enableParallelToolCalling: true })
		const createStub = sinon.stub().resolves(createAsyncIterable([]))
		const fakeClient = {
			chat: {
				completions: {
					create: createStub,
				},
			},
		}
		sinon.stub(handler as any, "ensureClient").resolves(fakeClient as any)
		sinon.stub(handler, "getModel").returns({
			id: "openai/gpt-4o-mini",
			info: openRouterDefaultModelInfo,
		})

		const tools = [
			{ type: "function", function: { name: "read_file", description: "", parameters: { type: "object" } } },
		] as any
		for await (const _chunk of handler.createMessage("system", [{ role: "user", content: "hi" }], tools)) {
			// drain stream
		}

		const payload = createStub.firstCall.args[0]
		payload.parallel_tool_calls.should.equal(true)
	})
})
