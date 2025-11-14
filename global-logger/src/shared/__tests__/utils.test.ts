/**
 * 工具函数单元测试
 */

import { 
  formatFileSize, 
  safeStringify, 
  truncateString, 
  matchPattern,
  getWatchedFileList
} from '../utils';
import { WatchedFileTypes } from '../types';

describe('formatFileSize()', () => {
  test('应该正确格式化 0 字节', () => {
    expect(formatFileSize(0)).toBe('0 B');
  });

  test('应该正确格式化字节', () => {
    expect(formatFileSize(100)).toBe('100 B');
    expect(formatFileSize(1023)).toBe('1023 B');
  });

  test('应该正确格式化 KB', () => {
    expect(formatFileSize(1024)).toBe('1 KB');
    expect(formatFileSize(2048)).toBe('2 KB');
    expect(formatFileSize(1536)).toBe('1.5 KB');
  });

  test('应该正确格式化 MB', () => {
    expect(formatFileSize(1024 * 1024)).toBe('1 MB');
    expect(formatFileSize(2 * 1024 * 1024)).toBe('2 MB');
    expect(formatFileSize(1.5 * 1024 * 1024)).toBe('1.5 MB');
  });

  test('应该正确格式化 GB', () => {
    expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB');
    expect(formatFileSize(2.5 * 1024 * 1024 * 1024)).toBe('2.5 GB');
  });
});

describe('safeStringify()', () => {
  test('应该正确序列化简单对象', () => {
    const obj = { key: 'value', num: 42 };
    const result = safeStringify(obj);
    expect(result).toBe('{"key":"value","num":42}');
  });

  test('应该处理 null 和 undefined', () => {
    expect(safeStringify(null)).toBe('null');
    expect(safeStringify(undefined)).toBe(undefined);
    expect(safeStringify({ key: null, value: undefined })).toContain('"key":null');
  });

  test('应该处理循环引用', () => {
    const obj: any = { key: 'value' };
    obj.self = obj; // 创建循环引用
    
    const result = safeStringify(obj);
    expect(result).toContain('[Circular Reference]');
  });

  test('应该处理深层嵌套对象', () => {
    const deep = { 
      a: { 
        b: { 
          c: { 
            d: { 
              e: 'too deep' 
            } 
          } 
        } 
      } 
    };
    
    const result = safeStringify(deep, 3);
    expect(result).toContain('[Max Depth Reached]');
  });

  test('应该处理数组', () => {
    const arr = [1, 2, 'three', { key: 'value' }];
    const result = safeStringify(arr);
    expect(result).toBe('[1,2,"three",{"key":"value"}]');
  });

  test('应该处理序列化错误', () => {
    const circular: any = {};
    circular.a = circular;
    circular.b = circular;
    
    const result = safeStringify(circular);
    // 应该返回包含 Circular Reference 的字符串
    expect(result).toBeTruthy();
  });
});

describe('truncateString()', () => {
  test('短字符串不应该被截断', () => {
    const str = 'short string';
    expect(truncateString(str, 100)).toBe(str);
  });

  test('长字符串应该被截断', () => {
    const str = 'a'.repeat(2000);
    const result = truncateString(str, 1000);
    
    expect(result.length).toBeLessThan(str.length);
    expect(result).toContain('... [truncated]');
    expect(result.startsWith('a'.repeat(1000))).toBe(true);
  });

  test('应该使用默认长度 1000', () => {
    const str = 'a'.repeat(2000);
    const result = truncateString(str);
    
    expect(result).toContain('... [truncated]');
  });

  test('空字符串应该返回空字符串', () => {
    expect(truncateString('')).toBe('');
  });
});

describe('matchPattern()', () => {
  describe('精确匹配', () => {
    test('应该精确匹配文件名', () => {
      expect(matchPattern('data.json', 'data.json')).toBe(true);
      expect(matchPattern('main.js', 'main.js')).toBe(true);
    });

    test('不匹配的文件名应该返回 false', () => {
      expect(matchPattern('data.json', 'config.json')).toBe(false);
      expect(matchPattern('main.js', 'main.ts')).toBe(false);
    });
  });

  describe('通配符匹配', () => {
    test('应该匹配 *.json 模式', () => {
      expect(matchPattern('data.json', '*.json')).toBe(true);
      expect(matchPattern('config.json', '*.json')).toBe(true);
      expect(matchPattern('test.js', '*.json')).toBe(false);
    });

    test('应该匹配 *.* 模式', () => {
      expect(matchPattern('file.txt', '*.*')).toBe(true);
      expect(matchPattern('data.json', '*.*')).toBe(true);
      expect(matchPattern('noextension', '*.*')).toBe(false);
    });

    test('应该匹配目录通配符', () => {
      expect(matchPattern('lang/en.json', 'lang/*.json')).toBe(true);
      expect(matchPattern('lang/zh.json', 'lang/*.json')).toBe(true);
      expect(matchPattern('en.json', 'lang/*.json')).toBe(false);
    });

    test('应该匹配复杂通配符', () => {
      expect(matchPattern('config.backup.json', 'config.*.json')).toBe(true);
      expect(matchPattern('test-file.ts', 'test-*.ts')).toBe(true);
      expect(matchPattern('prefix-middle-suffix.txt', 'prefix-*-suffix.txt')).toBe(true);
    });

    test('应该处理多个通配符', () => {
      expect(matchPattern('a-b-c.json', '*-*-*.json')).toBe(true);
      expect(matchPattern('x.y.z', '*.*.*')).toBe(true);
    });
  });

  describe('边界情况', () => {
    test('应该处理空字符串', () => {
      expect(matchPattern('', '')).toBe(true);
      expect(matchPattern('', 'pattern')).toBe(false);
      expect(matchPattern('file', '')).toBe(false);
    });

    test('应该处理仅包含通配符的模式', () => {
      expect(matchPattern('anything', '*')).toBe(true);
      expect(matchPattern('', '*')).toBe(true);
    });
  });
});

describe('getWatchedFileList()', () => {
  test('应该返回所有启用的文件', () => {
    const fileTypes: WatchedFileTypes = {
      main: true,
      manifest: true,
      styles: true,
      custom: ['data.json']
    };
    
    const result = getWatchedFileList(fileTypes);
    
    expect(result).toContain('main.js');
    expect(result).toContain('manifest.json');
    expect(result).toContain('styles.css');
    expect(result).toContain('data.json');
    expect(result.length).toBe(4);
  });

  test('应该排除禁用的文件', () => {
    const fileTypes: WatchedFileTypes = {
      main: true,
      manifest: false,
      styles: false,
      custom: []
    };
    
    const result = getWatchedFileList(fileTypes);
    
    expect(result).toContain('main.js');
    expect(result).not.toContain('manifest.json');
    expect(result).not.toContain('styles.css');
    expect(result.length).toBe(1);
  });

  test('应该包含自定义文件列表', () => {
    const fileTypes: WatchedFileTypes = {
      main: true,
      manifest: false,
      styles: false,
      custom: ['data.json', 'lang/*.json', 'config.yaml']
    };
    
    const result = getWatchedFileList(fileTypes);
    
    expect(result).toContain('data.json');
    expect(result).toContain('lang/*.json');
    expect(result).toContain('config.yaml');
  });

  test('应该处理空自定义列表', () => {
    const fileTypes: WatchedFileTypes = {
      main: true,
      manifest: true,
      styles: true,
      custom: []
    };
    
    const result = getWatchedFileList(fileTypes);
    expect(result.length).toBe(3);
  });
});

