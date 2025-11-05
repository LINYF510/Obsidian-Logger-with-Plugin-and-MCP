"""
缓存系统模块

提供多层缓存机制，提升性能
"""

import time
import logging
from collections import deque
from typing import Optional, Dict, Any, List

logger = logging.getLogger(__name__)


class LogCache:
    """日志缓存系统
    
    提供日志条目缓存、统计缓存和自动失效机制
    """
    
    def __init__(self, max_size: int = 1000, cache_ttl: int = 300):
        """初始化缓存系统
        
        Args:
            max_size: 最大缓存条目数
            cache_ttl: 缓存过期时间（秒）
        """
        self.max_size = max_size
        self.cache_ttl = cache_ttl
        
        # 日志条目缓存（环形缓冲区）
        self.log_entries: deque = deque(maxlen=max_size)
        
        # 统计数据缓存
        self.summary_cache: Optional[str] = None
        self.summary_cache_time: float = 0
        
        # 错误列表缓存
        self.errors_cache: Optional[str] = None
        self.errors_cache_time: float = 0
        self.errors_cache_limit: int = 0
        
        # 错误分析缓存
        self.analysis_cache: Optional[str] = None
        self.analysis_cache_time: float = 0
        self.analysis_cache_hours: int = 0
        
        # 文件元数据缓存
        self.file_metadata: Dict[str, Any] = {
            'size': 0,
            'mtime': 0,
            'lines': 0
        }
        
        logger.info(f"缓存系统已初始化 (max_size={max_size}, ttl={cache_ttl}s)")
    
    def add_log_entry(self, entry: str) -> None:
        """添加日志条目到缓存
        
        Args:
            entry: 日志条目
        """
        self.log_entries.append(entry)
    
    def get_log_entries(self, count: Optional[int] = None) -> List[str]:
        """获取缓存的日志条目
        
        Args:
            count: 返回的数量，None 表示全部
        
        Returns:
            日志条目列表
        """
        if count is None:
            return list(self.log_entries)
        else:
            return list(self.log_entries)[-count:] if len(self.log_entries) > count else list(self.log_entries)
    
    def get_cached_summary(self) -> Optional[str]:
        """获取缓存的统计摘要（如果未过期）
        
        Returns:
            缓存的摘要，如果过期或不存在则返回 None
        """
        if self.summary_cache is None:
            return None
        
        # 检查是否过期
        if time.time() - self.summary_cache_time > self.cache_ttl:
            logger.debug("统计摘要缓存已过期")
            self.summary_cache = None
            return None
        
        logger.debug("命中统计摘要缓存")
        return self.summary_cache
    
    def set_summary_cache(self, summary: str) -> None:
        """设置统计摘要缓存
        
        Args:
            summary: 统计摘要
        """
        self.summary_cache = summary
        self.summary_cache_time = time.time()
        logger.debug("已更新统计摘要缓存")
    
    def get_cached_errors(self, limit: int) -> Optional[str]:
        """获取缓存的错误列表（如果未过期且参数匹配）
        
        Args:
            limit: 错误数量限制
        
        Returns:
            缓存的错误列表，如果过期或参数不匹配则返回 None
        """
        if self.errors_cache is None or self.errors_cache_limit != limit:
            return None
        
        # 检查是否过期
        if time.time() - self.errors_cache_time > self.cache_ttl:
            logger.debug("错误列表缓存已过期")
            self.errors_cache = None
            return None
        
        logger.debug(f"命中错误列表缓存 (limit={limit})")
        return self.errors_cache
    
    def set_errors_cache(self, errors: str, limit: int) -> None:
        """设置错误列表缓存
        
        Args:
            errors: 错误列表
            limit: 错误数量限制
        """
        self.errors_cache = errors
        self.errors_cache_time = time.time()
        self.errors_cache_limit = limit
        logger.debug(f"已更新错误列表缓存 (limit={limit})")
    
    def get_cached_analysis(self, hours: int) -> Optional[str]:
        """获取缓存的错误分析（如果未过期且参数匹配）
        
        Args:
            hours: 分析时间范围（小时）
        
        Returns:
            缓存的分析结果，如果过期或参数不匹配则返回 None
        """
        if self.analysis_cache is None or self.analysis_cache_hours != hours:
            return None
        
        # 检查是否过期
        if time.time() - self.analysis_cache_time > self.cache_ttl:
            logger.debug("错误分析缓存已过期")
            self.analysis_cache = None
            return None
        
        logger.debug(f"命中错误分析缓存 (hours={hours})")
        return self.analysis_cache
    
    def set_analysis_cache(self, analysis: str, hours: int) -> None:
        """设置错误分析缓存
        
        Args:
            analysis: 分析结果
            hours: 分析时间范围（小时）
        """
        self.analysis_cache = analysis
        self.analysis_cache_time = time.time()
        self.analysis_cache_hours = hours
        logger.debug(f"已更新错误分析缓存 (hours={hours})")
    
    def update_file_metadata(self, size: int, mtime: float, lines: int) -> None:
        """更新文件元数据缓存
        
        Args:
            size: 文件大小
            mtime: 修改时间
            lines: 行数
        """
        self.file_metadata = {
            'size': size,
            'mtime': mtime,
            'lines': lines
        }
        logger.debug(f"已更新文件元数据缓存 (size={size}, lines={lines})")
    
    def get_file_metadata(self) -> Dict[str, Any]:
        """获取文件元数据缓存
        
        Returns:
            文件元数据字典
        """
        return self.file_metadata.copy()
    
    def invalidate(self) -> None:
        """使所有缓存失效"""
        self.summary_cache = None
        self.errors_cache = None
        self.analysis_cache = None
        logger.info("所有缓存已失效")
    
    def invalidate_summary(self) -> None:
        """使统计摘要缓存失效"""
        self.summary_cache = None
        logger.debug("统计摘要缓存已失效")
    
    def invalidate_errors(self) -> None:
        """使错误列表缓存失效"""
        self.errors_cache = None
        logger.debug("错误列表缓存已失效")
    
    def invalidate_analysis(self) -> None:
        """使错误分析缓存失效"""
        self.analysis_cache = None
        logger.debug("错误分析缓存已失效")
    
    def get_cache_stats(self) -> Dict[str, Any]:
        """获取缓存统计信息
        
        Returns:
            缓存统计字典
        """
        current_time = time.time()
        
        return {
            'log_entries_count': len(self.log_entries),
            'log_entries_max': self.max_size,
            'summary_cached': self.summary_cache is not None,
            'summary_age': current_time - self.summary_cache_time if self.summary_cache else 0,
            'errors_cached': self.errors_cache is not None,
            'errors_age': current_time - self.errors_cache_time if self.errors_cache else 0,
            'analysis_cached': self.analysis_cache is not None,
            'analysis_age': current_time - self.analysis_cache_time if self.analysis_cache else 0,
            'cache_ttl': self.cache_ttl
        }
    
    def clear(self) -> None:
        """清空所有缓存"""
        self.log_entries.clear()
        self.invalidate()
        self.file_metadata = {
            'size': 0,
            'mtime': 0,
            'lines': 0
        }
        logger.info("缓存已清空")

