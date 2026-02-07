import { describe, it, expect } from "vitest";
import { buildModelMigrations } from "../../lib/models/index.js";

describe("Config Migration", () => {
  it("should build migration map from deprecated models", () => {
    const migrations = buildModelMigrations();

    expect(migrations).toEqual({
      "gpt-5.2-codex": "gpt-5.3-codex",
      "gpt-5.1-codex": "gpt-5.3-codex",
      "gpt-5.1-codex-max": "gpt-5.3-codex",
      "gpt-5.1-codex-mini": "gpt-5.3-codex",
      "gpt-5.1": "gpt-5.2",
      "claude-opus-4-5-20251101": "claude-opus-4-6-20260205",
      "claude-opus-4-6-20260205-third-party": "claude-opus-4-6-20260205",
      "claude-opus-4-5-20251101-third-party": "claude-opus-4-6-20260205",
      "claude-sonnet-4-5-20250929-third-party": "claude-sonnet-4-5-20250929",
      "claude-haiku-4-5-20251001-third-party": "claude-haiku-4-5-20251001",
    });
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
});
