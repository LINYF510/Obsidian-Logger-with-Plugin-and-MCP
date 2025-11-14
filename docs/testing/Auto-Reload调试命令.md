# Auto-Reload 调试命令集

**日期**: 2025-11-02  
**用途**: 诊断 Auto-Reload 文件检测问题

---

## 🔍 诊断命令

请在 Obsidian 控制台中逐个执行以下命令，并将结果告诉我：

### 1. 检查文件路径

```javascript
// 获取 test-reload 的文件路径
const adapter = app.vault.adapter;
const basePath = adapter.basePath || adapter.getBasePath?.();
const pluginPath = `${basePath}/.obsidian/plugins/test-reload/main.js`;
console.log('计算的路径:', pluginPath);
```

### 2. 检查文件是否存在

```javascript
// 检查文件是否可以被访问
const adapter = app.vault.adapter;
const basePath = adapter.basePath || adapter.getBasePath?.();
const pluginPath = `${basePath}/.obsidian/plugins/test-reload/main.js`;
const exists = await adapter.exists(pluginPath);
console.log('文件是否存在:', exists);
```

### 3. 获取文件状态

```javascript
// 获取文件的 stat 信息
const adapter = app.vault.adapter;
const basePath = adapter.basePath || adapter.getBasePath?.();
const pluginPath = `${basePath}/.obsidian/plugins/test-reload/main.js`;
try {
  const stats = await adapter.stat(pluginPath);
  console.log('文件状态:', stats);
  console.log('修改时间:', new Date(stats.mtime));
} catch (e) {
  console.error('获取文件状态失败:', e);
}
```

### 4. 测试相对路径

```javascript
// 尝试使用相对路径
const relativePath = '.obsidian/plugins/test-reload/main.js';
try {
  const stats = await app.vault.adapter.stat(relativePath);
  console.log('相对路径 stat 成功:', stats);
} catch (e) {
  console.error('相对路径失败:', e);
}
```

### 5. 手动触发文件检查

```javascript
// 手动触发 FileWatcher 检查
const plugin = app.plugins.plugins['obsidian-cursor-logger'];
const watcher = plugin.autoReloadModule.fileWatcher;
console.log('FileWatcher:', watcher);
console.log('监控的插件:', watcher.getWatchedPlugins());
```

---

请执行这些命令并将输出结果发给我，我会根据结果找出问题所在！

