import React, { useState } from 'react';
import { Search, Download, Eye, Trash2, Filter, Calendar, User, BookOpen, CalendarIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';

interface GeneratedTestPaper {
  id: string;
  title: string;
  createdAt: string;
  createdBy: string;
  repository: 'Public' | 'Private';
  status: 'Generated' | 'Downloaded';
  totalQuestions: number;
  totalMarks: number;
  duration: number;
  sourceType: 'CSV Upload' | 'CLMS Library';
  templateUsed: string;
  downloadCount: number;
}

const OCRTestPaperManagement = () => {
  const { user, canAccessRepository } = useUser();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [repositoryFilter, setRepositoryFilter] = useState('all');
  const [createdByFilter, setCreatedByFilter] = useState('all');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  // Mock data - would come from API in real implementation
  const [testPapers] = useState<GeneratedTestPaper[]>([
    {
      id: 'tp-001',
      title: 'Mathematics Grade 10 Test Paper',
      createdAt: '2024-01-15T10:30:00Z',
      createdBy: 'John Doe',
      repository: 'Public',
      status: 'Generated',
      totalQuestions: 25,
      totalMarks: 100,
      duration: 180,
      sourceType: 'CSV Upload',
      templateUsed: 'Standard Math Template',
      downloadCount: 3
    },
    {
      id: 'tp-002',
      title: 'Science Assessment Paper',
      createdAt: '2024-01-14T14:20:00Z',
      createdBy: 'Jane Smith',
      repository: 'Private',
      status: 'Downloaded',
      totalQuestions: 30,
      totalMarks: 150,
      duration: 240,
      sourceType: 'CLMS Library',
      templateUsed: 'Science Template V2',
      downloadCount: 1
    },
    {
      id: 'tp-003',
      title: 'English Literature Practice Test',
      createdAt: '2024-01-13T09:15:00Z',
      createdBy: 'Mike Johnson',
      repository: 'Public',
      status: 'Downloaded',
      totalQuestions: 20,
      totalMarks: 80,
      duration: 120,
      sourceType: 'CSV Upload',
      templateUsed: 'Literature Template',
      downloadCount: 7
    }
  ]);

  // Get unique creators for filter dropdown
  const uniqueCreators = Array.from(new Set(testPapers.map(paper => paper.createdBy)));

  // Filter test papers based on access permissions
  const filteredTestPapers = testPapers.filter(paper => {
    // Repository access check
    if (!canAccessRepository(paper.repository)) {
      return false;
    }

    // Search filter
    if (searchTerm && !paper.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Status filter
    if (statusFilter !== 'all' && paper.status !== statusFilter) {
      return false;
    }

    // Repository filter
    if (repositoryFilter !== 'all' && paper.repository !== repositoryFilter) {
      return false;
    }

    // Created by filter
    if (createdByFilter !== 'all' && paper.createdBy !== createdByFilter) {
      return false;
    }

    // Date range filter
    const paperDate = new Date(paper.createdAt);
    if (startDate && paperDate < startDate) {
      return false;
    }
    if (endDate && paperDate > endDate) {
      return false;
    }

    return true;
  });

  const handleDownload = (paper: GeneratedTestPaper) => {
    toast({
      title: "Download Started",
      description: `Downloading "${paper.title}"`,
    });
    // Download logic would go here
  };

  const handleView = (paper: GeneratedTestPaper) => {
    toast({
      title: "Opening Preview",
      description: `Previewing "${paper.title}"`,
    });
    // View logic would go here
  };

  const handleDelete = (paper: GeneratedTestPaper) => {
    toast({
      title: "Test Paper Deleted",
      description: `"${paper.title}" has been removed`,
      variant: "destructive"
    });
    // Delete logic would go here
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Generated': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'Downloaded': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getRepositoryColor = (repository: string) => {
    return repository === 'Private' 
      ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Test Paper Management</h1>
          <p className="text-muted-foreground">
            View, download, and manage test papers generated through OCR tools
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filter & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search Test Papers</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Generated">Generated</SelectItem>
                  <SelectItem value="Downloaded">Downloaded</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Repository</label>
              <Select value={repositoryFilter} onValueChange={setRepositoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All repositories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Repositories</SelectItem>
                  <SelectItem value="Public">Public</SelectItem>
                  <SelectItem value="Private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Created By</label>
              <Select value={createdByFilter} onValueChange={setCreatedByFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {uniqueCreators.map((creator) => (
                    <SelectItem key={creator} value={creator}>
                      {creator}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : <span>Pick start date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : <span>Pick end date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {filteredTestPapers.length} test paper{filteredTestPapers.length !== 1 ? 's' : ''} found
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setRepositoryFilter('all');
                    setCreatedByFilter('all');
                    setStartDate(undefined);
                    setEndDate(undefined);
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Papers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Generated Test Papers
          </CardTitle>
          <CardDescription>
            Manage test papers created through OCR tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTestPapers.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No test papers found</h3>
              <p className="text-muted-foreground">
                 {searchTerm || statusFilter !== 'all' || repositoryFilter !== 'all' || createdByFilter !== 'all' || startDate || endDate
                   ? 'Try adjusting your filters to see more results.'
                   : 'Generate your first test paper using the OCR tools.'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title & Details</TableHead>
                  <TableHead>Repository</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTestPapers.map((paper) => (
                  <TableRow key={paper.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{paper.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {paper.totalQuestions} questions • {paper.totalMarks} marks • {paper.duration} min
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Template: {paper.templateUsed}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRepositoryColor(paper.repository)}>
                        {paper.repository}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(paper.status)}>
                        {paper.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{paper.sourceType}</div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">
                          {new Date(paper.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {paper.createdBy}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Download className="w-3 h-3" />
                          {paper.downloadCount} downloads
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleView(paper)}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(paper)}
                          className="h-8 w-8 p-0"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(paper)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OCRTestPaperManagement;