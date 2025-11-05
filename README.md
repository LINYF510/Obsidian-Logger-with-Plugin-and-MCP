# 📋 Obsidian-Cursor Logger

> 为 Obsidian 插件开发者提供一套**完整、自动化、智能化的调试解决方案**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Obsidian](https://img.shields.io/badge/Obsidian-0.13.0%2B-purple)](https://obsidian.md/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9%2B-blue)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.10%2B-blue)](https://www.python.org/)

## ✨ 核心特性

- 🎯 **一次配置，永久有效** - 单一插件，双模块设计，安装后自动为所有插件工作
- 🔄 **实时监控日志** - 所有日志自动集中收集和显示
- 🤖 **AI 智能分析** - 通过 Cursor AI 进行自动化错误分析和修复建议
- 🔥 **智能自动重载** - Auto-Reload 模块提供三种监控模式（自动/智能/手动）
- ⚡ **极致效率** - 开发效率提升 5-10 倍

## 🚀 快速开始

### 第一步：安装 Obsidian 插件

> **重要**：必须先安装插件才能生成日志，MCP Server 才有数据可读取

#### 方式 A：从 Release 安装（推荐 - 适合普通用户）

1. 从 [Releases](https://github.com/LINYF510/Obsidian-Logger-with-Plugin-and-MCP/releases) 下载最新版本
2. 解压到 Obsidian vault 的插件目录：
   - Windows: `%APPDATA%\Obsidian\YourVault\.obsidian\plugins\obsidian-logger\`
   - macOS: `~/Library/Application Support/obsidian/YourVault/.obsidian/plugins/obsidian-logger/`
   - Linux: `~/.config/obsidian/YourVault/.obsidian/plugins/obsidian-logger/`

#### 方式 B：手动构建（开发者）

```bash
# 克隆仓库
git clone https://github.com/LINYF510/Obsidian-Logger-with-Plugin-and-MCP.git
cd Obsidian-Logger-with-Plugin-and-MCP/global-logger

# 安装依赖并构建
npm install
npm run build

# 链接到 Obsidian（推荐使用符号链接）
# 详见 scripts/link-plugin.bat 或 link-plugin.sh
```

#### 启用插件

1. 打开 Obsidian
2. 进入 **设置 → 第三方插件**
3. 关闭 **安全模式**（如果已开启）
4. 启用 **Obsidian Logger**
5. 在控制台（Ctrl+Shift+I）查看启动日志：
   ```
   🚀 Obsidian Logger 启动中...
   ✅ Obsidian Logger 已启动
   📝 日志模块：已启动
   🤖 Auto-Reload 模块：已启动（smart 模式）
   ```

#### 验证插件工作

插件会自动创建日志文件：`vault目录/../obsidian-logger/obsidian-debug.log`

检查文件是否存在并包含日志内容。

---

### 第二步：安装 MCP Server（可选）

> **说明**：MCP Server 提供 AI 智能分析功能，如果只需要基础日志收集，可以跳过此步骤

#### 方式 1: 使用 uvx（推荐）

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
# 下载并运行配置向导
curl -O https://raw.githubusercontent.com/LINYF510/Obsidian-Logger-with-Plugin-and-MCP/main/mcp-server/create-config.py
python create-config.py
```

向导会自动检测你的 Vault 和日志文件路径，生成配置到 `~/.obsidian-logger/config.json`

**3. 配置 Cursor MCP**

编辑 Cursor 配置文件 (`~/.config/Cursor/User/settings.json`):

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

详见 [uvx 安装指南](docs/guides/uvx安装指南.md)

#### 方式 2: 本地开发模式（开发者）

如果你已经完成第一步（安装插件），现在安装 MCP Server 本地版本：

```bash
# 进入 MCP Server 目录
cd mcp-server

# 安装依赖
pip install -r requirements.txt

# 创建配置文件
python create-config.py
# 或手动复制：cp config.example.json config.json
```

**配置 Cursor MCP**（本地模式）:

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

**测试**：重启 Cursor 后使用 `@obsidian-logger read_logs` 验证

---

### 配置说明

1. **启用 Obsidian 插件**：
   - 打开 Obsidian → 设置 → 第三方插件
   - 找到"Obsidian Logger"并启用

2. **配置 Auto-Reload 模式**（可选）：
   - 默认使用智能模式，自动识别开发中的插件
   - 可在 Obsidian 设置中调整监控模式：
     - 🤖 **自动模式**：监控所有已启用的插件
     - 🧠 **智能模式**（推荐）：智能识别开发插件
     - ✋ **手动模式**：手动选择要监控的插件

## 📖 使用方法

### 完整开发流程

```
1. 修改插件代码 → 保存
   ↓
2. 自动构建（npm run dev）
   ↓
3. Auto-Reload 模块智能检测并自动重载插件（~1秒）
   ↓
4. Global Logger 自动收集日志（包含重载日志）
   ↓
5. 在 Cursor 中使用 @obsidian-logger
   ├─ 日志工具：
   │  ├─ read_logs：查看最近日志
   │  ├─ get_log_summary：查看统计
   │  └─ analyze_errors：分析错误
   └─ Auto-Reload 工具：
      ├─ get_auto_reload_status：查看监控状态
      ├─ manage_watched_plugins：管理监控列表
      └─ get_reload_statistics：查看重载统计
   ↓
6. AI 自动分析问题 → 获得修复建议
```

### MCP 工具列表

#### 日志工具（6个）
- `read_logs` - 读取日志内容
- `get_log_summary` - 获取统计摘要
- `get_recent_errors` - 获取最近错误
- `analyze_errors` - 深度错误分析
- `get_log_file_path` - 获取日志路径
- `clear_logs` - 清空日志

#### Auto-Reload 管理工具（6个）
- `get_auto_reload_status` - 获取 Auto-Reload 状态和监控列表
- `get_auto_reload_mode` - 获取当前监控模式
- `set_auto_reload_mode` - 切换监控模式（auto/smart/manual）
- `manage_watched_plugins` - 管理监控插件列表（add/remove/set/get）
- `trigger_plugin_reload` - 手动触发指定插件重载
- `get_reload_statistics` - 获取重载统计信息

## 📊 效率对比

| 开发流程 | 传统方式 | 使用本工具 | 效率提升 |
|---------|---------|-----------|---------|
| 每次迭代时间 | 2-3 分钟 | 10-20 秒 | **5-10x** |
| 日志查看 | 手动复制控制台 | 自动收集 + AI 分析 | **10x** |
| 插件重载 | 手动禁用/启用 | Auto-Reload 智能重载 | **20x** |
| 错误诊断 | 手动分析 | AI 智能分析 | **5x** |

## ✨ 核心优势

| 功能 | 说明 |
|------|------|
| 📦 **单一插件** | 一次安装，同时获得日志收集和智能重载功能 |
| 🧠 **智能识别** | 自动检测开发中的插件，无需手动配置 |
| 🎯 **三种模式** | 自动/智能/手动，灵活适配不同开发场景 |
| 🔄 **双向协同** | 重载日志自动收集，AI 可分析重载历史 |
| 🎨 **可视化界面** | 完整的设置界面，实时显示监控状态 |

## 🏗️ 系统架构

```
Cursor IDE（应用层）
    ↑↓ MCP 协议（JSON-RPC）
MCP Server（中间层）
    ↑↓ 文件系统 API + 日志文件监听 + 插件配置管理
Global Logger 插件（数据+控制层 - 单一插件，内部模块化）
    ├─ 日志模块：拦截 console → 收集日志 → 写入文件
    └─ Auto-Reload 模块：智能监控 → 检测变化 → 自动重载
Obsidian 核心 + 插件生态
```

## 📚 文档

- [完整开发方案](./docs/Obsidian-Cursor%20Logger%20项目开发方案.md)
- [安装配置指南](./docs/Obsidian-Cursor%20Logger%20项目开发方案.md#附录-a安装和配置指南)
- [常见问题排查](./docs/Obsidian-Cursor%20Logger%20项目开发方案.md#a4-常见问题排查)

## 🛠️ 技术栈

- **插件**: TypeScript + Obsidian Plugin API
  - 日志模块：Console 拦截 + 文件管理
  - Auto-Reload 模块：智能监控 + 插件重载
- **MCP Server**: Python 3.8+
  - 12 个工具（6个日志 + 6个 Auto-Reload）
  - Watchdog 文件监听
- **通信协议**: JSON-RPC (MCP)
- **AI**: Cursor IDE

## 🔧 开发指南

### 环境要求

- Node.js 16+
- Python 3.8+
- Obsidian 0.13.0+
- Cursor IDE（可选）

### 开发命令

```bash
# 开发模式（Watch 自动编译）
npm run dev

# 生产构建
npm run build

# 运行测试
npm test

# 代码检查
npm run lint
```

## 📝 更新日志

### v1.0.0（当前开发版本）
- ✅ 单一插件，双模块设计
  - 日志模块：全局日志收集和管理
  - Auto-Reload 模块：智能自动重载
- ✅ 三种监控模式（自动/智能/手动）
- ✅ 智能识别算法（source map + 修改时间 + 文件大小）
- ✅ 可视化设置界面
- ✅ MCP Server 实现
- ✅ 12 个核心工具（6个日志 + 6个 Auto-Reload）
- ✅ 重载统计和历史查询
- ✅ Cursor 集成

## 🤝 贡献

欢迎贡献代码、报告问题或提出建议！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- 感谢 Obsidian 社区的支持和反馈
- 感谢所有贡献者

## 📮 联系方式

- GitHub: [@LINYF510](https://github.com/LINYF510)
- Issues: [GitHub Issues](https://github.com/LINYF510/Obsidian-Logger-with-Plugin-and-MCP/issues)

---

**Made with ❤️ for Obsidian Plugin Developers**
