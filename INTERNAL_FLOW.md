# OpenClaw + AICodewith 插件安装流程（内部文档）

## 前置条件

- 已安装 Node.js（建议 18+）
- 已有 AICodewith API Key
- （可选）Telegram Bot Token（从 @BotFather 获取）

---

## 一、基础安装

### 第一步：安装 OpenClaw

```bash
npm i -g openclaw
```

验证：
```bash
openclaw --version
```

### 第二步：安装插件

```bash
openclaw plugins install openclaw-aicodewith-auth
```

### 第三步：启用插件

```bash
openclaw plugins enable openclaw-aicodewith-auth
```

### 第四步：配置 API Key

```bash
openclaw models auth login --provider aicodewith-claude --set-default
```

执行后会提示输入 API Key，粘贴即可。

### 第五步：测试

```bash
openclaw agent --message "你好"
```

---

## 二、Telegram 集成

### 第一步：获取 Telegram Bot Token

1. 在 Telegram 中搜索 @BotFather
2. 发送 `/newbot`
3. 按提示设置 bot 名称
4. 获得 Bot Token（格式：`123456789:ABCdefGHIjklMNOpqrsTUVwxyz`）

### 第二步：启用 Telegram 插件

```bash
openclaw plugins enable telegram
```

### 第三步：配置 Bot Token

```bash
openclaw config set channels.telegram.botToken "你的Bot_Token"
```

### 第四步：启动 Gateway

```bash
openclaw gateway run
```

### 第五步：测试

在 Telegram 中找到你的 bot，发送任意消息，bot 会使用 AICodewith 的模型回复。

---

## 三、主动发送消息

如果想让 bot 主动给用户发消息：

```bash
openclaw message send --channel telegram --to 用户Telegram_ID --text "你好"
```

获取 Telegram ID：在 Telegram 中搜索 @userinfobot，发送任意消息即可获得你的 ID。

---

## 六、常用命令汇总

| 命令 | 说明 |
|------|------|
| `openclaw plugins list` | 查看已安装插件 |
| `openclaw plugins enable <插件名>` | 启用插件 |
| `openclaw models list` | 查看可用模型 |
| `openclaw gateway run` | 启动 Gateway |
| `openclaw gateway stop` | 停止 Gateway |
| `openclaw agent --message "xxx"` | 发送消息测试 |

---

## 相关链接

- npm 包：https://www.npmjs.com/package/openclaw-aicodewith-auth
- GitHub：https://github.com/DaneelOlivaw1/openclaw-aicodewith-auth
