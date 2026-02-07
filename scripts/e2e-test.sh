#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "=== OpenClaw AICodewith Auth Plugin E2E Test ==="
echo "Plugin directory: $PLUGIN_DIR"

TEST_HOME=$(mktemp -d "/tmp/openclaw-e2e-test.XXXXXX")
export HOME="$TEST_HOME"
echo "Test home: $TEST_HOME"

cleanup() {
  echo "Cleaning up test environment..."
  rm -rf "$TEST_HOME"
}
trap cleanup EXIT

mkdir -p "$HOME/.config/openclaw"

cat > "$HOME/.config/openclaw/config.json" << 'EOF'
{
  "agents": {
    "defaults": {
      "model": {
        "primary": "aicodewith-claude/claude-opus-4-5-20251101",
        "fallbacks": ["aicodewith-gpt/gpt-5.2-codex"]
      }
    },
    "list": [
      {
        "id": "test-agent",
        "model": {
          "primary": "aicodewith-claude/claude-sonnet-4-5-20250929-third-party"
        }
      }
    ]
  }
}
EOF

echo ""
echo "=== Step 1: Initial config with deprecated models ==="
cat "$HOME/.config/openclaw/config.json"

echo ""
echo "=== Step 2: Installing plugin from local directory ==="
npx openclaw@latest plugins install "file:$PLUGIN_DIR" 2>&1 || {
  echo "Plugin install via file: failed, trying direct path..."
  npx openclaw@latest plugins install "$PLUGIN_DIR" 2>&1 || true
}

echo ""
echo "=== Step 3: Verify plugin is loaded (this triggers migration) ==="
npx openclaw@latest plugins list --json 2>/dev/null > /tmp/plugins.json || true

node - << 'NODE'
const fs = require("node:fs");

try {
  const data = JSON.parse(fs.readFileSync("/tmp/plugins.json", "utf8"));
  const plugin = (data.plugins || []).find((entry) => 
    entry.id === "openclaw-aicodewith-auth" || 
    entry.name?.includes("AICodewith")
  );
  
  if (!plugin) {
    console.log("Available plugins:", JSON.stringify(data.plugins || [], null, 2));
    console.log("⚠ Plugin not found - may need manual verification");
  } else {
    console.log("Plugin found:", plugin.id || plugin.name);
    console.log("Status:", plugin.status);
    if (plugin.status === "loaded") {
      console.log("✓ Plugin loaded successfully");
    }
  }
} catch (err) {
  console.log("⚠ Could not parse plugins list:", err.message);
}
NODE

echo ""
echo "=== Step 4: Verify config migration ==="
echo "Config after plugin load:"
cat "$HOME/.config/openclaw/config.json"

node - << 'NODE'
const fs = require("node:fs");

const config = JSON.parse(fs.readFileSync(process.env.HOME + "/.config/openclaw/config.json", "utf8"));

console.log("\n=== Migration Verification ===");

let allPassed = true;

const defaultModel = config.agents?.defaults?.model;
if (defaultModel?.primary === "aicodewith-claude/claude-opus-4-6-20260205") {
  console.log("✓ agents.defaults.model.primary migrated correctly");
} else {
  console.log(`✗ agents.defaults.model.primary: expected aicodewith-claude/claude-opus-4-6-20260205, got ${defaultModel?.primary}`);
  allPassed = false;
}

const fallbacks = defaultModel?.fallbacks || [];
if (fallbacks.includes("aicodewith-gpt/gpt-5.3-codex")) {
  console.log("✓ agents.defaults.model.fallbacks migrated correctly");
} else {
  console.log(`✗ agents.defaults.model.fallbacks: expected to include aicodewith-gpt/gpt-5.3-codex, got ${JSON.stringify(fallbacks)}`);
  allPassed = false;
}

const testAgentModel = config.agents?.list?.find(a => a.id === "test-agent")?.model;
if (testAgentModel?.primary === "aicodewith-claude/claude-sonnet-4-5-20250929") {
  console.log("✓ agents.list[test-agent].model.primary migrated correctly");
} else {
  console.log(`✗ agents.list[test-agent].model.primary: expected aicodewith-claude/claude-sonnet-4-5-20250929, got ${testAgentModel?.primary}`);
  allPassed = false;
}

if (allPassed) {
  console.log("\n=== All migration tests passed! ===");
  process.exit(0);
} else {
  console.log("\n=== Some migration tests failed ===");
  process.exit(1);
}
NODE

echo ""
echo "=== E2E Test Complete ==="
