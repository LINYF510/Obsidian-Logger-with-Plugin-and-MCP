import { Plugin, Notice } from 'obsidian';
import { ConsoleInterceptor } from './console-interceptor';
import { LogCollector } from './log-collector';
import { FileManager } from './file-manager';
import { LogLevel } from '../shared/types';

/**
 * 日志模块
 * 
 * 负责整合 console 拦截、日志收集和文件管理功能
 */
export class LoggerModule {
  private consoleInterceptor: ConsoleInterceptor | null = null;
  private logCollector: LogCollector | null = null;
  private fileManager: FileManager | null = null;
  
  /**
   * 构造函数
   * @param plugin 插件实例
   */
  constructor(private plugin: Plugin) {}
  
  /**
   * 初始化日志模块
   */
  async initialize(): Promise<void> {
    try {
      // 获取配置
      const settings = (this.plugin as any).settings;
      const loggerConfig = settings.logger;
      
      // 初始化文件管理器
      this.fileManager = new FileManager(
        this.plugin.app,
        loggerConfig.logFilePath,
        loggerConfig.maxFileSize
      );
      await this.fileManager.initialize();
      
      // 初始化日志收集器
      this.logCollector = new LogCollector(
        loggerConfig.bufferSize,
        loggerConfig.flushInterval,
        (logs) => this.handleFlush(logs)
      );
      
      // 初始化 console 拦截器
      this.consoleInterceptor = new ConsoleInterceptor(
        (level, args) => this.handleLogEntry(level, args)
      );
      
      // 安装 console 拦截
      this.consoleInterceptor.install();
      
      console.log('📝 日志模块：已启动');
      console.log(`   └─ 日志文件位置：${this.fileManager.getLogFilePath()}`);
    } catch (error) {
      console.error('Failed to initialize LoggerModule:', error);
    }
  }
  
  /**
   * 处理日志条目
   * @param level 日志级别
   * @param args 参数数组
   */
  private handleLogEntry(level: LogLevel, args: any[]): void {
    if (this.logCollector) {
      this.logCollector.addEntry(level, args);
    }
  }
  
  /**
   * 处理缓冲区刷新
   * @param logs 日志数组
   */
  private handleFlush(logs: string[]): void {
    if (this.fileManager) {
      this.fileManager.writeLogs(logs);
    }
  }
  
  /**
   * 清理资源
   */
  async cleanup(): Promise<void> {
    try {
      // 停止日志收集器
      if (this.logCollector) {
        this.logCollector.cleanup();
        this.logCollector = null;
      }
      
      // 卸载 console 拦截器
      if (this.consoleInterceptor) {
        this.consoleInterceptor.uninstall();
        this.consoleInterceptor = null;
      }
      
      console.log('📝 日志模块：已停止');
    } catch (error) {
      console.error('Failed to cleanup LoggerModule:', error);
    }
  }
  
  /**
   * 显示日志文件路径
   */
  showLogPath(): void {
    if (this.fileManager) {
      const logPath = this.fileManager.getLogFilePath();
      new Notice(`日志文件路径：\n${logPath}`, 5000);
      
      // 复制到剪贴板
      if (navigator.clipboard) {
        navigator.clipboard.writeText(logPath).then(() => {
          new Notice('✅ 路径已复制到剪贴板', 2000);
        }).catch(() => {
          console.error('Failed to copy to clipboard');
        });
      }
    } else {
      new Notice('❌ 日志模块未初始化', 3000);
    }
  }
  
  /**
   * 清空日志文件
   */
  async clearLogs(): Promise<void> {
    if (this.fileManager) {
      await this.fileManager.clearLogs();
      new Notice('✅ 日志已清空（已备份）', 3000);
    } else {
      new Notice('❌ 日志模块未初始化', 3000);
    }
  }
  
  /**
   * 获取日志文件路径
   * @returns 日志文件路径
   */
  getLogFilePath(): string {
    return this.fileManager ? this.fileManager.getLogFilePath() : '';
  }
}

