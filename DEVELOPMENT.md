# 开发与测试指南

本文档介绍 `openclaw-aicodewith-auth` 插件的开发流程、测试方法和关键技术细节。

## 目录

- [项目结构](#项目结构)
- [开发环境设置](#开发环境设置)
- [核心架构](#核心架构)
- [添加新模型](#添加新模型)
- [测试流程](#测试流程)
- [Docker E2E 测试](#docker-e2e-测试)
- [本地调试](#本地调试)
- [API 格式说明](#api-格式说明)
- [常见问题](#常见问题)

---

## 项目结构

```
openclaw-aicodewith-auth/
├── index.ts                    # 插件入口，注册 providers 和配置迁移
├── src/
│   ├── constants.ts            # 常量定义（API URLs, Provider IDs）
│   └── auth.ts                 # 认证方法实现
├── lib/
│   └── models/
│       ├── registry.ts         # 模型注册表（单一数据源）
│       └── index.ts            # 导出入口
├── tests/
│   └── unit/
│       ├── model-registry.test.ts    # 模型注册表单元测试
│       └── config-migration.test.ts  # 配置迁移单元测试
├── Dockerfile.test             # E2E 测试 Docker 镜像
├── package.json
└── README.md
```

---

## 开发环境设置

### 前置要求

- Node.js >= 22
- pnpm 或 npm
- OpenClaw CLI (`npm install -g openclaw`)

### 安装依赖

```bash
# 使用 pnpm（推荐）
pnpm install

# 或使用 npm
npm install
```

### 环境变量

```bash
export AICODEWITH_API_KEY=your-api-key
```

---

## 核心架构

### 模型注册表 (`lib/models/registry.ts`)

这是**单一数据源**，所有模型定义都在这里。

```typescript
export const MODELS: ModelDefinition[] = [
  {
    id: "gpt-5.3-codex",           // 模型 ID
    name: "GPT-5.3 Codex",         // 显示名称
    family: "gpt",                  // 模型家族: gpt | claude | gemini
    contextWindow: 400000,          // 上下文窗口
    maxTokens: 128000,              // 最大输出 tokens
    deprecated: false,              // 是否已弃用
    replacedBy: undefined,          // 替代模型 ID（弃用时设置）
    isDefault: false,               // 是否为默认模型
    // ... 其他字段
  },
];
```

### Provider 配置

插件注册 3 个 providers：

| Provider ID | API 格式 | Base URL |
|-------------|----------|----------|
| `aicodewith-gpt` | `openai-responses` | `https://api.aicodewith.com/chatgpt/v1` |
| `aicodewith-claude` | `anthropic-messages` | `https://api.aicodewith.com` |
| `aicodewith-gemini` | `google-generative-ai` | `https://api.aicodewith.com/gemini_cli` |

### 配置迁移

插件在 `register()` 时自动迁移用户配置中的弃用模型：

```
~/.openclaw/openclaw.json
```

迁移逻辑：
1. 读取用户配置文件
2. 查找 `agents.defaults.model` 和 `agents.list[].model` 中的弃用模型
3. 替换为 `replacedBy` 指定的新模型
4. 写回配置文件

---

## 添加新模型

### 步骤 1: 在 `registry.ts` 添加模型定义

```typescript
// lib/models/registry.ts
export const MODELS: ModelDefinition[] = [
  // ... 现有模型
  
  // 添加新模型
  {
    id: "gpt-6.0-codex",
    name: "GPT-6.0 Codex",
    family: "gpt",
    displayName: "GPT-6.0 Codex",
    version: "6.0",
    reasoning: false,
    input: ["text", "image"] as const,
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    contextWindow: 500000,
    maxTokens: 150000,
    limit: { context: 500000, output: 150000 },
    modalities: { input: ["text", "image"], output: ["text"] },
  },
];
```

### 步骤 2: 标记旧模型为弃用（如需要）

```typescript
{
  id: "gpt-5.3-codex",
  // ... 其他字段
  deprecated: true,
  replacedBy: "gpt-6.0-codex",  // 指向新模型
},
```

### 步骤 3: 运行测试验证

```bash
npm test
```

---

## 测试流程

### 单元测试

```bash
# 运行所有测试
npm test

# 监听模式
npm run test:watch
```

测试覆盖：
- `model-registry.test.ts`: 模型注册表功能
- `config-migration.test.ts`: 配置迁移逻辑

### 测试用例示例

```typescript
// tests/unit/model-registry.test.ts
describe("buildModelMigrations", () => {
  it("should create migrations for deprecated models", () => {
    const migrations = buildModelMigrations();
    
    // 验证弃用模型有迁移路径
    expect(migrations["gpt-5.2-codex"]).toBe("gpt-5.3-codex");
    expect(migrations["aicodewith-gpt/gpt-5.2-codex"]).toBe("aicodewith-gpt/gpt-5.3-codex");
  });
});
```

---

## Docker E2E 测试

### 构建测试镜像

```bash
docker build -f Dockerfile.test -t openclaw-aicodewith-test .
```

### 运行 E2E 测试

```bash
# 不带 API Key（跳过 Live API 测试）
docker run --rm openclaw-aicodewith-test

# 带 API Key（完整测试）
docker run --rm \
  -e AICODEWITH_API_KEY="your-api-key" \
  openclaw-aicodewith-test
```

### E2E 测试内容

1. **插件安装测试**: 验证 `openclaw plugins install` 成功
2. **插件加载测试**: 验证 providers 正确注册
3. **配置迁移测试**: 验证弃用模型自动迁移
4. **Live API 测试**: 验证 Claude/GPT API 调用（需要 API Key）

### 测试输出示例

```
========================================
OpenClaw AICodewith Auth Plugin E2E Tests
========================================

=== Test 1: Plugin Installation & Config Migration ===
✓ Plugin installed successfully

=== Test 2: Plugin Loading ===
✓ Plugin loaded: openclaw-aicodewith-auth v0.3.0
✓ All providers registered: aicodewith-gpt, aicodewith-claude, aicodewith-gemini

=== Test 3: Config Migration ===
✓ defaults.model.primary migrated to claude-opus-4-6-20260205
✓ defaults.model.fallbacks migrated to gpt-5.3-codex
✓ test-agent.model.primary migrated (removed -third-party suffix)

=== Test 4: Live API Tests ===
Testing Claude API...
✓ Claude API call successful: Hello
Testing GPT API...
✓ GPT API call successful: Hello

========================================
=== E2E Tests Complete ===
========================================
```

---

## 本地调试

### 方法 1: 本地安装插件

```bash
# 在插件目录
cd /path/to/openclaw-aicodewith-auth

# 安装到 OpenClaw
openclaw plugins install file:.

# 验证安装
openclaw plugins list
```

### 方法 2: 直接测试 API

```bash
# 测试 Claude API
curl -X POST https://api.aicodewith.com/v1/messages \
  -H "Content-Type: application/json" \
  -H "x-api-key: $AICODEWITH_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -d '{
    "model": "claude-opus-4-6-20260205",
    "max_tokens": 100,
    "messages": [{"role": "user", "content": "Say hello"}]
  }'

# 测试 GPT API（注意：使用 /responses 端点）
curl -X POST https://api.aicodewith.com/chatgpt/v1/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AICODEWITH_API_KEY" \
  -d '{
    "model": "gpt-5.3-codex",
    "input": "Say hello"
  }'
```

### 方法 3: 使用 OpenClaw CLI

```bash
# 设置模型
openclaw config set agents.defaults.model.primary aicodewith-claude/claude-opus-4-6-20260205

# 测试调用
openclaw agent --local --message "Hello"
```

---

## API 格式说明

### GPT API（重要）

AICodewith GPT 使用 **OpenAI Responses API** 格式，**不是** Chat Completions：

| 属性 | Responses API | Chat Completions API |
|------|---------------|---------------------|
| 端点 | `/responses` | `/chat/completions` |
| 请求字段 | `input` | `messages` |
| OpenClaw API 类型 | `openai-responses` | `openai-completions` |

```typescript
// 正确配置
{
  api: "openai-responses",  // ✓
  baseUrl: "https://api.aicodewith.com/chatgpt/v1",
}

// 错误配置
{
  api: "openai-completions",  // ✗ 会导致 API 调用失败
}
```

### Claude API

标准 Anthropic Messages API：

```typescript
{
  api: "anthropic-messages",
  baseUrl: "https://api.aicodewith.com",
}
```

### Gemini API

Google Generative AI 格式：

```typescript
{
  api: "google-generative-ai",
  baseUrl: "https://api.aicodewith.com/gemini_cli",
}
```

---

## 常见问题

### Q: 配置迁移没有生效？

**A**: 检查以下几点：
1. 配置文件路径是 `~/.openclaw/openclaw.json`（不是 `~/.config/openclaw/`）
2. 插件已正确安装并加载
3. 查看控制台是否有迁移日志：`[openclaw-aicodewith-auth] Migrating...`

### Q: GPT API 调用失败？

**A**: 确认以下配置：
1. API 类型必须是 `openai-responses`（不是 `openai-completions`）
2. 不要添加 codex headers（`originator`, `user-agent`），会导致错误

### Q: 如何查看已注册的 providers？

```bash
openclaw models list | grep aicodewith
```

### Q: 如何重置配置？

```bash
rm ~/.openclaw/openclaw.json
openclaw plugins disable openclaw-aicodewith-auth
openclaw plugins enable openclaw-aicodewith-auth
```

### Q: Docker 测试中 JSON 解析失败？

**A**: 这是 OpenClaw CLI 的已知问题，CLI 输出中混入了日志信息。不影响插件功能。

---

## 发布流程

### 1. 更新版本号

```bash
npm version patch  # 或 minor / major
```

### 2. 运行测试

```bash
npm test
docker build -f Dockerfile.test -t openclaw-aicodewith-test . && \
docker run --rm -e AICODEWITH_API_KEY="$AICODEWITH_API_KEY" openclaw-aicodewith-test
```

### 3. 发布到 npm

```bash
npm publish
```

---

## 相关链接

- [OpenClaw 官方文档](https://github.com/openclaw/openclaw)
- [OpenClaw 插件开发指南](https://github.com/openclaw/openclaw/blob/main/docs/plugins.md)
- [AICodewith API 文档](https://api.aicodewith.com/docs)
