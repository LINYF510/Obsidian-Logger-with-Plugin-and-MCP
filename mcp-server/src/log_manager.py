"""
日志文件管理模块

负责读取、解析、统计和管理日志文件
"""

import os
import re
import time
import logging
from typing import List, Dict, Optional, Tuple
from datetime import datetime, timedelta
from collections import defaultdict

logger = logging.getLogger(__name__)


class LogManager:
    """日志管理器
    
    管理日志文件的读取、解析、统计和分析
    """
    
    # 日志格式：[HH:MM:SS.mmm] [LEVEL] message
    LOG_PATTERN = re.compile(r'\[(\d{2}:\d{2}:\d{2}\.\d{3})\]\s+\[(\w+)\]\s+(.*)')
    
    def __init__(self, log_file_path: str):
        """初始化日志管理器
        
        Args:
            log_file_path: 日志文件路径
        """
        self.log_file_path = log_file_path
        logger.info(f"日志管理器已初始化: {log_file_path}")
    
    def file_exists(self) -> bool:
        """检查日志文件是否存在
        
        Returns:
            文件是否存在
        """
        return os.path.exists(self.log_file_path)
    
    def get_file_size(self) -> int:
        """获取文件大小（字节）
        
        Returns:
            文件大小，如果文件不存在则返回 0
        """
        if not self.file_exists():
            return 0
        return os.path.getsize(self.log_file_path)
    
    def get_file_mtime(self) -> Optional[float]:
        """获取文件最后修改时间
        
        Returns:
            修改时间戳，如果文件不存在则返回 None
        """
        if not self.file_exists():
            return None
        return os.path.getmtime(self.log_file_path)
    
    def read_logs(self, lines: int = 50, level: str = 'all') -> str:
        """读取日志内容
        
        Args:
            lines: 读取的行数（从文件末尾开始）
            level: 日志级别过滤（all/log/error/warn/debug）
        
        Returns:
            日志内容字符串
        """
        if not self.file_exists():
            return "⚠️ 日志文件不存在"
        
        try:
            # 读取文件末尾指定行数
            with open(self.log_file_path, 'r', encoding='utf-8', errors='ignore') as f:
                all_lines = f.readlines()
            
            # 根据级别过滤
            if level.lower() != 'all':
                level_upper = level.upper()
                filtered_lines = [
                    line for line in all_lines
                    if f'[{level_upper}]' in line
                ]
            else:
                filtered_lines = all_lines
            
            # 取最后 N 行
            selected_lines = filtered_lines[-lines:] if len(filtered_lines) > lines else filtered_lines
            
            # 添加头部信息
            header = f"📋 最近 {len(selected_lines)} 条日志"
            if level.lower() != 'all':
                header += f" (级别: {level.upper()})"
            header += f"\n{'─' * 60}\n"
            
            return header + ''.join(selected_lines)
        
        except Exception as e:
            logger.error(f"读取日志失败: {e}")
            return f"❌ 读取日志失败: {str(e)}"
    
    def parse_log_line(self, line: str) -> Optional[Tuple[str, str, str]]:
        """解析日志行
        
        Args:
            line: 日志行
        
        Returns:
            (时间戳, 级别, 消息) 或 None
        """
        match = self.LOG_PATTERN.match(line)
        if match:
            return match.group(1), match.group(2), match.group(3)
        return None
    
    def get_summary(self) -> str:
        """获取日志统计摘要
        
        Returns:
            格式化的统计摘要
        """
        if not self.file_exists():
            return "⚠️ 日志文件不存在"
        
        try:
            # 读取文件
            with open(self.log_file_path, 'r', encoding='utf-8', errors='ignore') as f:
                lines = f.readlines()
            
            # 统计信息
            total_lines = len(lines)
            level_counts = defaultdict(int)
            first_time = None
            last_time = None
            
            # 如果文件为空，返回特殊提示
            if total_lines == 0:
                file_size = self.get_file_size()
                size_str = self._format_file_size(file_size)
                mtime = self.get_file_mtime()
                time_str = self._format_relative_time(mtime) if mtime else 'N/A'
                
                return f"""
📊 日志统计摘要
{'━' * 60}
📁 文件路径：{self.log_file_path}
💾 文件大小：{size_str}
📈 总行数：0
⏱️ 最后更新：{time_str}

✅ 日志文件为空（刚清空或首次运行）
{'━' * 60}
""".strip()
            
            for line in lines:
                parsed = self.parse_log_line(line)
                if parsed:
                    timestamp, level, message = parsed
                    level_counts[level] += 1
                    
                    if first_time is None:
                        first_time = timestamp
                    last_time = timestamp
            
            # 计算统计数据
            log_count = level_counts.get('LOG', 0)
            error_count = level_counts.get('ERROR', 0)
            warn_count = level_counts.get('WARN', 0)
            debug_count = level_counts.get('DEBUG', 0)
            
            error_rate = (error_count / total_lines * 100) if total_lines > 0 else 0
            
            # 文件信息
            file_size = self.get_file_size()
            size_str = self._format_file_size(file_size)
            
            mtime = self.get_file_mtime()
            time_str = self._format_relative_time(mtime) if mtime else 'N/A'
            
            # 生成报告
            report = f"""
📊 日志统计摘要
{'━' * 60}
📁 文件路径：{self.log_file_path}
💾 文件大小：{size_str}
📈 总行数：{total_lines:,}
⏱️ 最后更新：{time_str}

📝 日志级别分布：
├─ 🔵 普通日志（LOG）：{log_count:,} ({(log_count/total_lines*100):.1f}%)
├─ 🟡 警告日志（WARN）：{warn_count:,} ({(warn_count/total_lines*100):.1f}%)
├─ 🔴 错误日志（ERROR）：{error_count:,} ({(error_count/total_lines*100):.1f}%)
└─ ⚪ 调试日志（DEBUG）：{debug_count:,} ({(debug_count/total_lines*100):.1f}%)

📊 统计指标：
├─ 错误率：{error_rate:.2f}%
├─ 首条日志：{first_time or 'N/A'}
└─ 末条日志：{last_time or 'N/A'}

{'⚠️ 警告：错误率较高，建议检查' if error_rate > 5 else '✅ 日志状态良好'}
{'━' * 60}
""".strip()
            
            return report
        
        except Exception as e:
            logger.error(f"获取统计失败: {e}")
            return f"❌ 获取统计失败: {str(e)}"
    
    def get_recent_errors(self, limit: int = 10, include_stack: bool = False) -> str:
        """获取最近的错误日志
        
        Args:
            limit: 返回的错误数量
            include_stack: 是否包含堆栈信息
        
        Returns:
            格式化的错误列表
        """
        if not self.file_exists():
            return "⚠️ 日志文件不存在"
        
        try:
            with open(self.log_file_path, 'r', encoding='utf-8', errors='ignore') as f:
                lines = f.readlines()
            
            # 提取错误日志
            errors = []
            for i, line in enumerate(lines):
                if '[ERROR]' in line:
                    parsed = self.parse_log_line(line)
                    if parsed:
                        timestamp, level, message = parsed
                        error_info = {
                            'timestamp': timestamp,
                            'message': message,
                            'line_num': i + 1
                        }
                        
                        # 如果需要堆栈信息，查找后续行
                        if include_stack and i + 1 < len(lines):
                            stack_lines = []
                            for j in range(i + 1, min(i + 10, len(lines))):
                                next_line = lines[j]
                                # 如果下一行还是错误相关，添加到堆栈
                                if not self.parse_log_line(next_line):
                                    stack_lines.append(next_line.strip())
                                else:
                                    break
                            if stack_lines:
                                error_info['stack'] = '\n'.join(stack_lines)
                        
                        errors.append(error_info)
            
            # 取最近的 N 个
            recent_errors = errors[-limit:] if len(errors) > limit else errors
            
            if not recent_errors:
                return "✅ 未发现错误日志"
            
            # 格式化输出
            header = f"🔴 最近 {len(recent_errors)} 个错误\n{'─' * 60}\n"
            result = header
            
            for i, error in enumerate(recent_errors, 1):
                result += f"\n{i}. [{error['timestamp']}] (行 {error['line_num']})\n"
                result += f"   {error['message']}\n"
                if include_stack and 'stack' in error:
                    result += f"   堆栈:\n"
                    for stack_line in error['stack'].split('\n'):
                        result += f"     {stack_line}\n"
            
            return result
        
        except Exception as e:
            logger.error(f"获取错误日志失败: {e}")
            return f"❌ 获取错误日志失败: {str(e)}"
    
    def analyze_errors(self, time_range_hours: int = 24) -> str:
        """深度错误分析
        
        Args:
            time_range_hours: 分析的时间范围（小时）
        
        Returns:
            格式化的分析报告
        """
        if not self.file_exists():
            return "⚠️ 日志文件不存在"
        
        try:
            with open(self.log_file_path, 'r', encoding='utf-8', errors='ignore') as f:
                lines = f.readlines()
            
            # 错误分类统计
            error_patterns = defaultdict(int)
            error_examples = defaultdict(list)
            total_errors = 0
            
            for line in lines:
                if '[ERROR]' in line:
                    total_errors += 1
                    parsed = self.parse_log_line(line)
                    if parsed:
                        timestamp, level, message = parsed
                        
                        # 尝试识别错误类型
                        error_type = self._classify_error(message)
                        error_patterns[error_type] += 1
                        
                        # 保存示例（每种最多3个）
                        if len(error_examples[error_type]) < 3:
                            error_examples[error_type].append({
                                'timestamp': timestamp,
                                'message': message[:100]  # 限制长度
                            })
            
            if total_errors == 0:
                return "✅ 分析范围内未发现错误"
            
            # 生成报告
            report = f"""
🔍 错误深度分析
{'━' * 60}
⏱️ 分析范围：最近 {time_range_hours} 小时
📊 错误总数：{total_errors}

📋 错误分类统计：
"""
            
            # 按频率排序
            sorted_patterns = sorted(error_patterns.items(), key=lambda x: x[1], reverse=True)
            
            for error_type, count in sorted_patterns:
                percentage = (count / total_errors * 100)
                report += f"\n{error_type}：{count} 次 ({percentage:.1f}%)\n"
                
                # 显示示例
                for example in error_examples[error_type]:
                    report += f"  └─ [{example['timestamp']}] {example['message']}\n"
            
            # 修复建议
            report += f"\n{'─' * 60}\n💡 修复建议：\n"
            for error_type, count in sorted_patterns[:3]:  # 只针对前3种
                suggestions = self._get_fix_suggestions(error_type)
                if suggestions:
                    report += f"\n{error_type}:\n"
                    for suggestion in suggestions:
                        report += f"  • {suggestion}\n"
            
            report += f"{'━' * 60}"
            
            return report
        
        except Exception as e:
            logger.error(f"分析错误失败: {e}")
            return f"❌ 分析错误失败: {str(e)}"
    
    def clear_logs(self, backup: bool = True) -> str:
        """清空日志文件
        
        Args:
            backup: 是否备份
        
        Returns:
            操作结果消息
        """
        if not self.file_exists():
            return "⚠️ 日志文件不存在，无需清空"
        
        try:
            # 备份
            if backup:
                backup_path = self._create_backup()
                if backup_path:
                    logger.info(f"日志已备份到: {backup_path}")
            
            # 清空文件
            with open(self.log_file_path, 'w', encoding='utf-8') as f:
                f.write('')
            
            result = "✅ 日志已清空"
            if backup and backup_path:
                result += f"\n📦 备份文件: {backup_path}"
            
            return result
        
        except Exception as e:
            logger.error(f"清空日志失败: {e}")
            return f"❌ 清空日志失败: {str(e)}"
    
    def _create_backup(self) -> Optional[str]:
        """创建日志备份
        
        Returns:
            备份文件路径，失败返回 None
        """
        try:
            timestamp = datetime.now().strftime('%Y%m%d-%H%M%S')
            backup_path = self.log_file_path.replace('.log', f'-backup-{timestamp}.log')
            
            import shutil
            shutil.copy2(self.log_file_path, backup_path)
            
            return backup_path
        except Exception as e:
            logger.error(f"创建备份失败: {e}")
            return None
    
    def _classify_error(self, message: str) -> str:
        """分类错误类型
        
        Args:
            message: 错误消息
        
        Returns:
            错误类型
        """
        message_lower = message.lower()
        
        if 'typeerror' in message_lower:
            return '🔧 TypeError'
        elif 'referenceerror' in message_lower:
            return '🔍 ReferenceError'
        elif 'undefined' in message_lower:
            return '❓ Undefined'
        elif 'null' in message_lower:
            return '🚫 Null Reference'
        elif 'network' in message_lower or 'fetch' in message_lower:
            return '🌐 Network Error'
        elif 'permission' in message_lower or 'access' in message_lower:
            return '🔒 Permission Error'
        elif 'file' in message_lower or 'path' in message_lower:
            return '📁 File Error'
        else:
            return '❗ Other Error'
    
    def _get_fix_suggestions(self, error_type: str) -> List[str]:
        """获取修复建议
        
        Args:
            error_type: 错误类型
        
        Returns:
            建议列表
        """
        suggestions = {
            '🔧 TypeError': [
                '检查变量类型是否匹配',
                '确保函数参数类型正确',
                '添加类型检查和验证'
            ],
            '🔍 ReferenceError': [
                '检查变量是否已声明',
                '确认变量作用域',
                '检查拼写错误'
            ],
            '❓ Undefined': [
                '检查变量初始化',
                '验证对象属性是否存在',
                '添加空值检查'
            ],
            '🚫 Null Reference': [
                '添加 null 检查',
                '使用可选链操作符 (?.)',
                '提供默认值'
            ],
            '🌐 Network Error': [
                '检查网络连接',
                '验证 API 端点',
                '添加错误重试机制'
            ],
            '🔒 Permission Error': [
                '检查文件/目录权限',
                '确认用户权限',
                '使用正确的访问路径'
            ],
            '📁 File Error': [
                '检查文件是否存在',
                '验证文件路径',
                '确保文件权限正确'
            ]
        }
        
        return suggestions.get(error_type, ['检查错误堆栈信息', '查看详细日志'])
    
    @staticmethod
    def _format_file_size(bytes: int) -> str:
        """格式化文件大小
        
        Args:
            bytes: 字节数
        
        Returns:
            格式化后的大小字符串
        """
        for unit in ['B', 'KB', 'MB', 'GB']:
            if bytes < 1024:
                return f"{bytes:.2f} {unit}"
            bytes /= 1024
        return f"{bytes:.2f} TB"
    
    @staticmethod
    def _format_relative_time(timestamp: float) -> str:
        """格式化相对时间
        
        Args:
            timestamp: 时间戳
        
        Returns:
            相对时间字符串
        """
        now = time.time()
        diff = now - timestamp
        
        if diff < 10:
            return "刚刚"
        elif diff < 60:
            return f"{int(diff)} 秒前"
        elif diff < 3600:
            return f"{int(diff / 60)} 分钟前"
        elif diff < 86400:
            return f"{int(diff / 3600)} 小时前"
        else:
            days = int(diff / 86400)
            return f"{days} 天前"

