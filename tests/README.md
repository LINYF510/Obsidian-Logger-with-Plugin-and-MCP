# Tests - 测试套件

本目录包含项目的所有测试代码，包括单元测试和集成测试。

## 测试结构

```
tests/
├── unit/              # 单元测试
│   ├── test_logger.py
│   ├── test_cache.py
│   ├── test_file_monitor.py
│   └── test_tools.py
├── integration/       # 集成测试
│   ├── test_mcp_server.py
│   └── test_plugin_flow.py
└── conftest.py        # pytest 配置
```

## 运行测试

### TypeScript 测试（插件）
```bash
cd global-logger
npm test
```

### Python 测试（MCP Server）
```bash
cd mcp-server
pytest
```

### 测试覆盖率
```bash
# Python
pytest --cov=src --cov-report=html

# TypeScript
npm test -- --coverage
```

## 测试要求

- 单元测试覆盖率 > 80%
- 所有关键功能必须有测试
- 集成测试覆盖完整的数据流
- 性能测试确保指标达标

## 测试分类

### 单元测试
- 日志拦截逻辑测试
- 参数序列化测试
- 缓冲区管理测试
- 文件操作测试
- MCP 工具调用测试
- Auto-Reload 触发测试

### 集成测试
- 完整日志流测试（插件 → 文件 → MCP → Cursor）
- 性能测试（10000+ 条日志）
- 错误恢复测试（文件删除、磁盘满）
- 并发访问测试（多个 MCP 工具同时调用）

### 性能测试
- CPU 占用测试（目标 < 5%）
- 内存占用测试（目标 < 60MB）
- 响应时间测试（目标 < 500ms）
- 长时间稳定性测试（运行 24 小时）

## 编写测试

### TypeScript 测试示例
```typescript
import { LogCollector } from '../src/logger/log-collector';

describe('LogCollector', () => {
  it('should collect logs correctly', () => {
    const collector = new LogCollector(100, 500, jest.fn());
    collector.addEntry('LOG', ['test message']);
    expect(collector.getBuffer().length).toBe(1);
  });
});
```

### Python 测试示例
```python
import pytest
from src.cache import LogCache

def test_log_cache():
    cache = LogCache(max_size=10)
    cache.add_entry('LOG', 'test message')
    assert len(cache.cache) == 1
```

## 持续集成

测试在以下情况下自动运行：
- 每次 commit 前（pre-commit hook）
- Pull Request 提交时（GitHub Actions）
- 发布版本前（release workflow）

## 许可证

MIT

