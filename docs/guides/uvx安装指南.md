# uvx 安装和使用指南

**版本**: v1.0  
**日期**: 2025-11-02  
**适用场景**: 普通用户，无需克隆仓库

---

## 📋 什么是 uvx？

`uvx` 是 [uv](https://github.com/astral-sh/uv) 工具提供的命令，可以：
- ✅ 直接从 GitHub 运行 Python 应用
- ✅ 无需手动克隆仓库
- ✅ 自动管理虚拟环境和依赖
- ✅ 快速且轻量（比 pip 快 10-100 倍）

**对用户的好处**: 一条命令即可使用 Obsidian Logger MCP Server！

---

## 🚀 快速开始

### 前提条件

- ✅ Python 3.8+ 已安装
- ✅ Obsidian 已安装并有一个 Vault
- ✅ Cursor IDE 已安装

---

### 步骤 1: 安装 uv

#### Windows (PowerShell)

```powershell
irm https://astral.sh/uv/install.ps1 | iex
```

或使用 pip:
```bash
pip install uv
```

#### macOS / Linux

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

或使用 pip:
```bash
pip install uv
```

#### 验证安装

```bash
uvx --version
```

应该显示版本号，例如: `uvx 0.x.x`

---

### 步骤 2: 创建配置文件

#### 方式 A: 使用配置向导（推荐）

```bash
python -c "import urllib.request; exec(urllib.request.urlopen('https://raw.githubusercontent.com/LINYF510/Obsidian-Logger-with-Plugin-and-MCP/main/mcp-server/create-config.py').read())"
```

或手动下载脚本并运行:
```bash
curl -O https://raw.githubusercontent.com/LINYF510/Obsidian-Logger-with-Plugin-and-MCP/main/mcp-server/create-config.py
python create-config.py
```

向导会引导你：
1. 输入 Obsidian Vault 路径
2. 选择日志文件位置
3. 选择配置文件保存位置
4. 显示 Cursor 配置代码

#### 方式 B: 手动创建配置文件

创建 `~/.obsidian-logger/config.json`:

```json
{
  "vault_path": "/path/to/your/obsidian/vault",
  "log_file_path": "/path/to/your/obsidian/obsidian-logger/obsidian-debug.log"
}
```

**路径说明**:
- `vault_path`: 你的 Obsidian Vault 目录（包含 `.obsidian` 文件夹的那个）
- `log_file_path`: 日志文件位置（推荐放在 Vault 外部）

---

### 步骤 3: 配置 Cursor MCP

打开 Cursor 配置文件:
- **Windows**: `%APPDATA%\Cursor\User\settings.json`
- **macOS**: `~/Library/Application Support/Cursor/User/settings.json`
- **Linux**: `~/.config/Cursor/User/settings.json`

添加以下配置:

```json
{
  "mcpServers": {
    "obsidian-logger": {
      "command": "uvx",
      "args": [
        "--from",
        "git+https://github.com/LINYF510/Obsidian-Logger-with-Plugin-and-MCP",
        "obsidian-logger-mcp",
        "/absolute/path/to/your/config.json"
      ],
      "description": "Obsidian 日志收集和 Auto-Reload 服务",
      "transport": "stdio",
      "disabled": false
    }
  }
}
```

**⚠️ 重要**: 将 `/absolute/path/to/your/config.json` 替换为实际的配置文件路径！

---

### 步骤 4: 重启 Cursor

1. 完全关闭 Cursor
2. 重新打开 Cursor
3. uvx 会自动从 GitHub 下载并启动 MCP Server

---

## ✅ 验证安装

在 Cursor 中测试 MCP 工具:

```
@obsidian-logger read_logs
```

如果看到日志输出，说明配置成功！✅

---

## 🎯 使用示例

### 查看日志

```
@obsidian-logger read_logs lines=20
@obsidian-logger get_log_summary
```

### 管理 Auto-Reload

```
@obsidian-logger get_auto_reload_status
@obsidian-logger set_auto_reload_mode mode="smart"
```

### 分析错误

```
@obsidian-logger get_recent_errors limit=10
@obsidian-logger analyze_errors
```

完整的工具列表参见: `docs/api/MCP-Tools-API.md`

---

## 🔧 高级配置

### 自定义配置文件位置

如果配置文件不在默认位置，可以通过命令行参数指定:

```json
{
  "mcpServers": {
    "obsidian-logger": {
      "command": "uvx",
      "args": [
        "--from",
        "git+https://github.com/LINYF510/Obsidian-Logger-with-Plugin-and-MCP",
        "obsidian-logger-mcp",
        "/custom/path/to/config.json"
      ],
      "transport": "stdio"
    }
  }
}
```

### 使用特定分支或版本

```json
"args": [
  "--from",
  "git+https://github.com/LINYF510/Obsidian-Logger-with-Plugin-and-MCP@dev",
  "obsidian-logger-mcp"
]
```

### 配置自动查找顺序

如果不指定配置文件路径，MCP Server 会按以下顺序查找:

1. 当前工作目录: `./config.json`
2. 用户主目录: `~/.obsidian-logger/config.json` ⭐ 推荐
3. 脚本目录: `../config.json`

---

## 🐛 故障排查

### 问题 1: uvx 命令不存在

**错误信息**: `uvx: command not found`

**解决方案**:
```bash
# 重新安装 uv
pip install uv

# 或使用安装脚本
curl -LsSf https://astral.sh/uv/install.sh | sh  # macOS/Linux
# 或
irm https://astral.sh/uv/install.ps1 | iex  # Windows
```

---

### 问题 2: 找不到配置文件

**错误信息**: `❌ 错误: 未找到配置文件`

**解决方案**:
1. 确认配置文件已创建
2. 检查配置文件路径是否正确
3. 使用绝对路径而不是相对路径

```bash
# 检查配置文件是否存在
ls ~/.obsidian-logger/config.json  # macOS/Linux
dir %USERPROFILE%\.obsidian-logger\config.json  # Windows
```

---

### 问题 3: MCP Server 启动失败

**错误信息**: 在 Cursor 中看不到 MCP 工具

**排查步骤**:

1. **检查 Cursor 配置**
   - 打开 Cursor 设置
   - 搜索 "mcp"
   - 确认配置正确

2. **查看 MCP 日志**
   - Cursor → 设置 → 扩展
   - 查找 MCP Server 状态和日志

3. **手动测试启动**
   ```bash
   uvx --from git+https://github.com/LINYF510/Obsidian-Logger-with-Plugin-and-MCP obsidian-logger-mcp /path/to/config.json
   ```

4. **检查配置文件格式**
   ```bash
   # 验证 JSON 格式
   python -m json.tool ~/.obsidian-logger/config.json
   ```

---

### 问题 4: Vault 路径不正确

**现象**: MCP Server 启动但工具调用失败

**解决方案**:
```bash
# 重新创建配置文件
python create-config.py

# 或手动编辑
vi ~/.obsidian-logger/config.json
```

确保 `vault_path` 指向包含 `.obsidian` 目录的文件夹。

---

## 📊 对比：uvx vs 传统方式

| 特性 | uvx 方式 | 传统方式 |
|------|---------|---------|
| 需要克隆仓库 | ❌ 不需要 | ✅ 需要 |
| 需要手动安装依赖 | ❌ 不需要 | ✅ 需要 |
| 更新方式 | 自动 | 手动 git pull |
| 磁盘占用 | 最小 | 完整仓库 |
| 适用场景 | 普通用户 | 开发者 |
| 配置复杂度 | ⭐ 简单 | ⭐⭐ 中等 |

---

## 💡 最佳实践

### 1. 配置文件位置

推荐使用用户主目录:
```
~/.obsidian-logger/config.json
```

**优点**:
- ✅ 不会丢失（不在项目目录中）
- ✅ 跨项目共享
- ✅ 方便备份

### 2. 日志文件位置

推荐放在 Vault 外部:
```
/path/to/vault/../obsidian-logger/obsidian-debug.log
```

**优点**:
- ✅ 不会被 Obsidian 同步
- ✅ 不占用 Vault 空间
- ✅ 方便查看和管理

### 3. 定期更新

uvx 会缓存已下载的包。要获取最新版本:
```bash
# 清除缓存并重新下载
uvx --refresh --from git+https://github.com/LINYF510/Obsidian-Logger-with-Plugin-and-MCP obsidian-logger-mcp
```

---

## 🎉 总结

使用 uvx 启动 Obsidian Logger MCP Server 的优势:

1. **一键安装** - 无需克隆仓库
2. **自动更新** - 从 GitHub 获取最新代码
3. **零配置依赖** - uvx 自动处理
4. **跨平台** - Windows/macOS/Linux 统一体验

**安装流程**: 安装 uv → 创建配置 → 配置 Cursor → 完成 ✅

---

## 📚 相关文档

- `docs/guides/MCP服务器启动指南.md` - 传统启动方式
- `docs/api/MCP-Tools-API.md` - 工具 API 文档
- `docs/guides/快速测试指南-阶段二.md` - 功能测试
- `README.md` - 项目总览

---

**文档维护者**: LINYF510  
**最后更新**: 2025-11-02



**版本**: v1.0  
**日期**: 2025-11-02  
**适用场景**: 普通用户，无需克隆仓库

---

## 📋 什么是 uvx？

`uvx` 是 [uv](https://github.com/astral-sh/uv) 工具提供的命令，可以：
- ✅ 直接从 GitHub 运行 Python 应用
- ✅ 无需手动克隆仓库
- ✅ 自动管理虚拟环境和依赖
- ✅ 快速且轻量（比 pip 快 10-100 倍）

**对用户的好处**: 一条命令即可使用 Obsidian Logger MCP Server！

---

## 🚀 快速开始

### 前提条件

- ✅ Python 3.8+ 已安装
- ✅ Obsidian 已安装并有一个 Vault
- ✅ Cursor IDE 已安装

---

### 步骤 1: 安装 uv

#### Windows (PowerShell)

```powershell
irm https://astral.sh/uv/install.ps1 | iex
```

或使用 pip:
```bash
pip install uv
```

#### macOS / Linux

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

或使用 pip:
```bash
pip install uv
```

#### 验证安装

```bash
uvx --version
```

应该显示版本号，例如: `uvx 0.x.x`

---

### 步骤 2: 创建配置文件

#### 方式 A: 使用配置向导（推荐）

```bash
python -c "import urllib.request; exec(urllib.request.urlopen('https://raw.githubusercontent.com/LINYF510/Obsidian-Logger-with-Plugin-and-MCP/main/mcp-server/create-config.py').read())"
```

或手动下载脚本并运行:
```bash
curl -O https://raw.githubusercontent.com/LINYF510/Obsidian-Logger-with-Plugin-and-MCP/main/mcp-server/create-config.py
python create-config.py
```

向导会引导你：
1. 输入 Obsidian Vault 路径
2. 选择日志文件位置
3. 选择配置文件保存位置
4. 显示 Cursor 配置代码

#### 方式 B: 手动创建配置文件

创建 `~/.obsidian-logger/config.json`:

```json
{
  "vault_path": "/path/to/your/obsidian/vault",
  "log_file_path": "/path/to/your/obsidian/obsidian-logger/obsidian-debug.log"
}
```

**路径说明**:
- `vault_path`: 你的 Obsidian Vault 目录（包含 `.obsidian` 文件夹的那个）
- `log_file_path`: 日志文件位置（推荐放在 Vault 外部）

---

### 步骤 3: 配置 Cursor MCP

打开 Cursor 配置文件:
- **Windows**: `%APPDATA%\Cursor\User\settings.json`
- **macOS**: `~/Library/Application Support/Cursor/User/settings.json`
- **Linux**: `~/.config/Cursor/User/settings.json`

添加以下配置:

```json
{
  "mcpServers": {
    "obsidian-logger": {
      "command": "uvx",
      "args": [
        "--from",
        "git+https://github.com/LINYF510/Obsidian-Logger-with-Plugin-and-MCP",
        "obsidian-logger-mcp",
        "/absolute/path/to/your/config.json"
      ],
      "description": "Obsidian 日志收集和 Auto-Reload 服务",
      "transport": "stdio",
      "disabled": false
    }
  }
}
```

**⚠️ 重要**: 将 `/absolute/path/to/your/config.json` 替换为实际的配置文件路径！

---

### 步骤 4: 重启 Cursor

1. 完全关闭 Cursor
2. 重新打开 Cursor
3. uvx 会自动从 GitHub 下载并启动 MCP Server

---

## ✅ 验证安装

在 Cursor 中测试 MCP 工具:

```
@obsidian-logger read_logs
```

如果看到日志输出，说明配置成功！✅

---

## 🎯 使用示例

### 查看日志

```
@obsidian-logger read_logs lines=20
@obsidian-logger get_log_summary
```

### 管理 Auto-Reload

```
@obsidian-logger get_auto_reload_status
@obsidian-logger set_auto_reload_mode mode="smart"
```

### 分析错误

```
@obsidian-logger get_recent_errors limit=10
@obsidian-logger analyze_errors
```

完整的工具列表参见: `docs/api/MCP-Tools-API.md`

---

## 🔧 高级配置

### 自定义配置文件位置

如果配置文件不在默认位置，可以通过命令行参数指定:

```json
{
  "mcpServers": {
    "obsidian-logger": {
      "command": "uvx",
      "args": [
        "--from",
        "git+https://github.com/LINYF510/Obsidian-Logger-with-Plugin-and-MCP",
        "obsidian-logger-mcp",
        "/custom/path/to/config.json"
      ],
      "transport": "stdio"
    }
  }
}
```

### 使用特定分支或版本

```json
"args": [
  "--from",
  "git+https://github.com/LINYF510/Obsidian-Logger-with-Plugin-and-MCP@dev",
  "obsidian-logger-mcp"
]
```

### 配置自动查找顺序

如果不指定配置文件路径，MCP Server 会按以下顺序查找:

1. 当前工作目录: `./config.json`
2. 用户主目录: `~/.obsidian-logger/config.json` ⭐ 推荐
3. 脚本目录: `../config.json`

---

## 🐛 故障排查

### 问题 1: uvx 命令不存在

**错误信息**: `uvx: command not found`

**解决方案**:
```bash
# 重新安装 uv
pip install uv

# 或使用安装脚本
curl -LsSf https://astral.sh/uv/install.sh | sh  # macOS/Linux
# 或
irm https://astral.sh/uv/install.ps1 | iex  # Windows
```

---

### 问题 2: 找不到配置文件

**错误信息**: `❌ 错误: 未找到配置文件`

**解决方案**:
1. 确认配置文件已创建
2. 检查配置文件路径是否正确
3. 使用绝对路径而不是相对路径

```bash
# 检查配置文件是否存在
ls ~/.obsidian-logger/config.json  # macOS/Linux
dir %USERPROFILE%\.obsidian-logger\config.json  # Windows
```

---

### 问题 3: MCP Server 启动失败

**错误信息**: 在 Cursor 中看不到 MCP 工具

**排查步骤**:

1. **检查 Cursor 配置**
   - 打开 Cursor 设置
   - 搜索 "mcp"
   - 确认配置正确

2. **查看 MCP 日志**
   - Cursor → 设置 → 扩展
   - 查找 MCP Server 状态和日志

3. **手动测试启动**
   ```bash
   uvx --from git+https://github.com/LINYF510/Obsidian-Logger-with-Plugin-and-MCP obsidian-logger-mcp /path/to/config.json
   ```

4. **检查配置文件格式**
   ```bash
   # 验证 JSON 格式
   python -m json.tool ~/.obsidian-logger/config.json
   ```

---

### 问题 4: Vault 路径不正确

**现象**: MCP Server 启动但工具调用失败

**解决方案**:
```bash
# 重新创建配置文件
python create-config.py

# 或手动编辑
vi ~/.obsidian-logger/config.json
```

确保 `vault_path` 指向包含 `.obsidian` 目录的文件夹。

---

## 📊 对比：uvx vs 传统方式

| 特性 | uvx 方式 | 传统方式 |
|------|---------|---------|
| 需要克隆仓库 | ❌ 不需要 | ✅ 需要 |
| 需要手动安装依赖 | ❌ 不需要 | ✅ 需要 |
| 更新方式 | 自动 | 手动 git pull |
| 磁盘占用 | 最小 | 完整仓库 |
| 适用场景 | 普通用户 | 开发者 |
| 配置复杂度 | ⭐ 简单 | ⭐⭐ 中等 |

---

## 💡 最佳实践

### 1. 配置文件位置

推荐使用用户主目录:
```
~/.obsidian-logger/config.json
```

**优点**:
- ✅ 不会丢失（不在项目目录中）
- ✅ 跨项目共享
- ✅ 方便备份

### 2. 日志文件位置

推荐放在 Vault 外部:
```
/path/to/vault/../obsidian-logger/obsidian-debug.log
```

**优点**:
- ✅ 不会被 Obsidian 同步
- ✅ 不占用 Vault 空间
- ✅ 方便查看和管理

### 3. 定期更新

uvx 会缓存已下载的包。要获取最新版本:
```bash
# 清除缓存并重新下载
uvx --refresh --from git+https://github.com/LINYF510/Obsidian-Logger-with-Plugin-and-MCP obsidian-logger-mcp
```

---

## 🎉 总结

使用 uvx 启动 Obsidian Logger MCP Server 的优势:

1. **一键安装** - 无需克隆仓库
2. **自动更新** - 从 GitHub 获取最新代码
3. **零配置依赖** - uvx 自动处理
4. **跨平台** - Windows/macOS/Linux 统一体验

**安装流程**: 安装 uv → 创建配置 → 配置 Cursor → 完成 ✅

---

## 📚 相关文档

- `docs/guides/MCP服务器启动指南.md` - 传统启动方式
- `docs/api/MCP-Tools-API.md` - 工具 API 文档
- `docs/guides/快速测试指南-阶段二.md` - 功能测试
- `README.md` - 项目总览

---

**文档维护者**: LINYF510  
**最后更新**: 2025-11-02


