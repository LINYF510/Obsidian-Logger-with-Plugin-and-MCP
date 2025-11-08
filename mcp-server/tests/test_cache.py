"""
Cache 模块单元测试
"""

import pytest
import time
from cache import LogCache


class TestLogCache:
    """LogCache 测试类"""
    
    def test_init(self):
        """测试初始化"""
        cache = LogCache(max_size=100)
        
        assert cache.max_size == 100
        assert len(cache.log_entries) == 0
    
    def test_add_log_entry(self):
        """测试添加日志条目"""
        cache = LogCache(max_size=10)
        
        cache.add_log_entry('[10:30:45.123] [LOG] Test log')
        
        assert len(cache.log_entries) == 1
        assert cache.log_entries[0] == '[10:30:45.123] [LOG] Test log'
    
    def test_max_size_limit(self):
        """测试最大容量限制"""
        cache = LogCache(max_size=5)
        
        # 添加 10 条日志
        for i in range(10):
            cache.add_log_entry(f'[10:30:{i:02d}.000] [LOG] Log {i}')
        
        # 应该只保留最后 5 条
        assert len(cache.log_entries) == 5
        assert 'Log 5' in cache.log_entries[0]
        assert 'Log 9' in cache.log_entries[4]
    
    def test_get_log_entries_all(self):
        """测试获取所有日志条目"""
        cache = LogCache(max_size=10)
        
        entries = [
            '[10:30:01.000] [LOG] Log 1',
            '[10:30:02.000] [LOG] Log 2',
            '[10:30:03.000] [LOG] Log 3'
        ]
        
        for entry in entries:
            cache.add_log_entry(entry)
        
        result = cache.get_log_entries(count=None)
        
        assert result == entries
        assert len(result) == 3
    
    def test_get_log_entries_limited(self):
        """测试获取限定数量的日志条目"""
        cache = LogCache(max_size=10)
        
        for i in range(5):
            cache.add_log_entry(f'[10:30:{i:02d}.000] [LOG] Log {i}')
        
        # 获取最近 3 条
        recent = cache.get_log_entries(count=3)
        
        assert len(recent) == 3
        assert 'Log 2' in recent[0]
        assert 'Log 4' in recent[2]
    
    def test_get_log_entries_more_than_available(self):
        """测试获取超过可用数量的条目"""
        cache = LogCache(max_size=10)
        
        cache.add_log_entry('[10:30:01.000] [LOG] Log 1')
        cache.add_log_entry('[10:30:02.000] [LOG] Log 2')
        
        # 请求 5 条但只有 2 条
        recent = cache.get_log_entries(count=5)
        
        assert len(recent) == 2
    
    def test_summary_cache(self):
        """测试统计摘要缓存"""
        cache = LogCache(max_size=10, cache_ttl=1)
        
        # 设置缓存
        cache.set_summary_cache('Test Summary')
        
        # 应该能获取缓存
        result = cache.get_cached_summary()
        assert result == 'Test Summary'
        
        # 等待过期
        time.sleep(1.5)
        
        # 应该过期
        result = cache.get_cached_summary()
        assert result is None
    
    def test_errors_cache(self):
        """测试错误列表缓存"""
        cache = LogCache(max_size=10, cache_ttl=1)
        
        # 设置缓存
        cache.set_errors_cache('Error List', limit=5)
        
        # 应该能获取缓存
        result = cache.get_cached_errors(limit=5)
        assert result == 'Error List'
        
        # 不同的 limit 应该返回 None
        result = cache.get_cached_errors(limit=10)
        assert result is None
    
    def test_analysis_cache(self):
        """测试分析结果缓存"""
        cache = LogCache(max_size=10, cache_ttl=1)
        
        # 设置缓存
        cache.set_analysis_cache('Analysis Result', hours=24)
        
        # 应该能获取缓存
        result = cache.get_cached_analysis(hours=24)
        assert result == 'Analysis Result'
        
        # 不同的 hours 应该返回 None
        result = cache.get_cached_analysis(hours=12)
        assert result is None
    
    def test_clear(self):
        """测试清空所有缓存"""
        cache = LogCache(max_size=10)
        
        # 添加一些数据
        cache.add_log_entry('[10:30:01.000] [LOG] Log')
        cache.set_summary_cache('Summary')
        cache.set_errors_cache('Errors', 5)
        
        # 清空
        cache.clear()
        
        # 验证已清空
        assert len(cache.log_entries) == 0
        assert cache.summary_cache is None
        assert cache.errors_cache is None
    
    def test_update_file_metadata(self):
        """测试更新文件元数据"""
        cache = LogCache(max_size=10)
        
        cache.update_file_metadata(size=1024, mtime=123456, lines=100)
        
        assert cache.file_metadata['size'] == 1024
        assert cache.file_metadata['mtime'] == 123456
        assert cache.file_metadata['lines'] == 100

