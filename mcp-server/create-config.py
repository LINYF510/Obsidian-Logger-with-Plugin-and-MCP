#!/usr/bin/env python3
"""
配置文件创建向导

自动检测 Obsidian Vault 并帮助用户快速生成配置文件
"""

import json
import os
import sys
from pathlib import Path


def find_obsidian_vaults():
    """自动查找系统中的 Obsidian Vault
    
    Returns:
        找到的 Vault 路径列表
    """
    vaults = []
    
    # 常见的 Obsidian 数据目录
    if sys.platform == 'win32':
        # Windows
        search_paths = [
            os.path.join(os.environ.get('APPDATA', ''), 'obsidian'),
            os.path.join(os.path.expanduser('~'), 'Documents'),
            os.path.join(os.path.expanduser('~'), 'OneDrive', 'Documents'),
        ]
    elif sys.platform == 'darwin':
        # macOS
        search_paths = [
            os.path.join(os.path.expanduser('~'), 'Documents'),
            os.path.join(os.path.expanduser('~'), 'Library', 'Application Support', 'obsidian'),
        ]
    else:
        # Linux
        search_paths = [
            os.path.join(os.path.expanduser('~'), 'Documents'),
            os.path.join(os.path.expanduser('~'), '.config', 'obsidian'),
        ]
    
    # 递归搜索包含 .obsidian 目录的文件夹
    for search_path in search_paths:
        if not os.path.exists(search_path):
            continue
        
        try:
            # 只搜索3层深度，避免太慢
            for root, dirs, files in os.walk(search_path):
                # 计算深度
                depth = root[len(search_path):].count(os.sep)
                if depth > 3:
                    dirs[:] = []  # 不再深入
                    continue
                
                # 检查是否包含 .obsidian 目录
                if '.obsidian' in dirs:
                    vault_path = os.path.abspath(root)
                    if vault_path not in vaults:
                        vaults.append(vault_path)
                    # 不再搜索子目录
                    dirs[:] = []
        except (PermissionError, OSError):
            # 跳过无权限访问的目录
            continue
    
    return vaults


def create_config():
    """配置文件创建向导"""
    print("=" * 70)
    print("Obsidian Logger MCP Server 配置向导")
    print("=" * 70)
    print()
    
    # 自动检测 Vault
    print("正在自动检测 Obsidian Vault...")
    vaults = find_obsidian_vaults()
    
    if vaults:
        print(f"找到 {len(vaults)} 个 Vault:")
        print()
        for i, vault in enumerate(vaults, 1):
            print(f"{i}. {vault}")
        print(f"{len(vaults) + 1}. 手动输入路径")
        print()
        
        choice = input(f"请选择 [1-{len(vaults) + 1}]: ").strip()
        
        try:
            choice_num = int(choice)
            if 1 <= choice_num <= len(vaults):
                vault_path = vaults[choice_num - 1]
                print(f"已选择: {vault_path}")
            else:
                # 手动输入
                vault_path = input("\n请输入 Obsidian Vault 路径: ").strip()
                vault_path = vault_path.strip('"').strip("'")
        except ValueError:
            # 输入无效，使用手动输入
            vault_path = input("\n请输入 Obsidian Vault 路径: ").strip()
            vault_path = vault_path.strip('"').strip("'")
    else:
        print("未找到 Obsidian Vault，请手动输入")
        print()
        vault_path = input("请输入 Obsidian Vault 路径: ").strip()
        vault_path = vault_path.strip('"').strip("'")
    
    print()
    
    # 验证路径
    if not os.path.exists(vault_path):
        print(f"错误: 路径不存在: {vault_path}")
        sys.exit(1)
    
    # 检查是否是 Obsidian Vault
    obsidian_dir = os.path.join(vault_path, '.obsidian')
    if not os.path.exists(obsidian_dir):
        print(f"警告: {vault_path} 可能不是 Obsidian Vault")
        print(f"   未找到 .obsidian 目录")
        confirm = input("   是否继续？ [y/N]: ").strip().lower()
        if confirm != 'y':
            print("已取消")
            sys.exit(0)
    
    print(f"OK - Vault 路径: {vault_path}")
    print()
    
    # 检测 Obsidian Logger 插件配置
    print("步骤 2: 配置日志文件路径")
    print()
    
    plugin_data_path = os.path.join(vault_path, '.obsidian', 'plugins', 'obsidian-logger', 'data.json')
    plugin_log_path = None
    
    if os.path.exists(plugin_data_path):
        try:
            with open(plugin_data_path, 'r', encoding='utf-8') as f:
                plugin_data = json.load(f)
            
            # 读取插件配置的日志路径（相对路径）
            plugin_log_relative = plugin_data.get('logger', {}).get('logFilePath', '../obsidian-logger/obsidian-debug.log')
            
            # 转换为绝对路径
            plugin_log_path = os.path.abspath(os.path.join(vault_path, plugin_log_relative))
            
            print("检测到 Obsidian Logger 插件配置!")
            print(f"  插件配置路径(相对): {plugin_log_relative}")
            print(f"  实际日志路径(绝对): {plugin_log_path}")
            
            if os.path.exists(plugin_log_path):
                size = os.path.getsize(plugin_log_path)
                size_mb = size / 1024 / 1024
                print(f"  文件大小: {size_mb:.2f} MB")
                print(f"  状态: 存在且正在使用")
            else:
                print(f"  状态: 配置中但文件未创建(插件运行后会创建)")
            
            print()
            use_plugin_config = input("使用插件配置的日志路径? [Y/n]: ").strip().lower()
            
            if use_plugin_config != 'n':
                log_file_path = plugin_log_path
                print(f"OK - 使用插件配置的日志路径")
                print()
            else:
                plugin_log_path = None  # 用户选择不使用
        except Exception as e:
            print(f"警告: 无法读取插件配置: {e}")
            plugin_log_path = None
    else:
        print("未检测到 Obsidian Logger 插件配置")
        print(f"  (插件可能未安装或未运行过)")
        print()
    
    # 如果没有使用插件配置，则提供其他选项
    if not plugin_log_path or use_plugin_config == 'n':
        default_log_dir = os.path.join(os.path.dirname(vault_path), 'obsidian-logger')
        default_log_path = os.path.join(default_log_dir, 'obsidian-debug.log')
        
        # 检查是否已存在日志
        existing_logs = []
        vault_parent = os.path.dirname(vault_path)
        
        # 检查常见的日志目录名
        for log_dir_name in ['obsidian-logger', 'cursor-logs', 'logs']:
            log_dir = os.path.join(vault_parent, log_dir_name)
            if os.path.exists(log_dir):
                for file in os.listdir(log_dir):
                    if file.endswith('.log'):
                        existing_logs.append(os.path.join(log_dir, file))
        
        if existing_logs:
            print("检测到已存在的日志文件:")
            for i, log in enumerate(existing_logs, 1):
                size = os.path.getsize(log) if os.path.exists(log) else 0
                size_mb = size / 1024 / 1024
                print(f"{i}. {log} ({size_mb:.2f} MB)")
            print(f"{len(existing_logs) + 1}. 使用默认路径: {default_log_path}")
            print(f"{len(existing_logs) + 2}. 自定义路径")
            print()
            
            choice = input(f"请选择 [1-{len(existing_logs) + 2}]: ").strip()
            
            try:
                choice_num = int(choice)
                if 1 <= choice_num <= len(existing_logs):
                    log_file_path = existing_logs[choice_num - 1]
                elif choice_num == len(existing_logs) + 1:
                    log_file_path = default_log_path
                else:
                    log_file_path = input("请输入日志文件路径: ").strip().strip('"').strip("'")
            except ValueError:
                log_file_path = default_log_path
        else:
            print(f"默认路径: {default_log_path}")
            use_default = input("使用默认路径？ [Y/n]: ").strip().lower()
            
            if use_default == 'n':
                log_file_path = input("请输入日志文件路径: ").strip().strip('"').strip("'")
            else:
                log_file_path = default_log_path
    
    print(f"OK - 日志路径: {log_file_path}")
    print()
    
    # 配置对象
    config = {
        "vault_path": vault_path,
        "log_file_path": log_file_path
    }
    
    # 选择保存位置
    print("步骤 3: 选择配置文件保存位置")
    print()
    print("1. 当前目录 (./config.json)")
    print("2. 用户主目录 (~/.obsidian-logger/config.json) [推荐]")
    print("3. 自定义路径")
    print()
    
    choice = input("请选择 [1/2/3]: ").strip()
    
    if choice == "2":
        config_dir = os.path.join(os.path.expanduser("~"), ".obsidian-logger")
        os.makedirs(config_dir, exist_ok=True)
        config_path = os.path.join(config_dir, "config.json")
    elif choice == "3":
        custom_path = input("请输入配置文件保存路径: ").strip().strip('"').strip("'")
        config_dir = os.path.dirname(custom_path)
        if config_dir:
            os.makedirs(config_dir, exist_ok=True)
        config_path = custom_path
    else:
        config_path = os.path.join(os.getcwd(), "config.json")
    
    # 保存配置
    try:
        with open(config_path, 'w', encoding='utf-8') as f:
            json.dump(config, f, indent=2, ensure_ascii=False)
        
        print()
        print("=" * 70)
        print("配置文件创建成功!")
        print("=" * 70)
        print()
        print(f"配置文件位置: {os.path.abspath(config_path)}")
        print()
        print("配置内容:")
        print(json.dumps(config, indent=2, ensure_ascii=False))
        print()
        print("=" * 70)
        print("Cursor MCP 配置")
        print("=" * 70)
        print()
        print("方式 1: uvx 启动 (推荐 - 从 GitHub 自动更新)")
        print()
        print('{')
        print('  "mcpServers": {')
        print('    "obsidian-logger": {')
        print('      "command": "uvx",')
        print('      "args": [')
        print('        "--from",')
        print('        "git+https://github.com/LINYF510/Obsidian-Logger-with-Plugin-and-MCP",')
        print('        "obsidian-logger-mcp",')
        print(f'        "{os.path.abspath(config_path).replace(os.sep, "/")}"')
        print('      ],')
        print('      "transport": "stdio"')
        print('    }')
        print('  }')
        print('}')
        print()
        print("-" * 70)
        print()
        print("方式 2: 本地开发模式 (适合开发者)")
        print()
        
        # 获取当前脚本的目录
        script_dir = os.path.dirname(os.path.abspath(__file__))
        mcp_script_path = os.path.join(script_dir, 'src', 'mcp_obsidian_logger.py')
        
        print('{')
        print('  "mcpServers": {')
        print('    "obsidian-logger": {')
        print('      "command": "python",')
        print('      "args": [')
        print(f'        "{mcp_script_path.replace(os.sep, "/")}",')
        print(f'        "{os.path.abspath(config_path).replace(os.sep, "/")}"')
        print('      ],')
        print('      "transport": "stdio"')
        print('    }')
        print('  }')
        print('}')
        print()
        print("=" * 70)
        print()
        print("提示:")
        print("  1. 将以上配置（选择一种）添加到 Cursor settings.json")
        print("  2. 重启 Cursor")
        print("  3. 在 Cursor 中使用 @obsidian-logger 调用工具")
        print()
        
    except Exception as e:
        print(f"\n错误: 保存配置文件失败: {e}")
        sys.exit(1)


if __name__ == "__main__":
    try:
        create_config()
    except KeyboardInterrupt:
        print("\n\n已取消配置创建")
        sys.exit(0)
