import { LogLevel } from '../shared/types';
import { safeStringify, truncateString } from '../shared/utils';

/**
 * Console 拦截器
 * 
 * 负责拦截全局 console 对象的方法，并将日志传递给回调函数
 */
export class ConsoleInterceptor {
  private isLogging = false;
  private originalConsole: {
    log: typeof console.log;
    error: typeof console.error;
    warn: typeof console.warn;
    debug: typeof console.debug;
  };
  
  /**
   * 构造函数
   * @param onLogEntry 日志条目回调函数
   */
  constructor(private onLogEntry: (level: LogLevel, args: any[]) => void) {
    // 保存原始 console 方法引用
    this.originalConsole = {
      log: console.log.bind(console),
      error: console.error.bind(console),
      warn: console.warn.bind(console),
      debug: console.debug.bind(console)
    };
  }
  
  /**
   * 安装拦截器
   */
  install(): void {
    // 拦截 console.log
    console.log = (...args: any[]) => {
      if (this.isLogging) return;
      this.isLogging = true;
      
      this.originalConsole.log(...args);
      this.onLogEntry('LOG', args);
      
      this.isLogging = false;
    };
    
    // 拦截 console.error
    console.error = (...args: any[]) => {
      if (this.isLogging) return;
      this.isLogging = true;
      
      this.originalConsole.error(...args);
      this.onLogEntry('ERROR', args);
      
      this.isLogging = false;
    };
    
    // 拦截 console.warn
    console.warn = (...args: any[]) => {
      if (this.isLogging) return;
      this.isLogging = true;
      
      this.originalConsole.warn(...args);
      this.onLogEntry('WARN', args);
      
      this.isLogging = false;
    };
    
    // 拦截 console.debug
    console.debug = (...args: any[]) => {
      if (this.isLogging) return;
      this.isLogging = true;
      
      this.originalConsole.debug(...args);
      this.onLogEntry('DEBUG', args);
      
      this.isLogging = false;
    };
  }
  
  /**
   * 卸载拦截器，恢复原始 console
   */
  uninstall(): void {
    console.log = this.originalConsole.log;
    console.error = this.originalConsole.error;
    console.warn = this.originalConsole.warn;
    console.debug = this.originalConsole.debug;
  }
  
  /**
   * 序列化参数
   * @param args 参数数组
   * @returns 序列化后的字符串
   */
  static serializeArgs(args: any[]): string {
    const serialized = args.map(arg => ConsoleInterceptor.serializeArg(arg)).join(' ');
    return truncateString(serialized, 1000);
  }
  
  /**
   * 序列化单个参数
   * @param arg 参数
   * @returns 序列化后的字符串
   */
  private static serializeArg(arg: any): string {
    // 处理 null 和 undefined
    if (arg === null) return 'null';
    if (arg === undefined) return 'undefined';
    
    // 处理原始类型
    if (typeof arg === 'string') return arg;
    if (typeof arg === 'number' || typeof arg === 'boolean') return String(arg);
    
    // 处理 Error 对象
    if (arg instanceof Error) {
      let errorStr = `${arg.name}: ${arg.message}`;
      if (arg.stack) {
        errorStr += `\n${arg.stack}`;
      }
      return errorStr;
    }
    
    // 处理对象和数组
    if (typeof arg === 'object') {
      try {
        return safeStringify(arg);
      } catch (e) {
        return '[Object with circular reference]';
      }
    }
    
    // 其他类型
    try {
      return String(arg);
    } catch (e) {
      return '[Unstringifiable value]';
    }
  }
}

