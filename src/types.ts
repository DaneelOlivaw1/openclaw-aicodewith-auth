
export type ModelFamily = "gpt" | "claude" | "gemini";

/**
 * OpenClaw SDK Model Interface
 */
export interface OpenClawModel {
  id: string;
  name: string;
  reasoning: boolean;
  input: readonly ("text" | "image")[];
  cost: { input: number; output: number; cacheRead: number; cacheWrite: number };
  contextWindow: number;
  maxTokens: number;
}

/**
 * Extended Model Definition with Registry Metadata
 */
export interface ModelDefinition {
  // OpenClaw SDK fields
  id: string;
  name: string;
  reasoning: boolean;
  input: readonly ("text" | "image")[];
  cost: { input: number; output: number; cacheRead: number; cacheWrite: number };
  contextWindow: number;
  maxTokens: number;

  // Registry metadata
  family: ModelFamily;
  displayName: string;
  version: string;
  limit: {
    context: number;
    output: number;
  };
  modalities: {
    input: ("text" | "image")[];
    output: ("text")[];
  };
  deprecated?: boolean;
  replacedBy?: string;
  isDefault?: boolean;
}

export type SelectOption<T> = { value: T; label: string; hint?: string };

export type AuthContext = {
  config: Record<string, unknown>;
  prompter: {
    text: (opts: {
      message: string;
      placeholder?: string;
      validate?: (value: string) => string | undefined;
    }) => Promise<string>;
    select: <T>(opts: {
      message: string;
      options: SelectOption<T>[];
    }) => Promise<T>;
  };
};

export type AuthMethod = {
  id: string;
  label: string;
  hint: string;
  kind: "api_key";
  run: (ctx: AuthContext) => Promise<unknown>;
};

export type PluginRuntime = {
  config: {
    loadConfig: () => Record<string, unknown>;
    writeConfigFile: (config: Record<string, unknown>) => Promise<void>;
  };
};

export type PluginApi = {
  id: string;
  runtime: PluginRuntime;
  registerProvider: (provider: {
    id: string;
    label: string;
    envVars?: string[];
    models?: {
      baseUrl: string;
      api: string;
      models: Array<OpenClawModel>;
    };
    auth: Array<AuthMethod>;
  }) => void;
  on: (
    hookName: string,
    handler: (event: { port: number }, ctx: { port?: number }) => Promise<void> | void,
    opts?: { priority?: number }
  ) => void;
};
