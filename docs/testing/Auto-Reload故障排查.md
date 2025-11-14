# Auto-Reload 故障排查指南

**创建日期**: 2025-11-02  
**问题**: 修改文件后 Auto-Reload 未触发

---

## 🔍 诊断步骤

### 步骤 1：确认 Obsidian 已重启

**问题**: 用户可能没有重启 Obsidian，仍在使用旧代码（没有 Auto-Reload 模块）

**检查方法**:
在控制台中搜索以下关键日志：
```
[Auto-Reload] 🤖 Auto-Reload 模块启动中...
```

**如果没有这条日志**：
- 说明 Auto-Reload 模块未加载
- **解决方案**: 完全退出并重新启动 Obsidian

### 步骤 2：检查启动日志

在控制台中查找完整的启动序列：

**应该看到**:
```
🚀 Obsidian Cursor Logger 启动中...
📝 日志模块：已启动
   └─ 日志文件位置：...
[Auto-Reload] 🤖 Auto-Reload 模块启动中...
[Auto-Reload] 🔧 获取监控列表（模式: smart）
[Auto-Reload] 🧠 开始智能识别开发插件...
[Auto-Reload] ✅ Auto-Reload 模块已启动
   ├─ 监控模式: 🧠 智能模式
   ├─ 监控插件: X 个
   └─ 检查间隔: 1000ms
✅ Obsidian Cursor Logger 已启动
```

**如果缺少任何部分**：
- 说明模块初始化有问题
- 查看是否有错误日志

### 步骤 3：确认 test-reload 被识别

在启动日志中查找：

**应该看到**:
```
[Auto-Reload] 🧠 开始智能识别开发插件...
[Auto-Reload]     ✓ 包含 source map (+5分)
[Auto-Reload]     ✓ 最近修改过 (+3分)
[Auto-Reload]   ✅ test-reload - 总分: 8 分 → 识别为开发插件
```

或在监控列表中：
```
[Auto-Reload]    监控列表: test-reload, ...
```

**如果 test-reload 不在列表中**：
- 智能识别未找到它
- 检查文件是否包含 `sourceMappingURL`
- 检查文件修改时间是否在 24 小时内

### 步骤 4：检查文件监听器

在控制台中应该看到：
```
[Auto-Reload] 📡 开始监控 X 个插件
```

**如果没有**：
- FileWatcher 未启动
- 检查是否有错误日志

---

## 🛠️ 常见问题和解决方案

### 问题 1：Obsidian 未重启

**症状**: 控制台中完全没有 `[Auto-Reload]` 开头的日志

**解决方案**:
```
1. 完全退出 Obsidian（关闭所有窗口）
2. 重新启动 Obsidian
3. 查看启动日志
```

### 问题 2：test-reload 未被识别

**症状**: 启动日志中没有 test-reload，或显示总分 < 5

**检查清单**:
- [ ] main.js 是否包含 `//# sourceMappingURL=main.js.map`
- [ ] 文件是否最近创建（检查修改时间）
- [ ] 文件路径是否正确

**临时解决方案**：切换到自动模式
```
命令面板 → 🤖 切换到自动监控模式
```
自动模式会监控所有已启用插件，包括 test-reload。

### 问题 3：文件监听未工作

**症状**: test-reload 在监控列表中，但修改文件后无反应

**可能原因**:
- 文件修改时间未更新
- 时间戳缓存问题
- 定时器未启动

**解决方案**:
```
命令面板 → 🔄 刷新监控列表
```

### 问题 4：符号链接问题

**症状**: 主插件（obsidian-cursor-logger）本身不重载

**原因**: 符号链接的文件变化可能需要更长时间检测

**解决方案**:
- 等待 2-3 秒而不是 1 秒
- 或手动重载插件验证

---

## 🔧 调试命令

### 检查当前监控状态

在控制台执行：
```javascript
// 获取 Auto-Reload 状态
const plugin = app.plugins.plugins['obsidian-cursor-logger'];
const status = plugin.autoReloadModule.getStatus();
console.log('Auto-Reload 状态:', status);
```

**应该返回**:
```javascript
{
  mode: "🧠 智能模式",
  watchedPlugins: ["test-reload", ...],
  checkInterval: 1000,
  isRunning: true
}
```

### 手动触发重载

在控制台执行：
```javascript
const plugin = app.plugins.plugins['obsidian-cursor-logger'];
await plugin.autoReloadModule.manualReload('test-reload');
```

**应该看到**:
```
[Auto-Reload] 开始重载插件: test-reload
[Auto-Reload] ✅ 插件已重载: test-reload (用时: XXms)
```

### 强制刷新监控列表

在控制台执行：
```javascript
const plugin = app.plugins.plugins['obsidian-cursor-logger'];
await plugin.autoReloadModule.updateWatchList();
```

---

## 📝 完整测试流程

### 标准测试流程（推荐）

```
1. 确认 Obsidian 已完全重启
   ↓
2. 打开控制台（Ctrl+Shift+I）
   ↓
3. 检查 Auto-Reload 启动日志
   ↓
4. 确认 test-reload 在监控列表
   ↓
5. 修改 test-reload/main.js
   ↓
6. 保存文件
   ↓
7. 等待 1-2 秒
   ↓
8. 观察控制台日志
   ↓
9. 验证新版本号
```

---

## ✅ 成功标志

如果看到以下输出，说明 Auto-Reload **工作完美**：

```
[Auto-Reload] 🔄 检测到文件变化: test-reload
[Auto-Reload] 🔄 触发重载: test-reload
[Auto-Reload] 开始重载插件: test-reload
=========================================
🧪 Test Reload Plugin - Version 1.0.1 - 已修改！
=========================================
[Auto-Reload] ✅ 插件已重载: test-reload (用时: 105ms)
```

---

**维护者**: LINYF510  
**更新日期**: 2025-11-02

