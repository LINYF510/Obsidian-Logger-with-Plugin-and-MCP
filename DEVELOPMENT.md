# 开发指南

本文档为 Obsidian Logger 项目的开发者提供完整的开发指南，包括环境设置、开发工作流、技术架构和最佳实践。

---

## 📋 目录

- [快速开始](#快速开始)
- [环境要求](#环境要求)
- [项目结构](#项目结构)
- [开发工作流](#开发工作流)
- [技术架构](#技术架构)
- [核心模块详解](#核心模块详解)
- [测试指南](#测试指南)
- [调试技巧](#调试技巧)
- [性能优化](#性能优化)
- [发布流程](#发布流程)

---

## 快速开始

### 克隆并设置项目

```bash
# 1. 克隆仓库
git clone https://github.com/LINYF510/Obsidian-Logger-with-Plugin-and-MCP.git
cd Obsidian-Logger-with-Plugin-and-MCP

# 2. 安装插件依赖
cd global-logger
npm install

# 3. 安装 MCP Server 依赖
cd ../mcp-server
pip install -r requirements.txt
pip install -r requirements-dev.txt  # 开发依赖（包含测试工具）
```

### 开发模式启动

```bash
# 启动插件 Watch 模式（自动编译）
cd global-logger
npm run dev

# 另开终端，启动 MCP Server（用于测试）
cd mcp-server
python src/mcp_obsidian_logger.py config.json
```

### 链接到 Obsidian

```bash
# Windows
cd scripts
.\link-plugin.bat "C:\path\to\your\vault"

# macOS/Linux
cd scripts
./link-plugin.sh /path/to/your/vault
```

---

## 环境要求

### 必需软件

| 软件 | 最低版本 | 推荐版本 | 说明 |
|------|---------|---------|------|
| Node.js | 16.0.0 | 18.x LTS | 用于插件开发 |
| npm | 7.0.0 | 8.x | Node.js 包管理器 |
| Python | 3.8.0 | 3.10+ | 用于 MCP Server |
| pip | 20.0.0 | 最新 | Python 包管理器 |
| Obsidian | 0.13.0 | 最新 | 测试环境 |
| Git | 2.0.0 | 最新 | 版本控制 |

### 推荐工具

- **IDE**: Cursor（推荐）或 VSCode
- **Shell**: PowerShell 7+（Windows）或 Bash（macOS/Linux）
- **调试工具**: Chrome DevTools（Obsidian 内置）
- **测试工具**: Jest（TypeScript）、pytest（Python）

### 开发环境检查

```bash
# 检查版本
node --version    # 应该 >= 16.0.0
npm --version     # 应该 >= 7.0.0
python --version  # 应该 >= 3.8.0
pip --version     # 应该 >= 20.0.0

# 验证安装
cd global-logger && npm install && npm run build
cd ../mcp-server && pip install -r requirements.txt && pytest
```

---

## 项目结构

### 顶层结构

```
Obsidian-Logger-with-Plugin-and-MCP/
├── global-logger/          # Obsidian 插件（TypeScript）
├── mcp-server/             # MCP Server（Python）
├── docs/                   # 完整文档
├── scripts/                # 自动化脚本
├── tests/                  # 集成测试
├── examples/               # 使用示例
├── README.md               # 项目概览
├── DEVELOPMENT.md          # 开发指南（本文档）
├── CONTRIBUTING.md         # 贡献指南
├── CHANGELOG.md            # 更新日志
└── LICENSE                 # MIT 许可证
```

### 插件结构（global-logger/）

```
global-logger/
├── src/
│   ├── logger/             # 日志模块
│   │   ├── __tests__/      # 单元测试
│   │   ├── console-interceptor.ts    # Console 拦截器
│   │   ├── log-collector.ts          # 日志收集器
│   │   ├── file-manager.ts           # 文件管理器
│   │   ├── log-stats.ts              # 日志统计
│   │   └── index.ts                  # 模块导出
│   ├── auto-reload/        # Auto-Reload 模块
│   │   ├── file-watcher.ts           # 文件监听器
│   │   ├── plugin-reloader.ts        # 插件重载器
│   │   ├── smart-identifier.ts       # 智能识别算法
│   │   ├── mode-manager.ts           # 模式管理器
│   │   ├── reload-stats.ts           # 重载统计
│   │   └── index.ts                  # 模块导出
│   ├── shared/             # 共享模块
│   │   ├── __tests__/      # 单元测试
│   │   ├── types.ts        # 类型定义
│   │   └── utils.ts        # 工具函数
│   ├── main.ts             # 插件主入口
│   └── settings.ts         # 设置界面
├── __mocks__/              # Jest Mock 文件
├── manifest.json           # 插件元数据
├── package.json            # npm 配置
├── tsconfig.json           # TypeScript 配置
├── esbuild.config.mjs      # 构建配置
└── jest.config.js          # 测试配置
```

### MCP Server 结构（mcp-server/）

```
mcp-server/
├── src/
│   ├── mcp_obsidian_logger.py    # 主程序和工具定义
│   ├── config_manager.py         # 配置管理
│   ├── log_manager.py            # 日志文件管理
│   ├── cache.py                  # 缓存系统
│   └── file_monitor.py           # 文件监听
├── tests/
│   ├── conftest.py               # pytest 配置
│   ├── test_log_manager.py
│   ├── test_config_manager.py
│   └── test_cache.py
├── config.example.json           # 配置示例
├── create-config.py              # 配置向导
├── requirements.txt              # 运行时依赖
├── requirements-dev.txt          # 开发依赖
├── pyproject.toml                # Python 包配置
└── pytest.ini                    # pytest 配置
```

---

## 开发工作流

### 典型开发流程

```
1. 创建功能分支
   ↓
2. 修改代码并保存
   ↓
3. npm run dev 自动编译（Watch 模式）
   ↓
4. Auto-Reload 自动重载插件（~1秒）
   ↓
5. 在 Obsidian 中测试功能
   ↓
6. 查看日志（通过 MCP 工具或日志文件）
   ↓
7. 编写/更新单元测试
   ↓
8. 运行测试（npm test / pytest）
   ↓
9. 提交代码（遵循提交规范）
   ↓
10. 创建 Pull Request
```

### 常用命令

#### 插件开发

```bash
# 开发模式（Watch 自动编译）
npm run dev

# 生产构建
npm run build

# 运行测试
npm test

# Watch 模式测试
npm test -- --watch

# 生成覆盖率报告
npm test -- --coverage

# 代码检查
npm run lint
```

#### MCP Server 开发

```bash
# 运行测试
pytest

# 详细输出
pytest -v

# 生成覆盖率报告
pytest --cov=src --cov-report=html

# 运行特定测试
pytest tests/test_log_manager.py::test_read_logs

# 代码格式化
black src/ tests/

# 类型检查
mypy src/
```

---

## 技术架构

### 系统架构（三层）

```
┌─────────────────────────────────────────────┐
│           Cursor IDE（应用层）               │
│  - 用户交互                                  │
│  - AI 分析                                   │
└─────────────────┬───────────────────────────┘
                  │ MCP 协议（JSON-RPC）
                  ↓
┌─────────────────────────────────────────────┐
│         MCP Server（中间层）                 │
│  - 12 个工具接口                             │
│  - 日志读取和分析                            │
│  - Auto-Reload 管理                          │
│  - 缓存系统                                  │
│  - 文件监听                                  │
└─────────────────┬───────────────────────────┘
                  │ 文件系统 API
                  ↓
┌─────────────────────────────────────────────┐
│    Global Logger 插件（数据+控制层）          │
│  ┌───────────────┐  ┌───────────────┐      │
│  │  日志模块      │  │ Auto-Reload    │      │
│  │  - 拦截       │  │  - 文件监听    │      │
│  │  - 收集       │  │  - 智能识别    │      │
│  │  - 写入       │  │  - 自动重载    │      │
│  └───────────────┘  └───────────────┘      │
└─────────────────┬───────────────────────────┘
                  │ Obsidian Plugin API
                  ↓
┌─────────────────────────────────────────────┐
│      Obsidian 核心 + 插件生态                │
└─────────────────────────────────────────────┘
```

### 数据流

#### 日志流

```
Console 输出
  → Console 拦截器（函数劫持）
    → 日志收集器（格式化 + 缓冲）
      → 文件管理器（批量写入）
        → 日志文件（../obsidian-logger/obsidian-debug.log）
          → 文件监听器（watchdog）
            → 缓存更新
              → MCP 工具（read_logs 等）
                → Cursor AI 分析
```

#### Auto-Reload 流

```
文件修改（main.js/manifest.json/styles.css）
  → 文件监听器（定时检查）
    → 时间戳比较
      → 防抖处理（750ms）
        → 插件重载器
          → app.plugins.disablePlugin()
          → app.plugins.enablePlugin()
        → 重载日志记录
        → 统计更新
      → MCP 工具（get_reload_statistics 等）
```

### 核心设计模式

1. **观察者模式**：文件监听和事件通知
2. **单例模式**：插件实例、缓存管理器
3. **策略模式**：三种 Auto-Reload 模式
4. **工厂模式**：日志条目创建
5. **代理模式**：Console 拦截

---

## 核心模块详解

### 1. 日志模块

#### Console 拦截器（console-interceptor.ts）

```typescript
/**
 * 核心功能：拦截 console 方法
 * 防死循环机制：使用 isLogging 标志位
 */
class ConsoleInterceptor {
  private isLogging = false;
  
  install() {
    const originalLog = console.log;
    console.log = (...args) => {
      if (this.isLogging) return;  // 防止递归
      this.isLogging = true;
      originalLog(...args);          // 保持原有功能
      this.onLogEntry('LOG', args);  // 收集日志
      this.isLogging = false;
    };
  }
}
```

#### 日志收集器（log-collector.ts）

```typescript
/**
 * 核心功能：
 * - 格式化日志：[HH:MM:SS.mmm] [LEVEL] message
 * - 缓冲管理：最多 100 条
 * - 触发刷新：100 条或 500ms
 */
class LogCollector {
  private buffer: string[] = [];
  private flushTimer: NodeJS.Timeout;
  
  addEntry(level: string, args: any[]) {
    const entry = this.formatEntry(level, args);
    this.buffer.push(entry);
    
    if (this.buffer.length >= 100) {
      this.flush();
    }
  }
  
  private formatEntry(level: string, args: any[]): string {
    const timestamp = this.getTimestamp();
    const message = this.serializeArgs(args);
    return `[${timestamp}] [${level}] ${message}`;
  }
}
```

### 2. Auto-Reload 模块

#### 智能识别算法（smart-identifier.ts）

```typescript
/**
 * 评分算法：
 * - Source Map 检测：+5 分
 * - 最近修改（24h）：+3 分
 * - 文件大小（<50KB）：+2 分
 * - 阈值：≥ 5 分为开发插件
 */
class SmartIdentifier {
  identifyDevelopmentPlugins(plugins: Plugin[]): string[] {
    return plugins
      .map(plugin => ({
        id: plugin.id,
        score: this.calculateScore(plugin)
      }))
      .filter(p => p.score >= 5)
      .map(p => p.id);
  }
  
  private calculateScore(plugin: Plugin): number {
    let score = 0;
    if (this.hasSourceMap(plugin)) score += 5;
    if (this.isRecentlyModified(plugin, 24)) score += 3;
    if (this.isSmallFile(plugin, 50)) score += 2;
    return score;
  }
}
```

#### 文件监听器（file-watcher.ts）

```typescript
/**
 * 核心功能：
 * - 定时检查：默认 1000ms 间隔
 * - 时间戳缓存：记录上次修改时间
 * - 防抖机制：750ms 延迟
 */
class FileWatcher {
  private timestampCache: Map<string, number> = new Map();
  
  async checkChanges(pluginId: string) {
    const currentMTime = await this.getFileModTime(pluginId);
    const cachedMTime = this.timestampCache.get(pluginId);
    
    if (currentMTime > cachedMTime) {
      this.timestampCache.set(pluginId, currentMTime);
      this.debounceReload(pluginId);  // 防抖触发
    }
  }
}
```

### 3. MCP Server

#### 工具架构

```python
# 使用 MCP SDK 装饰器定义工具
@mcp.tool()
def read_logs(lines: int = 50, level: str = "all") -> str:
    """读取日志内容
    
    Args:
        lines: 读取行数，默认 50
        level: 日志级别过滤（all/LOG/ERROR/WARN/DEBUG）
        
    Returns:
        格式化的日志内容
    """
    # 1. 参数验证
    if lines < 1 or lines > 10000:
        return "❌ lines 必须在 1-10000 之间"
    
    # 2. 读取日志（使用缓存）
    logs = log_manager.read_logs(lines, level)
    
    # 3. 格式化输出
    return format_logs_output(logs, lines, level)
```

#### 缓存系统

```python
class Cache:
    """多层缓存系统"""
    
    def __init__(self, max_size: int = 1000):
        self.log_entries = deque(maxlen=max_size)  # 环形缓冲区
        self.error_stats = {}                      # 错误统计
        self.file_metadata = {}                    # 文件元数据
        self.search_cache = TTLCache(maxsize=100, ttl=300)  # 5分钟过期
```

---

## 测试指南

### 测试策略

- **单元测试**：覆盖率 > 80%
- **集成测试**：端到端工作流
- **性能测试**：CPU < 5%，内存 < 60MB

### 单元测试示例

#### TypeScript（Jest）

```typescript
describe('LogCollector', () => {
  it('should format log entry correctly', () => {
    const collector = new LogCollector(100, 500, jest.fn());
    collector.addEntry('LOG', ['test message']);
    
    expect(collector.buffer[0]).toMatch(
      /\[\d{2}:\d{2}:\d{2}\.\d{3}\] \[LOG\] test message/
    );
  });
  
  it('should flush when buffer is full', () => {
    const mockFlush = jest.fn();
    const collector = new LogCollector(100, 500, mockFlush);
    
    for (let i = 0; i < 100; i++) {
      collector.addEntry('LOG', [`message ${i}`]);
    }
    
    expect(mockFlush).toHaveBeenCalledTimes(1);
  });
});
```

#### Python（pytest）

```python
class TestLogManager:
    def test_read_logs_with_filter(self, log_manager):
        # 准备测试数据
        log_manager.write_logs([
            "[10:00:00] [ERROR] error 1",
            "[10:00:01] [LOG] info 1",
            "[10:00:02] [ERROR] error 2"
        ])
        
        # 执行测试
        errors = log_manager.read_logs(level="ERROR")
        
        # 验证结果
        assert len(errors) == 2
        assert all("ERROR" in log for log in errors)
```

---

## 调试技巧

### 插件调试

```typescript
// 1. 在代码中添加断点
debugger;

// 2. 打开 Obsidian 开发者工具
// Ctrl+Shift+I (Windows/Linux) 或 Cmd+Option+I (macOS)

// 3. 查看 Console 输出
console.log('Debug info:', variable);

// 4. 使用 Obsidian Logger 自己的日志
console.log('[DEBUG] Plugin loaded:', this.manifest.id);
```

### MCP Server 调试

```python
# 1. 添加详细日志
import logging
logging.basicConfig(level=logging.DEBUG)

# 2. 使用 pdb 断点
import pdb; pdb.set_trace()

# 3. 查看 MCP 通信日志
# Cursor 会在控制台显示 MCP 协议交互
```

### 常见问题排查

| 问题 | 可能原因 | 解决方法 |
|------|---------|---------|
| 插件不加载 | manifest.json 错误 | 检查 JSON 格式和必需字段 |
| 日志未写入 | 路径权限问题 | 检查日志目录权限 |
| Auto-Reload 不工作 | 文件监听失败 | 检查插件是否在监控列表中 |
| MCP 工具无响应 | 配置文件错误 | 验证 config.json 路径 |

---

## 性能优化

### 性能指标

- CPU 占用：< 5%
- 内存占用：< 60MB
- MCP 响应：< 500ms
- 日志延迟：< 100ms

### 优化技巧

1. **批量操作**：减少 I/O 次数
2. **异步处理**：避免阻塞主线程
3. **缓存策略**：减少重复计算
4. **防抖节流**：降低触发频率
5. **内存管理**：及时释放资源

---

## 发布流程

### 版本号规范

遵循[语义化版本](https://semver.org/)：`MAJOR.MINOR.PATCH`

- MAJOR：不兼容的 API 修改
- MINOR：向下兼容的功能新增
- PATCH：向下兼容的问题修正

### 发布步骤

```bash
# 1. 更新版本号
npm version patch  # 或 minor / major

# 2. 更新 CHANGELOG.md
# 记录本版本的所有变更

# 3. 运行完整测试
npm test
cd ../mcp-server && pytest

# 4. 构建生产版本
npm run build

# 5. 创建 Git 标签
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0

# 6. 创建 GitHub Release
# 上传 main.js, manifest.json, styles.css（如有）
```

---

## 参考资源

- [Obsidian Plugin API](https://docs.obsidian.md/)
- [MCP 协议文档](https://modelcontextprotocol.io/)
- [TypeScript 文档](https://www.typescriptlang.org/docs/)
- [Python 文档](https://docs.python.org/3/)
- [项目完整文档](./docs/)

---

**祝开发顺利！🚀**

