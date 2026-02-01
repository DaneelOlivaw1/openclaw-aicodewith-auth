import { emptyPluginConfigSchema } from "openclaw/plugin-sdk";
import {
  PLUGIN_ID,
  PLUGIN_NAME,
  PLUGIN_DESCRIPTION,
  PROVIDER_ID_GPT,
  PROVIDER_ID_CLAUDE,
  PROVIDER_ID_GEMINI,
  AICODEWITH_GPT_BASE_URL,
  AICODEWITH_CLAUDE_BASE_URL,
  AICODEWITH_GEMINI_BASE_URL,
  AICODEWITH_API_KEY_ENV,
} from "./src/constants.js";
import { GPT_MODELS, CLAUDE_MODELS, GEMINI_MODELS } from "./src/models.js";
import { createAicodewithAuthMethod } from "./src/auth.js";

const aicodewithPlugin = {
  id: PLUGIN_ID,
  name: PLUGIN_NAME,
  description: PLUGIN_DESCRIPTION,
  configSchema: emptyPluginConfigSchema(),
  register(api: {
    registerProvider: (provider: {
      id: string;
      label: string;
      envVars?: string[];
      models?: {
        baseUrl: string;
        api: string;
        models: Array<{
          id: string;
          name: string;
          reasoning: boolean;
          input: readonly string[];
          cost: { input: number; output: number; cacheRead: number; cacheWrite: number };
          contextWindow: number;
          maxTokens: number;
        }>;
      };
      auth: Array<ReturnType<typeof createAicodewithAuthMethod>>;
    }) => void;
  }) {
    const authMethod = createAicodewithAuthMethod();

    api.registerProvider({
      id: PROVIDER_ID_GPT,
      label: "AICodewith GPT",
      envVars: [AICODEWITH_API_KEY_ENV],
      models: {
        baseUrl: AICODEWITH_GPT_BASE_URL,
        api: "openai-completions",
        models: GPT_MODELS,
      },
      auth: [authMethod],
    });

    api.registerProvider({
      id: PROVIDER_ID_CLAUDE,
      label: "AICodewith Claude",
      envVars: [AICODEWITH_API_KEY_ENV],
      models: {
        baseUrl: AICODEWITH_CLAUDE_BASE_URL,
        api: "anthropic-messages",
        models: CLAUDE_MODELS,
      },
      auth: [authMethod],
    });

    api.registerProvider({
      id: PROVIDER_ID_GEMINI,
      label: "AICodewith Gemini",
      envVars: [AICODEWITH_API_KEY_ENV],
      models: {
        baseUrl: AICODEWITH_GEMINI_BASE_URL,
        api: "google-generative-ai",
        models: GEMINI_MODELS,
      },
      auth: [authMethod],
    });
  },
};

export default aicodewithPlugin;
