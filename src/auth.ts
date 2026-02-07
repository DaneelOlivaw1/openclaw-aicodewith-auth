import {
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
          auth: {
            order: {
              [PROVIDER_ID_GPT]: [AUTH_PROFILE_ID],
              [PROVIDER_ID_CLAUDE]: [AUTH_PROFILE_ID],
              [PROVIDER_ID_GEMINI]: [AUTH_PROFILE_ID],
            },
          },
          agents: {
            defaults: {
              model: {
                primary: defaultModelRef,
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
