import { LogLevel } from '../shared/types';
import { ConsoleInterceptor } from './console-interceptor';

/**
 * 日志收集器
 * 
 * 负责收集日志条目、添加时间戳、格式化并管理缓冲区
 */
export class LogCollector {
  private buffer: string[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  
  /**
   * 构造函数
   * @param bufferSize 缓冲区大小
   * @param flushInterval 刷新间隔（毫秒）
   * @param onFlush 刷新回调函数
   */
  constructor(
    private bufferSize: number,
    private flushInterval: number,
    private onFlush: (logs: string[]) => void
  ) {
    this.startFlushTimer();
  }
  
  /**
   * 添加日志条目
   * @param level 日志级别
   * @param args 参数数组
   */
  addEntry(level: LogLevel, args: any[]): void {
    const timestamp = this.getTimestamp();
    const message = ConsoleInterceptor.serializeArgs(args);
    const entry = `[${timestamp}] [${level}] ${message}`;
    
    this.buffer.push(entry);
    
    // 检查是否需要刷新
    if (this.buffer.length >= this.bufferSize) {
      this.flush();
    }
  }
  
  /**
   * 生成时间戳（HH:MM:SS.mmm 格式）
   * @returns 格式化的时间戳字符串
   */
  private getTimestamp(): string {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const ms = String(now.getMilliseconds()).padStart(3, '0');
    return `${hours}:${minutes}:${seconds}.${ms}`;
  }
  
  /**
   * 启动定时刷新器
   */
  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      if (this.buffer.length > 0) {
        this.flush();
      }
    }, this.flushInterval);
  }
  
  /**
   * 刷新缓冲区
   */
  flush(): void {
    if (this.buffer.length === 0) return;
    
    const logs = [...this.buffer];
    this.buffer = [];
    this.onFlush(logs);
  }
  
  /**
   * 清理资源
   */
  cleanup(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    // 最后刷新一次
    this.flush();
  }
}

