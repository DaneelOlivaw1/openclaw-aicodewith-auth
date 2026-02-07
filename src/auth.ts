import {
  PROVIDER_ID_GPT,
  PROVIDER_ID_CLAUDE,
  PROVIDER_ID_GEMINI,
  AUTH_PROFILE_ID,
} from "./constants.js";
import { buildProviderConfigs, getDefaultModel } from "../lib/models/index.js";

type SelectOption<T> = { value: T; label: string; hint?: string };

type AuthContext = {
  config: Record<string, unknown>;
  prompter: {
    text: (opts: {
      message: string;
      placeholder?: string;
      validate?: (value: string) => string | undefined;
    }) => Promise<string>;
    select: <T>(opts: {
      message: string;
      options: SelectOption<T>[];
    }) => Promise<T>;
  };
};

function maskKey(key: string): string {
  if (key.length <= 8) return "****";
  return key.slice(0, 6) + "****" + key.slice(-4);
}

function findExistingApiKey(config: Record<string, unknown>): string | undefined {
  const models = config.models as Record<string, unknown> | undefined;
  const providers = models?.providers as Record<string, Record<string, unknown>> | undefined;
  if (!providers) return undefined;

  for (const id of [PROVIDER_ID_CLAUDE, PROVIDER_ID_GPT, PROVIDER_ID_GEMINI]) {
    const key = providers[id]?.apiKey;
    if (typeof key === "string" && key.length >= 10) return key;
  }
  return undefined;
}

function validateApiKey(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return "API key is required";
  if (trimmed.length < 10) return "API key seems too short";
  return undefined;
}

function buildAuthResult(apiKey: string, existingConfig: Record<string, unknown>) {
  const providerConfigs = buildProviderConfigs();
  const defaultModel = getDefaultModel();
  const defaultModelRef = `${PROVIDER_ID_CLAUDE}/${defaultModel.id}`;

  const modelsConfig: Record<string, Record<string, unknown> | null> = {};
  for (const providerId of [PROVIDER_ID_GPT, PROVIDER_ID_CLAUDE, PROVIDER_ID_GEMINI] as const) {
    for (const model of providerConfigs[providerId].models) {
      modelsConfig[`${providerId}/${model.id}`] = {};
    }
  }

  // Nullify stale aicodewith entries from existing config so deep merge overwrites them
  const existingModels = (existingConfig.agents as Record<string, unknown> | undefined)
    ?.defaults as Record<string, unknown> | undefined;
  const existingModelKeys = existingModels?.models as Record<string, unknown> | undefined;
  if (existingModelKeys) {
    for (const key of Object.keys(existingModelKeys)) {
      if (key.startsWith("aicodewith-") && !(key in modelsConfig)) {
        modelsConfig[key] = null;
      }
    }
  }

  return {
    profiles: [
      {
        profileId: AUTH_PROFILE_ID,
        credential: {
          type: "api_key" as const,
          provider: "aicodewith",
          key: apiKey,
        },
      },
    ],
    configPatch: {
      auth: {
        order: {
          [PROVIDER_ID_GPT]: [AUTH_PROFILE_ID],
          [PROVIDER_ID_CLAUDE]: [AUTH_PROFILE_ID],
          [PROVIDER_ID_GEMINI]: [AUTH_PROFILE_ID],
        },
      },
      models: {
        providers: {
          [PROVIDER_ID_GPT]: {
            baseUrl: providerConfigs[PROVIDER_ID_GPT].baseUrl,
            api: providerConfigs[PROVIDER_ID_GPT].api,
            models: providerConfigs[PROVIDER_ID_GPT].models,
            apiKey,
          },
          [PROVIDER_ID_CLAUDE]: {
            baseUrl: providerConfigs[PROVIDER_ID_CLAUDE].baseUrl,
            api: providerConfigs[PROVIDER_ID_CLAUDE].api,
            models: providerConfigs[PROVIDER_ID_CLAUDE].models,
            apiKey,
          },
          [PROVIDER_ID_GEMINI]: {
            baseUrl: providerConfigs[PROVIDER_ID_GEMINI].baseUrl,
            api: providerConfigs[PROVIDER_ID_GEMINI].api,
            models: providerConfigs[PROVIDER_ID_GEMINI].models,
            apiKey,
          },
        },
      },
      agents: {
        defaults: {
          model: { primary: defaultModelRef },
          models: modelsConfig,
        },
      },
    },
    defaultModel: defaultModelRef,
    notes: [
      "AICodewith provides access to GPT, Claude, and Gemini models.",
      "Models are available under aicodewith-gpt/, aicodewith-claude/, and aicodewith-gemini/ prefixes.",
    ],
  };
}

export function createAicodewithAuthMethod() {
  return {
    id: "api_key",
    label: "AICodewith API Key",
    hint: "Enter your AICodewith API key to access GPT, Claude, and Gemini models",
    kind: "api_key" as const,
    run: async (ctx: AuthContext) => {
      const existingKey = findExistingApiKey(ctx.config);

      if (existingKey) {
        const choice = await ctx.prompter.select<"existing" | "new">({
          message: `Found existing API key (${maskKey(existingKey)}). What would you like to do?`,
          options: [
            { value: "existing" as const, label: "Use existing key", hint: "Update models only, keep current key" },
            { value: "new" as const, label: "Enter a new key" },
          ],
        });

        if (choice === "existing") {
          return buildAuthResult(existingKey, ctx.config);
        }
      }

      const apiKey = await ctx.prompter.text({
        message: "AICodewith API Key",
        placeholder: "sk-...",
        validate: validateApiKey,
      });

      return buildAuthResult(apiKey.trim(), ctx.config);
    },
  };
}
