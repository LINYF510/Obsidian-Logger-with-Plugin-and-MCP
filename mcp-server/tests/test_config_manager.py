"""
ConfigManager 模块单元测试
"""

import pytest
import os
import json
import tempfile
from src.config_manager import ConfigManager


class TestConfigManager:
    """ConfigManager 测试类"""
    
    @pytest.fixture
    def config_file(self, temp_dir):
        """创建测试配置文件"""
        config = {
            "vault_path": temp_dir,
            "log_file_path": os.path.join(temp_dir, "logs", "test.log")
        }
        
        config_path = os.path.join(temp_dir, 'config.json')
        with open(config_path, 'w', encoding='utf-8') as f:
            json.dump(config, f)
        
        return config_path
    
    @pytest.fixture
    def plugin_data_file(self, temp_dir):
        """创建测试插件配置文件"""
        plugin_dir = os.path.join(temp_dir, '.obsidian', 'plugins', 'obsidian-logger')
        os.makedirs(plugin_dir, exist_ok=True)
        
        data = {
            "autoReload": {
                "mode": "smart",
                "watchedPlugins": ["test-plugin"]
            }
        }
        
        data_path = os.path.join(plugin_dir, 'data.json')
        with open(data_path, 'w', encoding='utf-8') as f:
            json.dump(data, f)
        
        return data_path
    
    def test_init(self, config_file):
        """测试初始化"""
        manager = ConfigManager(config_file)
        
        assert manager.config_path == config_file
        assert manager.vault_path is not None
        assert manager.plugin_data_path is not None
    
    def test_get_log_file_path(self, config_file):
        """测试获取日志文件路径"""
        manager = ConfigManager(config_file)
        log_path = manager.get_log_file_path()
        
        assert log_path is not None
        assert log_path.endswith('test.log')
    
    def test_read_plugin_config(self, config_file, plugin_data_file):
        """测试读取插件配置"""
        manager = ConfigManager(config_file)
        config = manager.read_plugin_config()
        
        assert config is not None
        assert 'autoReload' in config
        assert config['autoReload']['mode'] == 'smart'
    
    def test_read_plugin_config_nonexistent(self, config_file):
        """测试读取不存在的插件配置"""
        manager = ConfigManager(config_file)
        config = manager.read_plugin_config()
        
        assert config is None
    
    def test_write_plugin_config(self, config_file, temp_dir):
        """测试写入插件配置"""
        # 创建插件目录
        plugin_dir = os.path.join(temp_dir, '.obsidian', 'plugins', 'obsidian-logger')
        os.makedirs(plugin_dir, exist_ok=True)
        
        manager = ConfigManager(config_file)
        
        test_config = {
            "autoReload": {
                "mode": "manual",
                "watchedPlugins": ["plugin1", "plugin2"]
            }
        }
        
        result = manager.write_plugin_config(test_config)
        
        assert result is True
        assert os.path.exists(manager.plugin_data_path)
        
        # 验证写入的内容
        with open(manager.plugin_data_path, 'r', encoding='utf-8') as f:
            saved_config = json.load(f)
        
        assert saved_config == test_config
    
    def test_get_auto_reload_config(self, config_file, plugin_data_file):
        """测试获取 Auto-Reload 配置"""
        manager = ConfigManager(config_file)
        ar_config = manager.get_auto_reload_config()
        
        assert ar_config is not None
        assert 'mode' in ar_config
        assert ar_config['mode'] == 'smart'
    
    def test_update_auto_reload_config(self, config_file, plugin_data_file):
        """测试更新 Auto-Reload 配置"""
        manager = ConfigManager(config_file)
        
        updates = {
            "mode": "manual",
            "checkInterval": 2000
        }
        
        result = manager.update_auto_reload_config(updates)
        
        assert result is True
        
        # 验证更新后的配置
        ar_config = manager.get_auto_reload_config()
        assert ar_config['mode'] == 'manual'
        assert ar_config['checkInterval'] == 2000
    
    def test_get_watched_plugins(self, config_file, plugin_data_file):
        """测试获取监控插件列表"""
        manager = ConfigManager(config_file)
        plugins = manager.get_watched_plugins()
        
        assert isinstance(plugins, list)
        assert 'test-plugin' in plugins
    
    def test_set_watched_plugins(self, config_file, plugin_data_file):
        """测试设置监控插件列表"""
        manager = ConfigManager(config_file)
        
        new_plugins = ['plugin1', 'plugin2', 'plugin3']
        result = manager.set_watched_plugins(new_plugins)
        
        assert result is True
        
        # 验证设置后的列表
        plugins = manager.get_watched_plugins()
        assert plugins == new_plugins
    
    def test_add_watched_plugin(self, config_file, plugin_data_file):
        """测试添加监控插件"""
        manager = ConfigManager(config_file)
        
        result = manager.add_watched_plugin('new-plugin')
        
        assert result is True
        
        plugins = manager.get_watched_plugins()
        assert 'new-plugin' in plugins
    
    def test_add_watched_plugin_duplicate(self, config_file, plugin_data_file):
        """测试添加已存在的插件"""
        manager = ConfigManager(config_file)
        
        # 添加已存在的插件
        result = manager.add_watched_plugin('test-plugin')
        
        assert result is True
        
        # 列表不应该重复
        plugins = manager.get_watched_plugins()
        assert plugins.count('test-plugin') == 1
    
    def test_remove_watched_plugin(self, config_file, plugin_data_file):
        """测试移除监控插件"""
        manager = ConfigManager(config_file)
        
        result = manager.remove_watched_plugin('test-plugin')
        
        assert result is True
        
        plugins = manager.get_watched_plugins()
        assert 'test-plugin' not in plugins
    
    def test_get_auto_reload_mode(self, config_file, plugin_data_file):
        """测试获取 Auto-Reload 模式"""
        manager = ConfigManager(config_file)
        mode = manager.get_auto_reload_mode()
        
        assert mode == 'smart'
    
    def test_set_auto_reload_mode(self, config_file, plugin_data_file):
        """测试设置 Auto-Reload 模式"""
        manager = ConfigManager(config_file)
        
        # 测试有效模式
        assert manager.set_auto_reload_mode('manual') is True
        assert manager.get_auto_reload_mode() == 'manual'
        
        assert manager.set_auto_reload_mode('auto') is True
        assert manager.get_auto_reload_mode() == 'auto'
    
    def test_set_invalid_mode(self, config_file, plugin_data_file):
        """测试设置无效模式"""
        manager = ConfigManager(config_file)
        
        result = manager.set_auto_reload_mode('invalid')
        
        assert result is False
    
    def test_trigger_plugin_reload(self, config_file, plugin_data_file):
        """测试触发插件重载"""
        manager = ConfigManager(config_file)
        
        result = manager.trigger_plugin_reload('test-plugin')
        
        assert result is True
        
        # 验证重载请求已添加
        config = manager.read_plugin_config()
        assert '_reloadRequest' in config
        assert config['_reloadRequest']['pluginId'] == 'test-plugin'
        assert 'timestamp' in config['_reloadRequest']

