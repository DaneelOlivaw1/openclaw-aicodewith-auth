import { describe, it, expect } from "vitest";
import { buildAuthResult, findExistingApiKey, maskKey } from "../../src/auth.js";
import { PROVIDER_ID_CLAUDE, PROVIDER_ID_GPT, PROVIDER_ID_GEMINI } from "../../src/constants.js";

describe("maskKey", () => {
  it("masks middle of key", () => {
    expect(maskKey("sk-acw-00e6bfda-0f3baebf5157b5ca")).toBe("sk-acw****b5ca");
  });
  it("returns **** for short keys", () => {
    expect(maskKey("short")).toBe("****");
  });
});

describe("findExistingApiKey", () => {
  it("finds key from claude provider", () => {
    const config = {
      models: {
        providers: {
          [PROVIDER_ID_CLAUDE]: { apiKey: "sk-claude-key-123" }
        }
      }
    };
    expect(findExistingApiKey(config)).toBe("sk-claude-key-123");
  });
  it("finds key from gpt provider", () => {
     const config = {
      models: {
        providers: {
          [PROVIDER_ID_GPT]: { apiKey: "sk-gpt-key-123" }
        }
      }
    };
    expect(findExistingApiKey(config)).toBe("sk-gpt-key-123");
  });
  it("returns undefined when no providers configured", () => {
    const config = {
      models: {}
    };
    expect(findExistingApiKey(config)).toBeUndefined();
  });
  it("returns undefined when key is too short", () => {
     const config = {
      models: {
        providers: {
          [PROVIDER_ID_CLAUDE]: { apiKey: "short" }
        }
      }
    };
    expect(findExistingApiKey(config)).toBeUndefined();
  });
});

describe("buildAuthResult", () => {
  it("returns configPatch with all 3 providers", () => {
    const result = buildAuthResult("test-api-key");
    const providers = result.configPatch.models.providers;
    expect(providers[PROVIDER_ID_GPT]).toBeDefined();
    expect(providers[PROVIDER_ID_CLAUDE]).toBeDefined();
    expect(providers[PROVIDER_ID_GEMINI]).toBeDefined();
  });

  it("sets default model to claude opus 4.6", () => {
    const result = buildAuthResult("test-api-key");
    expect(result.defaultModel).toContain("claude-opus-4-6");
  });

  it("agents.defaults.models only contains active model IDs", () => {
    const result = buildAuthResult("test-api-key");
    const modelKeys = Object.keys(result.configPatch.agents.defaults.models);
    const activeKeys = modelKeys.filter(k => !k.includes("deprecated"));
    expect(activeKeys.length).toBeGreaterThan(0);
  });

  it("does not include deprecated model IDs", () => {
    const result = buildAuthResult("test-api-key");
    const modelKeys = Object.keys(result.configPatch.agents.defaults.models);
    const deprecatedKeys = modelKeys.filter(k => k.includes("deprecated"));
    expect(deprecatedKeys).toHaveLength(0);
  });

  it("includes apiKey in all provider configs", () => {
    const apiKey = "test-api-key-12345";
    const result = buildAuthResult(apiKey);
    const providers = result.configPatch.models.providers;
    expect(providers[PROVIDER_ID_GPT].apiKey).toBe(apiKey);
    expect(providers[PROVIDER_ID_CLAUDE].apiKey).toBe(apiKey);
    expect(providers[PROVIDER_ID_GEMINI].apiKey).toBe(apiKey);
  });
});
