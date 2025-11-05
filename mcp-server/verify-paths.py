#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
验证 Obsidian 插件和 MCP Server 的日志路径是否一致
"""

import json
import os
import sys

# 设置 Windows 控制台编码
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')


def normalize_path(path):
    """规范化路径（解析 .. 和转换为绝对路径）"""
    return os.path.normpath(os.path.abspath(path))


def main():
    print("=" * 70)
    print("日志路径一致性验证")
    print("=" * 70)
    print()
    
    # 1. 读取 MCP Server 配置
    mcp_config_path = os.path.join(os.path.expanduser("~"), ".obsidian-logger", "config.json")
    
    if not os.path.exists(mcp_config_path):
        print(f"[ERROR] MCP 配置文件不存在: {mcp_config_path}")
        print("        请先运行: python create-config.py")
        sys.exit(1)
    
    with open(mcp_config_path, 'r', encoding='utf-8') as f:
        mcp_config = json.load(f)
    
    vault_path = mcp_config.get('vault_path')
    mcp_log_path = mcp_config.get('log_file_path')
    
    print(f"[INFO] Vault 路径: {vault_path}")
    print(f"[INFO] MCP 配置中的日志路径: {mcp_log_path}")
    print()
    
    # 2. 读取 Obsidian 插件配置
    plugin_data_path = os.path.join(vault_path, '.obsidian', 'plugins', 'obsidian-logger', 'data.json')
    
    if not os.path.exists(plugin_data_path):
        print(f"[WARN] Obsidian 插件配置不存在: {plugin_data_path}")
        print("       插件可能未启用或未运行过")
        print()
        plugin_log_path_relative = "../obsidian-logger/obsidian-debug.log"  # 使用默认值
    else:
        with open(plugin_data_path, 'r', encoding='utf-8') as f:
            plugin_data = json.load(f)
        
        plugin_log_path_relative = plugin_data.get('logger', {}).get('logFilePath', '../obsidian-logger/obsidian-debug.log')
    
    print(f"[INFO] Obsidian 插件配置中的日志路径(相对): {plugin_log_path_relative}")
    print()
    
    # 3. 转换为绝对路径并比较
    plugin_log_path_absolute = os.path.join(vault_path, plugin_log_path_relative)
    
    mcp_log_normalized = normalize_path(mcp_log_path)
    plugin_log_normalized = normalize_path(plugin_log_path_absolute)
    
    print("=" * 70)
    print("规范化后的路径")
    print("=" * 70)
    print()
    print(f"MCP Server:      {mcp_log_normalized}")
    print(f"Obsidian Plugin: {plugin_log_normalized}")
    print()
    
    # 4. 比较
    if mcp_log_normalized == plugin_log_normalized:
        print("[OK] 路径一致! 两个配置指向同一个日志文件")
        print()
        print(f"[INFO] 日志文件: {mcp_log_normalized}")
        
        if os.path.exists(mcp_log_normalized):
            size = os.path.getsize(mcp_log_normalized)
            print(f"[INFO] 文件大小: {size:,} 字节")
            print(f"[OK] 文件存在")
        else:
            print(f"[WARN] 日志文件尚未创建(插件运行后会自动创建)")
    else:
        print("[ERROR] 路径不一致!")
        print()
        print("请检查配置并确保两者指向同一个文件。")
        print()
        print("建议修改为:")
        print(f"  MCP config.json 中的 log_file_path: {plugin_log_normalized}")
    
    print()
    print("=" * 70)


if __name__ == "__main__":
    main()

