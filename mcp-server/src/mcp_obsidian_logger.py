#!/usr/bin/env python3
"""
Obsidian Logger MCP Server

为 Cursor IDE 提供日志分析和 Auto-Reload 管理工具接口

工具列表（12个）：
【日志工具】
1. read_logs: 读取日志内容
2. get_log_summary: 获取统计摘要
3. get_recent_errors: 获取最近错误
4. analyze_errors: 深度错误分析
5. get_log_file_path: 获取日志路径
6. clear_logs: 清空日志

【Auto-Reload 工具】
7. get_auto_reload_status: 获取 Auto-Reload 状态
8. get_auto_reload_mode: 获取监控模式
9. set_auto_reload_mode: 切换监控模式
10. manage_watched_plugins: 管理监控插件列表
11. trigger_plugin_reload: 手动触发插件重载
12. get_reload_statistics: 获取重载统计
"""

import sys
import os
import logging
import asyncio
from typing import Optional

# 添加 src 目录到 Python 路径
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# 导入 MCP SDK
try:
    from mcp.server import Server
    from mcp.server.stdio import stdio_server
    from mcp import types
except ImportError:
    print("错误: 无法导入 MCP SDK，请运行: pip install mcp", file=sys.stderr)
    sys.exit(1)

# 导入项目模块
from config_manager import ConfigManager
from log_manager import LogManager
from cache import LogCache
from file_monitor import FileMonitor

# 配置日志 - 只输出到 stderr（避免干扰 STDIO 通信）
logging.basicConfig(
    level=logging.ERROR,  # 只输出错误级别
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    stream=sys.stderr
)

logger = logging.getLogger(__name__)

# 全局变量
config_manager: Optional[ConfigManager] = None
log_manager: Optional[LogManager] = None
cache: Optional[LogCache] = None
file_monitor: Optional[FileMonitor] = None


def find_config_file() -> Optional[str]:
    """查找配置文件
    
    按以下顺序查找:
    1. 命令行参数指定的路径
    2. 当前工作目录的 config.json
    3. 用户主目录 ~/.obsidian-logger/config.json
    4. 脚本目录的 ../config.json
    
    Returns:
        配置文件路径，如果未找到返回 None
    """
    # 1. 命令行参数
    if len(sys.argv) > 1:
        config_path = sys.argv[1]
        if os.path.exists(config_path):
            return os.path.abspath(config_path)
        else:
            logger.error(f"配置文件不存在: {config_path}")
            return None
    
    # 2. 当前工作目录
    cwd_config = os.path.join(os.getcwd(), 'config.json')
    if os.path.exists(cwd_config):
        return cwd_config
    
    # 3. 用户主目录
    home_config = os.path.join(os.path.expanduser('~'), '.obsidian-logger', 'config.json')
    if os.path.exists(home_config):
        return home_config
    
    # 4. 脚本目录
    script_dir = os.path.dirname(os.path.abspath(__file__))
    script_config = os.path.join(os.path.dirname(script_dir), 'config.json')
    if os.path.exists(script_config):
        return script_config
    
    return None


def initialize_components(config_path: Optional[str] = None) -> bool:
    """初始化所有组件
    
    Args:
        config_path: 配置文件路径（可选）
    
    Returns:
        是否初始化成功
    """
    global config_manager, log_manager, cache, file_monitor
    
    try:
        # 查找配置文件
        if config_path is None:
            config_path = find_config_file()
        
        if not config_path:
            logger.error("未找到配置文件，请创建 config.json 或通过参数指定")
            print("❌ 错误: 未找到配置文件", file=sys.stderr)
            print("\n请创建配置文件或通过参数指定:", file=sys.stderr)
            print("  obsidian-logger-mcp /path/to/config.json", file=sys.stderr)
            print("\n配置文件查找顺序:", file=sys.stderr)
            print("  1. 命令行参数指定的路径", file=sys.stderr)
            print("  2. 当前目录: ./config.json", file=sys.stderr)
            print("  3. 用户主目录: ~/.obsidian-logger/config.json", file=sys.stderr)
            print("  4. 脚本目录: ../config.json", file=sys.stderr)
            return False
        
        # 初始化配置管理器
        config_manager = ConfigManager(config_path)
        
        # 获取日志文件路径
        log_file_path = config_manager.get_log_file_path()
        
        # 初始化日志管理器
        log_manager = LogManager(log_file_path)
        
        # 初始化缓存
        cache_size = config_manager.config.get('cache_size', 1000)
        cache_ttl = config_manager.config.get('cache_ttl_seconds', 300)
        cache = LogCache(max_size=cache_size, cache_ttl=cache_ttl)
        
        # 初始化文件监听
        file_monitor_config = config_manager.config.get('file_monitor', {})
        if file_monitor_config.get('enabled', True):
            debounce_ms = file_monitor_config.get('debounce_ms', 100)
            file_monitor = FileMonitor(log_file_path, cache, debounce_ms)
            file_monitor.start()
        
        logger.info("所有组件初始化成功")
        return True
    
    except Exception as e:
        logger.error(f"初始化组件失败: {e}", exc_info=True)
        return False


# 创建 MCP Server
app = Server("obsidian-logger")


# ============================================================================
# 日志工具（1-6）
# ============================================================================

@app.list_tools()
async def list_tools() -> list[types.Tool]:
    """列出所有可用工具"""
    return [
        # 日志工具
        types.Tool(
            name="read_logs",
            description="读取日志内容，支持按级别过滤",
            inputSchema={
                "type": "object",
                "properties": {
                    "lines": {
                        "type": "number",
                        "description": "读取的行数（从文件末尾开始）",
                        "default": 50
                    },
                    "level": {
                        "type": "string",
                        "description": "日志级别过滤（all/log/error/warn/debug）",
                        "enum": ["all", "log", "error", "warn", "debug"],
                        "default": "all"
                    }
                }
            }
        ),
        types.Tool(
            name="get_log_summary",
            description="获取日志统计摘要，包括总数、各级别分布、错误率等",
            inputSchema={
                "type": "object",
                "properties": {}
            }
        ),
        types.Tool(
            name="get_recent_errors",
            description="获取最近的错误日志",
            inputSchema={
                "type": "object",
                "properties": {
                    "limit": {
                        "type": "number",
                        "description": "返回的错误数量",
                        "default": 10
                    },
                    "include_stack": {
                        "type": "boolean",
                        "description": "是否包含堆栈信息",
                        "default": False
                    }
                }
            }
        ),
        types.Tool(
            name="analyze_errors",
            description="深度错误分析，包括错误分类、频率统计、模式识别、修复建议",
            inputSchema={
                "type": "object",
                "properties": {
                    "time_range_hours": {
                        "type": "number",
                        "description": "分析的时间范围（小时）",
                        "default": 24
                    }
                }
            }
        ),
        types.Tool(
            name="get_log_file_path",
            description="获取日志文件的绝对路径",
            inputSchema={
                "type": "object",
                "properties": {}
            }
        ),
        types.Tool(
            name="clear_logs",
            description="清空日志文件，可选择是否备份",
            inputSchema={
                "type": "object",
                "properties": {
                    "backup": {
                        "type": "boolean",
                        "description": "是否备份旧日志",
                        "default": True
                    }
                }
            }
        ),
        
        # Auto-Reload 工具
        types.Tool(
            name="get_auto_reload_status",
            description="获取 Auto-Reload 完整状态，包括当前模式、监控列表、配置详情",
            inputSchema={
                "type": "object",
                "properties": {}
            }
        ),
        types.Tool(
            name="get_auto_reload_mode",
            description="获取当前监控模式（auto/smart/manual）",
            inputSchema={
                "type": "object",
                "properties": {}
            }
        ),
        types.Tool(
            name="set_auto_reload_mode",
            description="切换监控模式",
            inputSchema={
                "type": "object",
                "properties": {
                    "mode": {
                        "type": "string",
                        "description": "监控模式",
                        "enum": ["auto", "smart", "manual"]
                    }
                },
                "required": ["mode"]
            }
        ),
        types.Tool(
            name="manage_watched_plugins",
            description="管理监控插件列表",
            inputSchema={
                "type": "object",
                "properties": {
                    "action": {
                        "type": "string",
                        "description": "操作类型",
                        "enum": ["get", "add", "remove", "set"]
                    },
                    "plugins": {
                        "type": "array",
                        "description": "插件 ID 列表（仅 add/remove/set 需要）",
                        "items": {"type": "string"}
                    }
                },
                "required": ["action"]
            }
        ),
        types.Tool(
            name="trigger_plugin_reload",
            description="手动触发指定插件重载",
            inputSchema={
                "type": "object",
                "properties": {
                    "plugin_id": {
                        "type": "string",
                        "description": "要重载的插件 ID"
                    }
                },
                "required": ["plugin_id"]
            }
        ),
        types.Tool(
            name="get_reload_statistics",
            description="获取插件重载统计信息",
            inputSchema={
                "type": "object",
                "properties": {
                    "plugin_id": {
                        "type": "string",
                        "description": "插件 ID（可选，为空则统计所有插件）"
                    },
                    "time_range_hours": {
                        "type": "number",
                        "description": "统计的时间范围（小时）",
                        "default": 24
                    }
                }
            }
        )
    ]


@app.call_tool()
async def call_tool(name: str, arguments: dict) -> list[types.TextContent]:
    """调用工具"""
    
    # 工具 1: read_logs
    if name == "read_logs":
        lines = arguments.get("lines", 50)
        level = arguments.get("level", "all")
        result = log_manager.read_logs(lines, level)
        return [types.TextContent(type="text", text=result)]
    
    # 工具 2: get_log_summary
    elif name == "get_log_summary":
        # 先尝试从缓存获取
        cached = cache.get_cached_summary()
        if cached:
            result = cached + "\n\n💾 (来自缓存)"
        else:
            result = log_manager.get_summary()
            # 更新缓存
            cache.set_summary_cache(result)
        return [types.TextContent(type="text", text=result)]
    
    # 工具 3: get_recent_errors
    elif name == "get_recent_errors":
        limit = arguments.get("limit", 10)
        include_stack = arguments.get("include_stack", False)
        
        # 尝试从缓存获取
        cached = cache.get_cached_errors(limit)
        if cached and not include_stack:
            result = cached + "\n\n💾 (来自缓存)"
        else:
            result = log_manager.get_recent_errors(limit, include_stack)
            # 更新缓存（仅当不包含堆栈时）
            if not include_stack:
                cache.set_errors_cache(result, limit)
        return [types.TextContent(type="text", text=result)]
    
    # 工具 4: analyze_errors
    elif name == "analyze_errors":
        hours = arguments.get("time_range_hours", 24)
        
        # 尝试从缓存获取
        cached = cache.get_cached_analysis(hours)
        if cached:
            result = cached + "\n\n💾 (来自缓存)"
        else:
            result = log_manager.analyze_errors(hours)
            # 更新缓存
            cache.set_analysis_cache(result, hours)
        return [types.TextContent(type="text", text=result)]
    
    # 工具 5: get_log_file_path
    elif name == "get_log_file_path":
        path = log_manager.log_file_path
        exists = "✅ 存在" if log_manager.file_exists() else "⚠️ 不存在"
        result = f"📁 日志文件路径\n{'─' * 60}\n{path}\n状态: {exists}"
        return [types.TextContent(type="text", text=result)]
    
    # 工具 6: clear_logs
    elif name == "clear_logs":
        backup = arguments.get("backup", True)
        result = log_manager.clear_logs(backup)
        # 清空缓存
        cache.clear()
        return [types.TextContent(type="text", text=result)]
    
    # 工具 7: get_auto_reload_status
    elif name == "get_auto_reload_status":
        auto_reload_config = config_manager.get_auto_reload_config()
        if not auto_reload_config:
            return [types.TextContent(type="text", text="⚠️ 无法获取 Auto-Reload 配置")]
        
        mode = auto_reload_config.get('mode', 'unknown')
        watched_plugins = auto_reload_config.get('watchedPlugins', [])
        check_interval = auto_reload_config.get('checkInterval', 1000)
        show_notification = auto_reload_config.get('showNotification', True)
        
        result = f"""
🤖 Auto-Reload 状态
{'━' * 60}
📊 当前模式：{mode.upper()}
📝 监控插件数：{len(watched_plugins)}
⏱️ 检查间隔：{check_interval}ms
🔔 显示通知：{'是' if show_notification else '否'}

📋 监控插件列表：
"""
        if watched_plugins:
            for i, plugin in enumerate(watched_plugins, 1):
                result += f"{i}. {plugin}\n"
        else:
            result += "  (无)\n"
        
        result += f"\n{'━' * 60}"
        return [types.TextContent(type="text", text=result.strip())]
    
    # 工具 8: get_auto_reload_mode
    elif name == "get_auto_reload_mode":
        mode = config_manager.get_auto_reload_mode()
        mode_descriptions = {
            'auto': '全自动模式 - 监控所有包含开发标识的插件',
            'smart': '智能模式 - 智能识别开发中的插件',
            'manual': '手动模式 - 仅监控手动选择的插件'
        }
        description = mode_descriptions.get(mode, '未知模式')
        result = f"🤖 当前监控模式：{mode.upper()}\n📝 说明：{description}"
        return [types.TextContent(type="text", text=result)]
    
    # 工具 9: set_auto_reload_mode
    elif name == "set_auto_reload_mode":
        mode = arguments.get("mode")
        if not mode:
            return [types.TextContent(type="text", text="❌ 错误：缺少 mode 参数")]
        
        success = config_manager.set_auto_reload_mode(mode)
        if success:
            result = f"✅ 已切换到 {mode.upper()} 模式\n💡 插件将在检测到配置变化后自动应用新模式"
        else:
            result = f"❌ 切换模式失败"
        return [types.TextContent(type="text", text=result)]
    
    # 工具 10: manage_watched_plugins
    elif name == "manage_watched_plugins":
        action = arguments.get("action")
        plugins = arguments.get("plugins", [])
        
        if action == "get":
            watched = config_manager.get_watched_plugins()
            result = f"📋 监控插件列表 ({len(watched)} 个)\n{'─' * 60}\n"
            if watched:
                for i, plugin in enumerate(watched, 1):
                    result += f"{i}. {plugin}\n"
            else:
                result += "(无)\n"
        
        elif action == "add":
            if not plugins:
                return [types.TextContent(type="text", text="❌ 错误：缺少 plugins 参数")]
            
            success_count = 0
            for plugin in plugins:
                if config_manager.add_watched_plugin(plugin):
                    success_count += 1
            
            result = f"✅ 已添加 {success_count}/{len(plugins)} 个插件到监控列表"
        
        elif action == "remove":
            if not plugins:
                return [types.TextContent(type="text", text="❌ 错误：缺少 plugins 参数")]
            
            success_count = 0
            for plugin in plugins:
                if config_manager.remove_watched_plugin(plugin):
                    success_count += 1
            
            result = f"✅ 已从监控列表移除 {success_count}/{len(plugins)} 个插件"
        
        elif action == "set":
            if not isinstance(plugins, list):
                return [types.TextContent(type="text", text="❌ 错误：plugins 必须是列表")]
            
            success = config_manager.set_watched_plugins(plugins)
            if success:
                result = f"✅ 已设置监控列表 ({len(plugins)} 个插件)"
            else:
                result = "❌ 设置监控列表失败"
        
        else:
            result = f"❌ 错误：未知操作 '{action}'"
        
        return [types.TextContent(type="text", text=result)]
    
    # 工具 11: trigger_plugin_reload
    elif name == "trigger_plugin_reload":
        plugin_id = arguments.get("plugin_id")
        if not plugin_id:
            return [types.TextContent(type="text", text="❌ 错误：缺少 plugin_id 参数")]
        
        success = config_manager.trigger_plugin_reload(plugin_id)
        if success:
            result = f"✅ 已触发重载请求: {plugin_id}\n💡 插件将在检测到配置变化后执行重载（约 2 秒内）"
        else:
            result = f"❌ 触发重载失败"
        return [types.TextContent(type="text", text=result)]
    
    # 工具 12: get_reload_statistics
    elif name == "get_reload_statistics":
        plugin_id = arguments.get("plugin_id")
        hours = arguments.get("time_range_hours", 24)
        
        # 从日志中提取重载记录
        if not log_manager.file_exists():
            return [types.TextContent(type="text", text="⚠️ 日志文件不存在，无法统计")]
        
        try:
            with open(log_manager.log_file_path, 'r', encoding='utf-8', errors='ignore') as f:
                lines = f.readlines()
            
            # 提取重载记录
            reload_records = []
            for line in lines:
                if 'Auto-Reload' in line and '插件已重载' in line:
                    parsed = log_manager.parse_log_line(line)
                    if parsed:
                        timestamp, level, message = parsed
                        # 提取插件 ID 和耗时
                        if plugin_id and plugin_id not in message:
                            continue
                        reload_records.append({
                            'timestamp': timestamp,
                            'message': message
                        })
            
            # 生成统计
            total_reloads = len(reload_records)
            
            result = f"""
📊 重载统计
{'━' * 60}
⏱️ 统计范围：最近 {hours} 小时
"""
            if plugin_id:
                result += f"🔌 插件：{plugin_id}\n"
            else:
                result += "🔌 插件：所有\n"
            
            result += f"🔄 重载次数：{total_reloads}\n"
            
            if reload_records:
                result += f"\n📋 最近 5 次重载：\n"
                for i, record in enumerate(reload_records[-5:], 1):
                    result += f"{i}. [{record['timestamp']}] {record['message']}\n"
            else:
                result += "\n✅ 统计范围内无重载记录\n"
            
            result += f"{'━' * 60}"
            return [types.TextContent(type="text", text=result.strip())]
        
        except Exception as e:
            logger.error(f"获取重载统计失败: {e}")
            return [types.TextContent(type="text", text=f"❌ 获取统计失败: {str(e)}")]
    
    else:
        return [types.TextContent(type="text", text=f"❌ 未知工具: {name}")]


async def run_server():
    """运行 MCP Server"""
    # 初始化组件
    if not initialize_components():
        logger.error("初始化失败，退出")
        sys.exit(1)
    
    # 使用 stdio 传输运行服务器
    async with stdio_server() as (read_stream, write_stream):
        await app.run(
            read_stream,
            write_stream,
            app.create_initialization_options()
        )


def main():
    """主入口点（用于 uvx 和命令行启动）"""
    try:
        asyncio.run(run_server())
    except KeyboardInterrupt:
        logger.info("MCP Server 正在关闭...")
        # 停止文件监听
        if file_monitor:
            file_monitor.stop()
        sys.exit(0)
    except Exception as e:
        logger.error(f"MCP Server 启动失败: {e}", exc_info=True)
        sys.exit(1)


if __name__ == "__main__":
    main()

                result += "🔌 插件：所有\n"
            
            result += f"🔄 重载次数：{total_reloads}\n"
            
            if reload_records:
                result += f"\n📋 最近 5 次重载：\n"
                for i, record in enumerate(reload_records[-5:], 1):
                    result += f"{i}. [{record['timestamp']}] {record['message']}\n"
            else:
                result += "\n✅ 统计范围内无重载记录\n"
            
            result += f"{'━' * 60}"
            return [types.TextContent(type="text", text=result.strip())]
        
        except Exception as e:
            logger.error(f"获取重载统计失败: {e}")
            return [types.TextContent(type="text", text=f"❌ 获取统计失败: {str(e)}")]
    
    else:
        return [types.TextContent(type="text", text=f"❌ 未知工具: {name}")]


async def run_server():
    """运行 MCP Server"""
    # 初始化组件
    if not initialize_components():
        logger.error("初始化失败，退出")
        sys.exit(1)
    
    # 使用 stdio 传输运行服务器
    async with stdio_server() as (read_stream, write_stream):
        await app.run(
            read_stream,
            write_stream,
            app.create_initialization_options()
        )


def main():
    """主入口点（用于 uvx 和命令行启动）"""
    try:
        asyncio.run(run_server())
    except KeyboardInterrupt:
        logger.info("MCP Server 正在关闭...")
        # 停止文件监听
        if file_monitor:
            file_monitor.stop()
        sys.exit(0)
    except Exception as e:
        logger.error(f"MCP Server 启动失败: {e}", exc_info=True)
        sys.exit(1)


if __name__ == "__main__":
    main()
