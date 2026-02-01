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

## Environment Variable

You can also set the API key via environment variable:

```bash
export AICODEWITH_API_KEY=your-api-key
```

## License

MIT
