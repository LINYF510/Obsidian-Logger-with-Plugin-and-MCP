# 更新日志

本项目的所有重要变更都将记录在此文件中。

格式遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

---

## [Unreleased]

### 计划中
- [ ] 移动端 Auto-Reload 支持
- [ ] 日志导出功能
- [ ] Web UI 仪表盘
- [ ] 实时告警系统
- [ ] 自动报告生成

---

## [1.0.0] - 2025-11-04

### 新增 ✨

#### 核心架构
- **单一插件设计**：Global Logger 插件集成日志模块和 Auto-Reload 模块
- **MCP Server**：提供 12 个工具接口（6个日志 + 6个 Auto-Reload）
- **完整文档系统**：包含开发方案、使用指南、API 文档等

#### 日志模块
- **零侵入日志收集**：自动拦截所有 `console.log/error/warn/debug` 输出
- **智能缓冲机制**：100 条或 500ms 触发批量写入
- **日志文件管理**：
  - 自动创建日志目录（`../obsidian-logger/`）
  - 日志文件轮转（10MB 阈值）
  - 自动清理旧日志（30天保留期）
- **日志统计功能**：实时统计各级别日志数量和错误类型
- **性能优化**：异步写入，内存占用 < 60MB，CPU < 5%

#### Auto-Reload 模块
- **三种监控模式**：
  - 🤖 **自动模式**：监控所有已启用的插件
  - 🧠 **智能模式**（推荐）：使用评分算法智能识别开发中的插件
  - ✋ **手动模式**：手动选择要监控的插件列表
- **智能识别算法**：
  - Source Map 检测（+5分）
  - 最近修改时间（24小时内 +3分）
  - 文件大小判断（< 50KB +2分）
  - 阈值：≥ 5分为开发插件
- **灵活文件监控**：
  - 全局文件类型配置（main.js, manifest.json, styles.css）
  - 插件特定文件配置
  - 自定义文件支持（通配符和 glob 模式）
- **重载统计**：记录重载次数、成功率、最后重载时间
- **防抖机制**：文件变化后 750ms 防抖，避免频繁重载
- **通知系统**：可选的重载通知（可在设置中关闭）

#### MCP Server 工具
**日志工具（6个）**：
- `read_logs` - 读取最近日志（支持行数和级别过滤）
- `get_log_summary` - 获取日志统计摘要
- `get_recent_errors` - 获取最近错误信息
- `analyze_errors` - 深度错误分析（错误分类、统计、模式识别）
- `get_log_file_path` - 获取日志文件绝对路径
- `clear_logs` - 清空日志文件（自动备份）

**Auto-Reload 工具（6个）**：
- `get_auto_reload_status` - 获取 Auto-Reload 状态和监控插件列表
- `get_auto_reload_mode` - 获取当前监控模式
- `set_auto_reload_mode` - 切换监控模式（auto/smart/manual）
- `manage_watched_plugins` - 管理监控插件列表（add/remove/set/get）
- `trigger_plugin_reload` - 手动触发指定插件重载
- `get_reload_statistics` - 获取重载统计信息

#### 设置界面
- **可视化配置面板**：
  - 日志模块设置：缓冲大小、刷新间隔、文件路径、轮转策略
  - Auto-Reload 模式切换：一键切换三种模式
  - 通知开关：控制重载通知显示
  - 高级选项：智能模式阈值、检查间隔等
- **实时状态显示**：
  - 当前监控模式
  - 监控插件列表
  - 重载统计信息
  - 日志文件路径
- **MCP 功能开关**：
  - 总开关控制 MCP 功能启用/禁用
  - 自动刷新设置（插件配置变更自动同步到 MCP Server）
  - 可配置的刷新间隔

#### 配置系统
- **配置持久化**：所有设置保存到 `data.json`
- **配置监听**：MCP Server 自动监听插件配置变更
- **配置向导**：`create-config.py` 自动检测 Vault 并生成配置
- **跨平台支持**：Windows/macOS/Linux 路径自动适配

#### 开发者体验
- **开发模式**：`npm run dev` 启动 Watch 自动编译
- **单元测试**：Jest + pytest，覆盖率 > 80%
- **安装脚本**：提供 Windows/macOS/Linux 安装脚本
- **符号链接支持**：开发模式下使用符号链接，无需重复复制
- **uvx 支持**：一键安装，从 GitHub 自动更新

### 技术实现

#### 架构设计
- **三层架构**：Cursor IDE ↔ MCP Server ↔ Global Logger Plugin
- **模块化设计**：日志模块和 Auto-Reload 模块独立开发、独立测试
- **事件驱动**：使用观察者模式处理文件变化和配置更新

#### 性能优化
- **批量写入**：减少 I/O 操作，提升性能
- **缓存系统**：MCP Server 内置缓存，减少文件读取
- **异步处理**：所有 I/O 操作异步执行，不阻塞主线程
- **防死循环**：日志拦截器使用标志位防止递归调用

#### 安全特性
- **错误隔离**：日志系统错误不影响 Obsidian 和其他插件
- **权限检查**：文件操作前检查权限
- **异常恢复**：自动恢复文件操作失败、磁盘满等异常

### 文档

#### 用户文档
- README.md - 项目概览和快速开始
- USER_MANUAL.md - 详细用户手册
- docs/guides/ - 完整使用指南（8个）
  - MCP服务器启动指南
  - 插件安装指南
  - uvx 安装指南
  - 符号链接开发模式
  - 设置界面使用指南
  - 通配符和文件类型配置指南
  - Auto-Reload 快速测试指南
  - 快速测试指南-阶段二

#### 开发者文档
- DEVELOPMENT.md - 开发指南
- CONTRIBUTING.md - 贡献指南
- CODE_OF_CONDUCT.md - 行为准则
- docs/development/ - 开发相关文档（3个）
  - DEVELOPMENT_PLAN.md - 详细开发计划
  - 文档管理规范.md
  - 文档查询建议.md

#### 技术文档
- docs/architecture/ - 架构设计文档
  - Auto-Reload架构设计.md
- docs/api/ - API 参考文档
  - MCP-Tools-API.md - 12个工具的完整 API 文档
- docs/Obsidian Logger 项目开发方案.md - 核心技术文档（90KB）

#### 测试文档
- docs/testing/ - 测试相关文档（10个）
  - 单元测试指南.md
  - 单元测试完成报告.md
  - Auto-Reload 实战测试指南.md
  - Auto-Reload 故障排查.md
  - Auto-Reload 调试命令.md
  - 集成测试指南（多个阶段）

#### 示例和工作流
- examples/mcp-examples/ - MCP 使用示例
  - 日志分析工作流.md
  - Auto-Reload管理示例.md

### 测试

#### 单元测试
- **TypeScript 测试**（Jest）：
  - Console 拦截器：15个测试用例
  - 日志收集器：11个测试用例
  - 工具函数：27个测试用例
  - 总计：53个测试用例
- **Python 测试**（pytest）：
  - LogManager：20个测试用例
  - ConfigManager：16个测试用例
  - Cache：11个测试用例
  - 总计：47个测试用例
- **覆盖率**：> 80%

#### 集成测试
- 完整日志流测试（插件 → 文件 → MCP → Cursor）
- Auto-Reload 三种模式完整测试
- 配置变更同步测试
- 异常恢复测试

#### 性能测试
- CPU 占用：< 5% ✅
- 内存占用：< 60MB ✅
- MCP 工具响应时间：< 500ms ✅
- 日志写入延迟：< 100ms ✅
- 长期稳定性：24小时运行测试通过 ✅

### 工具和脚本

#### 安装脚本
- `scripts/install.sh` - Linux/macOS 一键安装
- `scripts/install.bat` - Windows 一键安装
- `scripts/link-plugin.sh` - Linux/macOS 符号链接
- `scripts/link-plugin.bat` - Windows 符号链接（已参数化）

#### 开发脚本
- `scripts/dev-setup.sh` - Linux/macOS 开发环境设置
- `scripts/dev-setup.bat` - Windows 开发环境设置
- `mcp-server/create-config.py` - 配置文件创建向导
- `mcp-server/verify-paths.py` - 路径验证工具

#### 构建脚本
- `global-logger/esbuild.config.mjs` - 插件构建配置
- `global-logger/version-bump.mjs` - 版本升级脚本
- `mcp-server/pyproject.toml` - Python 包配置（支持 uvx）
- `mcp-server/setup.py` - Python 包安装脚本

### 依赖更新
- **插件依赖**：
  - TypeScript 4.9+
  - esbuild 0.17.3
  - Obsidian API（latest）
  - Jest 29.x（测试）
- **MCP Server 依赖**：
  - Python 3.8+
  - mcp >= 0.1.0
  - watchdog >= 3.0.0
  - pytest（测试）

### 修复 🐛
- 修复 `get_log_summary` 工具的除零错误（空日志文件时）
- 修复配置监听死循环问题（MCP 配置变更触发无限循环）
- 修复旧配置兼容性问题（自动迁移到新配置格式）
- 修复 Windows 路径处理问题（反斜杠转义）

### 变更 🔧
- 日志目录从 `cursor-logs` 重命名为 `obsidian-logger`
- 配置监听轮询间隔优化（从 100ms 调整为 500ms）
- 优化智能识别算法评分权重

### 性能优化 ⚡
- 日志缓冲区优化：减少内存占用
- 文件监听防抖：降低 CPU 使用
- 缓存系统：提升 MCP 工具响应速度
- 异步文件操作：避免阻塞主线程

---

## 版本历史

### 版本约定
- **主版本号（Major）**：不兼容的 API 修改
- **次版本号（Minor）**：向下兼容的功能性新增
- **修订号（Patch）**：向下兼容的问题修正

### 未来规划

#### v1.1.0（性能优化版）
- 内存占用降低 30%
- 响应时间降低 50%
- 增强错误恢复能力

#### v1.2.0（功能增强版）
- 日志导出功能（JSON/CSV/TXT）
- 高级日志搜索和过滤
- 插件开发统计面板

#### v2.0.0（平台扩展版）
- 移动端支持
- Web UI 仪表盘
- 实时协作功能
- 云同步支持

---

## 贡献者

感谢所有为本项目做出贡献的开发者！

- [@LINYF510](https://github.com/LINYF510) - 项目创建者和维护者

---

## 许可证

本项目采用 [MIT License](LICENSE) 许可证。

---

**更新说明**：
- 本文档记录所有公开版本的变更
- 开发版本变更请参考 Git 提交历史
- 如有疑问，请提交 [Issue](https://github.com/LINYF510/Obsidian-Logger-with-Plugin-and-MCP/issues)

