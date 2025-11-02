# Obsidian Cursor Logger - Global Logger 插件

这是 Obsidian Cursor Logger 的核心插件部分，提供全局日志收集和智能自动重载功能。

## 功能特性

### 日志模块
- 零侵入的全局日志收集
- 自动拦截所有 console 输出
- 批量写入优化
- 日志文件自动轮转

### Auto-Reload 模块
- 智能识别开发中的插件
- 三种监控模式（自动/智能/手动）
- 文件变化自动重载
- 重载历史记录

## 开发

```bash
# 安装依赖
npm install

# 开发模式（Watch 自动编译）
npm run dev

# 生产构建
npm run build

# 运行测试
npm test

# 代码检查
npm run lint
```

## 项目结构

```
src/
├── logger/              # 日志收集模块
│   ├── console-interceptor.ts
│   ├── log-collector.ts
│   └── file-manager.ts
├── auto-reload/         # 智能重载模块
│   ├── file-watcher.ts
│   ├── plugin-reloader.ts
│   ├── smart-identifier.ts
│   └── index.ts
├── shared/              # 共享模块
│   ├── types.ts
│   └── utils.ts
└── main.ts             # 主入口
```

## 文档

详细文档请参考：
- [项目开发方案](../docs/Obsidian-Cursor%20Logger%20项目开发方案.md)
- [开发计划](../docs/DEVELOPMENT_PLAN.md)
- [Auto-Reload 设计](../docs/auto-reload.md)

## 许可证

MIT

