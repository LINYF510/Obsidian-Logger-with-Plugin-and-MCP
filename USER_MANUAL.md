# Obsidian Logger 用户手册

欢迎使用 Obsidian Logger！本手册将帮助你快速上手并充分利用本工具的强大功能。

---

## 📋 目录

- [简介](#简介)
- [安装指南](#安装指南)
- [快速开始](#快速开始)
- [功能详解](#功能详解)
- [配置选项](#配置选项)
- [使用技巧](#使用技巧)
- [故障排查](#故障排查)
- [常见问题](#常见问题)

---

## 简介

### 什么是 Obsidian Logger？

Obsidian Logger 是一个为 Obsidian 插件开发者设计的完整调试解决方案，提供：

- 🎯 **全局日志收集**：自动捕获所有插件的 console 输出
- 🔥 **智能自动重载**：开发时自动检测并重载插件
- 🤖 **AI 智能分析**：通过 Cursor AI 自动分析和修复错误
- ⚡ **极致效率**：将开发效率提升 5-10 倍

### 适用人群

- Obsidian 插件开发者
- 需要调试 Obsidian 插件的用户
- 使用 Cursor AI 进行开发的开发者

---

## 安装指南

> **安装顺序很重要**：必须先安装 Obsidian 插件（生成日志），再安装 MCP Server（读取日志）

---

### 第一步：安装 Obsidian 插件

#### 方式 A：从 Release 安装（推荐）

1. **下载插件**
   - 访问 [Releases 页面](https://github.com/LINYF510/Obsidian-Logger-with-Plugin-and-MCP/releases)
   - 下载最新版本的 `obsidian-logger.zip`

2. **解压到插件目录**
   - **Windows**: `%APPDATA%\Obsidian\YourVault\.obsidian\plugins\obsidian-logger\`
   - **macOS**: `~/Library/Application Support/obsidian/YourVault/.obsidian/plugins/obsidian-logger/`
   - **Linux**: `~/.config/obsidian/YourVault/.obsidian/plugins/obsidian-logger/`

3. **启用插件**
   - 打开 Obsidian
   - 进入 **设置 → 第三方插件**
   - 关闭 **安全模式**（如果已开启）
   - 找到 **Obsidian Logger** 并启用

4. **验证安装**
   - 按 `Ctrl+Shift+I`（macOS: `Cmd+Option+I`）打开控制台
   - 应该看到启动日志：
     ```
     🚀 Obsidian Logger 启动中...
     ✅ Obsidian Logger 已启动
     📝 日志模块：已启动
     🤖 Auto-Reload 模块：已启动（smart 模式）
     ```
   - 检查日志文件是否创建：`vault目录/../obsidian-logger/obsidian-debug.log`

#### 方式 B：手动构建（开发者）

```bash
# 1. 克隆仓库
git clone https://github.com/LINYF510/Obsidian-Logger-with-Plugin-and-MCP.git
cd Obsidian-Logger-with-Plugin-and-MCP/global-logger

# 2. 安装依赖并构建
npm install
npm run build

# 3. 链接到 Obsidian
# Windows（需要管理员权限）
mklink /D "%APPDATA%\Obsidian\YourVault\.obsidian\plugins\obsidian-logger" "%CD%"

# macOS/Linux
ln -s "$(pwd)" "/path/to/vault/.obsidian/plugins/obsidian-logger"

# 或使用脚本
cd ../scripts
.\link-plugin.bat "C:\path\to\your\vault"  # Windows
./link-plugin.sh /path/to/your/vault       # macOS/Linux

# 4. 在 Obsidian 中启用插件（同上）
```

✅ **插件安装完成！** 现在可以开始使用基础的日志收集和 Auto-Reload 功能了。

---

### 第二步：安装 MCP Server（可选）

> **说明**：MCP Server 提供 AI 智能分析功能。如果只需要基础日志收集，可以跳过此步骤。

> **前提条件**：确保第一步已完成，插件正在运行并生成日志。

#### 方式 A：使用 uvx（推荐 - 适合普通用户）

**1. 安装 uv**

```bash
# Windows (PowerShell)
irm https://astral.sh/uv/install.ps1 | iex

# macOS / Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# 或使用 pip
pip install uv
```

**2. 创建配置文件**

```bash
# 下载配置向导
curl -O https://raw.githubusercontent.com/LINYF510/Obsidian-Logger-with-Plugin-and-MCP/main/mcp-server/create-config.py

# 运行向导
python create-config.py
```

向导会自动：
- ✅ 检测系统中的 Obsidian Vault
- ✅ 检测插件日志配置
- ✅ 验证日志文件存在
- ✅ 生成配置文件到 `~/.obsidian-logger/config.json`

**3. 配置 Cursor MCP**

编辑 Cursor 配置文件：

- **Windows**: `%APPDATA%\Cursor\User\settings.json`
- **macOS**: `~/Library/Application Support/Cursor/User/settings.json`
- **Linux**: `~/.config/Cursor/User/settings.json`

添加以下配置：

```json
{
  "mcpServers": {
    "obsidian-logger": {
      "command": "uvx",
      "args": [
        "--from",
        "git+https://github.com/LINYF510/Obsidian-Logger-with-Plugin-and-MCP",
        "obsidian-logger-mcp",
        "/absolute/path/to/config.json"
      ],
      "description": "Obsidian 日志收集和 Auto-Reload 服务",
      "transport": "stdio"
    }
  }
}
```

**4. 重启 Cursor 并测试**

```
@obsidian-logger read_logs
```

应该能看到插件生成的日志内容。

#### 方式 B：本地开发模式（开发者）

如果你已经克隆了仓库并完成第一步：

```bash
# 1. 进入 MCP Server 目录
cd mcp-server

# 2. 安装依赖
pip install -r requirements.txt

# 3. 创建配置
python create-config.py
```

**配置 Cursor（本地模式）**：

```json
{
  "mcpServers": {
    "obsidian-logger": {
      "command": "python",
      "args": [
        "/absolute/path/to/mcp-server/src/mcp_obsidian_logger.py",
        "/absolute/path/to/config.json"
      ],
      "transport": "stdio"
    }
  }
}
```

**测试**：重启 Cursor 后使用 `@obsidian-logger read_logs` 验证。

✅ **MCP Server 安装完成！** 现在可以使用 AI 智能分析功能了

---

## 快速开始

### 第一步：启用插件

1. 打开 Obsidian
2. 进入 **设置 → 第三方插件**
3. 关闭 **安全模式**（如果已开启）
4. 找到 **Obsidian Logger** 并启用

### 第二步：验证安装

在 Obsidian 控制台（Ctrl+Shift+I）查看启动日志：

```
🚀 Obsidian Logger 启动中...
✅ Obsidian Logger 已启动
📝 日志模块：已启动
🤖 Auto-Reload 模块：已启动（smart 模式）
```

### 第三步：使用 MCP 工具

在 Cursor 中输入：

```
@obsidian-logger read_logs 查看最近50条日志
```

你应该能看到日志输出，包括刚才的启动日志。

---

## 功能详解

### 1. 全局日志收集

#### 工作原理

Obsidian Logger 会自动拦截所有 `console.log/error/warn/debug` 输出，收集到统一的日志文件中。

#### 日志格式

```
[14:30:45.123] [LOG] Plugin loaded: my-plugin
[14:30:45.456] [ERROR] Failed to load file: test.md
[14:30:45.789] [WARN] Deprecated API usage
```

格式：`[时间戳] [级别] 消息内容`

#### 日志文件位置

默认：`vault目录/../obsidian-logger/obsidian-debug.log`

例如：
- Vault：`C:\Users\YourName\Documents\MyVault`
- 日志：`C:\Users\YourName\Documents\obsidian-logger\obsidian-debug.log`

#### 查看日志

**方式1：使用 MCP 工具（推荐）**

```
@obsidian-logger read_logs          # 最近50条
@obsidian-logger read_logs 100      # 最近100条
```

**方式2：直接打开文件**

使用任何文本编辑器打开日志文件。

**方式3：使用命令**

- **显示日志路径**：命令面板 → "显示日志文件路径"
- **清空日志**：命令面板 → "清空全局日志"

---

### 2. Auto-Reload 自动重载

#### 三种监控模式

##### 🤖 自动模式（Auto）

监控**所有已启用的插件**。

- **适用场景**：开发多个插件
- **优点**：无需配置
- **缺点**：监控插件较多时性能开销稍大

##### 🧠 智能模式（Smart）✨推荐

使用评分算法自动识别**开发中的插件**。

**识别算法**：
- Source Map 存在：+5分
- 24小时内修改：+3分
- 文件大小 < 50KB：+2分
- **阈值：≥ 5分** 视为开发插件

- **适用场景**：日常开发（最常用）
- **优点**：自动识别，性能最优
- **缺点**：需要符合评分条件

##### ✋ 手动模式（Manual）

手动选择要监控的插件列表。

- **适用场景**：只开发特定插件
- **优点**：完全可控
- **缺点**：需要手动管理列表

#### 切换模式

**方式1：设置界面**

设置 → Obsidian Logger → Auto-Reload 模块 → 选择模式

**方式2：命令面板**

- "切换到智能监控模式"
- "切换到自动监控模式"
- "切换到手动监控模式"

**方式3：MCP 工具**

```
@obsidian-logger set_auto_reload_mode smart
@obsidian-logger set_auto_reload_mode auto
@obsidian-logger set_auto_reload_mode manual
```

#### 监控的文件类型

默认监控：
- `main.js` - 插件主文件
- `manifest.json` - 插件配置
- `styles.css` - 样式文件（如果存在）

可在设置中添加自定义文件（支持通配符）：
- `data.json`
- `*.js`
- `views/**/*.ts`（编译后需要）

#### 重载流程

```
1. 检测到文件变化
   ↓
2. 防抖等待 750ms（避免频繁重载）
   ↓
3. 记录重载日志
   ↓
4. 禁用插件
   ↓
5. 等待 100ms
   ↓
6. 启用插件
   ↓
7. 显示通知（可选）
```

#### 查看重载统计

```
@obsidian-logger get_reload_statistics
```

输出示例：
```
📊 Auto-Reload 统计信息

监控插件数量: 2
  - my-plugin
  - test-plugin

my-plugin:
  重载次数: 15 次
  成功次数: 15 次
  失败次数: 0 次
  成功率: 100%
  最后重载: 2025-11-04 14:30:45
```

---

### 3. MCP 工具集

#### 日志工具（6个）

| 工具 | 说明 | 示例 |
|------|------|------|
| `read_logs` | 读取最近日志 | `@obsidian-logger read_logs 100` |
| `get_log_summary` | 获取统计摘要 | `@obsidian-logger get_log_summary` |
| `get_recent_errors` | 获取最近错误 | `@obsidian-logger get_recent_errors 20` |
| `analyze_errors` | 深度错误分析 | `@obsidian-logger analyze_errors` |
| `get_log_file_path` | 获取日志路径 | `@obsidian-logger get_log_file_path` |
| `clear_logs` | 清空日志 | `@obsidian-logger clear_logs` |

#### Auto-Reload 工具（6个）

| 工具 | 说明 | 示例 |
|------|------|------|
| `get_auto_reload_status` | 获取状态和列表 | `@obsidian-logger get_auto_reload_status` |
| `get_auto_reload_mode` | 获取当前模式 | `@obsidian-logger get_auto_reload_mode` |
| `set_auto_reload_mode` | 切换模式 | `@obsidian-logger set_auto_reload_mode smart` |
| `manage_watched_plugins` | 管理监控列表 | `@obsidian-logger manage_watched_plugins action="get"` |
| `trigger_plugin_reload` | 手动触发重载 | `@obsidian-logger trigger_plugin_reload my-plugin` |
| `get_reload_statistics` | 获取重载统计 | `@obsidian-logger get_reload_statistics` |

详细 API 文档：[MCP-Tools-API.md](./docs/api/MCP-Tools-API.md)

---

## 配置选项

### 插件设置界面

设置 → Obsidian Logger

#### 日志模块设置

| 选项 | 默认值 | 说明 |
|------|--------|------|
| 缓冲区大小 | 100 | 触发写入的日志条数 |
| 刷新间隔 | 500ms | 定时刷新间隔 |
| 日志文件路径 | `../obsidian-logger/obsidian-debug.log` | 相对 vault 的路径 |
| 启用日志轮转 | ✅ | 文件超过 10MB 自动轮转 |
| 最大文件大小 | 10MB | 轮转阈值 |
| 启用自动清理 | ✅ | 自动删除旧日志 |
| 保留天数 | 30 | 日志保留期限 |

#### Auto-Reload 模块设置

| 选项 | 默认值 | 说明 |
|------|--------|------|
| 监控模式 | 智能 | auto/smart/manual |
| 检查间隔 | 1000ms | 文件检查频率 |
| 显示重载通知 | ✅ | 重载时显示通知 |
| 显示启动通知 | ✅ | 启动时显示通知 |
| 智能模式阈值 | 24小时 | 修改时间判断阈值 |

#### 文件监控配置

**全局文件类型**：应用于所有监控插件
- main.js ✅
- manifest.json ✅
- styles.css ✅
- 自定义文件：`data.json`, `*.config.js`

**插件特定配置**：覆盖全局设置
- 为特定插件配置不同的监控文件

#### MCP 功能设置

| 选项 | 默认值 | 说明 |
|------|--------|------|
| 启用 MCP 功能 | ✅ | 总开关 |
| 自动刷新设置 | ✅ | 配置变更自动同步 |
| 刷新间隔 | 2000ms | 配置检查频率 |

### 配置文件

配置保存在：`vault/.obsidian/plugins/obsidian-logger/data.json`

示例：
```json
{
  "logger": {
    "bufferSize": 100,
    "flushInterval": 500,
    "logFilePath": "../obsidian-logger/obsidian-debug.log",
    "enableRotation": true,
    "maxFileSize": 10
  },
  "autoReload": {
    "mode": "smart",
    "watchedPlugins": [],
    "checkInterval": 1000,
    "showNotification": true
  },
  "mcp": {
    "enabled": true,
    "autoRefreshSettings": true
  }
}
```

---

## 使用技巧

### 1. 典型开发工作流

```
1. 修改插件代码 → 保存
2. Auto-Reload 自动检测并重载（~1秒）
3. 测试功能
4. 查看日志：@obsidian-logger read_logs
5. 如有错误，AI 分析：@obsidian-logger analyze_errors
6. 根据建议修复问题
7. 重复步骤 1-6
```

### 2. 快速错误诊断

```
# 1. 查看最近错误
@obsidian-logger get_recent_errors 20

# 2. 深度分析
@obsidian-logger analyze_errors

# 3. AI 会自动：
#    - 识别错误类型
#    - 找出常见模式
#    - 提供修复建议
```

### 3. 性能监控

```
# 查看日志统计
@obsidian-logger get_log_summary

# 输出示例：
# 总日志数: 1523
# LOG: 1200 (78.8%)
# ERROR: 23 (1.5%)
# WARN: 300 (19.7%)
#
# 如果 ERROR 占比高，说明需要关注错误修复
```

### 4. 管理监控列表（手动模式）

```
# 查看当前列表
@obsidian-logger manage_watched_plugins action="get"

# 添加插件
@obsidian-logger manage_watched_plugins action="add" plugin_id="my-plugin"

# 移除插件
@obsidian-logger manage_watched_plugins action="remove" plugin_id="my-plugin"

# 设置完整列表
@obsidian-logger manage_watched_plugins action="set" plugin_ids='["plugin1","plugin2"]'
```

### 5. 手动触发重载

```
# 重载特定插件（不需要等待文件变化）
@obsidian-logger trigger_plugin_reload my-plugin
```

---

## 故障排查

### 问题：插件无法加载

**症状**：Obsidian 中看不到插件

**可能原因**：
1. `manifest.json` 格式错误
2. 文件未正确复制/链接
3. Obsidian 版本过低

**解决方法**：
```bash
# 1. 验证 manifest.json
cat manifest.json | python -m json.tool

# 2. 检查文件是否存在
ls vault/.obsidian/plugins/obsidian-logger/

# 3. 查看 Obsidian 版本
# 设置 → 关于 → 版本应该 >= 0.13.0
```

### 问题：日志未写入

**症状**：日志文件不存在或为空

**可能原因**：
1. 日志目录权限不足
2. 路径配置错误
3. 缓冲区未刷新

**解决方法**：
```
# 1. 检查日志路径
@obsidian-logger get_log_file_path

# 2. 手动触发刷新（重载插件）
# 命令面板 → "重载插件"

# 3. 检查目录权限
# Windows: 右键 → 属性 → 安全
# macOS/Linux: ls -la 查看权限
```

### 问题：Auto-Reload 不工作

**症状**：修改文件后插件不重载

**可能原因**：
1. 插件不在监控列表中
2. 监控的文件类型不包含修改的文件
3. 智能模式评分不足

**解决方法**：
```
# 1. 查看监控状态
@obsidian-logger get_auto_reload_status

# 2. 切换到自动模式测试
@obsidian-logger set_auto_reload_mode auto

# 3. 手动添加到监控列表（手动模式）
@obsidian-logger manage_watched_plugins action="add" plugin_id="your-plugin"

# 4. 检查文件类型配置
# 设置 → Obsidian Logger → 文件监控配置
```

### 问题：MCP 工具无响应

**症状**：`@obsidian-logger` 无反应

**可能原因**：
1. MCP Server 未启动
2. 配置文件路径错误
3. Cursor 配置错误

**解决方法**：
```
# 1. 检查 Cursor 配置
# settings.json 中的路径是否正确

# 2. 测试 MCP Server
python mcp-server/src/mcp_obsidian_logger.py config.json

# 3. 查看 Cursor 日志
# Help → Toggle Developer Tools → Console

# 4. 验证配置文件
python -m json.tool config.json
```

---

## 常见问题

### Q: 会影响 Obsidian 性能吗？

A: 不会。性能开销极小：
- CPU 占用：< 5%
- 内存占用：< 60MB
- 日志写入延迟：< 100ms
- 采用异步操作，不阻塞主线程

### Q: 支持移动端吗？

A: 当前版本仅支持桌面端（Windows/macOS/Linux）。移动端支持计划在 v2.0 中实现。

### Q: 可以只使用日志功能，不使用 Auto-Reload 吗？

A: 可以。在设置中关闭 Auto-Reload 模块，或将模式设置为手动并清空监控列表。

### Q: 日志会占用大量磁盘空间吗？

A: 不会。有三层保护：
1. 日志轮转：超过 10MB 自动归档
2. 自动清理：默认保留 30 天
3. 手动清空：命令 `clear_logs`

### Q: 可以监控第三方插件吗？

A: 可以。Auto-Reload 可以监控任何插件，包括社区插件。但建议只监控自己开发的插件。

### Q: 如何卸载？

A: 
1. 在 Obsidian 中禁用插件
2. 删除插件目录：`vault/.obsidian/plugins/obsidian-logger`
3. 删除日志目录：`vault/../obsidian-logger`（可选）
4. 删除 Cursor MCP 配置

### Q: 支持多个 Vault 吗？

A: 支持。每个 Vault 安装独立的插件实例，MCP Server 通过配置文件指定目标 Vault。

### Q: 如何贡献代码或报告问题？

A: 
- 报告问题：[GitHub Issues](https://github.com/LINYF510/Obsidian-Logger-with-Plugin-and-MCP/issues)
- 贡献代码：阅读 [CONTRIBUTING.md](./CONTRIBUTING.md)
- 讨论：[GitHub Discussions](https://github.com/LINYF510/Obsidian-Logger-with-Plugin-and-MCP/discussions)

---

## 获取帮助

- 📖 完整文档：[docs/](./docs/)
- 🐛 报告问题：[GitHub Issues](https://github.com/LINYF510/Obsidian-Logger-with-Plugin-and-MCP/issues)
- 💬 社区讨论：[GitHub Discussions](https://github.com/LINYF510/Obsidian-Logger-with-Plugin-and-MCP/discussions)
- 📧 联系作者：[@LINYF510](https://github.com/LINYF510)

---

**祝使用愉快！🎉**

