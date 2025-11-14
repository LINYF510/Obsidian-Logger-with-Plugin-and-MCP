/**
 * 日志统计模块
 * 
 * 负责读取和分析日志文件，提供统计信息
 */

export interface LogStatistics {
  filePath: string;
  fileSize: number;      // 字节
  totalLines: number;
  errorCount: number;
  warnCount: number;
  debugCount: number;
  logCount: number;
  lastModified: number;  // 时间戳
}

export class LogStats {
  /**
   * 构造函数
   * @param logFilePath 日志文件路径
   */
  constructor(private logFilePath: string) {}
  
  /**
   * 获取日志统计信息
   * @returns 统计信息对象
   */
  async getStatistics(): Promise<LogStatistics> {
    const fs = require('fs');
    
    const defaultStats: LogStatistics = {
      filePath: this.logFilePath,
      fileSize: 0,
      totalLines: 0,
      errorCount: 0,
      warnCount: 0,
      debugCount: 0,
      logCount: 0,
      lastModified: 0
    };
    
    try {
      // 检查文件是否存在
      if (!fs.existsSync(this.logFilePath)) {
        return defaultStats;
      }
      
      // 获取文件状态
      const stats = fs.statSync(this.logFilePath);
      defaultStats.fileSize = stats.size;
      defaultStats.lastModified = stats.mtimeMs;
      
      // 读取文件内容
      const content = fs.readFileSync(this.logFilePath, 'utf8');
      const lines = content.split('\n').filter((line: string) => line.trim() !== '');
      
      defaultStats.totalLines = lines.length;
      
      // 统计各级别数量
      for (const line of lines) {
        if (line.includes('[ERROR]')) {
          defaultStats.errorCount++;
        } else if (line.includes('[WARN]')) {
          defaultStats.warnCount++;
        } else if (line.includes('[DEBUG]')) {
          defaultStats.debugCount++;
        } else if (line.includes('[LOG]')) {
          defaultStats.logCount++;
        }
      }
      
      return defaultStats;
    } catch (error) {
      console.error('获取日志统计失败:', error);
      return defaultStats;
    }
  }
  
  /**
   * 格式化文件大小
   * @param bytes 字节数
   * @returns 格式化后的字符串
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  /**
   * 格式化时间
   * @param timestamp 时间戳
   * @returns 格式化后的时间字符串
   */
  formatTime(timestamp: number): string {
    if (timestamp === 0) return '从未更新';
    
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 1000) return '刚刚';
    if (diff < 60000) return `${Math.floor(diff / 1000)} 秒前`;
    if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`;
    return `${Math.floor(diff / 86400000)} 天前`;
  }
}

