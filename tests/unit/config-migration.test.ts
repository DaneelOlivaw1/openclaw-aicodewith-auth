import { describe, it, expect } from "vitest";
import { buildModelMigrations } from "../../lib/models/index.js";

describe("Config Migration", () => {
  it("should build migration map from deprecated models", () => {
    const migrations = buildModelMigrations();

    expect(migrations["gpt-5.2-codex"]).toBe("gpt-5.3-codex");
    expect(migrations["gpt-5.1-codex"]).toBe("gpt-5.3-codex");
    expect(migrations["gpt-5.1-codex-max"]).toBe("gpt-5.3-codex");
    expect(migrations["gpt-5.1-codex-mini"]).toBe("gpt-5.3-codex");
    expect(migrations["gpt-5.1"]).toBe("gpt-5.2");
    expect(migrations["claude-opus-4-5-20251101"]).toBe("claude-opus-4-6-20260205");
    expect(migrations["claude-opus-4-6-20260205-third-party"]).toBe("claude-opus-4-6-20260205");
    expect(migrations["claude-opus-4-5-20251101-third-party"]).toBe("claude-opus-4-6-20260205");
    expect(migrations["claude-sonnet-4-5-20250929-third-party"]).toBe("claude-sonnet-4-5-20250929");
    expect(migrations["claude-haiku-4-5-20251001-third-party"]).toBe("claude-haiku-4-5-20251001");
  });

  it("should include provider-prefixed migrations", () => {
    const migrations = buildModelMigrations();

    expect(migrations["aicodewith-gpt/gpt-5.2-codex"]).toBe("aicodewith-gpt/gpt-5.3-codex");
    expect(migrations["aicodewith-claude/claude-opus-4-5-20251101"]).toBe("aicodewith-claude/claude-opus-4-6-20260205");
    expect(migrations["aicodewith-claude/claude-sonnet-4-5-20250929-third-party"]).toBe("aicodewith-claude/claude-sonnet-4-5-20250929");
  });

  it("should migrate default_model in config", () => {
    const migrations = buildModelMigrations();
    const config = {
      default_model: "gpt-5.2-codex",
    };

    if (config.default_model && migrations[config.default_model]) {
      config.default_model = migrations[config.default_model];
    }

    expect(config.default_model).toBe("gpt-5.3-codex");
  });

  it("should migrate model in agents.defaults", () => {
    const migrations = buildModelMigrations();
    const config = {
      agents: {
        defaults: {
          model: "claude-opus-4-5-20251101",
        },
      },
    };

    if (config.agents?.defaults?.model && migrations[config.agents.defaults.model]) {
      config.agents.defaults.model = migrations[config.agents.defaults.model];
    }

    expect(config.agents.defaults.model).toBe("claude-opus-4-6-20260205");
  });

  it("should migrate model in individual agent configs", () => {
    const migrations = buildModelMigrations();
    const config = {
      agents: {
        agents: {
          "agent-1": {
            model: "gpt-5.1",
          },
          "agent-2": {
            model: "claude-sonnet-4-5-20250929-third-party",
          },
        },
      },
    };

    if (config.agents?.agents && typeof config.agents.agents === "object") {
      for (const [agentId, agentConfig] of Object.entries(config.agents.agents)) {
        if (agentConfig && typeof agentConfig === "object") {
          const agent = agentConfig as Record<string, any>;
          if (agent.model && typeof agent.model === "string" && migrations[agent.model]) {
            agent.model = migrations[agent.model];
          }
        }
      }
    }

    expect(config.agents.agents["agent-1"].model).toBe("gpt-5.2");
    expect(config.agents.agents["agent-2"].model).toBe("claude-sonnet-4-5-20250929");
  });

  it("should not modify config if no deprecated models found", () => {
    const migrations = buildModelMigrations();
    const config = {
      default_model: "gpt-5.3-codex",
      agents: {
        defaults: {
          model: "claude-opus-4-6-20260205",
        },
      },
    };

    const originalConfig = JSON.stringify(config);

    if (config.default_model && migrations[config.default_model]) {
      config.default_model = migrations[config.default_model];
    }

    if (config.agents?.defaults?.model && migrations[config.agents.defaults.model]) {
      config.agents.defaults.model = migrations[config.agents.defaults.model];
    }

    expect(JSON.stringify(config)).toBe(originalConfig);
  });

  it("should remove stale provider configs from models.providers", () => {
    const config = {
      models: {
        providers: {
          "aicodewith-gpt": {
            baseUrl: "https://api.aicodewith.com/chatgpt/v1",
            models: [{ id: "gpt-5.2-codex", name: "GPT-5.2 Codex" }],
          },
          "aicodewith-claude": {
            baseUrl: "https://api.aicodewith.com",
            models: [{ id: "claude-sonnet-4-5-20250929", name: "Claude Sonnet 4.5" }],
          },
          "other-provider": {
            baseUrl: "https://other.api.com",
            models: [{ id: "other-model", name: "Other Model" }],
          },
        },
      },
    };

    const ourProviders = ["aicodewith-gpt", "aicodewith-claude", "aicodewith-gemini"];
    const providers = config.models.providers as Record<string, unknown>;
    
    for (const providerId of ourProviders) {
      if (providers[providerId]) {
        delete providers[providerId];
      }
    }

    expect(config.models.providers["aicodewith-gpt"]).toBeUndefined();
    expect(config.models.providers["aicodewith-claude"]).toBeUndefined();
    expect(config.models.providers["other-provider"]).toBeDefined();
  });

  it("should migrate model keys in agents.defaults.models", () => {
    const migrations = buildModelMigrations();
    const config = {
      agents: {
        defaults: {
          models: {
            "aicodewith-claude/claude-opus-4-5-20251101": { alias: "opus" },
            "aicodewith-gpt/gpt-5.2-codex": { alias: "codex" },
            "other-provider/other-model": { alias: "other" },
          } as Record<string, unknown>,
        },
      },
    };

    const modelsConfig = config.agents.defaults.models;
    const keysToMigrate: Array<[string, string]> = [];
    for (const key of Object.keys(modelsConfig)) {
      if (migrations[key]) {
        keysToMigrate.push([key, migrations[key]]);
      }
    }
    for (const [oldKey, newKey] of keysToMigrate) {
      modelsConfig[newKey] = modelsConfig[oldKey];
      delete modelsConfig[oldKey];
    }

    expect(modelsConfig["aicodewith-claude/claude-opus-4-5-20251101"]).toBeUndefined();
    expect(modelsConfig["aicodewith-claude/claude-opus-4-6-20260205"]).toEqual({ alias: "opus" });
    expect(modelsConfig["aicodewith-gpt/gpt-5.2-codex"]).toBeUndefined();
    expect(modelsConfig["aicodewith-gpt/gpt-5.3-codex"]).toEqual({ alias: "codex" });
    expect(modelsConfig["other-provider/other-model"]).toEqual({ alias: "other" });
  });
});
