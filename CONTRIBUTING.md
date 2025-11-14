# 贡献指南

感谢你考虑为 Obsidian Logger 做出贡献！我们欢迎各种形式的贡献，包括但不限于：

- 🐛 报告 Bug
- 💡 提出新功能建议
- 📝 改进文档
- 🔧 提交代码修复或新功能
- 🧪 编写测试用例
- 🌍 翻译文档

本指南将帮助你了解如何参与项目贡献。

---

## 📋 目录

- [行为准则](#行为准则)
- [如何贡献](#如何贡献)
  - [报告 Bug](#报告-bug)
  - [提出功能建议](#提出功能建议)
  - [提交代码](#提交代码)
- [开发环境设置](#开发环境设置)
- [代码规范](#代码规范)
- [提交规范](#提交规范)
- [Pull Request 流程](#pull-request-流程)
- [测试指南](#测试指南)
- [文档贡献](#文档贡献)

---

## 行为准则

参与本项目即表示你同意遵守我们的[行为准则](CODE_OF_CONDUCT.md)。请务必阅读并理解其内容，以维护友好和专业的社区环境。

---

## 如何贡献

### 报告 Bug

如果你发现了 Bug，请通过 [GitHub Issues](https://github.com/LINYF510/Obsidian-Logger-with-Plugin-and-MCP/issues) 报告。提交 Bug 报告前，请：

1. **搜索现有 Issues**：确保该问题尚未被报告
2. **使用最新版本**：确认问题在最新版本中仍然存在
3. **提供详细信息**：使用 Bug 报告模板，包含以下信息：

#### Bug 报告模板

```markdown
## Bug 描述
简明扼要地描述问题

## 重现步骤
1. 进入 '...'
2. 点击 '...'
3. 滚动到 '...'
4. 看到错误

## 预期行为
描述你期望发生的行为

## 实际行为
描述实际发生的行为

## 环境信息
- OS: [e.g. Windows 11, macOS 13.0, Ubuntu 22.04]
- Obsidian 版本: [e.g. 1.4.0]
- 插件版本: [e.g. 1.0.0]
- Node.js 版本: [e.g. 18.0.0]
- Python 版本: [e.g. 3.10.0]

## 日志信息
如果可能，请附上相关的日志输出：
- Obsidian Logger 的日志文件
- 浏览器控制台输出
- MCP Server 错误信息

## 截图
如果适用，添加截图以帮助说明问题

## 附加信息
其他任何有助于理解问题的上下文
```

---

### 提出功能建议

我们欢迎新功能建议！提交前请：

1. **检查现有 Issues**：确保该功能尚未被提出
2. **考虑项目范围**：确保建议符合项目目标
3. **提供详细描述**：使用功能请求模板

#### 功能请求模板

```markdown
## 功能描述
简明扼要地描述你想要的功能

## 问题背景
描述这个功能要解决什么问题
例如：我总是因为 [...] 而感到沮丧

## 期望的解决方案
描述你期望的功能如何工作

## 替代方案
描述你考虑过的其他解决方案

## 使用场景
描述具体的使用场景，例如：
- 作为开发者，我希望能够...
- 当我在调试时，我需要...

## 优先级
- [ ] 高：严重影响使用体验
- [ ] 中：有用但不紧急
- [ ] 低：锦上添花

## 附加信息
其他相关的上下文、截图或示例
```

---

### 提交代码

如果你想贡献代码，请遵循以下流程：

#### 1. Fork 项目

点击 GitHub 页面右上角的 "Fork" 按钮，创建项目的个人副本。

#### 2. 克隆仓库

```bash
git clone https://github.com/YOUR_USERNAME/Obsidian-Logger-with-Plugin-and-MCP.git
cd Obsidian-Logger-with-Plugin-and-MCP
```

#### 3. 创建分支

使用描述性的分支名称：

```bash
git checkout -b feature/add-export-function
# 或
git checkout -b fix/memory-leak-in-logger
# 或
git checkout -b docs/improve-readme
```

**分支命名约定**：
- `feature/` - 新功能
- `fix/` - Bug 修复
- `docs/` - 文档更新
- `refactor/` - 代码重构
- `test/` - 测试相关
- `chore/` - 构建/工具配置

#### 4. 进行修改

遵循[代码规范](#代码规范)和[提交规范](#提交规范)。

#### 5. 提交更改

```bash
git add .
git commit -m "feat: add log export function"
```

#### 6. 推送到你的 Fork

```bash
git push origin feature/add-export-function
```

#### 7. 创建 Pull Request

在 GitHub 上创建 Pull Request，详见 [Pull Request 流程](#pull-request-流程)。

---

## 开发环境设置

### 环境要求

- **Node.js** 16+ 和 npm
- **Python** 3.8+ 和 pip
- **Git**
- **Obsidian** 0.13.0+（用于测试）
- **Cursor IDE**（推荐，可选）

### 快速设置

#### 1. 安装插件依赖

```bash
cd global-logger
npm install
```

#### 2. 安装 MCP Server 依赖

```bash
cd ../mcp-server
pip install -r requirements.txt
pip install -r requirements-dev.txt  # 开发依赖
```

#### 3. 配置测试环境

创建测试用的 Obsidian vault，然后链接插件：

```bash
# Windows
cd scripts
.\link-plugin.bat "C:\path\to\your\test-vault"

# macOS/Linux
cd scripts
./link-plugin.sh /path/to/your/test-vault
```

#### 4. 启动开发模式

```bash
cd global-logger
npm run dev  # Watch 模式，自动编译
```

#### 5. 配置 MCP Server

```bash
cd mcp-server
python create-config.py  # 创建配置文件
```

### 开发工具

推荐的 VSCode/Cursor 插件：
- ESLint
- Prettier
- TypeScript Vue Plugin
- Python
- Pylance

---

## 代码规范

### TypeScript 代码规范

#### 命名约定

```typescript
// 变量和函数：camelCase
const logBuffer = [];
function flushLogs() { }

// 类名：PascalCase
class LogCollector { }
class FileManager { }

// 常量：UPPER_SNAKE_CASE
const MAX_BUFFER_SIZE = 100;
const LOG_FILE_PATH = '../obsidian-logger/obsidian-debug.log';

// 私有方法：前缀 _
private _processLogEntry() { }

// 接口：PascalCase，可选前缀 I
interface PluginSettings { }
interface ILogEntry { }

// 类型别名：PascalCase
type LogLevel = 'LOG' | 'ERROR' | 'WARN' | 'DEBUG';
```

#### 代码风格

```typescript
// 缩进：2 个空格
// 最大行长：100 字符
// 最大函数长度：50 行

/**
 * 日志收集器类
 * 负责收集、格式化和缓冲日志条目
 */
class LogCollector {
  private logBuffer: string[] = [];
  private readonly maxBufferSize = 100;

  /**
   * 添加日志条目到缓冲区
   * @param level 日志级别 (LOG, ERROR, WARN, DEBUG)
   * @param message 日志消息
   */
  public addLogEntry(level: string, message: string): void {
    // 实现...
  }
}
```

#### 注释规范

```typescript
// ✅ 好的注释
/**
 * 将日志缓冲区内容写入文件
 * 
 * 此方法会批量写入所有缓冲的日志条目，
 * 并在写入后清空缓冲区。
 * 
 * @throws {Error} 当文件写入失败时
 */
async flushLogs(): Promise<void> {
  // 检查缓冲区是否为空
  if (this.buffer.length === 0) return;
  
  // 批量写入（减少 I/O）
  await this.fileManager.writeLogs(this.buffer);
}

// ❌ 不好的注释
// 写日志
async flushLogs() {
  // 如果缓冲区有东西就写
  if (this.buffer.length > 0) {
    // 写入文件
    await this.fileManager.writeLogs(this.buffer);
  }
}
```

### Python 代码规范

#### 命名约定

```python
# 变量和函数：snake_case
log_cache = []
def read_logs():
    pass

# 类名：PascalCase
class LogCache:
    pass

class FileMonitor:
    pass

# 常量：UPPER_SNAKE_CASE
MAX_CACHE_SIZE = 1000
LOG_FILE_PATH = '../obsidian-logger/obsidian-debug.log'

# 私有方法：前缀 _
def _update_cache(self):
    pass
```

#### 代码风格

```python
# 遵循 PEP 8
# 缩进：4 个空格
# 最大行长：100 字符

from typing import List, Optional
import logging

class LogCache:
    """
    日志缓存系统
    
    负责管理日志条目的内存缓存，提供快速访问和自动失效机制。
    
    Attributes:
        max_size: 最大缓存条目数
        cache: 日志条目列表
    """
    
    def __init__(self, max_size: int = 1000):
        """初始化日志缓存
        
        Args:
            max_size: 最大缓存大小，默认 1000 条
        """
        self.max_size = max_size
        self.cache: List[str] = []
        self._logger = logging.getLogger(__name__)
    
    def add_entry(self, level: str, message: str) -> None:
        """添加日志条目到缓存
        
        Args:
            level: 日志级别
            message: 日志消息
        """
        entry = f"[{level}] {message}"
        self.cache.append(entry)
        
        if len(self.cache) > self.max_size:
            self._evict_oldest()
```

#### 类型注解

```python
# ✅ 完整的类型注解
def process_logs(
    file_path: str,
    lines: int = 50,
    level: Optional[str] = None
) -> List[str]:
    """处理日志文件
    
    Args:
        file_path: 日志文件路径
        lines: 读取行数，默认 50
        level: 日志级别过滤，None 表示不过滤
        
    Returns:
        日志条目列表
    """
    pass

# ❌ 缺少类型注解
def process_logs(file_path, lines=50, level=None):
    pass
```

---

## 提交规范

我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

### 提交消息格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type 类型

- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式（不影响代码运行的变动）
- `refactor`: 重构（既不是新增功能，也不是修复 bug）
- `perf`: 性能优化
- `test`: 添加或修改测试
- `chore`: 构建过程或辅助工具的变动
- `ci`: CI 配置文件和脚本的变动
- `revert`: 回滚 commit

### Scope 范围（可选）

- `logger`: 日志模块
- `auto-reload`: Auto-Reload 模块
- `mcp`: MCP Server
- `settings`: 设置界面
- `docs`: 文档
- `build`: 构建系统
- `deps`: 依赖更新

### 示例

```bash
# 新功能
git commit -m "feat(logger): add log export function"

# Bug 修复
git commit -m "fix(auto-reload): fix memory leak in file watcher"

# 文档更新
git commit -m "docs: update installation guide"

# 性能优化
git commit -m "perf(logger): optimize buffer flush mechanism"

# 重构
git commit -m "refactor(mcp): extract cache logic to separate module"

# Breaking Change（需要在 footer 中说明）
git commit -m "feat(logger): change log format structure

BREAKING CHANGE: log format changed from [time] [level] to {time, level, message}"
```

---

## Pull Request 流程

### PR 准备清单

提交 PR 前，请确保：

- [ ] 代码遵循项目的代码规范
- [ ] 添加了必要的注释和文档字符串
- [ ] 更新了相关文档（如果适用）
- [ ] 添加或更新了测试用例
- [ ] 所有测试通过 (`npm test` 和 `pytest`)
- [ ] 代码通过 linter 检查
- [ ] 提交消息遵循提交规范
- [ ] PR 标题清晰描述变更内容

### PR 描述模板

```markdown
## 变更类型
- [ ] Bug 修复
- [ ] 新功能
- [ ] 重构
- [ ] 文档更新
- [ ] 性能优化
- [ ] 其他（请说明）

## 变更说明
简要描述本 PR 的变更内容

## 相关 Issue
Fixes #(issue编号)
或
Related to #(issue编号)

## 变更详情
详细描述技术实现和设计决策

## 测试
描述如何测试这些变更：
1. 测试步骤 1
2. 测试步骤 2
3. ...

## 截图（如果适用）
添加相关截图

## 检查清单
- [ ] 我已阅读并遵循贡献指南
- [ ] 代码遵循项目规范
- [ ] 添加了测试用例
- [ ] 所有测试通过
- [ ] 更新了文档
- [ ] 提交消息遵循规范

## 附加说明
其他需要 reviewer 注意的信息
```

### Review 流程

1. **自动检查**：GitHub Actions 会自动运行测试和 linter
2. **代码审查**：维护者会审查你的代码
3. **反馈和修改**：根据反馈进行必要的修改
4. **合并**：所有检查通过且得到批准后，PR 将被合并

### PR 最佳实践

- **保持小而专注**：每个 PR 应该只解决一个问题或实现一个功能
- **提供上下文**：在描述中说明"为什么"，而不仅仅是"做了什么"
- **及时响应**：及时回复 reviewer 的评论和问题
- **保持更新**：如果 main 分支有更新，及时 rebase 你的分支

---

## 测试指南

### 运行测试

#### TypeScript 测试（Jest）

```bash
cd global-logger

# 运行所有测试
npm test

# Watch 模式
npm test -- --watch

# 生成覆盖率报告
npm test -- --coverage

# 运行特定测试文件
npm test -- console-interceptor.test.ts
```

#### Python 测试（pytest）

```bash
cd mcp-server

# 运行所有测试
pytest

# 显示详细输出
pytest -v

# 生成覆盖率报告
pytest --cov=src --cov-report=html

# 运行特定测试文件
pytest tests/test_log_manager.py

# 运行特定测试函数
pytest tests/test_log_manager.py::test_read_logs
```

### 编写测试

#### 测试覆盖要求

- 新功能必须有测试覆盖
- Bug 修复应该包含回归测试
- 目标覆盖率：> 80%

#### TypeScript 测试示例

```typescript
import { LogCollector } from '../log-collector';

describe('LogCollector', () => {
  let collector: LogCollector;
  let mockFlush: jest.Mock;

  beforeEach(() => {
    mockFlush = jest.fn();
    collector = new LogCollector(100, 500, mockFlush);
  });

  afterEach(() => {
    collector.cleanup();
  });

  it('should add log entry to buffer', () => {
    collector.addEntry('LOG', ['test message']);
    expect(collector.buffer).toHaveLength(1);
  });

  it('should flush when buffer is full', () => {
    for (let i = 0; i < 100; i++) {
      collector.addEntry('LOG', [`message ${i}`]);
    }
    expect(mockFlush).toHaveBeenCalled();
  });
});
```

#### Python 测试示例

```python
import pytest
from src.log_manager import LogManager

class TestLogManager:
    @pytest.fixture
    def log_manager(self, tmp_path):
        log_file = tmp_path / "test.log"
        return LogManager(str(log_file))
    
    def test_read_logs(self, log_manager):
        # 准备测试数据
        log_manager.write_logs(["test log 1", "test log 2"])
        
        # 执行测试
        logs = log_manager.read_logs(lines=10)
        
        # 验证结果
        assert len(logs) == 2
        assert "test log 1" in logs[0]
    
    def test_read_logs_with_level_filter(self, log_manager):
        # 测试级别过滤功能
        log_manager.write_logs([
            "[10:00:00] [ERROR] error message",
            "[10:00:01] [LOG] info message"
        ])
        
        errors = log_manager.read_logs(level="ERROR")
        assert len(errors) == 1
        assert "ERROR" in errors[0]
```

---

## 文档贡献

### 文档类型

- **用户文档**：README, USER_MANUAL, 使用指南
- **开发者文档**：DEVELOPMENT, API 文档, 架构文档
- **代码注释**：内联注释，JSDoc/Docstring

### 文档规范

- 使用 Markdown 格式
- 中文文档优先，英文文档可选
- 提供清晰的示例代码
- 包含必要的截图或图表
- 保持更新，与代码同步

### 文档结构

```markdown
# 文档标题

> 简短描述

## 目录（可选）

## 概述

## 详细内容
### 小节标题
#### 子标题

## 示例

## 常见问题

## 相关链接
```

---

## 获取帮助

如果你在贡献过程中遇到问题：

- 📖 查阅 [文档](./docs/)
- 💬 在 [Discussions](https://github.com/LINYF510/Obsidian-Logger-with-Plugin-and-MCP/discussions) 中提问
- 🐛 在 [Issues](https://github.com/LINYF510/Obsidian-Logger-with-Plugin-and-MCP/issues) 中报告问题
- 📧 联系维护者：[@LINYF510](https://github.com/LINYF510)

---

## 致谢

感谢所有贡献者的付出！你的贡献使这个项目变得更好。

---

**Happy Contributing! 🎉**

