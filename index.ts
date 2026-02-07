import { emptyPluginConfigSchema } from "openclaw/plugin-sdk";
import {
  PLUGIN_ID,
  PLUGIN_NAME,
  PLUGIN_DESCRIPTION,
  PROVIDER_ID_GPT,
  PROVIDER_ID_CLAUDE,
  PROVIDER_ID_GEMINI,
  AICODEWITH_API_KEY_ENV,
} from "./src/constants.js";
import { buildProviderConfigs, buildModelMigrations } from "./lib/models/index.js";
import { createAicodewithAuthMethod } from "./src/auth.js";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

function migrateConfigModels(): void {
  const migrations = buildModelMigrations();
  if (Object.keys(migrations).length === 0) {
    return;
  }

  const configDir = join(homedir(), ".openclaw");
  const configPath = join(configDir, "openclaw.json");

  if (!existsSync(configPath)) {
    return;
  }

  let config: Record<string, unknown>;
  try {
    const content = readFileSync(configPath, "utf-8");
    config = JSON.parse(content);
  } catch {
    return;
  }

  let changed = false;

  const migrateModelField = (modelConfig: unknown): boolean => {
    if (!modelConfig || typeof modelConfig !== "object") return false;
    const model = modelConfig as Record<string, unknown>;
    let fieldChanged = false;

    if (typeof model.primary === "string" && migrations[model.primary]) {
      console.log(`[${PLUGIN_ID}] Migrating primary: ${model.primary} -> ${migrations[model.primary]}`);
      model.primary = migrations[model.primary];
      fieldChanged = true;
    }

    if (Array.isArray(model.fallbacks)) {
      model.fallbacks = model.fallbacks.map((fb: unknown) => {
        if (typeof fb === "string" && migrations[fb]) {
          console.log(`[${PLUGIN_ID}] Migrating fallback: ${fb} -> ${migrations[fb]}`);
          fieldChanged = true;
          return migrations[fb];
        }
        return fb;
      });
    }

    return fieldChanged;
  };

  const agents = config.agents as Record<string, unknown> | undefined;
  if (agents) {
    const defaults = agents.defaults as Record<string, unknown> | undefined;
    if (defaults) {
      if (defaults.model && migrateModelField(defaults.model)) {
        changed = true;
      }
      if (defaults.imageModel && migrateModelField(defaults.imageModel)) {
        changed = true;
      }
    }

    const agentList = agents.list;
    if (Array.isArray(agentList)) {
      for (const agentConfig of agentList) {
        if (agentConfig && typeof agentConfig === "object") {
          const agent = agentConfig as Record<string, unknown>;
          if (agent.model && migrateModelField(agent.model)) {
            changed = true;
          }
          if (agent.imageModel && migrateModelField(agent.imageModel)) {
            changed = true;
          }
        }
      }
    }
  }

  if (changed) {
    try {
      writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n", "utf-8");
      console.log(`[${PLUGIN_ID}] Migrated deprecated model IDs in config`);
    } catch (error) {
      console.warn(
        `[${PLUGIN_ID}] Failed to write migrated config:`,
        error instanceof Error ? error.message : error
      );
    }
  }
}

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
    try {
      migrateConfigModels();
    } catch (error) {
      console.warn(
        `[${PLUGIN_ID}] Config migration failed:`,
        error instanceof Error ? error.message : error
      );
    }

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
  },
};

export default aicodewithPlugin;
