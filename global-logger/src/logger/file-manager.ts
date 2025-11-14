import { App } from 'obsidian';
import * as path from 'path';

/**
 * 文件管理器
 * 
 * 负责管理日志文件的创建、写入、轮转等操作
 */
export class FileManager {
  private logFilePath: string;
  private logDir: string;
  
  /**
   * 构造函数
   * @param app Obsidian App 实例
   * @param logFileRelativePath 日志文件相对路径
   * @param maxFileSize 最大文件大小（MB）
   */
  constructor(
    private app: App,
    logFileRelativePath: string,
    private maxFileSize: number
  ) {
    // 获取 vault 基础路径
    const vaultPath = (this.app.vault.adapter as any).basePath;
    
    // 解析相对路径
    if (logFileRelativePath.startsWith('../')) {
      // 处理相对路径
      const relativePath = logFileRelativePath.substring(3);
      this.logDir = path.join(vaultPath, '..', relativePath.split('/')[0]);
      this.logFilePath = path.join(vaultPath, '..', relativePath);
    } else {
      // 处理绝对路径
      this.logFilePath = logFileRelativePath;
      this.logDir = path.dirname(logFileRelativePath);
    }
  }
  
  /**
   * 初始化文件管理器
   */
  async initialize(): Promise<void> {
    try {
      // 创建日志目录
      await this.ensureDirectoryExists(this.logDir);
    } catch (error) {
      console.error('Failed to initialize FileManager:', error);
    }
  }
  
  /**
   * 确保目录存在
   * @param dirPath 目录路径
   */
  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      const adapter = this.app.vault.adapter;
      const exists = await adapter.exists(dirPath);
      
      if (!exists) {
        // 使用 Node.js fs API 创建目录（如果 adapter 不支持）
        const fs = require('fs');
        const mkdirp = (dir: string) => {
          if (!fs.existsSync(dir)) {
            mkdirp(path.dirname(dir));
            fs.mkdirSync(dir);
          }
        };
        mkdirp(dirPath);
      }
    } catch (error) {
      console.error('Failed to ensure directory exists:', error);
    }
  }
  
  /**
   * 写入日志
   * @param logs 日志数组
   */
  async writeLogs(logs: string[]): Promise<void> {
    try {
      // 检查并执行轮转
      await this.checkRotation();
      
      // 追加写入日志
      const content = logs.join('\n') + '\n';
      await this.appendToFile(this.logFilePath, content);
    } catch (error) {
      console.error('Failed to write logs:', error);
    }
  }
  
  /**
   * 追加内容到文件
   * @param filePath 文件路径
   * @param content 内容
   */
  private async appendToFile(filePath: string, content: string): Promise<void> {
    try {
      // 使用 Node.js fs API 进行文件操作
      const fs = require('fs');
      fs.appendFileSync(filePath, content, 'utf8');
    } catch (error) {
      console.error('Failed to append to file:', error);
    }
  }
  
  /**
   * 检查文件大小并执行轮转
   */
  private async checkRotation(): Promise<void> {
    try {
      const fs = require('fs');
      
      // 检查文件是否存在
      if (!fs.existsSync(this.logFilePath)) {
        return;
      }
      
      // 获取文件大小
      const stats = fs.statSync(this.logFilePath);
      const fileSizeInMB = stats.size / (1024 * 1024);
      
      // 如果超过阈值，执行轮转
      if (fileSizeInMB > this.maxFileSize) {
        await this.rotateLog();
      }
    } catch (error) {
      console.error('Failed to check rotation:', error);
    }
  }
  
  /**
   * 轮转日志文件
   */
  private async rotateLog(): Promise<void> {
    try {
      const fs = require('fs');
      
      // 生成备份文件名（带时间戳）
      const timestamp = new Date()
        .toISOString()
        .replace(/:/g, '-')
        .replace(/\./g, '-')
        .substring(0, 19);
      
      const backupPath = this.logFilePath.replace('.log', `-${timestamp}.log`);
      
      // 重命名旧文件
      fs.renameSync(this.logFilePath, backupPath);
      
      console.log(`Log file rotated: ${backupPath}`);
    } catch (error) {
      console.error('Failed to rotate log:', error);
    }
  }
  
  /**
   * 获取日志文件路径
   * @returns 日志文件路径
   */
  getLogFilePath(): string {
    return this.logFilePath;
  }
  
  /**
   * 清空日志文件
   */
  async clearLogs(): Promise<void> {
    try {
      const fs = require('fs');
      
      // 如果文件存在，先备份
      if (fs.existsSync(this.logFilePath)) {
        const timestamp = new Date()
          .toISOString()
          .replace(/:/g, '-')
          .replace(/\./g, '-')
          .substring(0, 19);
        
        const backupPath = this.logFilePath.replace('.log', `-backup-${timestamp}.log`);
        fs.copyFileSync(this.logFilePath, backupPath);
        
        // 清空原文件
        fs.writeFileSync(this.logFilePath, '', 'utf8');
        
        console.log(`Logs cleared. Backup saved to: ${backupPath}`);
      }
    } catch (error) {
      console.error('Failed to clear logs:', error);
    }
  }
}

