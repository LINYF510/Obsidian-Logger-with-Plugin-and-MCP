"""
配置管理模块

负责读写插件配置文件，支持与 Obsidian Logger 插件通信
"""

import os
import json
import logging
from typing import Dict, Optional, Any
from pathlib import Path

logger = logging.getLogger(__name__)


class ConfigManager:
    """配置管理器
    
    管理 MCP Server 配置和 Obsidian Logger 插件配置的读写
    """
    
    def __init__(self, config_path: str):
        """初始化配置管理器
        
        Args:
            config_path: MCP Server 配置文件路径
        """
        self.config_path = config_path
        self.config = self._load_config()
        
        # 获取 vault 路径
        self.vault_path = self.config.get('vault_path', '')
        if not self.vault_path:
            raise ValueError("配置文件中未指定 vault_path")
        
        # 插件配置文件路径
        self.plugin_data_path = os.path.join(
            self.vault_path,
            '.obsidian/plugins/obsidian-logger/data.json'
        )
        
        logger.info(f"配置管理器已初始化")
        logger.info(f"Vault 路径: {self.vault_path}")
        logger.info(f"插件配置路径: {self.plugin_data_path}")
    
    def _load_config(self) -> Dict[str, Any]:
        """加载 MCP Server 配置文件
        
        Returns:
            配置字典
        """
        try:
            with open(self.config_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            logger.error(f"配置文件不存在: {self.config_path}")
            raise
        except json.JSONDecodeError as e:
            logger.error(f"配置文件格式错误: {e}")
            raise
    
    def get_log_file_path(self) -> str:
        """获取日志文件路径
        
        Returns:
            日志文件的绝对路径
        """
        log_path = self.config.get('log_file_path', '')
        if not log_path:
            # 使用默认路径
            log_path = os.path.join(
                os.path.dirname(self.vault_path),
                'obsidian-logger/obsidian-debug.log'
            )
        
        # 转换为绝对路径
        if not os.path.isabs(log_path):
            log_path = os.path.join(self.vault_path, log_path)
        
        return log_path
    
    def read_plugin_config(self) -> Optional[Dict[str, Any]]:
        """读取插件配置文件
        
        Returns:
            配置字典，如果文件不存在则返回 None
        """
        try:
            if not os.path.exists(self.plugin_data_path):
                logger.warning(f"插件配置文件不存在: {self.plugin_data_path}")
                return None
            
            with open(self.plugin_data_path, 'r', encoding='utf-8') as f:
                config = json.load(f)
            
            return config
        
        except json.JSONDecodeError as e:
            logger.error(f"插件配置文件格式错误: {e}")
            return None
        except Exception as e:
            logger.error(f"读取插件配置失败: {e}")
            return None
    
    def write_plugin_config(self, config: Dict[str, Any]) -> bool:
        """写入插件配置文件（原子操作）
        
        Args:
            config: 要写入的配置字典
        
        Returns:
            是否写入成功
        """
        try:
            # 确保目录存在
            os.makedirs(os.path.dirname(self.plugin_data_path), exist_ok=True)
            
            # 原子写入：先写临时文件，再重命名
            temp_path = self.plugin_data_path + '.tmp'
            
            with open(temp_path, 'w', encoding='utf-8') as f:
                json.dump(config, f, indent=2, ensure_ascii=False)
            
            # 重命名（原子操作）
            os.replace(temp_path, self.plugin_data_path)
            
            logger.info("插件配置写入成功")
            return True
        
        except Exception as e:
            logger.error(f"写入插件配置失败: {e}")
            # 清理临时文件
            temp_path = self.plugin_data_path + '.tmp'
            if os.path.exists(temp_path):
                try:
                    os.remove(temp_path)
                except:
                    pass
            return False
    
    def get_auto_reload_config(self) -> Optional[Dict[str, Any]]:
        """获取 Auto-Reload 配置
        
        Returns:
            Auto-Reload 配置字典，如果不存在则返回 None
        """
        config = self.read_plugin_config()
        if config and 'autoReload' in config:
            return config['autoReload']
        return None
    
    def update_auto_reload_config(self, updates: Dict[str, Any]) -> bool:
        """更新 Auto-Reload 配置
        
        Args:
            updates: 要更新的配置字典
        
        Returns:
            是否更新成功
        """
        config = self.read_plugin_config()
        if not config:
            logger.error("无法读取插件配置，更新失败")
            return False
        
        # 确保 autoReload 字段存在
        if 'autoReload' not in config:
            config['autoReload'] = {}
        
        # 更新配置
        config['autoReload'].update(updates)
        
        # 写入配置
        return self.write_plugin_config(config)
    
    def trigger_plugin_reload(self, plugin_id: str) -> bool:
        """触发插件重载（通过配置文件）
        
        Args:
            plugin_id: 要重载的插件 ID
        
        Returns:
            是否成功添加重载请求
        """
        config = self.read_plugin_config()
        if not config:
            logger.error("无法读取插件配置，无法触发重载")
            return False
        
        # 添加重载请求
        import time
        config['_reloadRequest'] = {
            'pluginId': plugin_id,
            'timestamp': int(time.time() * 1000)
        }
        
        # 写入配置
        result = self.write_plugin_config(config)
        
        if result:
            logger.info(f"已添加重载请求: {plugin_id}")
        
        return result
    
    def get_watched_plugins(self) -> list:
        """获取监控的插件列表
        
        Returns:
            插件 ID 列表
        """
        auto_reload = self.get_auto_reload_config()
        if auto_reload and 'watchedPlugins' in auto_reload:
            return auto_reload['watchedPlugins']
        return []
    
    def set_watched_plugins(self, plugins: list) -> bool:
        """设置监控的插件列表
        
        Args:
            plugins: 插件 ID 列表
        
        Returns:
            是否设置成功
        """
        return self.update_auto_reload_config({
            'watchedPlugins': plugins
        })
    
    def add_watched_plugin(self, plugin_id: str) -> bool:
        """添加监控的插件
        
        Args:
            plugin_id: 插件 ID
        
        Returns:
            是否添加成功
        """
        plugins = self.get_watched_plugins()
        if plugin_id not in plugins:
            plugins.append(plugin_id)
            return self.set_watched_plugins(plugins)
        return True
    
    def remove_watched_plugin(self, plugin_id: str) -> bool:
        """移除监控的插件
        
        Args:
            plugin_id: 插件 ID
        
        Returns:
            是否移除成功
        """
        plugins = self.get_watched_plugins()
        if plugin_id in plugins:
            plugins.remove(plugin_id)
            return self.set_watched_plugins(plugins)
        return True
    
    def get_auto_reload_mode(self) -> str:
        """获取 Auto-Reload 模式
        
        Returns:
            模式名称（auto/smart/manual）
        """
        auto_reload = self.get_auto_reload_config()
        if auto_reload and 'mode' in auto_reload:
            return auto_reload['mode']
        return 'smart'  # 默认模式
    
    def set_auto_reload_mode(self, mode: str) -> bool:
        """设置 Auto-Reload 模式
        
        Args:
            mode: 模式名称（auto/smart/manual）
        
        Returns:
            是否设置成功
        """
        if mode not in ['auto', 'smart', 'manual']:
            logger.error(f"无效的模式: {mode}")
            return False
        
        return self.update_auto_reload_config({
            'mode': mode
        })

