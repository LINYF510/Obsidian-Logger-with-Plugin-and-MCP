"""
文件监听模块

使用 watchdog 监听日志文件变化，自动更新缓存
"""

import os
import time
import logging
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler, FileModifiedEvent
from typing import Callable, Optional

logger = logging.getLogger(__name__)


class LogFileHandler(FileSystemEventHandler):
    """日志文件事件处理器
    
    处理日志文件的修改事件，支持防抖
    """
    
    def __init__(self, log_file_path: str, on_modified: Callable, debounce_ms: int = 100):
        """初始化事件处理器
        
        Args:
            log_file_path: 日志文件路径
            on_modified: 文件修改时的回调函数
            debounce_ms: 防抖延迟（毫秒）
        """
        super().__init__()
        self.log_file_path = os.path.abspath(log_file_path)
        self.on_modified = on_modified
        self.debounce_ms = debounce_ms
        self.last_event_time = 0
        
        logger.info(f"事件处理器已初始化: {self.log_file_path}")
    
    def on_modified(self, event):
        """文件修改事件处理
        
        Args:
            event: 文件系统事件
        """
        # 只处理文件修改事件
        if not isinstance(event, FileModifiedEvent):
            return
        
        # 只处理目标日志文件
        event_path = os.path.abspath(event.src_path)
        if event_path != self.log_file_path:
            return
        
        # 防抖处理
        current_time = time.time() * 1000
        if current_time - self.last_event_time < self.debounce_ms:
            logger.debug("事件被防抖过滤")
            return
        
        self.last_event_time = current_time
        
        # 调用回调
        logger.debug(f"检测到文件修改: {event.src_path}")
        self.on_modified()


class FileMonitor:
    """文件监听器
    
    监听日志文件的变化并触发缓存更新
    """
    
    def __init__(self, log_file_path: str, cache, debounce_ms: int = 100):
        """初始化文件监听器
        
        Args:
            log_file_path: 日志文件路径
            cache: 缓存对象
            debounce_ms: 防抖延迟（毫秒）
        """
        self.log_file_path = log_file_path
        self.cache = cache
        self.debounce_ms = debounce_ms
        
        # 确定监听目录
        self.log_dir = os.path.dirname(os.path.abspath(log_file_path))
        
        # 创建观察者和事件处理器
        self.observer: Optional[Observer] = None
        self.handler: Optional[LogFileHandler] = None
        
        logger.info(f"文件监听器已初始化")
        logger.info(f"监听目录: {self.log_dir}")
        logger.info(f"目标文件: {os.path.basename(log_file_path)}")
    
    def _on_file_modified(self):
        """文件修改回调"""
        logger.info("日志文件已修改，使缓存失效")
        self.cache.invalidate()
    
    def start(self) -> bool:
        """启动文件监听
        
        Returns:
            是否启动成功
        """
        try:
            # 确保监听目录存在
            if not os.path.exists(self.log_dir):
                logger.warning(f"监听目录不存在: {self.log_dir}")
                logger.info("将在目录创建后开始监听")
                os.makedirs(self.log_dir, exist_ok=True)
            
            # 创建事件处理器
            self.handler = LogFileHandler(
                self.log_file_path,
                self._on_file_modified,
                self.debounce_ms
            )
            
            # 创建观察者
            self.observer = Observer()
            self.observer.schedule(
                self.handler,
                self.log_dir,
                recursive=False
            )
            
            # 启动观察者
            self.observer.start()
            
            logger.info("文件监听已启动")
            return True
        
        except Exception as e:
            logger.error(f"启动文件监听失败: {e}")
            return False
    
    def stop(self) -> None:
        """停止文件监听"""
        if self.observer:
            try:
                self.observer.stop()
                self.observer.join(timeout=5)
                logger.info("文件监听已停止")
            except Exception as e:
                logger.error(f"停止文件监听失败: {e}")
            finally:
                self.observer = None
                self.handler = None
    
    def is_running(self) -> bool:
        """检查监听器是否运行中
        
        Returns:
            是否运行中
        """
        return self.observer is not None and self.observer.is_alive()
    
    def __del__(self):
        """析构函数，确保停止监听"""
        self.stop()

