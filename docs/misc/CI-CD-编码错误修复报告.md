# CI/CD 编码错误修复报告

## 📅 修复日期
2025-11-08

## 🐛 问题描述

### 错误信息
```
UnicodeEncodeError: 'charmap' codec can't encode characters in position 21-24: 
character maps to <undefined>
C:\hostedtoolcache\windows\Python\3.10.11\x64\lib\encodings\cp1252.py:19
```

### 失败的测试
- **测试文件**: `tests/test_log_manager.py`
- **失败数量**: 15 个测试失败
- **通过数量**: 32 个测试通过
- **覆盖率**: 29.58%（要求 ≥ 45%）

### CI/CD 工作流信息
- **工作流运行ID**: 19194468735
- **工作流名称**: Tests（第 6 次运行）
- **运行时间**: 2025-11-08 14:41:33 UTC
- **链接**: https://github.com/LINYF510/Obsidian-Logger-with-Plugin-and-MCP/actions/runs/19194468735

## 🔍 根本原因分析

### 问题 1：字符编码错误（主要问题）

**环境差异**：
- **本地环境**（中国）: UTF-8 编码，中文字符正常工作
- **CI/CD 环境**（Windows）: CP1252 编码，无法处理中文字符

**技术原因**：
在 `mcp-server/tests/conftest.py` 中，所有 `tempfile.NamedTemporaryFile` 调用都没有指定 `encoding` 参数：

```python
# 问题代码 ❌
with tempfile.NamedTemporaryFile(mode='w', suffix='.log', delete=False) as f:
    f.write('[10:30:45.123] [LOG] 测试日志 1\n')  # 中文字符
    f.write('[10:30:46.456] [ERROR] 测试错误\n')  # 中文字符
```

在 Windows CI/CD 环境下：
- 默认编码是 `cp1252`（Windows-1252）
- 无法编码中文字符：`测试日志`、`测试错误`、`测试警告` 等
- 导致 `UnicodeEncodeError`

### 问题 2：测试覆盖率不足（次要问题）

**原因**：
- 15 个测试失败导致覆盖率降低
- 实际覆盖率 29.58% < 要求的 45%
- 修复编码问题后，覆盖率恢复正常

## ✅ 解决方案

### 1. 修复编码问题

#### 修改 `mcp-server/tests/conftest.py`

为所有 `tempfile.NamedTemporaryFile` 调用添加 `encoding='utf-8'` 参数：

**修复前 ❌**：
```python
with tempfile.NamedTemporaryFile(mode='w', suffix='.log', delete=False) as f:
    f.write('[10:30:45.123] [LOG] 测试日志 1\n')
```

**修复后 ✅**：
```python
with tempfile.NamedTemporaryFile(mode='w', suffix='.log', delete=False, encoding='utf-8') as f:
    f.write('[10:30:45.123] [LOG] 测试日志 1\n')
```

**修复的 fixtures**：
- ✅ `temp_log_file()` - 添加 `encoding='utf-8'`
- ✅ `empty_log_file()` - 添加 `encoding='utf-8'`
- ✅ `temp_config_file()` - 添加 `encoding='utf-8'` + `ensure_ascii=False`
- ✅ `temp_plugin_data()` - 添加 `encoding='utf-8'` + `ensure_ascii=False`

### 2. 更新 CI/CD Workflow

#### 修改 `.github/workflows/test.yml`

添加 UTF-8 编码环境变量和包安装步骤：

```yaml
- name: Install package in editable mode
  working-directory: ./mcp-server
  run: pip install -e .

- name: Run tests with pytest
  working-directory: ./mcp-server
  env:
    PYTHONIOENCODING: utf-8  # 设置 Python I/O 编码为 UTF-8
  run: pytest --cov=src --cov-report=xml --cov-report=term
```

**关键改进**：
1. 添加了 `Install package in editable mode` 步骤（与上次修复一致）
2. 为测试步骤设置 `PYTHONIOENCODING=utf-8` 环境变量
3. 确保 Windows 环境也使用 UTF-8 编码

## 📊 修复后验证

### 本地测试结果（Windows 环境）

```bash
$ cd mcp-server && python -m pytest tests/ -v --cov=src

============================= test session starts =============================
platform win32 -- Python 3.12.9, pytest-8.4.2

collected 47 items

tests/test_cache.py::TestLogCache::test_init PASSED                      [  2%]
tests/test_cache.py::TestLogCache::test_add_log_entry PASSED             [  4%]
...（中间省略）...
tests/test_log_manager.py::TestLogManager::test_format_relative_time PASSED [100%]

=============================== tests coverage ================================

Name                         Stmts   Miss  Cover   Missing
----------------------------------------------------------
src\cache.py                    94     16    83%
src\config_manager.py          120     33    72%
src\log_manager.py             232     34    85%
----------------------------------------------------------
TOTAL                          764    401    48%

Required test coverage of 45% reached. Total coverage: 47.51%
============================= 47 passed in 3.69s ==============================
```

### 测试统计
- ✅ **47/47 测试通过**（之前 32 通过 + 15 失败）
- ✅ **覆盖率 47.51%**（之前 29.58%）
- ✅ **0 个失败**
- ✅ **0 个编码错误**

### 覆盖率对比

| 模块                        | 修复前 | 修复后 | 变化     |
|-----------------------------|--------|--------|----------|
| src/cache.py                | -      | 83%    | ✅ 恢复 |
| src/config_manager.py       | -      | 72%    | ✅ 恢复 |
| src/log_manager.py          | -      | 85%    | ✅ 恢复 |
| **总覆盖率**                | 29.58% | 47.51% | **+17.93%** |

## 📝 经验教训

### 1. 跨平台编码最佳实践

**核心原则**：**始终显式指定编码**

```python
# ✅ 好的实践：显式指定 UTF-8
with open(file_path, 'w', encoding='utf-8') as f:
    f.write('中文内容')

with tempfile.NamedTemporaryFile(mode='w', encoding='utf-8') as f:
    f.write('中文内容')

# ❌ 坏的实践：依赖系统默认编码
with open(file_path, 'w') as f:  # 在 Windows 上可能是 cp1252
    f.write('中文内容')  # 会导致 UnicodeEncodeError
```

### 2. JSON 序列化中文字符

```python
# ✅ 正确：保留中文字符
json.dump(data, f, ensure_ascii=False)

# ❌ 错误：中文被转义为 Unicode
json.dump(data, f)  # 中文变成 \u4e2d\u6587
```

### 3. 环境差异检测

| 环境              | 默认编码        | 处理中文 |
|-------------------|----------------|----------|
| Linux/macOS       | UTF-8          | ✅ 支持  |
| Windows (中国)    | GBK/UTF-8      | ✅ 支持  |
| Windows (英文)    | CP1252         | ❌ 不支持|
| CI/CD (GitHub)    | CP1252         | ❌ 不支持|

**教训**：不要假设环境总是 UTF-8，始终显式指定。

### 4. 测试中的编码问题

**问题场景**：
- ✅ 本地开发（中国）：UTF-8 环境，测试通过
- ❌ CI/CD（国际）：CP1252 环境，测试失败
- 开发者可能注意不到问题

**解决方案**：
1. 在代码中显式指定编码
2. 在 CI/CD 中设置 `PYTHONIOENCODING=utf-8`
3. 添加跨平台编码测试

### 5. Python 编码环境变量

```yaml
# 方法 1：pytest 步骤级别设置（推荐）
- name: Run tests with pytest
  env:
    PYTHONIOENCODING: utf-8
  run: pytest

# 方法 2：作业级别设置
jobs:
  test:
    env:
      PYTHONIOENCODING: utf-8

# 方法 3：工作流级别设置
env:
  PYTHONIOENCODING: utf-8
```

## 🔧 修复文件清单

### 修改的文件

1. **mcp-server/tests/conftest.py**
   - 修复 4 个 fixtures 的编码问题
   - 添加 `encoding='utf-8'` 参数
   - 添加 `ensure_ascii=False` 参数（JSON）

2. **.github/workflows/test.yml**
   - 添加 `Install package in editable mode` 步骤
   - 为测试步骤设置 `PYTHONIOENCODING=utf-8`

### 新增的文档

- ✅ `docs/misc/CI-CD-编码错误修复报告.md` - 本文档

## 🚀 下一步行动

### 1. 提交更改

```bash
git add mcp-server/tests/conftest.py
git add .github/workflows/test.yml
git add docs/misc/CI-CD-编码错误修复报告.md

git commit -m "fix(tests): 修复 CI/CD Windows 环境编码错误

- 为所有 tempfile 添加 encoding='utf-8' 参数
- 在 CI/CD workflow 中设置 PYTHONIOENCODING=utf-8
- 所有 47 个测试通过，覆盖率 47.51%

修复内容：
- mcp-server/tests/conftest.py (4 个 fixtures)
- .github/workflows/test.yml (环境变量)

新增文档：
- docs/misc/CI-CD-编码错误修复报告.md

Fixes: CI/CD 工作流运行 #19194468735"
```

### 2. 推送到远程仓库

```bash
git push origin main
```

### 3. 监控 CI/CD

- 访问: https://github.com/LINYF510/Obsidian-Logger-with-Plugin-and-MCP/actions
- 等待 GitHub Actions 自动运行
- 验证所有平台测试通过：
  - ✅ Ubuntu + Python 3.10/3.11/3.12
  - ✅ Windows + Python 3.10/3.11/3.12
  - ✅ macOS + Python 3.10/3.11/3.12

## 📚 参考资料

### Python 编码相关
- [PEP 597 – Add optional EncodingWarning](https://peps.python.org/pep-0597/)
- [Python tempfile documentation](https://docs.python.org/3/library/tempfile.html)
- [Unicode HOWTO](https://docs.python.org/3/howto/unicode.html)

### 最佳实践
- [The Absolute Minimum Every Software Developer Must Know About Unicode](https://www.joelonsoftware.com/2003/10/08/the-absolute-minimum-every-software-developer-absolutely-positively-must-know-about-unicode-and-character-sets-no-excuses/)
- [Python 3 Unicode HOWTO](https://docs.python.org/3/howto/unicode.html)

### GitHub Actions
- [Setting environment variables](https://docs.github.com/en/actions/learn-github-actions/variables)
- [Workflow syntax for GitHub Actions](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)

## ✅ 验证清单

修复完成后，请确保：

- [x] 所有 fixtures 都指定了 `encoding='utf-8'`
- [x] JSON 序列化使用 `ensure_ascii=False`
- [x] CI/CD workflow 设置了 `PYTHONIOENCODING=utf-8`
- [x] 添加了 `pip install -e .` 步骤
- [x] 本地测试全部通过（47/47）
- [x] 覆盖率达标（47.51% ≥ 45%）
- [x] 修复文档已创建

## 🎯 问题对比总结

### 第一次 CI/CD 失败（工作流 #19096597522）
- **问题**: 模块导入路径错误
- **错误**: `ModuleNotFoundError: No module named 'src'`
- **原因**: 测试使用 `from src.xxx` 导入
- **解决**: 改为 `from xxx` 导入

### 第二次 CI/CD 失败（工作流 #19194468735）
- **问题**: 字符编码错误
- **错误**: `UnicodeEncodeError: 'charmap' codec can't encode`
- **原因**: Windows CI/CD 环境使用 CP1252 编码
- **解决**: 显式指定 UTF-8 编码

### 两次问题的共同点
- 都是**本地正常，CI/CD 失败**
- 都与**环境差异**有关（路径配置、字符编码）
- 都需要**跨平台兼容性**考虑

---

**修复完成时间**: 2025-11-08  
**修复人员**: AI Assistant  
**审核状态**: ✅ 待审核  
**测试状态**: ✅ 本地验证通过

