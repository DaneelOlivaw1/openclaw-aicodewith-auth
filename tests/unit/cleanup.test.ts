import { describe, it, expect } from "vitest";
import { cleanupStaleModels } from "../../src/migrations.js";

describe("cleanupStaleModels", () => {
  it("removes stale aicodewith entries from agents.defaults.models", () => {
    const config = {
      agents: {
        defaults: {
          models: {
            "aicodewith-gpt/stale-model": { alias: "stale" },
            "aicodewith-claude/claude-opus-4-6-20260205": { alias: "opus" },
          }
        }
      }
    };
    const { config: result, changed } = cleanupStaleModels(config);
    expect(changed).toBe(true);
    expect((result.agents as any).defaults.models["aicodewith-gpt/stale-model"]).toBeUndefined();
    expect((result.agents as any).defaults.models["aicodewith-claude/claude-opus-4-6-20260205"]).toBeDefined();
  });

  it("preserves active aicodewith entries", () => {
    const config = {
      agents: {
        defaults: {
          models: {
            "aicodewith-claude/claude-opus-4-6-20260205": { alias: "opus" },
            "aicodewith-gpt/gpt-5.3-codex": { alias: "codex" },
          }
        }
      }
    };
    const { config: result, changed } = cleanupStaleModels(config);
    expect(changed).toBe(false);
    expect((result.agents as any).defaults.models["aicodewith-claude/claude-opus-4-6-20260205"]).toBeDefined();
    expect((result.agents as any).defaults.models["aicodewith-gpt/gpt-5.3-codex"]).toBeDefined();
  });

  it("preserves non-aicodewith entries", () => {
    const config = {
      agents: {
        defaults: {
          models: {
            "other-provider/some-model": { alias: "other" },
          }
        }
      }
    };
    const { config: result, changed } = cleanupStaleModels(config);
    expect(changed).toBe(false);
    expect((result.agents as any).defaults.models["other-provider/some-model"]).toBeDefined();
  });

  it("returns changed=false when no stale entries exist", () => {
     const config = {
      agents: {
        defaults: {
          models: {
            "aicodewith-claude/claude-opus-4-6-20260205": { alias: "opus" },
          }
        }
      }
    };
    const { config: result, changed } = cleanupStaleModels(config);
    expect(changed).toBe(false);
  });

  it("handles missing agents.defaults.models gracefully", () => {
    const config = {
      agents: {
        defaults: {}
      }
    };
    const { config: result, changed } = cleanupStaleModels(config);
    expect(changed).toBe(false);
    expect(result).toBe(config);
  });

  it("handles empty config gracefully", () => {
    const config = {};
    const { config: result, changed } = cleanupStaleModels(config);
    expect(changed).toBe(false);
    expect(result).toBe(config);
  });
});
