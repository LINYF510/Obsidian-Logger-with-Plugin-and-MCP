# Obsidian Cursor Logger - MCP Server

MCP Server 为 Cursor IDE 提供日志分析和 Auto-Reload 管理工具接口。

## 功能特性

### 日志工具（6个）
- `read_logs` - 读取日志内容
- `get_log_summary` - 获取统计摘要
- `get_recent_errors` - 获取最近错误
- `analyze_errors` - 深度错误分析
- `get_log_file_path` - 获取日志路径
- `clear_logs` - 清空日志

### Auto-Reload 管理工具（6个）
- `get_auto_reload_status` - 获取状态和监控列表
- `get_auto_reload_mode` - 获取当前监控模式
- `set_auto_reload_mode` - 切换监控模式
- `manage_watched_plugins` - 管理监控插件列表
- `trigger_plugin_reload` - 手动触发插件重载
- `get_reload_statistics` - 获取重载统计

## 安装

```bash
# 安装依赖
pip install -r requirements.txt

# 开发依赖
pip install -r requirements-dev.txt

# 安装为包
pip install -e .
```

## 配置

1. 复制配置示例文件：
```bash
cp config.example.json config.json
```

2. 编辑配置文件，设置正确的路径

3. 在 Cursor 设置中添加 MCP Server：

```json
{
  "mcpServers": {
    "obsidian-logger": {
      "command": "python3",
      "args": ["/absolute/path/to/mcp-server/src/mcp_obsidian_logger.py"],
      "description": "Obsidian 日志收集和 Auto-Reload 管理服务",
      "transport": "stdio",
      "disabled": false
    }
  }
}
```

## 开发

```bash
# 运行测试
pytest

# 代码格式化
black src/

# 类型检查
mypy src/

# 代码检查
flake8 src/
```

## 项目结构

```
src/
├── __init__.py
├── mcp_obsidian_logger.py  # 主程序
├── cache.py                 # 缓存系统
├── file_monitor.py          # 文件监听
├── tools.py                 # 工具定义
└── logger.py                # 日志记录
```

## 文档

详细文档请参考：
- [项目开发方案](../docs/Obsidian-Cursor%20Logger%20项目开发方案.md)
- [MCP 协议实现](../docs/Obsidian-Cursor%20Logger%20项目开发方案.md#mcp-服务器开发方案)

## 许可证

MIT

