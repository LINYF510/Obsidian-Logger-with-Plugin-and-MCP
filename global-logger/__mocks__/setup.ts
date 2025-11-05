/**
 * Jest 测试设置
 */

// 设置全局超时
jest.setTimeout(10000);

// Mock console 方法以避免测试输出混乱
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// 使此文件成为模块
export {};


export {};

