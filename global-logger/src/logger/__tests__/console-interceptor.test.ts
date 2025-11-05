/**
 * Console 拦截器单元测试
 */

import { ConsoleInterceptor } from '../console-interceptor';

describe('ConsoleInterceptor', () => {
  let interceptor: ConsoleInterceptor;
  let logEntries: Array<{ level: string; args: any[] }>;
  let originalConsole: any;

  beforeEach(() => {
    // 保存原始 console
    originalConsole = {
      log: console.log,
      error: console.error,
      warn: console.warn,
      debug: console.debug
    };

    // 清空日志条目
    logEntries = [];

    // 创建拦截器
    interceptor = new ConsoleInterceptor((level, args) => {
      logEntries.push({ level, args });
    });
  });

  afterEach(() => {
    // 恢复原始 console
    if (interceptor) {
      interceptor.uninstall();
    }
  });

  describe('install()', () => {
    test('应该成功劫持 console.log', () => {
      interceptor.install();
      console.log('test message');
      
      expect(logEntries.length).toBe(1);
      expect(logEntries[0].level).toBe('LOG');
      expect(logEntries[0].args[0]).toBe('test message');
    });

    test('应该成功劫持 console.error', () => {
      interceptor.install();
      console.error('error message');
      
      expect(logEntries.length).toBe(1);
      expect(logEntries[0].level).toBe('ERROR');
      expect(logEntries[0].args[0]).toBe('error message');
    });

    test('应该成功劫持 console.warn', () => {
      interceptor.install();
      console.warn('warning message');
      
      expect(logEntries.length).toBe(1);
      expect(logEntries[0].level).toBe('WARN');
      expect(logEntries[0].args[0]).toBe('warning message');
    });

    test('应该成功劫持 console.debug', () => {
      interceptor.install();
      console.debug('debug message');
      
      expect(logEntries.length).toBe(1);
      expect(logEntries[0].level).toBe('DEBUG');
      expect(logEntries[0].args[0]).toBe('debug message');
    });
  });

  describe('防死循环机制', () => {
    test('应该防止日志系统自身输出被重复拦截', () => {
      interceptor.install();
      
      // 模拟日志系统自身的输出
      const callback = (level: string, args: any[]) => {
        // 在回调中再次调用 console.log（模拟递归）
        if (logEntries.length < 5) { // 限制以防真的死循环
          console.log('recursive log');
        }
        logEntries.push({ level, args });
      };
      
      const recursiveInterceptor = new ConsoleInterceptor(callback);
      recursiveInterceptor.install();
      
      console.log('initial log');
      
      // 应该只有一条日志，不会递归
      expect(logEntries.length).toBeLessThanOrEqual(2);
      
      recursiveInterceptor.uninstall();
    });
  });

  describe('参数序列化', () => {
    test('应该正确处理字符串参数', () => {
      interceptor.install();
      console.log('simple string');
      
      expect(logEntries[0].args[0]).toBe('simple string');
    });

    test('应该正确处理数字参数', () => {
      interceptor.install();
      console.log(123, 45.67);
      
      expect(logEntries[0].args[0]).toBe(123);
      expect(logEntries[0].args[1]).toBe(45.67);
    });

    test('应该正确处理对象参数', () => {
      interceptor.install();
      const obj = { key: 'value', num: 42 };
      console.log(obj);
      
      expect(logEntries[0].args[0]).toEqual(obj);
    });

    test('应该正确处理 Error 对象', () => {
      interceptor.install();
      const error = new Error('test error');
      console.error(error);
      
      expect(logEntries[0].level).toBe('ERROR');
      expect(logEntries[0].args[0]).toBeInstanceOf(Error);
      expect(logEntries[0].args[0].message).toBe('test error');
    });

    test('应该正确处理多个混合参数', () => {
      interceptor.install();
      console.log('string', 123, { key: 'value' }, true, null, undefined);
      
      expect(logEntries[0].args).toHaveLength(6);
      expect(logEntries[0].args[0]).toBe('string');
      expect(logEntries[0].args[1]).toBe(123);
      expect(logEntries[0].args[2]).toEqual({ key: 'value' });
      expect(logEntries[0].args[3]).toBe(true);
      expect(logEntries[0].args[4]).toBe(null);
      expect(logEntries[0].args[5]).toBe(undefined);
    });
  });

  describe('uninstall()', () => {
    test('应该恢复原始 console 方法', () => {
      interceptor.install();
      const hijackedLog = console.log;
      
      interceptor.uninstall();
      
      // console.log 应该被恢复（不等于劫持后的函数）
      expect(console.log).not.toBe(hijackedLog);
    });

    test('卸载后不应该再拦截日志', () => {
      interceptor.install();
      console.log('before uninstall');
      
      interceptor.uninstall();
      logEntries = [];
      
      console.log('after uninstall');
      
      // 卸载后日志不应该被记录
      expect(logEntries.length).toBe(0);
    });
  });
});

