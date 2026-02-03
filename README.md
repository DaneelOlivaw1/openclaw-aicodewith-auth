# openclaw-aicodewith-auth

AICodewith provider plugin for [OpenClaw](https://github.com/openclaw/openclaw).

Access GPT, Claude, and Gemini models through AICodewith API.

## Installation

```bash
openclaw plugins install openclaw-aicodewith-auth
```

Or install via npm:

```bash
npm install openclaw-aicodewith-auth
```

Then enable the plugin:

```bash
openclaw plugins enable openclaw-aicodewith-auth
```

## Authentication

After installing the plugin, authenticate with your AICodewith API key:

```bash
openclaw models auth login --provider aicodewith-claude --set-default
```

You will be prompted to enter your AICodewith API key.

## Supported Models

| Provider | Model ID | Description |
|----------|----------|-------------|
| GPT | `aicodewith-gpt/gpt-5.2-codex` | GPT-5.2 Codex (400K context) |
| GPT | `aicodewith-gpt/gpt-5.2` | GPT-5.2 (400K context) |
| Claude | `aicodewith-claude/claude-sonnet-4-5-20250929` | Claude Sonnet 4.5 (200K context) |
| Claude | `aicodewith-claude/claude-opus-4-5-20251101` | Claude Opus 4.5 (200K context) |
| Gemini | `aicodewith-gemini/gemini-3-pro` | Gemini 3 Pro (1M context) |

## Usage

```bash
# Use Claude Opus 4.5 (default after auth)
openclaw agent --message "Hello"

# Use a specific model
openclaw agent --model aicodewith-gpt/gpt-5.2-codex --message "Hello"

# List available models
openclaw models list | grep aicodewith
```

## Environment Variables

You can set the API key via environment variable:

```bash
export AICODEWITH_API_KEY=your-api-key
```

### Local Testing / Development

Override base URLs and API type for local testing:

```bash
# Override GPT base URL (e.g., local proxy)
export AICODEWITH_GPT_BASE_URL=http://localhost:3000/v1

# Override Claude base URL
export AICODEWITH_CLAUDE_BASE_URL=http://localhost:3000/v1

# Override Gemini base URL
export AICODEWITH_GEMINI_BASE_URL=http://localhost:3000/gemini_cli

# Switch GPT API type: "openai-responses" (default) or "openai-completions"
export AICODEWITH_GPT_API=openai-responses
```

### Local Plugin Development

Link the plugin for live editing:

```bash
# From openclaw repo root
openclaw plugins install --link ../openclaw-aicodewith-auth

# Enable the plugin
openclaw plugins enable openclaw-aicodewith-auth

# Restart gateway to pick up changes
openclaw gateway restart
```

## License

MIT
