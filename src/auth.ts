import {
  PROVIDER_ID_GPT,
  PROVIDER_ID_CLAUDE,
  PROVIDER_ID_GEMINI,
  AUTH_PROFILE_ID,
} from "./constants.js";
import { buildProviderConfigs, getDefaultModel, buildModelMigrations } from "../lib/models/index.js";

function validateApiKey(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return "API key is required";
  if (trimmed.length < 10) return "API key seems too short";
  return undefined;
}

export function createAicodewithAuthMethod() {
  return {
    id: "api_key",
    label: "AICodewith API Key",
    hint: "Enter your AICodewith API key to access GPT, Claude, and Gemini models",
    kind: "api_key" as const,
    run: async (ctx: {
      prompter: {
        text: (opts: {
          message: string;
          placeholder?: string;
          validate?: (value: string) => string | undefined;
        }) => Promise<string>;
      };
    }) => {
      const apiKey = await ctx.prompter.text({
        message: "AICodewith API Key",
        placeholder: "sk-...",
        validate: validateApiKey,
      });

      const trimmedKey = apiKey.trim();
      const providerConfigs = buildProviderConfigs();
      const defaultModel = getDefaultModel();
      const defaultModelRef = `${PROVIDER_ID_CLAUDE}/${defaultModel.id}`;
      const migrations = buildModelMigrations();

      // Build models config with all current model IDs
      const modelsConfig: Record<string, Record<string, unknown>> = {};
      for (const providerId of [PROVIDER_ID_GPT, PROVIDER_ID_CLAUDE, PROVIDER_ID_GEMINI] as const) {
        const config = providerConfigs[providerId];
        for (const model of config.models) {
          const fullModelId = `${providerId}/${model.id}`;
          modelsConfig[fullModelId] = {};
          // Also add migrated model IDs pointing to the same config
          for (const [oldId, newId] of Object.entries(migrations)) {
            if (newId === fullModelId) {
              modelsConfig[oldId] = {};
            }
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
              key: trimmedKey,
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
                apiKey: trimmedKey,
              },
              [PROVIDER_ID_CLAUDE]: {
                baseUrl: providerConfigs[PROVIDER_ID_CLAUDE].baseUrl,
                api: providerConfigs[PROVIDER_ID_CLAUDE].api,
                models: providerConfigs[PROVIDER_ID_CLAUDE].models,
                apiKey: trimmedKey,
              },
              [PROVIDER_ID_GEMINI]: {
                baseUrl: providerConfigs[PROVIDER_ID_GEMINI].baseUrl,
                api: providerConfigs[PROVIDER_ID_GEMINI].api,
                models: providerConfigs[PROVIDER_ID_GEMINI].models,
                apiKey: trimmedKey,
              },
            },
          },
          agents: {
            defaults: {
              model: {
                primary: defaultModelRef,
              },
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
    },
  };
}
