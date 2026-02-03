const DEFAULT_COST = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 };

export const GPT_MODELS = [
  {
    id: "gpt-5.2-codex",
    name: "GPT-5.2 Codex",
    reasoning: false,
    input: ["text", "image"] as const,
    cost: DEFAULT_COST,
    contextWindow: 400000,
    maxTokens: 128000,
  },
  {
    id: "gpt-5.2",
    name: "GPT-5.2",
    reasoning: false,
    input: ["text", "image"] as const,
    cost: DEFAULT_COST,
    contextWindow: 400000,
    maxTokens: 128000,
  },
];

export const CLAUDE_MODELS = [
  {
    id: "claude-sonnet-4-5-20250929",
    name: "Claude Sonnet 4.5",
    reasoning: false,
    input: ["text", "image"] as const,
    cost: DEFAULT_COST,
    contextWindow: 200000,
    maxTokens: 64000,
  },
  {
    id: "claude-opus-4-5-20251101",
    name: "Claude Opus 4.5",
    reasoning: false,
    input: ["text", "image"] as const,
    cost: DEFAULT_COST,
    contextWindow: 200000,
    maxTokens: 64000,
  },
];

export const GEMINI_MODELS = [
  {
    id: "gemini-3-pro",
    name: "Gemini 3 Pro",
    reasoning: false,
    input: ["text", "image"] as const,
    cost: DEFAULT_COST,
    contextWindow: 1048576,
    maxTokens: 65536,
  },
];
