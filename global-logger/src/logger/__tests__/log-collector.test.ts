/**
 * 日志收集器单元测试
 */

import { LogCollector } from '../log-collector';

describe('LogCollector', () => {
  let collector: LogCollector;
  let flushedLogs: string[][];
  const bufferSize = 5;
  const flushInterval = 100;

  beforeEach(() => {
    flushedLogs = [];
    collector = new LogCollector(
      bufferSize,
      flushInterval,
      (logs) => {
        flushedLogs.push([...logs]);
      }
    );
  });

  afterEach(() => {
    if (collector) {
      collector.cleanup();
    }
  });

  describe('addEntry()', () => {
    test('应该添加日志条目到缓冲区', () => {
      collector.addEntry('LOG', ['test message']);
      
      // 缓冲区应该有一条日志
      expect((collector as any).buffer.length).toBe(1);
    });

    test('应该格式化日志条目', () => {
      collector.addEntry('LOG', ['test']);
      const entry = (collector as any).buffer[0];
      
      // 应该包含时间戳、级别和消息
      expect(entry).toMatch(/\[\d{2}:\d{2}:\d{2}\.\d{3}\] \[LOG\] test/);
    });

    test('应该正确处理不同的日志级别', () => {
      collector.addEntry('LOG', ['log']);
      collector.addEntry('ERROR', ['error']);
      collector.addEntry('WARN', ['warn']);
      collector.addEntry('DEBUG', ['debug']);
      
      const buffer = (collector as any).buffer;
      expect(buffer[0]).toContain('[LOG]');
      expect(buffer[1]).toContain('[ERROR]');
      expect(buffer[2]).toContain('[WARN]');
      expect(buffer[3]).toContain('[DEBUG]');
    });
  });

  describe('缓冲区管理', () => {
    test('达到缓冲区大小时应该自动刷新', () => {
      // 添加 5 条日志（达到 bufferSize）
      for (let i = 0; i < bufferSize; i++) {
        collector.addEntry('LOG', [`message ${i}`]);
      }
      
      // 应该触发一次刷新
      expect(flushedLogs.length).toBe(1);
      expect(flushedLogs[0].length).toBe(bufferSize);
    });

    test('刷新后缓冲区应该被清空', () => {
      // 触发刷新
      for (let i = 0; i < bufferSize; i++) {
        collector.addEntry('LOG', [`message ${i}`]);
      }
      
      // 缓冲区应该被清空
      expect((collector as any).buffer.length).toBe(0);
    });

    test('未达到缓冲区大小时不应该刷新', () => {
      collector.addEntry('LOG', ['message 1']);
      collector.addEntry('LOG', ['message 2']);
      
      // 不应该触发刷新（只有 2 条，小于 5 条）
      expect(flushedLogs.length).toBe(0);
    });
  });

  describe('定时刷新', () => {
    test('应该在指定间隔后自动刷新', async () => {
      collector.addEntry('LOG', ['message']);
      
      // 等待超过刷新间隔
      await new Promise(resolve => setTimeout(resolve, flushInterval + 50));
      
      // 应该触发定时刷新
      expect(flushedLogs.length).toBeGreaterThan(0);
    });

    test('空缓冲区不应该触发刷新', async () => {
      // 不添加任何日志
      await new Promise(resolve => setTimeout(resolve, flushInterval + 50));
      
      // 不应该刷新空缓冲区
      expect(flushedLogs.length).toBe(0);
    });
  });

  describe('flush()', () => {
    test('应该立即刷新缓冲区', () => {
      collector.addEntry('LOG', ['message 1']);
      collector.addEntry('LOG', ['message 2']);
      
      collector.flush();
      
      expect(flushedLogs.length).toBe(1);
      expect(flushedLogs[0].length).toBe(2);
    });

    test('空缓冲区刷新应该不做任何事', () => {
      collector.flush();
      
      expect(flushedLogs.length).toBe(0);
    });
  });

  describe('cleanup()', () => {
    test('应该刷新剩余的日志', () => {
      collector.addEntry('LOG', ['message']);
      collector.cleanup();
      
      expect(flushedLogs.length).toBe(1);
    });

    test('应该停止定时器', async () => {
      collector.addEntry('LOG', ['message']);
      collector.cleanup();
      
      const initialFlushCount = flushedLogs.length;
      
      // 等待超过刷新间隔
      await new Promise(resolve => setTimeout(resolve, flushInterval + 50));
      
      // 不应该再触发刷新
      expect(flushedLogs.length).toBe(initialFlushCount);
    });
  });

  describe('时间戳格式', () => {
    test('应该生成正确格式的时间戳', () => {
      collector.addEntry('LOG', ['test']);
      const entry = (collector as any).buffer[0];
      
      // 验证时间戳格式：HH:MM:SS.mmm
      expect(entry).toMatch(/\[\d{2}:\d{2}:\d{2}\.\d{3}\]/);
    });
  });
});

