# CI/CD 编码问题修复报告

## 📅 修复日期
2025-11-08

## 🐛 问题描述

### 工作流运行信息
- **工作流运行ID**: 19194468735
- **工作流名称**: Tests（第 6 次运行）
- **运行时间**: 2025-11-08 14:41:33 UTC
- **链接**: https://github.com/LINYF510/Obsidian-Logger-with-Plugin-and-MCP/actions/runs/19194468735
- **状态**: ❌ 失败

### 错误信息

#### 主要错误：UnicodeEncodeError（字符编码错误）

```
UnicodeEncodeError: 'charmap' codec can't encode characters in position 21-24: 
character maps to <undefined>

C:\hostedtoolcache\windows\Python\3.10.11\x64\lib\encodings\cp1252.py:19
```

#### 受影响范围
- **失败测试**: 15 个 `test_log_manager.py` 测试
- **通过测试**: 32 个
- **覆盖率**: 29.58%（要求 ≥ 45%）

### 测试失败列表
```
tests/test_log_manager.py::test_file_exists ❌
tests/test_log_manager.py::test_get_file_size ❌
tests/test_log_manager.py::test_parse_log_line_valid ❌
tests/test_log_manager.py::test_parse_log_line_invalid ❌
tests/test_log_manager.py::test_read_logs ❌
tests/test_log_manager.py::test_read_logs_filtered ❌
tests/test_log_manager.py::test_get_summary_with_logs ❌
tests/test_log_manager.py::test_get_recent_errors ❌
tests/test_log_manager.py::test_get_recent_errors_no_errors ❌
tests/test_log_manager.py::test_analyze_errors ❌
tests/test_log_manager.py::test_clear_logs_with_backup ❌
tests/test_log_manager.py::test_clear_logs_without_backup ❌
tests/test_log_manager.py::test_classify_error ❌
tests/test_log_manager.py::test_format_file_size ❌
tests/test_log_manager.py::test_format_relative_time ❌
```

## 🔍 根本原因分析

### 问题 1：编码错误（主要问题）

**原因**：
- 运行环境是 **Windows 系统**，默认使用 CP1252 编码
- `conftest.py` 中的 fixture 在创建临时文件时使用 `mode='w'`，未指定 `encoding='utf-8'`
- 测试代码中包含**中文字符**（"测试日志"、"测试错误"等），无法用 CP1252 编码表示
- Fixture `temp_log_file` 在写入文件时抛出 `UnicodeEncodeError`

**问题代码**：
```python
# mcp-server/tests/conftest.py (修复前)
with tempfile.NamedTemporaryFile(mode='w', suffix='.log', delete=False) as f:
    f.write('[10:30:45.123] [LOG] 测试日志 1\n')  # ❌ 中文无法在 CP1252 中编码
```

### 问题 2：缺少包安装步骤

**原因**：
- `.github/workflows/test.yml` 中缺少 `pip install -e .` 步骤
- 导致测试时包未被正确安装
- 覆盖率计算不准确，从本地的 47.51% 降到 29.58%

### 问题 3：环境变量未设置

**原因**：
- CI/CD 环境中未设置 UTF-8 编码相关的环境变量
- `PYTHONIOENCODING` 和 `PYTHONUTF8` 未配置

## ✅ 解决方案

### 修复 1：conftest.py 添加 UTF-8 编码

#### 修改所有文件操作的编码

```python
# 修复前 ❌
with tempfile.NamedTemporaryFile(mode='w', suffix='.log', delete=False) as f:
    f.write('[10:30:45.123] [LOG] 测试日志 1\n')

# 修复后 ✅
with tempfile.NamedTemporaryFile(mode='w', encoding='utf-8', suffix='.log', delete=False) as f:
    f.write('[10:30:45.123] [LOG] 测试日志 1\n')
```

#### 添加环境变量设置

```python
# mcp-server/tests/conftest.py (开头添加)
import os

# 确保 UTF-8 编码（Windows 环境兼容）
os.environ['PYTHONIOENCODING'] = 'utf-8'
```

#### JSON 文件添加 ensure_ascii=False

```python
# 修复前 ❌
json.dump(config, f)

# 修复后 ✅
json.dump(config, f, ensure_ascii=False)
```

### 修复 2：GitHub Actions 工作流

#### 添加包安装步骤

```yaml
# .github/workflows/test.yml
- name: Install package in editable mode
  working-directory: ./mcp-server
  run: pip install -e .
```

#### 添加环境变量

```yaml
- name: Run tests with pytest
  working-directory: ./mcp-server
  env:
    PYTHONIOENCODING: utf-8
    PYTHONUTF8: 1
  run: pytest --cov=src --cov-report=xml --cov-report=term
```

## 📝 修改的文件

### 1. mcp-server/tests/conftest.py

**修改内容**：
- 添加环境变量设置（第 10 行）
- `temp_log_file` fixture 添加 `encoding='utf-8'`（第 23 行）
- `empty_log_file` fixture 添加 `encoding='utf-8'`（第 35 行）
- `temp_config_file` fixture 添加 `encoding='utf-8'` 和 `ensure_ascii=False`（第 54-56 行）
- `temp_plugin_data` fixture 添加 `encoding='utf-8'` 和 `ensure_ascii=False`（第 86-88 行）

### 2. .github/workflows/test.yml

**修改内容**：
- 添加 "Install package in editable mode" 步骤（第 77-79 行）
- 添加环境变量 `PYTHONIOENCODING` 和 `PYTHONUTF8`（第 83-85 行）

## 📊 修复后验证

### 本地测试结果（Windows 环境）

```bash
$ cd mcp-server && python -m pytest tests/ -v
============================= test session starts =============================
platform win32 -- Python 3.12.9, pytest-8.4.2, pluggy-1.5.0
collected 47 items

tests/test_cache.py::TestLogCache::test_init PASSED                      [  2%]
...
tests/test_log_manager.py::TestLogManager::test_format_relative_time PASSED [100%]

============================= 47 passed in 3.31s ==============================
```

### 测试统计
- ✅ **47/47 测试全部通过**
- ✅ **覆盖率**: 47.51%（要求 ≥ 45%）
- ✅ **0 个失败**
- ✅ **耗时**: 3.31 秒

### 覆盖率详情

| 模块                         | 语句数 | 缺失 | 覆盖率 | 说明                |
|------------------------------|--------|------|--------|---------------------|
| src/__init__.py              | 2      | 2    | 0%     | 入口文件，无需测试   |
| src/cache.py                 | 94     | 16   | 83%    | ✅ 高覆盖率         |
| src/config_manager.py        | 120    | 33   | 72%    | ✅ 良好覆盖率       |
| src/file_monitor.py          | 71     | 71   | 0%     | ⚠️ 待添加测试       |
| src/log_manager.py           | 232    | 34   | 85%    | ✅ 高覆盖率         |
| src/mcp_obsidian_logger.py   | 245    | 245  | 0%     | ⚠️ 主程序，集成测试  |
| **总计**                     | **764**| **401** | **47.51%** | ✅ **达标** |

## 🔧 技术要点

### 1. Python 跨平台编码最佳实践

**DO（正确）**：
```python
# 1. 明确指定编码
with open(file_path, 'w', encoding='utf-8') as f:
    f.write('中文内容')

# 2. tempfile 也要指定编码
with tempfile.NamedTemporaryFile(mode='w', encoding='utf-8', delete=False) as f:
    f.write('中文内容')

# 3. JSON 处理中文
json.dump(data, f, ensure_ascii=False)

# 4. 设置环境变量
os.environ['PYTHONIOENCODING'] = 'utf-8'
```

**DON'T（错误）**：
```python
# ❌ 不指定编码（系统默认，可能是 CP1252）
with open(file_path, 'w') as f:
    f.write('中文内容')

# ❌ JSON 默认转义中文
json.dump(data, f)  # 中文会变成 \uXXXX
```

### 2. Windows 环境特别注意事项

| 系统      | 默认编码 | 建议做法                        |
|-----------|----------|---------------------------------|
| Linux/Mac | UTF-8    | 通常无需特殊处理                |
| Windows   | CP1252   | **必须**明确指定 `encoding='utf-8'` |

### 3. GitHub Actions 环境变量

```yaml
env:
  PYTHONIOENCODING: utf-8  # 设置 Python I/O 编码
  PYTHONUTF8: 1            # Python 3.7+ UTF-8 模式
```

### 4. pytest 配置

```ini
[pytest]
testpaths = tests
pythonpath = src
addopts = 
    --cov=src
    --cov-report=term-missing
    --cov-report=html
    --cov-fail-under=45
    -v
```

## 📚 相关文档更新

- ✅ `docs/misc/CI-CD-编码问题修复报告.md` - 本文档
- ✅ `docs/misc/CI-CD-测试路径修复报告.md` - 上一次修复
- ✅ `docs/misc/CI-CD-修复摘要.md` - 快速参考

## 🚀 下一步行动

### 1. 提交更改

```bash
git add mcp-server/tests/conftest.py
git add .github/workflows/test.yml
git add docs/misc/CI-CD-编码问题修复报告.md

git commit -m "fix(tests): 修复 Windows 环境下的 UTF-8 编码问题

- 所有文件操作添加 encoding='utf-8' 参数
- JSON 操作添加 ensure_ascii=False
- GitHub Actions 添加环境变量设置
- 添加 pip install -e . 步骤确保包正确安装

修复内容：
- mcp-server/tests/conftest.py
- .github/workflows/test.yml

测试结果：
- 所有 47 个测试通过
- 覆盖率 47.51% (要求 ≥ 45%)

Fixes: CI/CD 工作流运行 #19194468735"
```

### 2. 推送到远程仓库

```bash
git push origin main
```

### 3. 监控 CI/CD

- 访问: https://github.com/LINYF510/Obsidian-Logger-with-Plugin-and-MCP/actions
- 验证 Windows/Linux/macOS 所有平台测试通过
- 确认覆盖率报告正常上传

## 📖 经验教训

### 1. 跨平台开发的编码陷阱

**问题**：本地（macOS/Linux）开发一切正常，CI（Windows）失败

**原因**：
- 开发者在 UTF-8 环境中测试，未发现编码问题
- Windows 默认使用系统本地编码（CP1252）
- 中文字符在 CP1252 中无法表示

**解决**：
- **始终明确指定 `encoding='utf-8'`**
- 在 CI 矩阵中包含 Windows 环境
- 使用包含非 ASCII 字符的测试数据

### 2. CI/CD 与本地环境的差异

| 方面              | 本地开发                 | CI/CD 环境             | 最佳实践                          |
|-------------------|-------------------------|------------------------|-----------------------------------|
| 编码              | 可能是 UTF-8            | Windows 是 CP1252      | 明确指定 `encoding='utf-8'`      |
| 包安装            | 可能未安装或手动安装     | 需要明确步骤           | 添加 `pip install -e .`          |
| 环境变量          | IDE 自动设置            | 需要明确配置           | 在工作流中设置环境变量            |
| 测试运行          | 可能直接运行源码         | 应该测试安装后的包      | 使用标准安装流程                  |

### 3. 测试覆盖率差异的原因

**本地**: 47.51%  
**CI（修复前）**: 29.58%  

**原因**：缺少 `pip install -e .` 导致某些模块未被正确导入和测试

### 4. 编码问题调试技巧

```python
# 检查当前编码
import sys
print(sys.getdefaultencoding())      # 'utf-8' or 'cp1252'
print(sys.stdout.encoding)           # 可能是 'cp1252'

# 检查文件编码
with open('test.txt', 'rb') as f:
    data = f.read()
    print(data)  # 查看原始字节

# 设置环境变量
import os
os.environ['PYTHONIOENCODING'] = 'utf-8'
```

## ✅ 验证清单

修复完成后，确保：

- [x] 所有文件操作指定 `encoding='utf-8'`
- [x] JSON 操作使用 `ensure_ascii=False`
- [x] GitHub Actions 添加环境变量
- [x] 添加 `pip install -e .` 步骤
- [x] 本地测试全部通过（47/47）
- [x] 覆盖率达标（47.51% ≥ 45%）
- [x] 修复文档已创建

## 📚 参考资料

- [Python Unicode HOWTO](https://docs.python.org/3/howto/unicode.html)
- [tempfile - Generate temporary files and directories](https://docs.python.org/3/library/tempfile.html)
- [GitHub Actions - Setting environment variables](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#env)
- [pytest Documentation](https://docs.pytest.org/)
- [PEP 540 -- Add a new UTF-8 Mode](https://www.python.org/dev/peps/pep-0540/)

---

**修复完成时间**: 2025-11-08  
**修复人员**: AI Assistant  
**审核状态**: ✅ 待审核  
**前置修复**: CI-CD-测试路径修复报告.md (#19096597522)

