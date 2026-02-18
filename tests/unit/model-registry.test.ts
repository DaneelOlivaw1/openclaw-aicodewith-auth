import { describe, it, expect } from "vitest"
import {
  MODELS,
  PROVIDER_IDS,
  getActiveModels,
  getModelById,
  getModelsByFamily,
  getDefaultModel,
  getDeprecatedModels,
  buildModelMigrations,
  buildProviderConfigs,
  toOpenClawModel,
} from "../../src/models/registry.js"

describe("Model Registry", () => {
  describe("MODELS array", () => {
    it("has models", () => {
      expect(MODELS.length).toBeGreaterThan(0)
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
      expect(defaultModels[0].id).toBe("claude-opus-4-6-20260205")
    })
  })

  describe("getActiveModels", () => {
    it("returns active models (excludes deprecated)", () => {
      const active = getActiveModels()
      expect(active.length).toBeGreaterThan(0)
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
    it("finds active model by exact ID", () => {
      const model = getModelById("gpt-5.3-codex")
      expect(model).toBeDefined()
      expect(model?.displayName).toBe("GPT-5.3 Codex")
    })

    it("finds deprecated model by exact ID", () => {
      const model = getModelById("gpt-5.2-codex")
      expect(model).toBeDefined()
      expect(model?.displayName).toBe("GPT-5.2 Codex (deprecated)")
      expect(model?.deprecated).toBe(true)
    })

    it("returns undefined for unknown ID", () => {
      const model = getModelById("unknown-model-id")
      expect(model).toBeUndefined()
    })

    it("finds all active models by their IDs", () => {
      expect(getModelById("gpt-5.3-codex")).toBeDefined()
      expect(getModelById("gpt-5.2")).toBeDefined()
      expect(getModelById("claude-opus-4-6-20260205")).toBeDefined()
      expect(getModelById("claude-sonnet-4-6")).toBeDefined()
      expect(getModelById("claude-sonnet-4-5-20250929")).toBeDefined()
      expect(getModelById("claude-haiku-4-5-20251001")).toBeDefined()
      expect(getModelById("gemini-3-pro")).toBeDefined()
    })
  })

  describe("getDefaultModel", () => {
    it("returns claude-opus-4-6-20260205", () => {
      const defaultModel = getDefaultModel()
      expect(defaultModel.id).toBe("claude-opus-4-6-20260205")
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
      expect(gptModels.length).toBeGreaterThan(0)
      expect(gptModels.every(m => m.family === "gpt")).toBe(true)
    })

    it("returns only Claude models", () => {
      const claudeModels = getModelsByFamily("claude")
      expect(claudeModels.length).toBeGreaterThan(0)
      expect(claudeModels.every(m => m.family === "claude")).toBe(true)
    })

    it("returns only Gemini models", () => {
      const geminiModels = getModelsByFamily("gemini")
      expect(geminiModels.length).toBeGreaterThan(0)
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

    it("Claude provider has models", () => {
      const configs = buildProviderConfigs()
      const claudeConfig = configs[PROVIDER_IDS.CLAUDE]
      expect(claudeConfig.models.length).toBeGreaterThan(0)
    })

    it("Claude provider includes claude-opus-4-6-20260205", () => {
      const configs = buildProviderConfigs()
      const claudeConfig = configs[PROVIDER_IDS.CLAUDE]
      const modelIds = claudeConfig.models.map(m => m.id)
      expect(modelIds).toContain("claude-opus-4-6-20260205")
      expect(modelIds).toContain("claude-sonnet-4-6")
      expect(modelIds).toContain("claude-haiku-4-5-20251001")
    })

    it("GPT provider includes gpt-5.3-codex", () => {
      const configs = buildProviderConfigs()
      const gptConfig = configs[PROVIDER_IDS.GPT]
      const modelIds = gptConfig.models.map(m => m.id)
      expect(modelIds).toContain("gpt-5.3-codex")
      expect(modelIds).toContain("gpt-5.2")
    })

    it("Gemini provider has models", () => {
      const configs = buildProviderConfigs()
      const geminiConfig = configs[PROVIDER_IDS.GEMINI]
      expect(geminiConfig.models.length).toBeGreaterThan(0)
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

  describe("getDeprecatedModels", () => {
    it("returns deprecated models", () => {
      const deprecated = getDeprecatedModels()
      expect(deprecated.length).toBeGreaterThan(0)
    })

    it("returns only models with deprecated: true", () => {
      const deprecated = getDeprecatedModels()
      expect(deprecated.every(m => m.deprecated === true)).toBe(true)
    })

    it("all deprecated models have replacedBy field", () => {
      const deprecated = getDeprecatedModels()
      expect(deprecated.every(m => m.replacedBy)).toBe(true)
    })
  })

  describe("buildModelMigrations", () => {
    it("returns migration mappings for all deprecated models", () => {
      const migrations = buildModelMigrations()
      const deprecated = getDeprecatedModels()
      expect(Object.keys(migrations).length).toBe(deprecated.length * 2)
    })

    it("returns Record<string, string> type", () => {
      const migrations = buildModelMigrations()
      expect(typeof migrations).toBe("object")
      for (const [key, value] of Object.entries(migrations)) {
        expect(typeof key).toBe("string")
        expect(typeof value).toBe("string")
      }
    })

    it("maps deprecated models to their replacements", () => {
      const migrations = buildModelMigrations()
      expect(migrations["gpt-5.2-codex"]).toBe("gpt-5.3-codex")
      expect(migrations["claude-opus-4-5-20251101"]).toBe("claude-opus-4-6-20260205")
    })

    it("includes provider-prefixed migrations", () => {
      const migrations = buildModelMigrations()
      expect(migrations["aicodewith-gpt/gpt-5.2-codex"]).toBe("aicodewith-gpt/gpt-5.3-codex")
      expect(migrations["aicodewith-claude/claude-opus-4-5-20251101"]).toBe("aicodewith-claude/claude-opus-4-6-20260205")
    })
  })

  describe("toOpenClawModel", () => {
    it("transforms ModelDefinition to OpenClawModel format", () => {
      const model = getModelById("gpt-5.2-codex")!
      const openClawModel = toOpenClawModel(model)

      expect(openClawModel.id).toBe(model.id)
      expect(openClawModel.name).toBe(model.name)
      expect(openClawModel.reasoning).toBe(model.reasoning)
      expect(openClawModel.input).toEqual(model.input)
      expect(openClawModel.cost).toEqual(model.cost)
      expect(openClawModel.contextWindow).toBe(model.contextWindow)
      expect(openClawModel.maxTokens).toBe(model.maxTokens)
    })

    it("excludes registry metadata fields", () => {
      const model = getModelById("claude-opus-4-5-20251101")!
      const openClawModel = toOpenClawModel(model)

      expect("family" in openClawModel).toBe(false)
      expect("displayName" in openClawModel).toBe(false)
      expect("version" in openClawModel).toBe(false)
      expect("limit" in openClawModel).toBe(false)
      expect("modalities" in openClawModel).toBe(false)
      expect("deprecated" in openClawModel).toBe(false)
      expect("replacedBy" in openClawModel).toBe(false)
      expect("isDefault" in openClawModel).toBe(false)
    })

    it("works for all model families", () => {
      const gptModel = toOpenClawModel(getModelById("gpt-5.2")!)
      const claudeModel = toOpenClawModel(getModelById("claude-sonnet-4-6")!)
      const geminiModel = toOpenClawModel(getModelById("gemini-3-pro")!)

      expect(gptModel.id).toBe("gpt-5.2")
      expect(claudeModel.id).toBe("claude-sonnet-4-6")
      expect(geminiModel.id).toBe("gemini-3-pro")
    })
  })
})
