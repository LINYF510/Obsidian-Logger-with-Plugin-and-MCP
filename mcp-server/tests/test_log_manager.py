"""
LogManager 模块单元测试
"""

import pytest
import os
from log_manager import LogManager


class TestLogManager:
    """LogManager 测试类"""
    
    def test_file_exists(self, temp_log_file):
        """测试文件存在检查"""
        manager = LogManager(temp_log_file)
        assert manager.file_exists() is True
        
        # 测试不存在的文件
        manager2 = LogManager('/nonexistent/file.log')
        assert manager2.file_exists() is False
    
    def test_get_file_size(self, temp_log_file):
        """测试获取文件大小"""
        manager = LogManager(temp_log_file)
        size = manager.get_file_size()
        
        assert size > 0
        assert isinstance(size, int)
    
    def test_get_file_size_nonexistent(self):
        """测试获取不存在文件的大小"""
        manager = LogManager('/nonexistent/file.log')
        assert manager.get_file_size() == 0
    
    def test_parse_log_line_valid(self, temp_log_file):
        """测试解析有效的日志行"""
        manager = LogManager(temp_log_file)
        
        line = '[10:30:45.123] [LOG] 测试消息'
        result = manager.parse_log_line(line)
        
        assert result is not None
        timestamp, level, message = result
        assert timestamp == '10:30:45.123'
        assert level == 'LOG'
        assert message == '测试消息'
    
    def test_parse_log_line_invalid(self, temp_log_file):
        """测试解析无效的日志行"""
        manager = LogManager(temp_log_file)
        
        line = 'invalid log line'
        result = manager.parse_log_line(line)
        
        assert result is None
    
    def test_read_logs(self, temp_log_file):
        """测试读取日志"""
        manager = LogManager(temp_log_file)
        
        result = manager.read_logs(lines=10, level='all')
        
        assert '📋 最近' in result
        assert '[LOG]' in result
        assert '[ERROR]' in result
        assert '[WARN]' in result
    
    def test_read_logs_filtered(self, temp_log_file):
        """测试按级别过滤日志"""
        manager = LogManager(temp_log_file)
        
        # 只读取 ERROR 级别
        result = manager.read_logs(lines=10, level='error')
        
        assert '[ERROR]' in result
        assert '10:30:46.456' in result  # 验证时间戳而不是中文消息
    
    def test_read_logs_nonexistent(self):
        """测试读取不存在的文件"""
        manager = LogManager('/nonexistent/file.log')
        result = manager.read_logs()
        
        assert '⚠️ 日志文件不存在' in result
    
    def test_get_summary_empty_file(self, empty_log_file):
        """测试空文件的统计摘要"""
        manager = LogManager(empty_log_file)
        result = manager.get_summary()
        
        assert '📊 日志统计摘要' in result
        assert '总行数：0' in result
        assert '日志文件为空' in result
    
    def test_get_summary_with_logs(self, temp_log_file):
        """测试有日志的文件统计"""
        manager = LogManager(temp_log_file)
        result = manager.get_summary()
        
        assert '📊 日志统计摘要' in result
        assert '总行数：5' in result
        assert '普通日志（LOG）' in result
        assert '错误日志（ERROR）' in result
        assert '警告日志（WARN）' in result
        assert '调试日志（DEBUG）' in result
    
    def test_get_summary_nonexistent(self):
        """测试不存在文件的统计"""
        manager = LogManager('/nonexistent/file.log')
        result = manager.get_summary()
        
        assert '⚠️ 日志文件不存在' in result
    
    def test_get_recent_errors(self, temp_log_file):
        """测试获取最近错误"""
        manager = LogManager(temp_log_file)
        result = manager.get_recent_errors(limit=5, include_stack=False)
        
        assert '最近' in result
        assert '10:30:46.456' in result  # 验证时间戳而不是中文消息
    
    def test_get_recent_errors_no_errors(self, temp_log_file):
        """测试无错误时的返回"""
        # 创建只有 LOG 的文件
        with open(temp_log_file, 'w', encoding='utf-8') as f:
            f.write('[10:30:45.123] [LOG] 测试日志\n')
        
        manager = LogManager(temp_log_file)
        result = manager.get_recent_errors()
        
        assert '✅ 未发现错误日志' in result
    
    def test_analyze_errors(self, temp_log_file):
        """测试错误分析"""
        manager = LogManager(temp_log_file)
        result = manager.analyze_errors(time_range_hours=24)
        
        # 应该有分析结果
        assert '🔍 错误深度分析' in result or '✅ 分析范围内未发现错误' in result
    
    def test_clear_logs_with_backup(self, temp_log_file):
        """测试带备份的清空日志"""
        manager = LogManager(temp_log_file)
        result = manager.clear_logs(backup=True)
        
        assert '✅ 日志已清空' in result
        assert '备份文件' in result
        
        # 验证文件已清空
        with open(temp_log_file, 'r', encoding='utf-8') as f:
            content = f.read()
        assert content == ''
    
    def test_clear_logs_without_backup(self, temp_log_file):
        """测试不备份的清空日志"""
        manager = LogManager(temp_log_file)
        result = manager.clear_logs(backup=False)
        
        assert '✅ 日志已清空' in result
        assert '备份' not in result or '备份文件' not in result
        
        # 验证文件已清空
        with open(temp_log_file, 'r', encoding='utf-8') as f:
            content = f.read()
        assert content == ''
    
    def test_clear_logs_nonexistent(self):
        """测试清空不存在的文件"""
        manager = LogManager('/nonexistent/file.log')
        result = manager.clear_logs()
        
        assert '⚠️ 日志文件不存在' in result
    
    def test_classify_error(self, temp_log_file):
        """测试错误分类"""
        manager = LogManager(temp_log_file)
        
        assert '🔧 TypeError' in manager._classify_error('TypeError: undefined')
        assert '🔍 ReferenceError' in manager._classify_error('ReferenceError: x is not defined')
        assert '❓ Undefined' in manager._classify_error('Cannot read property of undefined')
        assert '🚫 Null Reference' in manager._classify_error('Cannot read null')
        assert '🌐 Network Error' in manager._classify_error('Network request failed')
        assert '🔒 Permission Error' in manager._classify_error('Permission denied')
        assert '📁 File Error' in manager._classify_error('File not found')
        assert '❗ Other Error' in manager._classify_error('Unknown error')
    
    def test_format_file_size(self, temp_log_file):
        """测试文件大小格式化"""
        manager = LogManager(temp_log_file)
        
        assert manager._format_file_size(0) == '0.00 B'
        assert manager._format_file_size(1023) == '1023.00 B'
        assert manager._format_file_size(1024) == '1.00 KB'
        assert manager._format_file_size(1024 * 1024) == '1.00 MB'
        assert manager._format_file_size(1024 * 1024 * 1024) == '1.00 GB'
    
    def test_format_relative_time(self, temp_log_file):
        """测试相对时间格式化"""
        import time
        manager = LogManager(temp_log_file)
        
        now = time.time()
        
        assert '刚刚' in manager._format_relative_time(now - 5)
        assert '秒前' in manager._format_relative_time(now - 30)
        assert '分钟前' in manager._format_relative_time(now - 120)
        assert '小时前' in manager._format_relative_time(now - 7200)
        assert '天前' in manager._format_relative_time(now - 86400 * 2)

