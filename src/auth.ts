import {
  AICODEWITH_GPT_BASE_URL,
  AICODEWITH_CLAUDE_BASE_URL,
  AICODEWITH_GEMINI_BASE_URL,
  PROVIDER_ID_GPT,
  PROVIDER_ID_CLAUDE,
  PROVIDER_ID_GEMINI,
  AUTH_PROFILE_ID,
} from "./constants.js";
import { GPT_MODELS, CLAUDE_MODELS, GEMINI_MODELS } from "./models.js";

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
      const defaultModelRef = `${PROVIDER_ID_CLAUDE}/claude-opus-4-5-20251101`;

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
                baseUrl: AICODEWITH_GPT_BASE_URL,
                apiKey: trimmedKey,
                api: "openai-completions",
                models: GPT_MODELS,
              },
              [PROVIDER_ID_CLAUDE]: {
                baseUrl: AICODEWITH_CLAUDE_BASE_URL,
                apiKey: trimmedKey,
                api: "anthropic-messages",
                models: CLAUDE_MODELS,
              },
              [PROVIDER_ID_GEMINI]: {
                baseUrl: AICODEWITH_GEMINI_BASE_URL,
                apiKey: trimmedKey,
                api: "google-generative-ai",
                models: GEMINI_MODELS,
              },
            },
          },
          agents: {
            defaults: {
              model: defaultModelRef,
              models: {
                ...Object.fromEntries(
                  GPT_MODELS.map((m) => [`${PROVIDER_ID_GPT}/${m.id}`, {}])
                ),
                ...Object.fromEntries(
                  CLAUDE_MODELS.map((m) => [`${PROVIDER_ID_CLAUDE}/${m.id}`, {}])
                ),
                ...Object.fromEntries(
                  GEMINI_MODELS.map((m) => [`${PROVIDER_ID_GEMINI}/${m.id}`, {}])
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
