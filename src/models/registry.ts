import {
  PROVIDER_ID_GPT,
  PROVIDER_ID_CLAUDE,
  PROVIDER_ID_GEMINI,
  AICODEWITH_GPT_BASE_URL,
  AICODEWITH_CLAUDE_BASE_URL,
  AICODEWITH_GEMINI_BASE_URL,
} from "../constants.js";
import { ModelDefinition, OpenClawModel, ModelFamily } from "../types.js";

const DEFAULT_COST = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 };

export const MODELS: ModelDefinition[] = [
  {
    id: "gpt-5.3-codex",
    name: "GPT-5.3 Codex",
    family: "gpt",
    displayName: "GPT-5.3 Codex",
    version: "5.3",
    reasoning: false,
    input: ["text", "image"] as const,
    cost: DEFAULT_COST,
    contextWindow: 400000,
    maxTokens: 128000,
    limit: { context: 400000, output: 128000 },
    modalities: { input: ["text", "image"], output: ["text"] },
  },
  {
    id: "gpt-5.2",
    name: "GPT-5.2",
    family: "gpt",
    displayName: "GPT-5.2",
    version: "5.2",
    reasoning: false,
    input: ["text", "image"] as const,
    cost: DEFAULT_COST,
    contextWindow: 400000,
    maxTokens: 128000,
    limit: { context: 400000, output: 128000 },
    modalities: { input: ["text", "image"], output: ["text"] },
  },
  {
    id: "gpt-5.2-codex",
    name: "GPT-5.2 Codex (deprecated)",
    family: "gpt",
    displayName: "GPT-5.2 Codex (deprecated)",
    version: "5.2",
    reasoning: false,
    input: ["text", "image"] as const,
    cost: DEFAULT_COST,
    contextWindow: 400000,
    maxTokens: 128000,
    limit: { context: 400000, output: 128000 },
    modalities: { input: ["text", "image"], output: ["text"] },
    deprecated: true,
    replacedBy: "gpt-5.3-codex",
  },
  {
    id: "gpt-5.1-codex",
    name: "GPT-5.1 Codex (deprecated)",
    family: "gpt",
    displayName: "GPT-5.1 Codex (deprecated)",
    version: "5.1",
    reasoning: false,
    input: ["text", "image"] as const,
    cost: DEFAULT_COST,
    contextWindow: 400000,
    maxTokens: 128000,
    limit: { context: 400000, output: 128000 },
    modalities: { input: ["text", "image"], output: ["text"] },
    deprecated: true,
    replacedBy: "gpt-5.3-codex",
  },
  {
    id: "gpt-5.1-codex-max",
    name: "GPT-5.1 Codex Max (deprecated)",
    family: "gpt",
    displayName: "GPT-5.1 Codex Max (deprecated)",
    version: "5.1",
    reasoning: false,
    input: ["text", "image"] as const,
    cost: DEFAULT_COST,
    contextWindow: 400000,
    maxTokens: 128000,
    limit: { context: 400000, output: 128000 },
    modalities: { input: ["text", "image"], output: ["text"] },
    deprecated: true,
    replacedBy: "gpt-5.3-codex",
  },
  {
    id: "gpt-5.1-codex-mini",
    name: "GPT-5.1 Codex Mini (deprecated)",
    family: "gpt",
    displayName: "GPT-5.1 Codex Mini (deprecated)",
    version: "5.1",
    reasoning: false,
    input: ["text", "image"] as const,
    cost: DEFAULT_COST,
    contextWindow: 200000,
    maxTokens: 64000,
    limit: { context: 200000, output: 64000 },
    modalities: { input: ["text", "image"], output: ["text"] },
    deprecated: true,
    replacedBy: "gpt-5.3-codex",
  },
  {
    id: "gpt-5.1",
    name: "GPT-5.1 (deprecated)",
    family: "gpt",
    displayName: "GPT-5.1 (deprecated)",
    version: "5.1",
    reasoning: false,
    input: ["text", "image"] as const,
    cost: DEFAULT_COST,
    contextWindow: 400000,
    maxTokens: 128000,
    limit: { context: 400000, output: 128000 },
    modalities: { input: ["text", "image"], output: ["text"] },
    deprecated: true,
    replacedBy: "gpt-5.2",
  },
  {
    id: "claude-opus-4-6-20260205",
    name: "Claude Opus 4.6",
    family: "claude",
    displayName: "Claude Opus 4.6",
    version: "4.6",
    reasoning: false,
    input: ["text", "image"] as const,
    cost: DEFAULT_COST,
    contextWindow: 200000,
    maxTokens: 64000,
    limit: { context: 200000, output: 64000 },
    modalities: { input: ["text", "image"], output: ["text"] },
    isDefault: true,
  },
  {
    id: "claude-sonnet-4-5-20250929",
    name: "Claude Sonnet 4.5",
    family: "claude",
    displayName: "Claude Sonnet 4.5",
    version: "4.5",
    reasoning: false,
    input: ["text", "image"] as const,
    cost: DEFAULT_COST,
    contextWindow: 200000,
    maxTokens: 64000,
    limit: { context: 200000, output: 64000 },
    modalities: { input: ["text", "image"], output: ["text"] },
  },
  {
    id: "claude-haiku-4-5-20251001",
    name: "Claude Haiku 4.5",
    family: "claude",
    displayName: "Claude Haiku 4.5",
    version: "4.5",
    reasoning: false,
    input: ["text", "image"] as const,
    cost: DEFAULT_COST,
    contextWindow: 200000,
    maxTokens: 8192,
    limit: { context: 200000, output: 8192 },
    modalities: { input: ["text", "image"], output: ["text"] },
  },
  {
    id: "claude-opus-4-5-20251101",
    name: "Claude Opus 4.5 (deprecated)",
    family: "claude",
    displayName: "Claude Opus 4.5 (deprecated)",
    version: "4.5",
    reasoning: false,
    input: ["text", "image"] as const,
    cost: DEFAULT_COST,
    contextWindow: 180000,
    maxTokens: 64000,
    limit: { context: 180000, output: 64000 },
    modalities: { input: ["text", "image"], output: ["text"] },
    deprecated: true,
    replacedBy: "claude-opus-4-6-20260205",
  },
  {
    id: "claude-opus-4-6-20260205-third-party",
    name: "Claude Opus 4.6 third-party (deprecated)",
    family: "claude",
    displayName: "Claude Opus 4.6 third-party (deprecated)",
    version: "4.6",
    reasoning: false,
    input: ["text", "image"] as const,
    cost: DEFAULT_COST,
    contextWindow: 200000,
    maxTokens: 64000,
    limit: { context: 200000, output: 64000 },
    modalities: { input: ["text", "image"], output: ["text"] },
    deprecated: true,
    replacedBy: "claude-opus-4-6-20260205",
  },
  {
    id: "claude-opus-4-5-20251101-third-party",
    name: "Claude Opus 4.5 third-party (deprecated)",
    family: "claude",
    displayName: "Claude Opus 4.5 third-party (deprecated)",
    version: "4.5",
    reasoning: false,
    input: ["text", "image"] as const,
    cost: DEFAULT_COST,
    contextWindow: 180000,
    maxTokens: 64000,
    limit: { context: 180000, output: 64000 },
    modalities: { input: ["text", "image"], output: ["text"] },
    deprecated: true,
    replacedBy: "claude-opus-4-6-20260205",
  },
  {
    id: "claude-sonnet-4-5-20250929-third-party",
    name: "Claude Sonnet 4.5 third-party (deprecated)",
    family: "claude",
    displayName: "Claude Sonnet 4.5 third-party (deprecated)",
    version: "4.5",
    reasoning: false,
    input: ["text", "image"] as const,
    cost: DEFAULT_COST,
    contextWindow: 200000,
    maxTokens: 64000,
    limit: { context: 200000, output: 64000 },
    modalities: { input: ["text", "image"], output: ["text"] },
    deprecated: true,
    replacedBy: "claude-sonnet-4-5-20250929",
  },
  {
    id: "claude-haiku-4-5-20251001-third-party",
    name: "Claude Haiku 4.5 third-party (deprecated)",
    family: "claude",
    displayName: "Claude Haiku 4.5 third-party (deprecated)",
    version: "4.5",
    reasoning: false,
    input: ["text", "image"] as const,
    cost: DEFAULT_COST,
    contextWindow: 200000,
    maxTokens: 8192,
    limit: { context: 200000, output: 8192 },
    modalities: { input: ["text", "image"], output: ["text"] },
    deprecated: true,
    replacedBy: "claude-haiku-4-5-20251001",
  },
  {
    id: "gemini-3-pro",
    name: "Gemini 3 Pro",
    family: "gemini",
    displayName: "Gemini 3 Pro",
    version: "3",
    reasoning: false,
    input: ["text", "image"] as const,
    cost: DEFAULT_COST,
    contextWindow: 1048576,
    maxTokens: 65536,
    limit: { context: 1048576, output: 65536 },
    modalities: { input: ["text", "image"], output: ["text"] },
  },
];

export const PROVIDER_IDS = {
  GPT: PROVIDER_ID_GPT,
  CLAUDE: PROVIDER_ID_CLAUDE,
  GEMINI: PROVIDER_ID_GEMINI,
} as const;

export const getActiveModels = (): ModelDefinition[] => {
  return MODELS.filter((m) => !m.deprecated);
};

export const getModelById = (id: string): ModelDefinition | undefined => {
  return MODELS.find((m) => m.id === id);
};

export const getModelsByFamily = (family: ModelFamily): ModelDefinition[] => {
  return MODELS.filter((m) => m.family === family && !m.deprecated);
};

export const toOpenClawModel = (model: ModelDefinition): OpenClawModel => {
  return {
    id: model.id,
    name: model.name,
    reasoning: model.reasoning,
    input: model.input,
    cost: model.cost,
    contextWindow: model.contextWindow,
    maxTokens: model.maxTokens,
  };
};

export const getDefaultModel = (): ModelDefinition => {
  const defaultModel = MODELS.find((m) => m.isDefault);
  if (!defaultModel) {
    throw new Error("No default model found in registry");
  }
  return defaultModel;
};

export const getDeprecatedModels = (): ModelDefinition[] => {
  return MODELS.filter((m) => m.deprecated);
};

export const buildModelMigrations = (): Record<string, string> => {
  const migrations: Record<string, string> = {};
  
  const getProviderForFamily = (family: ModelFamily): string => {
    switch (family) {
      case "gpt": return PROVIDER_ID_GPT;
      case "claude": return PROVIDER_ID_CLAUDE;
      case "gemini": return PROVIDER_ID_GEMINI;
    }
  };
  
  for (const model of MODELS) {
    if (model.deprecated && model.replacedBy) {
      migrations[model.id] = model.replacedBy;
      
      const provider = getProviderForFamily(model.family);
      const replacementModel = MODELS.find(m => m.id === model.replacedBy);
      if (replacementModel) {
        const replacementProvider = getProviderForFamily(replacementModel.family);
        migrations[`${provider}/${model.id}`] = `${replacementProvider}/${model.replacedBy}`;
      }
    }
  }
  return migrations;
};

export const buildProviderConfigs = () => {
  const gptModels = getModelsByFamily("gpt").map(toOpenClawModel);
  const claudeModels = getModelsByFamily("claude").map(toOpenClawModel);
  const geminiModels = getModelsByFamily("gemini").map(toOpenClawModel);

  return {
    [PROVIDER_ID_GPT]: {
      baseUrl: AICODEWITH_GPT_BASE_URL,
      api: "openai-responses" as const,
      models: gptModels,
    },
    [PROVIDER_ID_CLAUDE]: {
      baseUrl: AICODEWITH_CLAUDE_BASE_URL,
      api: "anthropic-messages" as const,
      models: claudeModels,
    },
    [PROVIDER_ID_GEMINI]: {
      baseUrl: AICODEWITH_GEMINI_BASE_URL,
      api: "google-generative-ai" as const,
      models: geminiModels,
    },
  };
};
