"""
pytest 配置和通用 fixtures
"""

import sys
import os

# 确保 UTF-8 编码（Windows 环境兼容）
# 设置环境变量，由 GitHub Actions 和文件操作使用
os.environ['PYTHONIOENCODING'] = 'utf-8'

import pytest
import tempfile
import json
from pathlib import Path


@pytest.fixture
def temp_log_file():
    """创建临时日志文件"""
    with tempfile.NamedTemporaryFile(mode='w', encoding='utf-8', suffix='.log', delete=False) as f:
        temp_path = f.name
        f.write('[10:30:45.123] [LOG] 测试日志 1\n')
        f.write('[10:30:46.456] [ERROR] 测试错误\n')
        f.write('[10:30:47.789] [WARN] 测试警告\n')
        f.write('[10:30:48.012] [LOG] 测试日志 2\n')
        f.write('[10:30:49.345] [DEBUG] 测试调试\n')
    
    yield temp_path
    
    # 清理
    if os.path.exists(temp_path):
        os.unlink(temp_path)


@pytest.fixture
def empty_log_file():
    """创建空的临时日志文件"""
    with tempfile.NamedTemporaryFile(mode='w', encoding='utf-8', suffix='.log', delete=False) as f:
        temp_path = f.name
        f.write('')
    
    yield temp_path
    
    # 清理
    if os.path.exists(temp_path):
        os.unlink(temp_path)


@pytest.fixture
def temp_config_file():
    """创建临时配置文件"""
    config = {
        "vault_path": "/mock/vault/path",
        "log_file_path": "/mock/logs/obsidian-debug.log"
    }
    
    with tempfile.NamedTemporaryFile(mode='w', encoding='utf-8', suffix='.json', delete=False) as f:
        temp_path = f.name
        json.dump(config, f, ensure_ascii=False)
    
    yield temp_path
    
    # 清理
    if os.path.exists(temp_path):
        os.unlink(temp_path)


@pytest.fixture
def temp_plugin_data():
    """创建临时插件配置文件"""
    data = {
        "logger": {
            "bufferSize": 100,
            "flushInterval": 500
        },
        "autoReload": {
            "mode": "smart",
            "watchedPlugins": ["test-plugin"],
            "checkInterval": 1000
        },
        "mcp": {
            "enabled": True,
            "autoRefreshSettings": True,
            "refreshInterval": 2000,
            "configMonitorInterval": 500
        }
    }
    
    with tempfile.NamedTemporaryFile(mode='w', encoding='utf-8', suffix='.json', delete=False) as f:
        temp_path = f.name
        json.dump(data, f, ensure_ascii=False)
    
    yield temp_path
    
    # 清理
    if os.path.exists(temp_path):
        os.unlink(temp_path)


@pytest.fixture
def temp_dir():
    """创建临时目录"""
    temp_path = tempfile.mkdtemp()
    yield temp_path
    
    # 清理
    import shutil
    if os.path.exists(temp_path):
        shutil.rmtree(temp_path)

