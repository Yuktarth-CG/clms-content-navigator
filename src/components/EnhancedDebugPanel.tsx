import React, { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { 
  Brain,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  RotateCcw,
  Copy,
  ChevronDown,
  ChevronRight,
  Lightbulb
} from 'lucide-react';
import { enhancedDebugService, ChangeRequest, LearningPattern } from '@/services/enhancedDebugService';
import { useToast } from '@/hooks/use-toast';

const EnhancedDebugPanel = () => {
  const [requests, setRequests] = useState<ChangeRequest[]>([]);
  const [expandedRequests, setExpandedRequests] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = enhancedDebugService.subscribe(setRequests);
    return unsubscribe;
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'partial':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-blue-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'failed':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'partial':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'pending':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-600';
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

  const toggleExpanded = (requestId: string) => {
    const newExpanded = new Set(expandedRequests);
    if (newExpanded.has(requestId)) {
      newExpanded.delete(requestId);
    } else {
      newExpanded.add(requestId);
    }
    setExpandedRequests(newExpanded);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard",
        description: "Request details copied successfully",
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const analysis = enhancedDebugService.getFailureAnalysis();
  const learningPatterns = enhancedDebugService.getLearningPatterns();

  // Pagination logic
  const totalPages = Math.ceil(requests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRequests = requests.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const RequestCard = ({ request }: { request: ChangeRequest }) => {
    const isExpanded = expandedRequests.has(request.id);
    
    return (
      <Card className={`mb-3 ${getStatusColor(request.status)}`}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              {getStatusIcon(request.status)}
              <div>
                <CardTitle className="text-sm font-medium">
                  {formatTime(request.timestamp)}
                </CardTitle>
                <CardDescription className="text-xs">
                  ID: {request.id} {request.retryCount > 0 && `(Retry #${request.retryCount})`}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                onClick={() => copyToClipboard(`Request: ${request.userRequest}\nStatus: ${request.status}\nChanges: ${request.changesAttempted.join(', ')}`)}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
              >
                <Copy className="w-3 h-3" />
              </Button>
              <Button
                onClick={() => toggleExpanded(request.id)}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
              >
                {isExpanded ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronRight className="w-3 h-3" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="text-xs font-medium mb-1">User Request:</div>
          <div className="text-xs mb-2 bg-white/50 rounded p-2 max-h-20 overflow-y-auto">
            {request.userRequest}
          </div>
          
          {isExpanded && (
            <div className="space-y-2">
              {request.aiResponse && (
                <div>
                  <div className="text-xs font-medium mb-1">AI Response:</div>
                  <div className="text-xs bg-white/50 rounded p-2 max-h-32 overflow-y-auto">
                    {request.aiResponse}
                  </div>
                </div>
              )}
              
              {request.changesAttempted.length > 0 && (
                <div>
                  <div className="text-xs font-medium mb-1">Changes Attempted:</div>
                  <ul className="text-xs space-y-1">
                    {request.changesAttempted.map((change, idx) => (
                      <li key={idx} className="flex items-start space-x-1">
                        <span className="text-gray-400">•</span>
                        <span>{change}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {request.errorDetails && (
                <div>
                  <div className="text-xs font-medium mb-1 text-red-600">Error Details:</div>
                  <div className="text-xs bg-red-50 border border-red-200 rounded p-2 max-h-24 overflow-y-auto">
                    {request.errorDetails}
                  </div>
                </div>
              )}
              
              {request.learningNotes && (
                <div>
                  <div className="text-xs font-medium mb-1 flex items-center space-x-1">
                    <Lightbulb className="w-3 h-3 text-yellow-500" />
                    <span>Learning Notes:</span>
                  </div>
                  <div className="text-xs bg-yellow-50 border border-yellow-200 rounded p-2">
                    <pre className="whitespace-pre-wrap">{request.learningNotes}</pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const LearningPatternsView = () => (
    <div className="space-y-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center space-x-2">
            <TrendingUp className="w-4 h-4" />
            <span>Performance Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="text-center">
              <div className="font-bold text-lg">{analysis.totalRequests}</div>
              <div className="text-gray-500">Total Requests</div>
            </div>
            <div className="text-center">
              <div className={`font-bold text-lg ${analysis.successRate >= 70 ? 'text-green-600' : analysis.successRate >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                {analysis.successRate.toFixed(1)}%
              </div>
              <div className="text-gray-500">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-lg">{analysis.commonErrors.length}</div>
              <div className="text-gray-500">Error Types</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {analysis.commonErrors.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
              <span>Common Error Types</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analysis.commonErrors.map((error, idx) => (
                <div key={idx} className="flex items-center space-x-2 text-xs">
                  <Badge variant="outline" className="text-xs">
                    #{idx + 1}
                  </Badge>
                  <span>{error}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {learningPatterns.map((pattern, idx) => (
        <Card key={idx}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center space-x-2">
              <Brain className="w-4 h-4 text-purple-500" />
              <span>{pattern.errorType}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pattern.commonCauses.length > 0 && (
              <div className="mb-3">
                <div className="text-xs font-medium mb-1">Common Causes:</div>
                <ul className="text-xs space-y-1">
                  {pattern.commonCauses.slice(0, 3).map((cause, i) => (
                    <li key={i} className="flex items-start space-x-1">
                      <span className="text-gray-400">•</span>
                      <span>{cause}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {pattern.suggestedSolutions.length > 0 && (
              <div>
                <div className="text-xs font-medium mb-1">Suggested Solutions:</div>
                <ul className="text-xs space-y-1">
                  {pattern.suggestedSolutions.slice(0, 3).map((solution, i) => (
                    <li key={i} className="flex items-start space-x-1">
                      <span className="text-green-400">✓</span>
                      <span>{solution}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="p-3 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Brain className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-medium text-gray-800">AI Learning Center</h3>
            <Badge variant="outline" className="text-xs">
              {requests.length}
            </Badge>
          </div>
          <Button
            onClick={() => enhancedDebugService.clear()}
            variant="outline"
            size="sm"
            className="text-xs h-7"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Clear
          </Button>
        </div>
        <p className="text-xs text-gray-500">
          Track requests, analyze failures, and improve AI performance
        </p>
      </div>

      <Tabs defaultValue="requests" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2 mx-3 mt-2">
          <TabsTrigger value="requests" className="text-xs">Requests</TabsTrigger>
          <TabsTrigger value="learning" className="text-xs">Learning</TabsTrigger>
        </TabsList>
        
        <TabsContent value="requests" className="flex-1 mt-2 flex flex-col">
          <div className="flex-1">
            <ScrollArea className="h-full px-3">
              {requests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Brain className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No requests tracked yet</p>
                  <p className="text-xs text-gray-400">AI interactions will appear here</p>
                </div>
              ) : (
                <div className="space-y-2 pb-4">
                  {currentRequests.map((request) => (
                    <RequestCard key={request.id} request={request} />
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
          
          {requests.length > itemsPerPage && (
            <div className="border-t border-gray-200 p-3 bg-white">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) handlePageChange(currentPage - 1);
                      }}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNumber;
                    if (totalPages <= 5) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i;
                    } else {
                      pageNumber = currentPage - 2 + i;
                    }
                    
                    return (
                      <PaginationItem key={pageNumber}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(pageNumber);
                          }}
                          isActive={currentPage === pageNumber}
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}
                  
                  <PaginationItem>
                    <PaginationNext 
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages) handlePageChange(currentPage + 1);
                      }}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
              
              <div className="text-xs text-gray-500 text-center mt-2">
                Showing {startIndex + 1}-{Math.min(endIndex, requests.length)} of {requests.length} requests
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="learning" className="flex-1 mt-2">
          <ScrollArea className="h-full px-3">
            <div className="pb-4">
              <LearningPatternsView />
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedDebugPanel;