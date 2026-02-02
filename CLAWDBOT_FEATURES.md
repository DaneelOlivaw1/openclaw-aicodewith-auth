# OpenClaw 功能介绍（内部文档）

## 一、产品定位

OpenClaw 是一个**个人 AI 助手**，运行在你自己的设备上，可以通过你日常使用的聊天软件与你对话。

**核心价值：**
- 本地运行，数据自主
- 多平台统一入口
- 支持多种 AI 模型
- 可扩展插件系统

---

## 二、支持的聊天平台（15+）

### 核心平台（内置）

| 平台 | 说明 |
|------|------|
| WhatsApp | 通过 Web 扫码登录，最常用 |
| Telegram | Bot API，配置最简单 |
| Discord | 支持服务器/频道/私聊 |
| Slack | 工作区应用 |
| Google Chat | HTTP Webhook |
| Signal | 隐私优先，需要 signal-cli |
| iMessage | 仅 macOS |

### 扩展平台（插件）

| 平台 | 说明 |
|------|------|
| Microsoft Teams | 企业级 |
| Matrix | 开源协议 |
| LINE | 日本/台湾常用 |
| Mattermost | 自托管 |
| Nextcloud Talk | 自托管 |
| BlueBubbles | iMessage 增强版 |
| Nostr | 去中心化 |
| Zalo | 越南常用 |
| Twitch | 直播聊天 |
| WebChat | 网页版 |

---

## 三、支持的 AI 模型

### OAuth 登录（订阅账号）

| 提供商 | 模型 |
|--------|------|
| Anthropic | Claude Pro/Max (Opus 4.5, Sonnet 4.5) |
| OpenAI | ChatGPT/Codex (GPT-5.2) |
| GitHub Copilot | Copilot 模型 |
| Google | Gemini |

### API Key（按量付费）

| 提供商 | 说明 |
|--------|------|
| OpenRouter | 多模型聚合 |
| Amazon Bedrock | AWS 托管 |
| MiniMax | 国产模型 |
| Moonshot | Kimi |
| 本地模型 | node-llama-cpp |

### AICodewith（通过插件）

| 模型 | 说明 |
|------|------|
| GPT-5.2 Codex | 400K 上下文 |
| GPT-5.2 | 400K 上下文 |
| Claude Opus 4.5 | 200K 上下文 |
| Claude Sonnet 4.5 | 200K 上下文 |
| Gemini 3 Pro | 1M 上下文 |

---

## 四、Agent 能力

### 内置工具（20+）

| 工具 | 功能 |
|------|------|
| exec | 执行 Shell 命令 |
| read/write/edit | 文件读写编辑 |
| web_search | 网页搜索（Brave） |
| web_fetch | 抓取网页内容 |
| browser | 浏览器自动化 |
| image | 图片分析 |
| message | 跨平台发消息 |
| cron | 定时任务 |
| memory | 记忆搜索 |
| tts | 文字转语音 |

### 浏览器控制

- 打开/关闭标签页
- 截图/快照
- 点击/输入/滚动
- 上传/下载文件
- Cookie/Storage 管理
- 多配置文件

### 节点控制（Node）

- 摄像头拍照/录像
- 屏幕录制
- 获取位置
- 发送通知
- Canvas 画布

---

## 五、自动化功能

### 定时任务（Cron）

```bash
openclaw cron add --name "日报" --schedule "0 9 * * *" --message "生成今日工作日报"
```

### Webhook

- Gmail 邮件触发
- 自定义 Webhook

### Skills（技能）

- 内置技能
- 托管技能
- 工作区技能
- 可自定义

### Hooks（钩子）

- 消息前/后处理
- 媒体转录
- 自定义脚本

---

## 六、安全特性

### DM 访问控制

| 模式 | 说明 |
|------|------|
| pairing（默认） | 陌生人需要配对码 |
| allowlist | 白名单模式 |
| open | 公开访问（需手动开启） |

### 沙箱隔离

- Docker 容器隔离
- 工具权限控制
- 执行审批机制

### 安全审计

```bash
openclaw security audit
openclaw doctor
```

---

## 七、客户端应用

### macOS 应用

- 菜单栏控制
- Voice Wake 语音唤醒
- Talk Mode 对话模式
- WebChat 网页聊天
- Canvas 画布

### iOS 应用

- 节点配对
- 语音唤醒
- 对话模式
- 摄像头/屏幕捕获

### Android 应用

- 节点配对
- 对话模式
- 摄像头/屏幕捕获
- 可选 SMS

---

## 八、部署方式

### 安装方式

| 方式 | 命令 |
|------|------|
| npm | `npm i -g openclaw` |
| pnpm | `pnpm add -g openclaw` |
| Docker | 容器部署 |
| Nix | 声明式配置 |
| 源码 | 开发模式 |

### 运行要求

- Node.js ≥ 22
- 可选：Docker（沙箱）
- 可选：Tailscale（远程访问）

---

## 九、CLI 命令概览

### 核心命令

| 命令 | 功能 |
|------|------|
| `openclaw onboard` | 引导设置 |
| `openclaw gateway run` | 启动网关 |
| `openclaw agent --message "xxx"` | 发送消息 |
| `openclaw status` | 查看状态 |
| `openclaw doctor` | 诊断修复 |

### 频道管理

| 命令 | 功能 |
|------|------|
| `openclaw channels list` | 列出频道 |
| `openclaw channels status` | 频道状态 |
| `openclaw channels login` | 登录频道 |

### 模型管理

| 命令 | 功能 |
|------|------|
| `openclaw models list` | 列出模型 |
| `openclaw models auth login` | 模型认证 |
| `openclaw models set` | 设置默认模型 |

### 插件管理

| 命令 | 功能 |
|------|------|
| `openclaw plugins list` | 列出插件 |
| `openclaw plugins install` | 安装插件 |
| `openclaw plugins enable` | 启用插件 |

### 消息发送

| 命令 | 功能 |
|------|------|
| `openclaw message send` | 发送消息 |
| `openclaw message broadcast` | 广播消息 |

### 浏览器控制

| 命令 | 功能 |
|------|------|
| `openclaw browser start` | 启动浏览器 |
| `openclaw browser screenshot` | 截图 |
| `openclaw browser navigate` | 导航 |

---

## 十、插件生态（28+）

### 频道插件

bluebubbles, discord, googlechat, imessage, line, matrix, mattermost, msteams, nextcloud-talk, nostr, signal, slack, telegram, tlon, twitch, whatsapp, zalo, zalouser

### 模型插件

copilot-proxy, google-antigravity-auth, google-gemini-cli-auth, qwen-portal-auth, openclaw-aicodewith-auth

### 功能插件

llm-task, lobster, memory-core, memory-lancedb, open-prose, voice-call, diagnostics-otel

---

## 十一、核心优势总结

1. **多平台统一** - 15+ 聊天平台一个入口
2. **多模型支持** - Claude/GPT/Gemini 等主流模型
3. **本地运行** - 数据自主，隐私安全
4. **强大工具** - 浏览器、文件、命令行全控制
5. **自动化** - 定时任务、Webhook、技能系统
6. **可扩展** - 插件系统，自定义能力
7. **跨设备** - macOS/iOS/Android 客户端
8. **安全** - 配对机制、沙箱隔离、权限控制

---

## 相关链接

- 官网：https://openclaw.ai
- 文档：https://docs.openclaw.ai
- GitHub：https://github.com/openclaw/openclaw
- Discord：https://discord.gg/openclaw
