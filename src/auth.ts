import {
  AICODEWITH_GPT_BASE_URL,
  AICODEWITH_CLAUDE_BASE_URL,
  AICODEWITH_GEMINI_BASE_URL,
  PROVIDER_ID_GPT,
  PROVIDER_ID_CLAUDE,
  PROVIDER_ID_GEMINI,
  AUTH_PROFILE_ID,
} from "./constants.js";
import { buildProviderConfigs, getDefaultModel } from "../lib/models/index.js";

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
          models: {
            providers: {
              [PROVIDER_ID_GPT]: {
                ...providerConfigs[PROVIDER_ID_GPT],
                apiKey: trimmedKey,
              },
              [PROVIDER_ID_CLAUDE]: {
                ...providerConfigs[PROVIDER_ID_CLAUDE],
                apiKey: trimmedKey,
              },
              [PROVIDER_ID_GEMINI]: {
                ...providerConfigs[PROVIDER_ID_GEMINI],
                apiKey: trimmedKey,
              },
            },
          },
          agents: {
            defaults: {
              model: defaultModelRef,
              models: {
                ...Object.fromEntries(
                  providerConfigs[PROVIDER_ID_GPT].models.map((m) => [`${PROVIDER_ID_GPT}/${m.id}`, {}])
                ),
                ...Object.fromEntries(
                  providerConfigs[PROVIDER_ID_CLAUDE].models.map((m) => [`${PROVIDER_ID_CLAUDE}/${m.id}`, {}])
                ),
                ...Object.fromEntries(
                  providerConfigs[PROVIDER_ID_GEMINI].models.map((m) => [`${PROVIDER_ID_GEMINI}/${m.id}`, {}])
                ),
              },
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
