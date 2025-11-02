/**
 * 监控文件类型配置
 */
export interface WatchedFileTypes {
  main: boolean;        // main.js（必选，UI 中禁用）
  manifest: boolean;    // manifest.json
  styles: boolean;      // styles.css
  custom: string[];     // 自定义文件列表，支持通配符（如 data.json, lang/*.json）
}

/**
 * 插件完整配置接口
 */
export interface PluginSettings {
  // 日志模块配置
  logger: {
    bufferSize: number;           // 缓冲区大小（条数）
    flushInterval: number;        // 刷新间隔（毫秒）
    logFilePath: string;          // 日志文件路径
    enableRotation: boolean;      // 启用日志轮转
    maxFileSize: number;          // 文件大小上限（MB）
    enableAutoClean: boolean;     // 自动清理旧日志
    retentionDays: number;        // 保留天数
  };
  
  // Auto-Reload 模块配置
  autoReload: {
    mode: 'auto' | 'smart' | 'manual';  // 监控模式
    watchedPlugins: string[];            // 手动模式下选中的插件列表
    checkInterval: number;               // 检查间隔（毫秒）
    showNotification: boolean;           // 是否显示重载通知
    showStartupNotification: boolean;    // 是否在启动时显示通知
    smartModeThreshold: number;          // 智能模式的检测阈值（小时）
    globalWatchedFiles: WatchedFileTypes; // 全局监控文件类型
    usePluginSpecific: boolean;          // 是否启用插件特定配置
    pluginSpecificFiles: Record<string, WatchedFileTypes>; // 每个插件的特定配置
  };
}

/**
 * 默认文件类型配置
 */
export const DEFAULT_WATCHED_FILES: WatchedFileTypes = {
  main: true,           // 必选
  manifest: true,       // 默认监控
  styles: true,         // 默认监控
  custom: []            // 默认无自定义文件
};

/**
 * 默认配置
 */
export const DEFAULT_SETTINGS: PluginSettings = {
  logger: {
    bufferSize: 100,
    flushInterval: 500,
    logFilePath: '../cursor-logs/obsidian-debug.log',
    enableRotation: true,
    maxFileSize: 10,
    enableAutoClean: true,
    retentionDays: 30
  },
  autoReload: {
    mode: 'smart',
    watchedPlugins: [],
    checkInterval: 1000,
    showNotification: true,
    showStartupNotification: true,
    smartModeThreshold: 24,
    globalWatchedFiles: DEFAULT_WATCHED_FILES,
    usePluginSpecific: false,
    pluginSpecificFiles: {}
  }
};

/**
 * 日志级别类型
 */
export type LogLevel = 'LOG' | 'ERROR' | 'WARN' | 'DEBUG';

