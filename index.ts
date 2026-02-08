import { emptyPluginConfigSchema } from "openclaw/plugin-sdk";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import {
  PLUGIN_ID,
  PLUGIN_NAME,
  PLUGIN_DESCRIPTION,
  PROVIDER_ID_GPT,
  PROVIDER_ID_CLAUDE,
  PROVIDER_ID_GEMINI,
  AICODEWITH_API_KEY_ENV,
} from "./src/constants.js";
import { buildProviderConfigs } from "./src/models/index.js";
import { createAicodewithAuthMethod } from "./src/auth.js";
import { migrateConfig, cleanupStaleModels } from "./src/migrations.js";
import { PluginApi } from "./src/types.js";

function cleanupStaleModelEntries(): void {
  try {
    const configPath = join(homedir(), ".openclaw", "openclaw.json");
    if (!existsSync(configPath)) return;

    const raw = readFileSync(configPath, "utf8");
    const config = JSON.parse(raw) as Record<string, unknown>;

    const { config: newConfig, changed } = cleanupStaleModels(config);

    if (changed) {
      writeFileSync(configPath, JSON.stringify(newConfig, null, 2) + "\n");
    }
  } catch {
    // Config cleanup is best-effort; don't break plugin loading
  }
}

const aicodewithPlugin = {
  id: PLUGIN_ID,
  name: PLUGIN_NAME,
  description: PLUGIN_DESCRIPTION,
  configSchema: emptyPluginConfigSchema(),
  register(api: PluginApi) {
    cleanupStaleModelEntries();

    api.on("gateway_start", async () => {
      try {
        const config = api.runtime.config.loadConfig();
        const { config: migratedConfig, changed } = migrateConfig(config);
        if (changed) {
          await api.runtime.config.writeConfigFile(migratedConfig);
          console.log(`[${PLUGIN_ID}] Migrated deprecated model IDs in config`);
        }
      } catch (error) {
        console.warn(
          `[${PLUGIN_ID}] Config migration failed:`,
          error instanceof Error ? error.message : error
        );
      }
    });

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
