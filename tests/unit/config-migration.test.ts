import { describe, it, expect } from "vitest";
import { migrateConfig } from "../../src/migrations.js";
import { PROVIDER_ID_CLAUDE, PROVIDER_ID_GPT } from "../../src/constants.js";

describe("migrateConfig", () => {
  it("migrates agents.defaults.model.primary from deprecated to replacement", () => {
    const config = {
      agents: { defaults: { model: { primary: "aicodewith-claude/claude-opus-4-5-20251101" } } }
    };
    const { config: result, changed } = migrateConfig(config);
    expect(changed).toBe(true);
    expect((result.agents as any).defaults.model.primary).toBe("aicodewith-claude/claude-opus-4-6-20260205");
  });

  it("migrates agents.defaults.model.fallbacks", () => {
    const config = {
      agents: { defaults: { model: { fallbacks: ["aicodewith-gpt/gpt-5.2-codex", "other-model"] } } }
    };
    const { config: result, changed } = migrateConfig(config);
    expect(changed).toBe(true);
    expect((result.agents as any).defaults.model.fallbacks).toEqual(["aicodewith-gpt/gpt-5.3-codex", "other-model"]);
  });

  it("migrates agents.defaults.models keys", () => {
    const config = {
      agents: { defaults: { models: { "aicodewith-gpt/gpt-5.2-codex": { alias: "codex" } } } }
    };
    const { config: result, changed } = migrateConfig(config);
    expect(changed).toBe(true);
    expect((result.agents as any).defaults.models["aicodewith-gpt/gpt-5.2-codex"]).toBeUndefined();
    expect((result.agents as any).defaults.models["aicodewith-gpt/gpt-5.3-codex"]).toEqual({ alias: "codex" });
  });

  it("migrates agents.list[*].model.primary", () => {
    const config = {
      agents: {
        list: [
          { model: { primary: "gpt-5.1" } }
        ]
      }
    };
    const { config: result, changed } = migrateConfig(config);
    expect(changed).toBe(true);
    expect((result.agents as any).list[0].model.primary).toBe("gpt-5.2");
  });

  it("updates models.providers with latest config while preserving apiKey", () => {
    const config = {
      models: {
        providers: {
          [PROVIDER_ID_CLAUDE]: {
            baseUrl: "old-url",
            api: "old-api",
            models: [{ id: "claude-sonnet-4-5-20250929", name: "Claude Sonnet 4.5" }],
            apiKey: "sk-test-key",
          }
        }
      }
    };
    const { config: result, changed } = migrateConfig(config);
    expect(changed).toBe(true);
    const provider = (result.models as any).providers[PROVIDER_ID_CLAUDE];
    expect(provider.apiKey).toBe("sk-test-key");
    expect(provider.models.length).toBeGreaterThan(1);
    expect(provider.baseUrl).not.toBe("old-url");
  });

  it("returns changed=false when no deprecated models found", () => {
    const config = {
      agents: { defaults: { model: { primary: "aicodewith-claude/claude-opus-4-6-20260205" } } }
    };
    const { config: result, changed } = migrateConfig(config);
    expect(changed).toBe(false);
    expect(result).toBe(config);
  });

  it("handles missing agents/models sections gracefully", () => {
    const config = { other: "stuff" };
    const { config: result, changed } = migrateConfig(config);
    expect(changed).toBe(false);
    expect(result).toBe(config);
  });

  it("does not touch non-aicodewith providers", () => {
     const config = {
      models: {
        providers: {
          "other-provider": {
            baseUrl: "https://other.api.com",
            models: [{ id: "other-model", name: "Other Model" }],
          },
        },
      },
    };
    const { config: result, changed } = migrateConfig(config);
    expect(changed).toBe(false);
    expect((result.models as any).providers["other-provider"]).toBeDefined();
  });
});
