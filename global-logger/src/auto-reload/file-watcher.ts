import { App } from 'obsidian';
import { WatchedFileTypes } from '../shared/types';
import { getWatchedFileList, matchPattern } from '../shared/utils';

/**
 * 文件监听器
 * 
 * 定时检查插件文件的修改时间，触发重载回调
 */
export class FileWatcher {
  private watchTimer: NodeJS.Timeout | null = null;
  private lastModifiedTimes: Map<string, number> = new Map();
  private watchedPlugins: string[] = [];
  private getFileTypesConfig: (pluginId: string) => WatchedFileTypes;
  
  /**
   * 构造函数
   * @param app Obsidian App 实例
   * @param checkInterval 检查间隔（毫秒）
   * @param onFileChanged 文件变化回调
   * @param getFileTypesConfig 获取文件类型配置的函数
   */
  constructor(
    private app: App,
    private checkInterval: number,
    private onFileChanged: (pluginId: string) => void,
    getFileTypesConfig: (pluginId: string) => WatchedFileTypes
  ) {
    this.getFileTypesConfig = getFileTypesConfig;
  }
  
  /**
   * 开始监听
   * @param pluginIds 要监听的插件 ID 列表
   */
  startWatching(pluginIds: string[]): void {
    console.log(`[Auto-Reload] 📡 开始监控 ${pluginIds.length} 个插件`);
    
    this.watchedPlugins = pluginIds;
    
    // 初始化时间戳缓存
    this.initializeTimestamps();
    
    // 启动定时检查
    this.watchTimer = setInterval(() => {
      this.checkPlugins();
    }, this.checkInterval);
  }
  
  /**
   * 停止监听
   */
  stopWatching(): void {
    if (this.watchTimer) {
      clearInterval(this.watchTimer);
      this.watchTimer = null;
    }
    
    this.watchedPlugins = [];
    this.lastModifiedTimes.clear();
    
    console.log('[Auto-Reload] 📡 已停止监控');
  }
  
  /**
   * 更新监听的插件列表
   * @param pluginIds 新的插件 ID 列表
   */
  updateWatchedPlugins(pluginIds: string[]): void {
    console.log(`[Auto-Reload] 📡 更新监控列表: ${pluginIds.length} 个插件`);
    
    this.watchedPlugins = pluginIds;
    
    // 清理不再监听的插件的时间戳
    const pluginSet = new Set(pluginIds);
    const keysToDelete: string[] = [];
    
    for (const [cacheKey] of this.lastModifiedTimes) {
      const pluginId = cacheKey.split(':')[0];
      if (!pluginSet.has(pluginId)) {
        keysToDelete.push(cacheKey);
      }
    }
    
    keysToDelete.forEach(key => this.lastModifiedTimes.delete(key));
    
    // 初始化新插件的时间戳
    this.initializeTimestamps();
  }
  
  /**
   * 初始化所有监听插件的时间戳
   */
  private async initializeTimestamps(): Promise<void> {
    for (const pluginId of this.watchedPlugins) {
      const fileTypes = this.getFileTypesConfig(pluginId);
      const filesToWatch = getWatchedFileList(fileTypes);
      
      for (const filePattern of filesToWatch) {
        // 如果是通配符，需要扫描目录获取匹配的文件
        if (filePattern.includes('*')) {
          const matchedFiles = await this.getMatchingFiles(pluginId, filePattern);
          for (const fileName of matchedFiles) {
            const cacheKey = `${pluginId}:${fileName}`;
            if (!this.lastModifiedTimes.has(cacheKey)) {
              const mtime = await this.getFileModifiedTime(pluginId, fileName);
              if (mtime !== null) {
                this.lastModifiedTimes.set(cacheKey, mtime);
              }
            }
          }
        } else {
          // 精确文件名
          const cacheKey = `${pluginId}:${filePattern}`;
          if (!this.lastModifiedTimes.has(cacheKey)) {
            const mtime = await this.getFileModifiedTime(pluginId, filePattern);
            if (mtime !== null) {
              this.lastModifiedTimes.set(cacheKey, mtime);
            }
          }
        }
      }
    }
  }
  
  /**
   * 检查所有监听的插件
   */
  private async checkPlugins(): Promise<void> {
    for (const pluginId of this.watchedPlugins) {
      await this.checkPluginFile(pluginId);
    }
  }
  
  /**
   * 检查单个插件的所有文件
   * @param pluginId 插件 ID
   */
  private async checkPluginFile(pluginId: string): Promise<void> {
    try {
      let hasChanges = false;
      let changedFiles: string[] = [];
      
      // 获取该插件要监听的文件列表
      const fileTypes = this.getFileTypesConfig(pluginId);
      const filesToWatch = getWatchedFileList(fileTypes);
      
      // 检查所有监听的文件
      for (const filePattern of filesToWatch) {
        // 如果是通配符，获取匹配的文件
        if (filePattern.includes('*')) {
          const matchedFiles = await this.getMatchingFiles(pluginId, filePattern);
          for (const fileName of matchedFiles) {
            const changed = await this.checkSingleFile(pluginId, fileName);
            if (changed) {
              hasChanges = true;
              changedFiles.push(fileName);
            }
          }
        } else {
          // 精确文件名
          const changed = await this.checkSingleFile(pluginId, filePattern);
          if (changed) {
            hasChanges = true;
            changedFiles.push(filePattern);
          }
        }
      }
      
      // 如果有任何文件变化，触发重载
      if (hasChanges) {
        console.log(`[Auto-Reload] 🔄 检测到文件变化: ${pluginId} (${changedFiles.join(', ')})`);
        
        // 触发回调
        this.onFileChanged(pluginId);
      }
    } catch (error) {
      console.error(`[Auto-Reload] 检查文件失败 (${pluginId}):`, error);
    }
  }
  
  /**
   * 检查单个文件是否变化
   * @param pluginId 插件 ID
   * @param fileName 文件名
   * @returns 是否发生变化
   */
  private async checkSingleFile(pluginId: string, fileName: string): Promise<boolean> {
    const cacheKey = `${pluginId}:${fileName}`;
    const currentMtime = await this.getFileModifiedTime(pluginId, fileName);
    
    if (currentMtime === null) {
      // 文件不存在，跳过
      return false;
    }
    
    const lastMtime = this.lastModifiedTimes.get(cacheKey);
    
    if (lastMtime === undefined) {
      // 首次检查，记录时间戳
      this.lastModifiedTimes.set(cacheKey, currentMtime);
      return false;
    }
    
    // 比较时间戳
    if (currentMtime > lastMtime) {
      // 更新时间戳
      this.lastModifiedTimes.set(cacheKey, currentMtime);
      return true;
    }
    
    return false;
  }
  
  /**
   * 获取匹配通配符的文件列表
   * @param pluginId 插件 ID
   * @param pattern 文件模式（支持通配符）
   * @returns 匹配的文件名数组
   */
  private async getMatchingFiles(pluginId: string, pattern: string): Promise<string[]> {
    try {
      const pluginDir = `.obsidian/plugins/${pluginId}`;
      
      // 使用 Node.js fs 模块列出目录文件
      const fs = require('fs');
      const path = require('path');
      const basePath = (this.app.vault.adapter as any).basePath;
      const fullPath = path.join(basePath, pluginDir);
      
      if (!fs.existsSync(fullPath)) {
        return [];
      }
      
      const allFiles = this.listAllFiles(fullPath, '');
      const matchedFiles = allFiles.filter(file => matchPattern(file, pattern));
      
      return matchedFiles;
    } catch (error) {
      console.error(`[Auto-Reload] 获取匹配文件失败 (${pluginId}, ${pattern}):`, error);
      return [];
    }
  }
  
  /**
   * 递归列出目录中的所有文件（相对路径）
   * @param dir 目录绝对路径
   * @param relativePath 当前相对路径
   * @returns 文件相对路径数组
   */
  private listAllFiles(dir: string, relativePath: string): string[] {
    const fs = require('fs');
    const path = require('path');
    const files: string[] = [];
    
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const entryRelativePath = relativePath ? `${relativePath}/${entry.name}` : entry.name;
        
        if (entry.isDirectory()) {
          // 递归子目录
          const subFiles = this.listAllFiles(path.join(dir, entry.name), entryRelativePath);
          files.push(...subFiles);
        } else if (entry.isFile()) {
          files.push(entryRelativePath);
        }
      }
    } catch (error) {
      // 忽略错误
    }
    
    return files;
  }
  
  /**
   * 获取文件修改时间
   * @param pluginId 插件 ID
   * @param fileName 文件名（main.js, manifest.json, styles.css）
   * @returns 修改时间戳（毫秒），如果文件不存在则返回 null
   */
  private async getFileModifiedTime(pluginId: string, fileName: string): Promise<number | null> {
    try {
      // 使用相对于 vault 的路径
      const filePath = `.obsidian/plugins/${pluginId}/${fileName}`;
      
      const stats = await this.app.vault.adapter.stat(filePath);
      
      if (!stats) {
        return null;
      }
      
      return stats.mtime;
    } catch (error) {
      // 如果相对路径失败，尝试使用绝对路径
      try {
        const fs = require('fs');
        const basePath = (this.app.vault.adapter as any).basePath || 
                        (this.app.vault.adapter as any).getBasePath?.();
        const absPath = `${basePath}/.obsidian/plugins/${pluginId}/${fileName}`;
        const stats = fs.statSync(absPath);
        return stats.mtimeMs;
      } catch (e) {
        // 文件可能不存在（如 styles.css），这是正常的
        return null;
      }
    }
  }
  
  /**
   * 更新检查间隔
   * @param interval 新的检查间隔（毫秒）
   */
  setCheckInterval(interval: number): void {
    this.checkInterval = interval;
    
    // 重启定时器
    if (this.watchTimer) {
      this.stopWatching();
      this.startWatching(this.watchedPlugins);
    }
  }
  
  /**
   * 获取当前监听的插件列表
   * @returns 插件 ID 数组
   */
  getWatchedPlugins(): string[] {
    return [...this.watchedPlugins];
  }
}


