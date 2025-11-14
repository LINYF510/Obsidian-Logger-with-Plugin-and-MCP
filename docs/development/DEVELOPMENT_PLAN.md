# Obsidian Logger v1.0 开发计划

**制定日期**: 2025-11-02  
**项目负责人**: LINYF510  
**预计工期**: 4-6 周（单人开发）

---

## 📋 项目概述

### 项目目标

开发一个完整的 Obsidian 插件调试解决方案，包含：

- **单一插件**（obsidian-logger）：内部包含日志模块 + Auto-Reload 模块
- **MCP Server**：提供 12 个工具接口（6个日志工具 + 6个 Auto-Reload 工具）
- **完整文档和测试**：用户手册、开发者文档、单元测试、集成测试

### 核心特性

- ✅ 零侵入的全局日志收集
- ✅ 智能自动重载（三种监控模式）
- ✅ AI 智能分析（通过 MCP 协议）
- ✅ 高性能（CPU < 5%，内存 < 60MB）
- ✅ 跨平台支持（Windows、macOS、Linux）

---

## 🗓️ 总体时间规划

| 阶段 | 任务 | 预计时间 | 里程碑 |
|------|------|----------|--------|
| 阶段一 | 环境搭建与项目初始化 | 3-5天 | Week 1 结束：插件能加载 |
| 阶段二 | Global Logger 插件开发 | 2-3周 | Week 3 结束：插件功能完成 |
| 阶段三 | MCP Server 开发 | 1-2周 | Week 4 结束：MCP Server 完成 |
| 阶段四 | 文档编写 | 5-7天 | Week 5 结束：文档完成 |
| 阶段五 | 测试与发布 | 3-5天 | Week 6 结束：v1.0 发布 |

---

## 🚀 阶段一：环境搭建与项目初始化（3-5天）

### 任务 1.1：开发环境准备

**目标**：搭建完整的 TypeScript + Python 开发环境

**任务清单**：
- [ ] 安装 Node.js 16+ 和 npm
- [ ] 安装 Python 3.10+ 和 pip
- [ ] 安装 Obsidian（用于测试）
- [ ] 安装 Cursor IDE
- [ ] 配置 Git 仓库

**验收标准**：
- `node --version` 和 `python3 --version` 命令正常输出
- Obsidian 能正常启动
- Git 仓库初始化完成

**预计时间**：0.5 天

---

### 任务 1.2：项目结构搭建

**目标**：创建完整的项目目录结构

**核心目录**：
```
obsidian-logger/
├── global-logger/           # 插件目录
│   ├── src/
│   │   ├── logger/          # 日志模块
│   │   ├── auto-reload/     # 重载模块
│   │   ├── shared/          # 共享代码
│   │   └── main.ts          # 主入口
│   ├── manifest.json
│   ├── package.json
│   └── tsconfig.json
├── mcp-server/              # MCP 服务器
│   ├── src/
│   │   └── mcp_obsidian_logger.py
│   └── requirements.txt
├── docs/                    # 文档
├── tests/                   # 测试
└── scripts/                 # 脚本
```

**任务清单**：
- [ ] 创建所有目录结构
- [ ] 创建占位文件（README.md 等）
- [ ] 配置 .gitignore

**验收标准**：
- 所有目录按规划创建完成
- Git 仓库结构清晰

**预计时间**：1 天

---

### 任务 1.3：基础配置文件

**需要创建的文件**：

#### 1. `global-logger/package.json`

```json
{
  "name": "obsidian-logger",
  "version": "1.0.0",
  "description": "全局日志收集和智能自动重载",
  "main": "main.js",
  "scripts": {
    "dev": "node esbuild.config.mjs",
    "build": "tsc -noEmit -skipLibCheck && node esbuild.config.mjs production",
    "test": "jest",
    "lint": "eslint src --ext .ts"
  },
  "keywords": ["obsidian", "plugin", "logger", "auto-reload"],
  "author": "LINYF510",
  "license": "MIT",
  "devDependencies": {
    "@types/node": "^16.11.6",
    "@typescript-eslint/eslint-plugin": "5.29.0",
    "@typescript-eslint/parser": "5.29.0",
    "builtin-modules": "3.3.0",
    "esbuild": "0.17.3",
    "eslint": "^8.57.0",
    "jest": "^30.2.0",
    "obsidian": "latest",
    "ts-jest": "^29.4.5",
    "tslib": "2.4.0",
    "typescript": "4.7.4"
  }
}
```

#### 2. `global-logger/manifest.json`

```json
{
  "id": "obsidian-logger",
  "name": "Obsidian Logger",
  "version": "1.0.0",
  "minAppVersion": "0.13.0",
  "description": "全局日志收集和智能自动重载 - 为 Obsidian 插件开发者提供完整的调试解决方案",
  "author": "LINYF510",
  "authorUrl": "https://github.com/LINYF510",
  "isDesktopOnly": false
}
```

#### 3. `mcp-server/requirements.txt`

```
mcp>=1.19.0
watchdog>=3.0.0
```

**任务清单**：
- [ ] 创建 package.json 并配置依赖
- [ ] 创建 tsconfig.json 配置 TypeScript
- [ ] 创建 manifest.json 定义插件元数据
- [ ] 创建 esbuild.config.mjs 配置构建
- [ ] 创建 requirements.txt 定义 Python 依赖

**验收标准**：
- `npm install` 在 global-logger 目录成功执行
- `pip install -r requirements.txt` 在 mcp-server 成功执行
- TypeScript 编译器配置正确

**预计时间**：1-2 天

---

## 🔧 阶段二：Global Logger 插件核心开发（2-3周）

### 任务 2.1：插件主入口和类型定义（2天）

#### 子任务 2.1.1：创建共享类型定义

**文件**：`src/shared/types.ts`

**内容**：
```typescript
/**
 * 插件完整配置接口
 */
export interface PluginSettings {
  // 日志模块配置
  logger: {
    bufferSize: number;           // 缓冲区大小
    flushInterval: number;        // 刷新间隔（毫秒）
    logFilePath: string;          // 日志文件路径
    enableRotation: boolean;      // 启用日志轮转
    maxFileSize: number;          // 文件大小上限（MB）
    enableAutoClean: boolean;     // 自动清理旧日志
    retentionDays: number;        // 保留天数
  };
  
  // Auto-Reload 模块配置
  autoReload: {
    mode: 'auto' | 'smart' | 'manual';  // 监控模式
    watchedPlugins: string[];            // 手动模式下选中的插件列表
    checkInterval: number;               // 检查间隔（毫秒）
    showNotification: boolean;           // 是否显示重载通知
    showStartupNotification: boolean;    // 是否在启动时显示通知
    smartModeThreshold: number;          // 智能模式的检测阈值（小时）
  };
}

/**
 * 默认配置
 */
export const DEFAULT_SETTINGS: PluginSettings = {
  logger: {
    bufferSize: 100,
    flushInterval: 500,
    logFilePath: '../obsidian-logger/obsidian-debug.log',
    enableRotation: true,
    maxFileSize: 10,
    enableAutoClean: true,
    retentionDays: 30
  },
  autoReload: {
    mode: 'smart',
    watchedPlugins: [],
    checkInterval: 1000,
    showNotification: true,
    showStartupNotification: true,
    smartModeThreshold: 24
  }
};
```

**验收标准**：
- 类型定义完整
- 默认配置合理
- 编译无错误

**预计时间**：0.5 天

---

#### 子任务 2.1.2：创建插件主入口

**文件**：`src/main.ts`

**核心代码结构**：
```typescript
import { Plugin } from 'obsidian';
import { LoggerModule } from './logger';
import { AutoReloadModule } from './auto-reload';
import { CursorLoggerSettingTab } from './settings';
import { PluginSettings, DEFAULT_SETTINGS } from './shared/types';

export default class ObsidianCursorLoggerPlugin extends Plugin {
  settings: PluginSettings;
  loggerModule: LoggerModule;
  autoReloadModule: AutoReloadModule;
  
  async onload() {
    console.log('🚀 Obsidian Logger 启动中...');
    
    // 1. 加载配置
    await this.loadSettings();
    
    // 2. 初始化日志模块
    this.loggerModule = new LoggerModule(this);
    await this.loggerModule.initialize();
    
    // 3. 初始化 Auto-Reload 模块
    this.autoReloadModule = new AutoReloadModule(this);
    await this.autoReloadModule.initialize();
    
    // 4. 注册命令和设置页面
    this.registerCommands();
    this.addSettingTab(new CursorLoggerSettingTab(this.app, this));
    
    console.log('✅ Obsidian Logger 已启动');
    console.log(`📝 日志模块：已启动`);
    console.log(`🤖 Auto-Reload 模块：已启动（${this.settings.autoReload.mode} 模式）`);
  }
  
  async onunload() {
    // 1. 停止 Auto-Reload 模块
    if (this.autoReloadModule) {
      await this.autoReloadModule.cleanup();
    }
    
    // 2. 停止日志模块
    if (this.loggerModule) {
      await this.loggerModule.cleanup();
    }
    
    console.log('👋 Obsidian Logger 已卸载');
  }
  
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
  
  async saveSettings() {
    await this.saveData(this.settings);
  }
  
  registerCommands() {
    // 日志模块命令
    this.addCommand({
      id: 'show-log-path',
      name: '📋 显示日志文件路径',
      callback: () => this.loggerModule.showLogPath()
    });
    
    this.addCommand({
      id: 'clear-global-logs',
      name: '🗑️ 清空全局日志',
      callback: () => this.loggerModule.clearLogs()
    });
    
    // Auto-Reload 模块命令
    this.addCommand({
      id: 'switch-to-smart-mode',
      name: '🧠 切换到智能监控模式',
      callback: async () => {
        this.settings.autoReload.mode = 'smart';
        await this.saveSettings();
        await this.autoReloadModule.updateWatchList();
      }
    });
  }
}
```

**任务清单**：
- [ ] 实现 onload() 生命周期
- [ ] 实现 onunload() 生命周期
- [ ] 实现配置加载和保存
- [ ] 注册基础命令

**验收标准**：
- 插件能在 Obsidian 中加载
- 控制台显示启动日志
- 不报错

**预计时间**：1.5 天

---

### 任务 2.2：日志模块开发（5-7天）

**参考文档**：`docs/Obsidian Logger 项目开发方案.md` 第 2.1-2.3 节

#### 子任务 2.2.1：Console 拦截器（2天）

**文件**：`src/logger/console-interceptor.ts`

**核心功能**：
- 保存原始 console 引用
- 创建包装函数拦截 `console.log/error/warn/debug`
- 防死循环机制（使用 `isLogging` 标志位）
- 参数序列化（处理对象、数组、Error）

**预计时间**：2 天

---

#### 子任务 2.2.2：日志收集器（1天）

**文件**：`src/logger/log-collector.ts`

**核心功能**：
- 接收拦截的日志数据
- 添加时间戳（HH:MM:SS.mmm）
- 格式化为标准格式：`[时间] [级别] 消息`
- 缓冲区管理（最多 100 条）
- 触发刷新（条件：100条 或 500ms）

**预计时间**：1 天

---

#### 子任务 2.2.3：文件管理器（2-3天）

**文件**：`src/logger/file-manager.ts`

**核心功能**：
- 管理日志文件路径：`vault/../obsidian-logger/obsidian-debug.log`
- 批量写入（追加模式）
- 文件轮转（10MB 阈值）
- 异常处理（磁盘满、权限不足）

**预计时间**：2-3 天

---

### 任务 2.3：Auto-Reload 模块开发（5-7天）

**参考文档**：`docs/architecture/Auto-Reload架构设计.md`

#### 子任务 2.3.1：文件监听器（2天）

**文件**：`src/auto-reload/file-watcher.ts`

**核心功能**：
- 定时检查插件文件（默认 1000ms 间隔）
- 检查 `main.js` 修改时间变化
- 维护时间戳缓存
- 触发重载回调

**预计时间**：2 天

---

#### 子任务 2.3.2：智能识别器（2天）

**文件**：`src/auto-reload/smart-identifier.ts`

**核心功能**：
- 实现评分算法（3个特征）
  - Source Map 检测：+5分
  - 最近修改（24小时内）：+3分
  - 文件大小（>50KB）：+2分
- 阈值判断（>=5分为开发插件）

**预计时间**：2 天

---

#### 子任务 2.3.3：插件重载器（1-2天）

**文件**：`src/auto-reload/plugin-reloader.ts`

**核心功能**：
- 执行禁用/启用插件
- 等待 100ms 延迟
- 记录重载日志
- 显示通知（可选）

**预计时间**：1-2 天

---

### 任务 2.4：设置界面开发（3-4天）

**文件**：`src/settings.ts`

**核心功能**：
1. 日志模块设置区
2. Auto-Reload 模块设置区
3. 运行状态区

**预计时间**：3-4 天

---

### 任务 2.5：插件集成测试（2天）

**测试场景**：
1. 日志收集完整流程
2. Auto-Reload 三种模式
3. 设置界面操作
4. 异常情况处理
5. 性能测试

**验收标准**：
- 所有功能正常工作
- CPU < 5%，内存 < 60MB
- 无严重 Bug

**预计时间**：2 天

---

## 🌐 阶段三：MCP Server 开发（1-2周）

### 任务 3.1：MCP Server 基础框架（2天）

**文件**：`mcp-server/src/mcp_obsidian_logger.py`

**核心任务**：
- 初始化 MCP SDK
- 实现 JSON-RPC 通信
- 添加日志记录
- 实现工具注册机制

**预计时间**：2 天

---

### 任务 3.2：日志工具实现（3-4天）

**需实现的 6 个工具**：
1. read_logs（1天）
2. get_log_summary（0.5天）
3. get_recent_errors（0.5天）
4. analyze_errors（1天）
5. get_log_file_path（0.5天）
6. clear_logs（0.5天）

**验收标准**：
- 每个工具功能正确
- 参数验证完整
- 错误处理友好
- 响应时间 < 500ms

**预计时间**：3-4 天

---

### 任务 3.3：Auto-Reload 工具实现（2-3天）

**需实现的 6 个工具**：
1. get_auto_reload_status（0.5天）
2. get_auto_reload_mode（0.5天）
3. set_auto_reload_mode（0.5天）
4. manage_watched_plugins（1天）
5. trigger_plugin_reload（0.5天）
6. get_reload_statistics（1天）

**预计时间**：2-3 天

---

### 任务 3.4：MCP Server 集成测试（2天）

**测试内容**：
- 所有 12 个工具
- 并发调用
- 缓存一致性
- 性能基准

**预计时间**：2 天

---

## 📖 阶段四：文档编写（5-7天）

### 任务 4.1：用户文档（3天）

**需要编写的文档**：
1. README.md
2. USER_MANUAL.md
3. docs/guides/快速开始指南.md

**预计时间**：3 天

---

### 任务 4.2：开发者文档（2天）

**需要编写的文档**：
1. DEVELOPMENT.md
2. CONTRIBUTING.md
3. docs/api/MCP-Tools-API.md

**预计时间**：2 天

---

### 任务 4.3：文档审核（1天）

**审核内容**：
- 技术准确性
- 用户友好性
- 完整性检查
- 格式统一

**预计时间**：1 天

---

## 🧪 阶段五：测试与发布（3-5天）

### 任务 5.1：单元测试（2天）

**TypeScript 测试**（使用 Jest）：
- 日志拦截器测试
- 缓冲区管理测试
- 文件操作测试
- Auto-Reload 逻辑测试

**Python 测试**（使用 pytest）：
- 工具函数测试
- 缓存系统测试
- 文件监听测试

**目标**：覆盖率 > 80%

**预计时间**：2 天

---

### 任务 5.2：性能测试（1天）

**测试项目**：
- CPU 占用（目标 < 5%）
- 内存占用（目标 < 60MB）
- 响应时间（目标 < 500ms）
- 长时间稳定性（运行 24 小时）

**预计时间**：1 天

---

### 任务 5.3：发布准备（1天）

**任务清单**：
- 创建 CHANGELOG.md
- 打包发布版本
- 创建 GitHub Release
- 编写 Release Notes
- 发布到 GitHub

**验收标准**：
- 所有测试通过
- 文档完整
- 安装脚本正常
- Release 成功发布

**预计时间**：1 天

---

## 🎯 关键里程碑

| 时间节点 | 里程碑 | 验收标准 |
|----------|--------|----------|
| Week 1 结束 | 环境搭建完成，插件能加载 | 插件在 Obsidian 中正常启动 |
| Week 2 结束 | 日志模块基本完成 | 日志能正确收集和写入 |
| Week 3 结束 | Auto-Reload 模块完成，插件功能完成 | 三种模式都能正常工作 |
| Week 4 结束 | MCP Server 完成 | 12 个工具全部实现并测试通过 |
| Week 5 结束 | 文档完成 | 用户和开发者文档齐全 |
| Week 6 结束 | 测试完成，v1.0 发布 | 所有测试通过，正式发布 |

---

## ⚠️ 风险与应对

### 风险 1：TypeScript/Obsidian API 不熟悉
- **影响**：开发速度慢，可能出现架构问题
- **应对**：
  - 预留额外学习时间（2-3天）
  - 参考官方示例插件
  - 查阅 Obsidian API 文档

### 风险 2：MCP SDK 使用问题
- **影响**：MCP Server 开发受阻
- **应对**：
  - 查阅 MCP 官方文档
  - 参考其他 MCP Server 实现
  - 简化工具实现，先保证核心功能

### 风险 3：性能不达标
- **影响**：用户体验差，无法发布
- **应对**：
  - 及早进行性能测试
  - 预留优化时间（2-3天）
  - 使用性能分析工具定位瓶颈

---

**文档版本**：v1.0  
**制定日期**：2025-11-02  
**维护者**：LINYF510
