# CI/CD 测试失败修复摘要

## 问题描述

最近的 CI/CD 工作流在 Node.js 16.x 环境下运行测试时失败，错误信息如下：

```
TypeError: (0 , _os(...).availableParallelism) is not a function
    at getMaxWorkers (/home/runner/work/Obsidian-Logger-with-Plugin-and-MCP/Obsidian-Logger-with-Plugin-and-MCP/global-logger/node_modules/jest-config/build/index.js:798:52)
```

## 根本原因

1. **Jest 版本不兼容**：项目使用的 Jest 30.x 版本要求 Node.js >= 18.14.0
2. **测试矩阵包含不兼容版本**：`.github/workflows/test.yml` 中的测试矩阵包含了 Node.js 16.x
3. **缺失的 API**：`os.availableParallelism()` 函数在 Node.js 18.11.0 中才引入，Node.js 16.x 不支持

## 修复方案

### 1. 移除 Node.js 16.x 从测试矩阵

**文件**：`.github/workflows/test.yml`

**变更**：
```yaml
# 修改前
node-version: [16.x, 18.x, 20.x]

# 修改后
node-version: [18.x, 20.x]
```

### 2. 添加 engines 字段到 package.json

**文件**：`global-logger/package.json`

**变更**：
```json
{
  "engines": {
    "node": ">=18.14.0"
  }
}
```

这个变更明确声明了项目对 Node.js 版本的要求，可以：
- 防止在不兼容的 Node.js 版本上安装依赖
- 为开发者提供清晰的版本要求文档
- 在 npm install 时给出警告（如果使用的 Node.js 版本不匹配）

## 影响分析

### 正面影响
- ✅ 所有 CI/CD 测试现在将在兼容的 Node.js 版本上运行（18.x 和 20.x）
- ✅ 明确的版本要求防止未来的兼容性问题
- ✅ 减少了测试矩阵的规模，加快 CI/CD 运行速度

### 潜在考虑
- Node.js 16.x 已于 2023 年 9 月 11 日达到生命周期终点（EOL）
- 移除 Node.js 16.x 支持符合最佳实践
- Jest 30.x 的版本要求与现代 Node.js 版本保持一致

## 验证步骤

修复后，CI/CD 工作流应该：
1. 在 Node.js 18.x 上成功运行所有测试
2. 在 Node.js 20.x 上成功运行所有测试
3. 不再出现 `availableParallelism is not a function` 错误

## 参考信息

- [Node.js Release Schedule](https://github.com/nodejs/release#release-schedule)
- [Jest 30 Release Notes](https://jestjs.io/blog/2024/10/13/jest-30)
- [Node.js os.availableParallelism() Documentation](https://nodejs.org/api/os.html#osavailableparallelism)

## 修复日期

2025-11-09

## 修复人员

copilot-swe-agent[bot]
