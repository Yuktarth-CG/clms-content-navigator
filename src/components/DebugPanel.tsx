import React, { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Bug, 
  Trash2, 
  Info, 
  AlertTriangle, 
  AlertCircle, 
  Terminal,
  ChevronDown,
  ChevronRight,
  Copy
} from 'lucide-react';
import { debugService, DebugLogEntry } from '@/services/debugService';
import { useToast } from '@/hooks/use-toast';

const DebugPanel = () => {
  const [logs, setLogs] = useState<DebugLogEntry[]>([]);
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = debugService.subscribe(setLogs);
    return unsubscribe;
  }, []);

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error':
        return <AlertCircle className="w-3 h-3 text-red-500" />;
      case 'warn':
        return <AlertTriangle className="w-3 h-3 text-yellow-500" />;
      case 'info':
        return <Info className="w-3 h-3 text-blue-500" />;
      case 'debug':
        return <Terminal className="w-3 h-3 text-gray-500" />;
      default:
        return <Bug className="w-3 h-3 text-gray-400" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warn':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'debug':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const toggleExpanded = (logId: string) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedLogs(newExpanded);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard",
        description: "Debug log entry copied successfully",
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const clearLogs = () => {
    debugService.clear();
    toast({
      title: "Debug logs cleared",
      description: "All debug logs have been removed",
    });
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="p-3 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Bug className="w-4 h-4 text-gray-600" />
            <h3 className="text-sm font-medium text-gray-800">Debug Logs</h3>
            <Badge variant="outline" className="text-xs">
              {logs.length}
            </Badge>
          </div>
          <Button
            onClick={clearLogs}
            variant="outline"
            size="sm"
            className="text-xs h-7"
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Clear
          </Button>
        </div>
        <p className="text-xs text-gray-500">
          Real-time system activity and AI debugging information
        </p>
      </div>

      {/* Logs */}
      <ScrollArea className="flex-1 p-2">
        {logs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Bug className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No debug logs yet</p>
            <p className="text-xs text-gray-400">System activity will appear here</p>
          </div>
        ) : (
          <div className="space-y-1">
            {logs.map((log) => {
              const isExpanded = expandedLogs.has(log.id);
              const hasData = log.data && Object.keys(log.data).length > 0;
              
              return (
                <div
                  key={log.id}
                  className={`border rounded p-2 text-xs ${getLevelColor(log.level)}`}
                >
                  {/* Main log line */}
                  <div className="flex items-start space-x-2">
                    <div className="flex items-center space-x-1 flex-shrink-0">
                      {getLevelIcon(log.level)}
                      <span className="font-mono text-xs text-gray-600">
                        {formatTime(log.timestamp)}
                      </span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start space-x-2">
                        <div className="flex-1">
                          {log.component && (
                            <span className="font-medium text-xs">
                              [{log.component}]
                            </span>
                          )}
                          <span className="ml-1">{log.message}</span>
                        </div>
                        
                        <div className="flex items-center space-x-1 flex-shrink-0">
                          <Button
                            onClick={() => copyToClipboard(`[${formatTime(log.timestamp)}] ${log.component ? `[${log.component}] ` : ''}${log.message}${hasData ? `\nData: ${JSON.stringify(log.data, null, 2)}` : ''}`)}
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 hover:bg-black/10"
                          >
                            <Copy className="w-2.5 h-2.5" />
                          </Button>
                          
                          {hasData && (
                            <Button
                              onClick={() => toggleExpanded(log.id)}
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 hover:bg-black/10"
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-2.5 h-2.5" />
                              ) : (
                                <ChevronRight className="w-2.5 h-2.5" />
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded data */}
                  {isExpanded && hasData && (
                    <>
                      <Separator className="my-2" />
                      <div className="bg-black/5 rounded p-2 font-mono text-xs overflow-x-auto">
                        <pre className="whitespace-pre-wrap break-words">
                          {JSON.stringify(log.data, null, 2)}
                        </pre>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default DebugPanel;