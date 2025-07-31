interface DebugLogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  component?: string;
  data?: any;
}

class DebugService {
  private logs: DebugLogEntry[] = [];
  private listeners: ((logs: DebugLogEntry[]) => void)[] = [];
  private maxLogs = 100;

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  log(level: 'info' | 'warn' | 'error' | 'debug', message: string, component?: string, data?: any) {
    const entry: DebugLogEntry = {
      id: this.generateId(),
      timestamp: new Date(),
      level,
      message,
      component,
      data
    };

    this.logs.unshift(entry);
    
    // Keep only the latest logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Notify listeners
    this.listeners.forEach(listener => listener([...this.logs]));

    // Also log to console for debugging
    const consoleMethod = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
    console[consoleMethod](`[DEBUG ${level.toUpperCase()}] ${component ? `[${component}] ` : ''}${message}`, data || '');
  }

  info(message: string, component?: string, data?: any) {
    this.log('info', message, component, data);
  }

  warn(message: string, component?: string, data?: any) {
    this.log('warn', message, component, data);
  }

  error(message: string, component?: string, data?: any) {
    this.log('error', message, component, data);
  }

  debug(message: string, component?: string, data?: any) {
    this.log('debug', message, component, data);
  }

  subscribe(listener: (logs: DebugLogEntry[]) => void) {
    this.listeners.push(listener);
    // Immediately call with current logs
    listener([...this.logs]);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  getLogs(): DebugLogEntry[] {
    return [...this.logs];
  }

  clear() {
    this.logs = [];
    this.listeners.forEach(listener => listener([]));
  }
}

export const debugService = new DebugService();

// Initialize with a welcome message
debugService.info('Debug logging system initialized', 'DebugService');

export type { DebugLogEntry };
