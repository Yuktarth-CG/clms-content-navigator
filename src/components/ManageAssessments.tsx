import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Search, Download, Eye, Trash2, Filter, Calendar as CalendarIcon, User, FileText, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Assessment } from '@/types/assessment';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';

const ManageAssessments = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [previewAssessment, setPreviewAssessment] = useState<Assessment | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [repositoryCount, setRepositoryCount] = useState(0);
  
  const itemsPerPage = 25;
  const maxRepositoryLimit = 100;

  const [filters, setFilters] = useState({
    searchTerm: '',
    subject: 'all',
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined
  });

  useEffect(() => {
    fetchAssessments();
    fetchRepositoryCount();
  }, [filters, currentPage]);

  const fetchAssessments = async () => {
    setLoading(true);
    try {
      let countQuery = supabase
        .from('assessments')
        .select('*', { count: 'exact', head: true });

      let query = supabase
        .from('assessments')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters to both queries
      const applyFilters = (q: any) => {
        if (filters.searchTerm) {
          q = q.ilike('title', `%${filters.searchTerm}%`);
        }

        if (filters.subject !== 'all') {
          // Assuming subject information is stored in chapters or a separate subject field
          // For now, we'll add this filter if the subject field exists in the database
        }

        if (filters.startDate) {
          q = q.gte('created_at', filters.startDate.toISOString());
        }

        if (filters.endDate) {
          q = q.lte('created_at', filters.endDate.toISOString());
        }

        return q;
      };

      countQuery = applyFilters(countQuery);
      query = applyFilters(query);

      // Add pagination
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      query = query.range(from, to);

      const [{ count }, { data, error }] = await Promise.all([
        countQuery,
        query
      ]);

      if (error) throw error;
      
      // Cast and transform the data to match Assessment interface
      const assessmentsData = (data || []).map(assessment => ({
        ...assessment,
        manual_questions_count: assessment.manual_questions_count || 0,
        has_manual_questions: assessment.has_manual_questions || false,
        manual_questions_data: assessment.manual_questions_data ? 
          (Array.isArray(assessment.manual_questions_data) ? 
            assessment.manual_questions_data.map(q => q as any) : []) : []
      })) as Assessment[];
      
      setAssessments(assessmentsData);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error fetching assessments:', error);
      toast({
        title: "Error",
        description: "Failed to load assessments",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRepositoryCount = async () => {
    try {
      const { count, error } = await supabase
        .from('assessments')
        .select('*', { count: 'exact', head: true })
        .neq('status', 'Archived');

      if (error) throw error;
      setRepositoryCount(count || 0);
    } catch (error) {
      console.error('Error fetching repository count:', error);
    }
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      subject: 'all',
      startDate: undefined,
      endDate: undefined
    });
    setCurrentPage(1);
  };

  const handleView = async (assessment: Assessment) => {
    setPreviewAssessment(assessment);
    setPreviewOpen(true);

    // Log view action
    try {
      await supabase
        .from('assessment_audit')
        .insert({
          assessment_id: assessment.id,
          action: 'view',
          user_id: user?.id || '',
          user_name: user?.name || 'Unknown',
          metadata: { title: assessment.title }
        });
    } catch (error) {
      console.error('Error logging view action:', error);
    }
  };

  const handleDownload = async (assessment: Assessment) => {
    try {
      // Increment download count
      await supabase
        .from('assessments')
        .update({ download_count: assessment.download_count + 1 })
        .eq('id', assessment.id);

      // Log download action
      await supabase
        .from('assessment_audit')
        .insert({
          assessment_id: assessment.id,
          action: 'download',
          user_id: user?.id || '',
          user_name: user?.name || 'Unknown',
          metadata: { title: assessment.title, download_count: assessment.download_count + 1 }
        });

      toast({
        title: "Download Started",
        description: `Downloading "${assessment.title}"`,
      });

      // Refresh the list to show updated download count
      fetchAssessments();

    } catch (error) {
      console.error('Error downloading assessment:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download assessment. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (assessment: Assessment) => {
    try {
      // Soft delete by changing status
      await supabase
        .from('assessments')
        .update({ status: 'Archived' })
        .eq('id', assessment.id);

      // Log delete action
      await supabase
        .from('assessment_audit')
        .insert({
          assessment_id: assessment.id,
          action: 'delete',
          user_id: user?.id || '',
          user_name: user?.name || 'Unknown',
          metadata: { title: assessment.title }
        });

      toast({
        title: "Assessment Deleted",
        description: `"${assessment.title}" has been archived`,
      });

      fetchAssessments();

    } catch (error) {
      console.error('Error deleting assessment:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete assessment. Please try again.",
        variant: "destructive"
      });
    }
  };

  const canDelete = (assessment: Assessment) => {
    // Users can only delete their own assessments
    return user?.id === assessment.created_by;
  };

  // Add dummy data for assessments with manual questions
  const dummyAssessments: Assessment[] = [
    {
      id: '1',
      title: 'Mathematics - Algebra Assessment',
      grade: 10,
      medium: 'English',
      chapters: ['Linear Equations', 'Quadratic Equations'],
      learning_outcomes: ['Solve linear equations', 'Graph functions'],
      total_questions: 25,
      total_marks: 50,
      duration: 60,
      allowed_question_types: ['MCQ', 'FITB'],
      bloom_l1: 5, bloom_l2: 8, bloom_l3: 7, bloom_l4: 3, bloom_l5: 2, bloom_l6: 0,
      mode: 'FA' as const,
      source: 'Automated' as const,
      repository: 'Public' as const,
      status: 'Generated' as const,
      created_by: 'user1',
      created_by_name: 'John Doe',
      created_by_role: 'Teacher',
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-01-15T10:30:00Z',
      download_count: 15,
      manual_questions_count: 3,
      has_manual_questions: true,
      manual_questions_data: [
        {
          id: 'mq1',
          questionType: 'MCQ',
          questionText: 'What is the value of x in 2x + 5 = 15?',
          options: ['5', '10', '15', '20'],
          correctAnswer: '5',
          bloomLevel: 2,
          marks: 2,
          addedBy: 'John Doe',
          addedAt: '2024-01-15T10:30:00Z'
        }
      ]
    },
    {
      id: '2',
      title: 'Science - Physics Motion Test',
      grade: 9,
      medium: 'English',
      chapters: ['Motion', 'Force and Laws of Motion'],
      learning_outcomes: ['Understand motion concepts', 'Apply Newton\'s laws'],
      total_questions: 20,
      total_marks: 40,
      duration: 45,
      allowed_question_types: ['MCQ', 'Match'],
      bloom_l1: 4, bloom_l2: 6, bloom_l3: 5, bloom_l4: 3, bloom_l5: 2, bloom_l6: 0,
      mode: 'SA' as const,
      source: 'Customised' as const,
      repository: 'Private' as const,
      status: 'Generated' as const,
      created_by: 'user2',
      created_by_name: 'Jane Smith',
      created_by_role: 'Teacher',
      created_at: '2024-01-14T14:20:00Z',
      updated_at: '2024-01-14T14:20:00Z',
      download_count: 8
    },
    {
      id: '3',
      title: 'English - Grammar and Comprehension',
      grade: 8,
      medium: 'English',
      chapters: ['Parts of Speech', 'Reading Comprehension'],
      learning_outcomes: ['Identify grammatical elements', 'Analyze text'],
      total_questions: 30,
      total_marks: 60,
      duration: 90,
      allowed_question_types: ['MCQ', 'FITB', 'Arrange'],
      bloom_l1: 8, bloom_l2: 10, bloom_l3: 7, bloom_l4: 3, bloom_l5: 2, bloom_l6: 0,
      mode: 'FA' as const,
      source: 'OCR' as const,
      repository: 'Public' as const,
      status: 'Generated' as const,
      created_by: 'user3',
      created_by_name: 'Mike Johnson',
      created_by_role: 'Teacher',
      created_at: '2024-01-13T09:15:00Z',
      updated_at: '2024-01-13T09:15:00Z',
      download_count: 22,
      manual_questions_count: 5,
      has_manual_questions: true,
      manual_questions_data: [
        {
          id: 'mq2',
          questionType: 'FITB',
          questionText: 'The _____ of a sentence is the person or thing performing the action.',
          correctAnswer: 'subject',
          bloomLevel: 1,
          marks: 1,
          addedBy: 'Mike Johnson',
          addedAt: '2024-01-13T09:15:00Z'
        }
      ]
    },
    {
      id: '4',
      title: 'Hindi - Vyakaran aur Kavita',
      grade: 7,
      medium: 'Hindi',
      chapters: ['Vyakaran', 'Kavita Paath'],
      learning_outcomes: ['Hindi grammar mastery', 'Poetry appreciation'],
      total_questions: 18,
      total_marks: 36,
      duration: 60,
      allowed_question_types: ['MCQ', 'FITB'],
      bloom_l1: 6, bloom_l2: 5, bloom_l3: 4, bloom_l4: 2, bloom_l5: 1, bloom_l6: 0,
      mode: 'FA' as const,
      source: 'CSV Upload' as const,
      repository: 'Public' as const,
      status: 'Generated' as const,
      created_by: 'user4',
      created_by_name: 'Priya Sharma',
      created_by_role: 'Teacher',
      created_at: '2024-01-12T11:45:00Z',
      updated_at: '2024-01-12T11:45:00Z',
      download_count: 12
    },
    {
      id: '5',
      title: 'Social Studies - Indian History',
      grade: 6,
      medium: 'English',
      chapters: ['Ancient India', 'Medieval India'],
      learning_outcomes: ['Historical timeline knowledge', 'Cultural understanding'],
      total_questions: 22,
      total_marks: 44,
      duration: 75,
      allowed_question_types: ['MCQ', 'Match', 'Arrange'],
      bloom_l1: 7, bloom_l2: 6, bloom_l3: 5, bloom_l4: 3, bloom_l5: 1, bloom_l6: 0,
      mode: 'SA' as const,
      source: 'Automated' as const,
      repository: 'Private' as const,
      status: 'Generated' as const,
      created_by: 'user5',
      created_by_name: 'Rajesh Kumar',
      created_by_role: 'Teacher',
      created_at: '2024-01-11T16:30:00Z',
      updated_at: '2024-01-11T16:30:00Z',
      download_count: 18,
      manual_questions_count: 2,
      has_manual_questions: true,
      manual_questions_data: [
        {
          id: 'mq3',
          questionType: 'Match',
          questionText: 'Match the rulers with their dynasties',
          options: ['Chandragupta Maurya - Mauryan', 'Akbar - Mughal', 'Ashoka - Mauryan', 'Shah Jahan - Mughal'],
          correctAnswer: 'All matches correct',
          bloomLevel: 2,
          marks: 4,
          addedBy: 'Rajesh Kumar',
          addedAt: '2024-01-11T16:30:00Z'
        }
      ]
    }
  ];

  // Use dummy data if no real assessments exist
  const displayAssessments = assessments.length > 0 ? assessments : dummyAssessments;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Assessment Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Browse, filter, and manage all your generated assessment papers and worksheets
        </p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Search by Title</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search assessments..."
                  value={filters.searchTerm}
                  onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Subject</Label>
              <Select value={filters.subject} onValueChange={(value) => setFilters(prev => ({ ...prev, subject: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  <SelectItem value="Mathematics">Mathematics</SelectItem>
                  <SelectItem value="Science">Science</SelectItem>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Hindi">Hindi</SelectItem>
                  <SelectItem value="Social Studies">Social Studies</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filters.startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.startDate ? format(filters.startDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.startDate}
                    onSelect={(date) => setFilters(prev => ({ ...prev, startDate: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filters.endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.endDate ? format(filters.endDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.endDate}
                    onSelect={(date) => setFilters(prev => ({ ...prev, endDate: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {totalCount} total assessment{totalCount !== 1 ? 's' : ''} • Page {currentPage} of {Math.ceil(totalCount / itemsPerPage)} • Repository: {repositoryCount}/{maxRepositoryLimit} assessments
              </div>
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assessments Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Generated Assessments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {displayAssessments.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No assessments found</h3>
              <p className="text-muted-foreground">
                {Object.values(filters).some(f => f && f !== 'all') 
                  ? 'Try adjusting your filters to see more results.'
                  : 'Generate your first assessment using the Create Assessments tool.'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title & Details</TableHead>
                  <TableHead>Date Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayAssessments.map((assessment) => (
                <TableRow key={assessment.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{assessment.title}</span>
                          {assessment.has_manual_questions && (
                            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                              {assessment.manual_questions_count || 0} Custom Questions
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {assessment.total_questions} questions total
                          {assessment.has_manual_questions && ` (${assessment.total_questions - (assessment.manual_questions_count || 0)} auto-generated, ${assessment.manual_questions_count || 0} custom)`}
                          {assessment.total_marks && ` • ${assessment.total_marks} marks`}
                          {assessment.duration && ` • ${assessment.duration} min`}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {assessment.blueprint_name ? `Blueprint: ${assessment.blueprint_name}` : 'Custom Specification'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(assessment.created_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleView(assessment)}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(assessment)}
                          className="h-8 w-8 p-0"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        {canDelete(assessment) && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Assessment</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{assessment.title}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(assessment)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalCount > itemsPerPage && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) {
                      setCurrentPage(currentPage - 1);
                    }
                  }}
                  className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
              
              {Array.from({ length: Math.ceil(totalCount / itemsPerPage) }, (_, i) => i + 1)
                .filter(page => {
                  // Show first page, last page, current page, and pages around current
                  const totalPages = Math.ceil(totalCount / itemsPerPage);
                  return page === 1 || 
                         page === totalPages || 
                         Math.abs(page - currentPage) <= 1;
                })
                .map((page, index, array) => {
                  // Add ellipsis if there's a gap
                  const prevPage = array[index - 1];
                  const showEllipsis = prevPage && page - prevPage > 1;
                  
                  return (
                    <React.Fragment key={page}>
                      {showEllipsis && (
                        <PaginationItem>
                          <span className="px-4 py-2">...</span>
                        </PaginationItem>
                      )}
                      <PaginationItem>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(page);
                          }}
                          isActive={currentPage === page}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    </React.Fragment>
                  );
                })}
              
              <PaginationItem>
                <PaginationNext 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < Math.ceil(totalCount / itemsPerPage)) {
                      setCurrentPage(currentPage + 1);
                    }
                  }}
                  className={currentPage >= Math.ceil(totalCount / itemsPerPage) ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assessment Preview: {previewAssessment?.title}</DialogTitle>
          </DialogHeader>
          {previewAssessment && (
            <div className="space-y-6">
              {/* Assessment Details */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <Label className="text-sm font-medium">Grade</Label>
                  <p className="text-sm">{previewAssessment.grade}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Medium</Label>
                  <p className="text-sm">{previewAssessment.medium}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Questions</Label>
                  <p className="text-sm">{previewAssessment.total_questions}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Total Marks</Label>
                  <p className="text-sm">{previewAssessment.total_marks || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Duration</Label>
                  <p className="text-sm">{previewAssessment.duration ? `${previewAssessment.duration} min` : 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Mode</Label>
                  <p className="text-sm">{previewAssessment.mode}</p>
                </div>
              </div>

              {/* Chapters */}
              {previewAssessment.chapters && previewAssessment.chapters.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Chapters</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {previewAssessment.chapters.map((chapter, index) => (
                      <Badge key={index} variant="outline">{chapter}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Learning Outcomes */}
              {previewAssessment.learning_outcomes && previewAssessment.learning_outcomes.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Learning Outcomes</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {previewAssessment.learning_outcomes.map((outcome, index) => (
                      <Badge key={index} variant="secondary">{outcome}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Question Types */}
              <div>
                <Label className="text-sm font-medium">Question Types</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {previewAssessment.allowed_question_types.map((type, index) => (
                    <Badge key={index} variant="outline">{type}</Badge>
                  ))}
                </div>
              </div>

              {/* Bloom's Taxonomy Distribution */}
              <div>
                <Label className="text-sm font-medium">Bloom's Taxonomy Distribution</Label>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-2">
                  <div className="text-center p-2 bg-muted rounded">
                    <div className="text-sm font-medium">L1</div>
                    <div className="text-lg">{previewAssessment.bloom_l1}</div>
                  </div>
                  <div className="text-center p-2 bg-muted rounded">
                    <div className="text-sm font-medium">L2</div>
                    <div className="text-lg">{previewAssessment.bloom_l2}</div>
                  </div>
                  <div className="text-center p-2 bg-muted rounded">
                    <div className="text-sm font-medium">L3</div>
                    <div className="text-lg">{previewAssessment.bloom_l3}</div>
                  </div>
                  <div className="text-center p-2 bg-muted rounded">
                    <div className="text-sm font-medium">L4</div>
                    <div className="text-lg">{previewAssessment.bloom_l4}</div>
                  </div>
                  <div className="text-center p-2 bg-muted rounded">
                    <div className="text-sm font-medium">L5</div>
                    <div className="text-lg">{previewAssessment.bloom_l5}</div>
                  </div>
                  <div className="text-center p-2 bg-muted rounded">
                    <div className="text-sm font-medium">L6</div>
                    <div className="text-lg">{previewAssessment.bloom_l6}</div>
                  </div>
                </div>
              </div>

              {/* Manual Questions */}
              {previewAssessment.has_manual_questions && previewAssessment.manual_questions_data && (
                <div>
                  <Label className="text-sm font-medium">Manual Questions ({previewAssessment.manual_questions_count})</Label>
                  <div className="space-y-3 mt-2">
                    {previewAssessment.manual_questions_data.map((question, index) => (
                      <div key={question.id} className="p-3 border rounded-lg bg-amber-50 dark:bg-amber-900/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">{question.questionType}</Badge>
                          <Badge variant="outline" className="text-xs">L{question.bloomLevel}</Badge>
                          <Badge variant="outline" className="text-xs">{question.marks} marks</Badge>
                        </div>
                        <p className="text-sm font-medium mb-2">{question.questionText}</p>
                        {question.options && (
                          <div className="text-xs text-muted-foreground">
                            Options: {question.options.join(', ')}
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground mt-1">
                          Correct Answer: {question.correctAnswer}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Added by {question.addedBy} on {new Date(question.addedAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t">
                <Button onClick={() => handleDownload(previewAssessment)} className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Download Full PDF
                </Button>
                <Button variant="outline" onClick={() => setPreviewOpen(false)} className="flex-1">
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageAssessments;