/**
 * 重载统计模块
 * 
 * 负责从日志文件中解析重载记录并提供统计信息
 */

export interface ReloadStatistics {
  totalReloads: number;
  successfulReloads: number;
  failedReloads: number;
  successRate: number;           // 百分比
  averageDuration: number;       // 毫秒
  lastReloadTime: number | null; // 时间戳
  reloadsByPlugin: Map<string, PluginReloadStats>;
}

export interface PluginReloadStats {
  pluginId: string;
  totalReloads: number;
  successfulReloads: number;
  failedReloads: number;
  averageDuration: number;
  lastReloadTime: number | null;
}

export class ReloadStats {
  /**
   * 构造函数
   * @param logFilePath 日志文件路径
   */
  constructor(private logFilePath: string) {}
  
  /**
   * 获取重载统计信息（今日）
   * @returns 统计信息对象
   */
  async getTodayStatistics(): Promise<ReloadStatistics> {
    return this.getStatistics(24); // 最近 24 小时
  }
  
  /**
   * 获取重载统计信息
   * @param hours 时间范围（小时）
   * @returns 统计信息对象
   */
  async getStatistics(hours: number = 24): Promise<ReloadStatistics> {
    const fs = require('fs');
    
    const defaultStats: ReloadStatistics = {
      totalReloads: 0,
      successfulReloads: 0,
      failedReloads: 0,
      successRate: 0,
      averageDuration: 0,
      lastReloadTime: null,
      reloadsByPlugin: new Map()
    };
    
    try {
      // 检查文件是否存在
      if (!fs.existsSync(this.logFilePath)) {
        return defaultStats;
      }
      
      // 读取文件内容
      const content = fs.readFileSync(this.logFilePath, 'utf8');
      const lines = content.split('\n');
      
      // 计算时间范围
      const cutoffTime = Date.now() - (hours * 60 * 60 * 1000);
      
      const durations: number[] = [];
      const pluginStats = new Map<string, PluginReloadStats>();
      
      for (const line of lines) {
        // 匹配重载日志
        // 格式：[HH:MM:SS.mmm] [LOG] [Auto-Reload] ✅ 插件已重载: plugin-id (用时: XXms)
        //      或 [HH:MM:SS.mmm] [LOG] [Auto-Reload] ❌ 插件重载失败: plugin-id
        
        if (!line.includes('[Auto-Reload]')) {
          continue;
        }
        
        // 提取时间戳（简化版：使用当前日期 + 时间）
        const timeMatch = line.match(/\[(\d{2}):(\d{2}):(\d{2})/);
        if (!timeMatch) continue;
        
        // 简化处理：只统计今天的日志
        // TODO: 更准确的时间解析
        
        // 检查是否是重载成功的日志
        if (line.includes('✅ 插件已重载:')) {
          defaultStats.totalReloads++;
          defaultStats.successfulReloads++;
          
          // 提取插件 ID
          const pluginMatch = line.match(/插件已重载: ([^\s]+)/);
          if (pluginMatch) {
            const pluginId = pluginMatch[1];
            
            // 提取耗时
            const durationMatch = line.match(/用时: (\d+)ms/);
            if (durationMatch) {
              const duration = parseInt(durationMatch[1]);
              durations.push(duration);
              
              // 更新插件统计
              this.updatePluginStats(pluginStats, pluginId, true, duration);
            }
          }
        } else if (line.includes('❌ 插件重载失败:')) {
          defaultStats.totalReloads++;
          defaultStats.failedReloads++;
          
          // 提取插件 ID
          const pluginMatch = line.match(/重载失败: ([^\s]+)/);
          if (pluginMatch) {
            const pluginId = pluginMatch[1];
            this.updatePluginStats(pluginStats, pluginId, false, 0);
          }
        }
      }
      
      // 计算成功率
      if (defaultStats.totalReloads > 0) {
        defaultStats.successRate = (defaultStats.successfulReloads / defaultStats.totalReloads) * 100;
      }
      
      // 计算平均耗时
      if (durations.length > 0) {
        const sum = durations.reduce((a, b) => a + b, 0);
        defaultStats.averageDuration = Math.round(sum / durations.length);
      }
      
      defaultStats.reloadsByPlugin = pluginStats;
      
      return defaultStats;
    } catch (error) {
      console.error('获取重载统计失败:', error);
      return defaultStats;
    }
  }
  
  /**
   * 更新插件统计
   */
  private updatePluginStats(
    statsMap: Map<string, PluginReloadStats>,
    pluginId: string,
    success: boolean,
    duration: number
  ): void {
    if (!statsMap.has(pluginId)) {
      statsMap.set(pluginId, {
        pluginId,
        totalReloads: 0,
        successfulReloads: 0,
        failedReloads: 0,
        averageDuration: 0,
        lastReloadTime: Date.now()
      });
    }
    
    const stats = statsMap.get(pluginId)!;
    stats.totalReloads++;
    
    if (success) {
      stats.successfulReloads++;
      
      // 更新平均耗时
      const totalDuration = stats.averageDuration * (stats.successfulReloads - 1) + duration;
      stats.averageDuration = Math.round(totalDuration / stats.successfulReloads);
    } else {
      stats.failedReloads++;
    }
    
    stats.lastReloadTime = Date.now();
  }
}

