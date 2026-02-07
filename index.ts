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
import { buildProviderConfigs, buildModelMigrations } from "./lib/models/index.js";
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
    on: (
      hookName: string,
      handler: (event: any, ctx: any) => void | Promise<void>,
      opts?: { priority?: number }
    ) => void;
  }) {
    const authMethod = createAicodewithAuthMethod();
    const providerConfigs = buildProviderConfigs();

    api.registerProvider({
      id: PROVIDER_ID_GPT,
      label: "AICodewith GPT",
      envVars: [AICODEWITH_API_KEY_ENV],
      models: providerConfigs[PROVIDER_ID_GPT],
      auth: [authMethod],
    });

    api.registerProvider({
      id: PROVIDER_ID_CLAUDE,
      label: "AICodewith Claude",
      envVars: [AICODEWITH_API_KEY_ENV],
      models: providerConfigs[PROVIDER_ID_CLAUDE],
      auth: [authMethod],
    });

    api.registerProvider({
      id: PROVIDER_ID_GEMINI,
      label: "AICodewith Gemini",
      envVars: [AICODEWITH_API_KEY_ENV],
      models: providerConfigs[PROVIDER_ID_GEMINI],
      auth: [authMethod],
    });

    api.on("gateway_start", async () => {
      try {
        const { readConfigFileSnapshot, writeConfigFile } = await import("openclaw/config");
        const snapshot = await readConfigFileSnapshot();
        
        if (!snapshot?.parsed) {
          return;
        }

        const config = snapshot.parsed as Record<string, any>;
        const migrations = buildModelMigrations();
        let changed = false;

        if (config.default_model && typeof config.default_model === "string") {
          const migrated = migrations[config.default_model];
          if (migrated) {
            config.default_model = migrated;
            changed = true;
          }
        }

        if (config.agents?.defaults?.model && typeof config.agents.defaults.model === "string") {
          const migrated = migrations[config.agents.defaults.model];
          if (migrated) {
            config.agents.defaults.model = migrated;
            changed = true;
          }
        }

        if (config.agents?.agents && typeof config.agents.agents === "object") {
          for (const [agentId, agentConfig] of Object.entries(config.agents.agents)) {
            if (agentConfig && typeof agentConfig === "object") {
              const agent = agentConfig as Record<string, any>;
              if (agent.model && typeof agent.model === "string") {
                const migrated = migrations[agent.model];
                if (migrated) {
                  agent.model = migrated;
                  changed = true;
                }
              }
            }
          }
        }

        if (changed) {
          await writeConfigFile(config);
          console.log(`[${PLUGIN_ID}] Migrated deprecated model IDs in config`);
        }
      } catch (error) {
        console.warn(
          `[${PLUGIN_ID}] Failed to migrate config:`,
          error instanceof Error ? error.message : error
        );
      }
    });
  },
};

export default aicodewithPlugin;
