// Base URLs - can be overridden via environment variables for local testing
export const AICODEWITH_GPT_BASE_URL =
  process.env.AICODEWITH_GPT_BASE_URL?.trim() || "https://api.aicodewith.com/chatgpt/v1";
export const AICODEWITH_CLAUDE_BASE_URL =
  process.env.AICODEWITH_CLAUDE_BASE_URL?.trim() || "https://api.aicodewith.com/v1";
export const AICODEWITH_GEMINI_BASE_URL =
  process.env.AICODEWITH_GEMINI_BASE_URL?.trim() || "https://api.aicodewith.com/gemini_cli";

// API type for GPT - "openai-responses" (default) or "openai-completions"
export const AICODEWITH_GPT_API =
  (process.env.AICODEWITH_GPT_API?.trim() as "openai-responses" | "openai-completions") ||
  "openai-responses";

export const PROVIDER_ID_GPT = "aicodewith-gpt";
export const PROVIDER_ID_CLAUDE = "aicodewith-claude";
export const PROVIDER_ID_GEMINI = "aicodewith-gemini";

export const AICODEWITH_API_KEY_ENV = "AICODEWITH_API_KEY";

export const AUTH_PROFILE_ID = "aicodewith:default";

export const PLUGIN_ID = "openclaw-aicodewith-auth";
export const PLUGIN_NAME = "AICodewith";
export const PLUGIN_DESCRIPTION =
  "Access GPT, Claude, and Gemini models via AICodewith API";
