# Obsidian Logger - Global Logger Plugin

> 核心插件：单一插件，双模块设计 - 提供零侵入的全局日志收集和智能自动重载功能

[![TypeScript](https://img.shields.io/badge/TypeScript-4.9%2B-blue)](https://www.typescriptlang.org/)
[![Obsidian API](https://img.shields.io/badge/Obsidian-0.13.0%2B-purple)](https://obsidian.md/)
[![Tests](https://img.shields.io/badge/tests-53%20passing-brightgreen)]()
[![Coverage](https://img.shields.io/badge/coverage->80%25-brightgreen)]()

---

## ✨ 核心特性

### 📝 日志模块

#### 零侵入日志收集
- **Console 拦截**：自动拦截所有 `console.log/error/warn/debug` 输出
- **透明运行**：使用函数劫持技术，不影响原有 console 功能
- **防死循环**：内置标志位机制，确保日志系统自身输出不被再次拦截

#### 高性能设计
- **批量写入**：100条或500ms触发，减少I/O操作
- **异步处理**：所有文件操作异步执行，不阻塞主线程
- **内存优化**：环形缓冲区设计，内存占用 < 60MB
- **CPU友好**：CPU占用 < 5%，几乎感知不到性能损失

#### 智能文件管理
- **自动轮转**：文件超过10MB自动归档
- **自动清理**：默认保留30天，自动删除旧日志
- **统一路径**：`vault/../obsidian-logger/obsidian-debug.log`

### 🔄 Auto-Reload 模块

#### 三种监控模式
- **🤖 自动模式**：监控所有已启用的插件
- **🧠 智能模式**（推荐）：智能识别开发中的插件
  - Source Map 检测：+5分
  - 24小时内修改：+3分
  - 文件大小 < 50KB：+2分
  - 阈值：≥ 5分视为开发插件
- **✋ 手动模式**：手动选择要监控的插件列表

#### 灵活文件监控
- **全局配置**：统一设置监控的文件类型（main.js, manifest.json, styles.css）
- **插件特定配置**：为不同插件配置不同的监控文件
- **通配符支持**：支持 glob 模式，如 `*.js`, `views/**/*.tsx`
- **自定义文件**：可添加任意自定义文件到监控列表

#### 重载优化
- **防抖机制**：文件变化后750ms防抖，避免频繁重载
- **重载统计**：记录重载次数、成功率、最后重载时间
- **通知系统**：可选的重载通知（可在设置中关闭）

---

## 🏗️ 技术架构

### 模块化设计

```
Global Logger Plugin
├── 📝 Logger Module              # 日志收集模块
│   ├── ConsoleInterceptor        # Console 方法拦截
│   ├── LogCollector              # 日志格式化和缓冲
│   ├── FileManager               # 文件写入和轮转
│   └── LogStats                  # 日志统计
│
├── 🔄 Auto-Reload Module         # 智能重载模块
│   ├── FileWatcher               # 文件监听器（定时检查）
│   ├── PluginReloader            # 插件重载器
│   ├── SmartIdentifier           # 智能识别算法
│   ├── ModeManager               # 模式管理器
│   └── ReloadStats               # 重载统计
│
├── 🎨 Settings UI                # 设置界面
│   ├── 日志模块设置
│   ├── Auto-Reload 模块设置
│   ├── 文件监控配置
│   └── MCP 功能开关
│
└── 🔗 Shared Utilities           # 共享工具
    ├── Types                     # TypeScript 类型定义
    └── Utils                     # 工具函数（通配符匹配等）
```

### 核心算法

#### 日志拦截机制

```typescript
/**
 * 函数劫持（Function Hijacking）
 * 保存原始 console 引用 → 替换为包装函数 → 调用原始 + 记录日志
 */
const originalLog = console.log;
console.log = (...args) => {
  if (isLogging) return;  // 防死循环
  isLogging = true;
  originalLog(...args);   // 保持原有功能
  logEntry('LOG', args);  // 记录到日志系统
  isLogging = false;
};
```

#### 智能识别算法

```typescript
/**
 * 评分算法
 * 根据多个特征计算插件的"开发中"评分
 */
function calculateDevelopmentScore(plugin: Plugin): number {
  let score = 0;
  if (hasSourceMap(plugin))              score += 5;  // 最强特征
  if (modifiedWithin24Hours(plugin))     score += 3;  // 时间特征
  if (fileSize(plugin) < 50 * 1024)      score += 2;  // 大小特征
  return score;  // ≥ 5 分判定为开发插件
}
```

---

## 🚀 开发指南

### 环境要求

- Node.js 16+
- TypeScript 4.9+
- Obsidian 0.13.0+

### 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 开发模式（Watch 自动编译）
npm run dev

# 3. 在另一个终端，链接到 Obsidian
# Windows
mklink /D "%APPDATA%\Obsidian\YourVault\.obsidian\plugins\obsidian-logger" "%CD%"

# macOS/Linux
ln -s "$(pwd)" "/path/to/vault/.obsidian/plugins/obsidian-logger"
```

### 常用命令

```bash
# 开发模式（Watch 自动编译）
npm run dev

# 生产构建
npm run build

# 运行测试（53个测试用例）
npm test

# Watch 模式测试
npm test -- --watch

# 生成覆盖率报告
npm test -- --coverage

# 代码检查
npm run lint
```

### 项目结构

```
global-logger/
├── src/
│   ├── logger/                   # 日志模块
│   │   ├── __tests__/           # 单元测试（26个用例）
│   │   │   ├── console-interceptor.test.ts
│   │   │   └── log-collector.test.ts
│   │   ├── console-interceptor.ts    # Console 拦截器
│   │   ├── log-collector.ts          # 日志收集器
│   │   ├── file-manager.ts           # 文件管理器
│   │   ├── log-stats.ts              # 日志统计
│   │   └── index.ts                  # 模块导出
│   │
│   ├── auto-reload/              # Auto-Reload 模块
│   │   ├── file-watcher.ts           # 文件监听器
│   │   ├── plugin-reloader.ts        # 插件重载器
│   │   ├── smart-identifier.ts       # 智能识别算法
│   │   ├── mode-manager.ts           # 模式管理器
│   │   ├── reload-stats.ts           # 重载统计
│   │   └── index.ts                  # 模块导出
│   │
│   ├── shared/                   # 共享模块
│   │   ├── __tests__/           # 单元测试（27个用例）
│   │   │   └── utils.test.ts
│   │   ├── types.ts                  # 类型定义
│   │   └── utils.ts                  # 工具函数
│   │
│   ├── main.ts                   # 插件主入口
│   └── settings.ts               # 设置界面
│
├── __mocks__/                    # Jest Mock 文件
│   ├── obsidian.ts              # Obsidian API Mock
│   └── setup.ts                 # 测试环境设置
│
├── manifest.json                 # 插件元数据
├── package.json                  # npm 配置
├── tsconfig.json                 # TypeScript 配置
├── esbuild.config.mjs            # 构建配置
└── jest.config.js                # 测试配置
```

---

## 🧪 测试

### 测试覆盖

- **总测试用例**：53个
- **覆盖率**：> 80%
- **测试框架**：Jest

### 测试模块

| 模块 | 测试用例 | 说明 |
|------|---------|------|
| Console 拦截器 | 15个 | 测试拦截、防死循环、参数序列化 |
| 日志收集器 | 11个 | 测试缓冲、格式化、刷新机制 |
| 工具函数 | 27个 | 测试通配符匹配、路径处理等 |

### 运行测试

```bash
# 运行所有测试
npm test

# Watch 模式（自动重新运行）
npm test -- --watch

# 生成覆盖率报告（HTML）
npm test -- --coverage
# 报告生成在 coverage/index.html

# 运行特定测试文件
npm test -- console-interceptor.test.ts
```

---

## ⚙️ 配置

### 配置文件

配置保存在：`vault/.obsidian/plugins/obsidian-logger/data.json`

### 配置结构

```typescript
interface PluginSettings {
  logger: {
    bufferSize: number;           // 缓冲区大小（默认100）
    flushInterval: number;        // 刷新间隔（默认500ms）
    logFilePath: string;          // 日志文件路径
    enableRotation: boolean;      // 启用日志轮转
    maxFileSize: number;          // 最大文件大小（MB）
    enableAutoClean: boolean;     // 启用自动清理
    retentionDays: number;        // 保留天数
  };
  autoReload: {
    mode: 'auto' | 'smart' | 'manual';  // 监控模式
    watchedPlugins: string[];            // 手动模式插件列表
    checkInterval: number;               // 检查间隔（ms）
    showNotification: boolean;           // 显示重载通知
    smartModeThreshold: number;          // 智能模式阈值（小时）
    usePluginSpecific: boolean;          // 使用插件特定配置
    globalWatchedFiles: FileConfig;      // 全局文件配置
    pluginSpecificFiles: Record<string, FileConfig>;  // 插件特定配置
  };
  mcp: {
    enabled: boolean;                    // MCP 功能总开关
    autoRefreshSettings: boolean;        // 自动刷新设置
    refreshInterval: number;             // 刷新间隔（ms）
  };
}
```

---

## 📊 性能指标

| 指标 | 目标 | 实际 | 状态 |
|------|------|------|------|
| CPU 占用 | < 5% | ~3% | ✅ |
| 内存占用 | < 60MB | ~45MB | ✅ |
| 日志写入延迟 | < 100ms | ~50ms | ✅ |
| 文件监听间隔 | 1000ms | 1000ms | ✅ |
| 重载延迟 | < 2s | ~1s | ✅ |

---

## 📚 相关文档

- [项目总览](../README.md)
- [用户手册](../USER_MANUAL.md)
- [开发指南](../DEVELOPMENT.md)
- [完整开发方案](../docs/Obsidian%20Logger%20项目开发方案.md)
- [Auto-Reload 架构设计](../docs/architecture/Auto-Reload架构设计.md)
- [MCP Tools API](../docs/api/MCP-Tools-API.md)

---

## 🤝 贡献

欢迎贡献！请阅读 [贡献指南](../CONTRIBUTING.md)。

---

## 📄 许可证

MIT License - 查看 [LICENSE](../LICENSE) 文件了解详情

---

**Made with ❤️ for Obsidian Plugin Developers**
