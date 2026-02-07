import { describe, it, expect } from "vitest"
import {
  MODELS,
  PROVIDER_IDS,
  getActiveModels,
  getModelById,
  getModelsByFamily,
  getDefaultModel,
  buildProviderConfigs,
} from "../../lib/models/registry.js"

describe("Model Registry", () => {
  describe("MODELS array", () => {
    it("has 5 models total", () => {
      expect(MODELS).toHaveLength(5)
    })

    it("all models have required fields", () => {
      for (const model of MODELS) {
        expect(model.id).toBeTruthy()
        expect(model.name).toBeTruthy()
        expect(model.family).toBeTruthy()
        expect(model.displayName).toBeTruthy()
        expect(model.version).toBeTruthy()
        expect(model.reasoning).toBeDefined()
        expect(model.input).toBeDefined()
        expect(model.cost).toBeDefined()
        expect(model.contextWindow).toBeGreaterThan(0)
        expect(model.maxTokens).toBeGreaterThan(0)
        expect(model.limit.context).toBeGreaterThan(0)
        expect(model.limit.output).toBeGreaterThan(0)
        expect(model.modalities.input).toContain("text")
        expect(model.modalities.output).toContain("text")
      }
    })

    it("default model is marked with isDefault: true", () => {
      const defaultModels = MODELS.filter(m => m.isDefault)
      expect(defaultModels).toHaveLength(1)
      expect(defaultModels[0].id).toBe("claude-opus-4-5-20251101")
    })
  })

  describe("getActiveModels", () => {
    it("returns all 5 models (no deprecated models)", () => {
      const active = getActiveModels()
      expect(active).toHaveLength(5)
      expect(active.every(m => !m.deprecated)).toBe(true)
    })

    it("each model has correct structure", () => {
      const active = getActiveModels()
      for (const model of active) {
        expect(model.id).toBeTruthy()
        expect(model.name).toBeTruthy()
        expect(model.family).toBeTruthy()
        expect(model.displayName).toBeTruthy()
        expect(model.version).toBeTruthy()
      }
    })
  })

  describe("getModelById", () => {
    it("finds model by exact ID", () => {
      const model = getModelById("gpt-5.2-codex")
      expect(model).toBeDefined()
      expect(model?.displayName).toBe("GPT-5.2 Codex")
    })

    it("returns undefined for unknown ID", () => {
      const model = getModelById("unknown-model-id")
      expect(model).toBeUndefined()
    })

    it("finds all 5 models by their IDs", () => {
      expect(getModelById("gpt-5.2-codex")).toBeDefined()
      expect(getModelById("gpt-5.2")).toBeDefined()
      expect(getModelById("claude-sonnet-4-5-20250929")).toBeDefined()
      expect(getModelById("claude-opus-4-5-20251101")).toBeDefined()
      expect(getModelById("gemini-3-pro")).toBeDefined()
    })
  })

  describe("getDefaultModel", () => {
    it("returns claude-opus-4-5-20251101", () => {
      const defaultModel = getDefaultModel()
      expect(defaultModel.id).toBe("claude-opus-4-5-20251101")
    })

    it("has isDefault: true", () => {
      const defaultModel = getDefaultModel()
      expect(defaultModel.isDefault).toBe(true)
    })

    it("is a Claude model", () => {
      const defaultModel = getDefaultModel()
      expect(defaultModel.family).toBe("claude")
    })
  })

  describe("getModelsByFamily", () => {
    it("returns only GPT models", () => {
      const gptModels = getModelsByFamily("gpt")
      expect(gptModels).toHaveLength(2)
      expect(gptModels.every(m => m.family === "gpt")).toBe(true)
    })

    it("returns only Claude models", () => {
      const claudeModels = getModelsByFamily("claude")
      expect(claudeModels).toHaveLength(2)
      expect(claudeModels.every(m => m.family === "claude")).toBe(true)
    })

    it("returns only Gemini models", () => {
      const geminiModels = getModelsByFamily("gemini")
      expect(geminiModels).toHaveLength(1)
      expect(geminiModels.every(m => m.family === "gemini")).toBe(true)
    })

    it("excludes deprecated models", () => {
      const gptModels = getModelsByFamily("gpt")
      expect(gptModels.every(m => !m.deprecated)).toBe(true)
    })
  })

  describe("buildProviderConfigs", () => {
    it("returns 3 provider configs", () => {
      const configs = buildProviderConfigs()
      const providerIds = Object.keys(configs)
      expect(providerIds).toHaveLength(3)
    })

    it("each provider has baseUrl, api, and models", () => {
      const configs = buildProviderConfigs()
      for (const providerId of Object.keys(configs)) {
        const config = configs[providerId]
        expect(config.baseUrl).toBeTruthy()
        expect(config.api).toBeTruthy()
        expect(config.models).toBeDefined()
        expect(Array.isArray(config.models)).toBe(true)
      }
    })

    it("GPT provider has 2 models", () => {
      const configs = buildProviderConfigs()
      const gptConfig = configs[PROVIDER_IDS.GPT]
      expect(gptConfig.models).toHaveLength(2)
      expect(gptConfig.api).toBe("openai-completions")
    })

    it("Claude provider has 2 models", () => {
      const configs = buildProviderConfigs()
      const claudeConfig = configs[PROVIDER_IDS.CLAUDE]
      expect(claudeConfig.models).toHaveLength(2)
      expect(claudeConfig.api).toBe("anthropic-messages")
    })

    it("Gemini provider has 1 model", () => {
      const configs = buildProviderConfigs()
      const geminiConfig = configs[PROVIDER_IDS.GEMINI]
      expect(geminiConfig.models).toHaveLength(1)
      expect(geminiConfig.api).toBe("google-generative-ai")
    })

    it("models have OpenClaw SDK format", () => {
      const configs = buildProviderConfigs()
      const gptConfig = configs[PROVIDER_IDS.GPT]
      const firstModel = gptConfig.models[0]
      
      expect(firstModel.id).toBeTruthy()
      expect(firstModel.name).toBeTruthy()
      expect(firstModel.reasoning).toBeDefined()
      expect(firstModel.input).toBeDefined()
      expect(firstModel.cost).toBeDefined()
      expect(firstModel.contextWindow).toBeGreaterThan(0)
      expect(firstModel.maxTokens).toBeGreaterThan(0)
    })
  })

  describe("PROVIDER_IDS", () => {
    it("has GPT, CLAUDE, and GEMINI provider IDs", () => {
      expect(PROVIDER_IDS.GPT).toBeTruthy()
      expect(PROVIDER_IDS.CLAUDE).toBeTruthy()
      expect(PROVIDER_IDS.GEMINI).toBeTruthy()
    })
  })
})
