
import React, { useState } from 'react';
import { Search, Filter, Plus, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Question, RepositoryType } from '@/types/content';
import RepositoryBadge from './RepositoryBadge';
import BulkImport from './BulkImport';
import { useUser } from '@/contexts/UserContext';
import ManualQuestionEntry from './ManualQuestionEntry';
import { ManualQuestion } from '@/types/assessment';
import { useToast } from '@/hooks/use-toast';

const QuestionLibrary = () => {
  const { user, hasPermission, canAccessRepository } = useUser();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedLOCode, setSelectedLOCode] = useState('all');
  const [selectedRepository, setSelectedRepository] = useState<RepositoryType | 'all'>('all');
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [isCreateContentOpen, setIsCreateContentOpen] = useState(false);

  const statusColors = {
    'Drafts': 'bg-gray-100 text-gray-800',
    'Assigned for Review': 'bg-yellow-100 text-yellow-800',
    'Rejected': 'bg-red-100 text-red-800',
    'Approved': 'bg-blue-100 text-blue-800',
    'Published': 'bg-green-100 text-green-800',
    'Archived': 'bg-gray-100 text-gray-600'
  };

  // Mock data with repository information
  const questions: Question[] = [
    {
      id: 'Q001',
      title: 'Basic Algebra Question',
      content: 'Solve for x: 2x + 5 = 15',
      loCode: 'ALG001',
      chapter: 'Linear Equations',
      difficulty: 'Medium',
      contentType: 'Question',
      questionType: 'formative',
      tags: ['algebra', 'linear', 'basic'],
      status: 'Published',
      repository: 'Public',
      createdAt: '2024-01-15',
      modifiedAt: '2024-01-20',
      createdBy: 'John Doe'
    },
    {
      id: 'Q002',
      title: 'Geometry Problem',
      content: 'Calculate the area of a circle with radius 5cm',
      loCode: 'GEO001',
      chapter: 'Circles',
      difficulty: 'Easy',
      contentType: 'Question',
      questionType: 'practice',
      tags: ['geometry', 'area', 'circle'],
      status: 'Approved',
      repository: 'Public',
      createdAt: '2024-01-16',
      modifiedAt: '2024-01-21',
      createdBy: 'Jane Smith'
    },
    {
      id: 'Q003',
      title: 'Board Exam Question - Calculus',
      content: 'Find the derivative of f(x) = x³ + 2x² - 5x + 1',
      loCode: 'CALC001',
      chapter: 'Differentiation',
      difficulty: 'Hard',
      contentType: 'Question',
      questionType: 'assessment',
      tags: ['calculus', 'derivative', 'board-exam'],
      status: 'Published',
      repository: 'Private',
      createdAt: '2024-01-10',
      modifiedAt: '2024-01-12',
      createdBy: 'State Official A'
    }
  ];

  const filteredQuestions = questions.filter(question => {
    // Filter by repository access
    if (!canAccessRepository(question.repository)) {
      return false;
    }

    const matchesSearch = question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.loCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || question.status === selectedStatus;
    const matchesLO = selectedLOCode === 'all' || question.loCode === selectedLOCode;
    const matchesRepository = selectedRepository === 'all' || question.repository === selectedRepository;
    
    return matchesSearch && matchesStatus && matchesLO && matchesRepository;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Content Library</h1>
          <p className="text-muted-foreground mt-1">
            {user?.role === 'Admin' 
              ? 'Manage secure assessment content'
              : 'Manage and organize your content across repositories'
            }
          </p>
        </div>
        <div className="flex space-x-3">
          {hasPermission('canImportContent') && (
            <Dialog open={isBulkImportOpen} onOpenChange={setIsBulkImportOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center space-x-2">
                  <Upload className="w-4 h-4" />
                  <span>Bulk Import Content</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Bulk Import Content</DialogTitle>
                </DialogHeader>
                <BulkImport />
              </DialogContent>
            </Dialog>
          )}
          {hasPermission('canCreateContent') && (
            <Dialog open={isCreateContentOpen} onOpenChange={setIsCreateContentOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4" />
                  <span>Create Content</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Question</DialogTitle>
                </DialogHeader>
                <ManualQuestionEntry
                  shortages={[
                    { questionType: 'MCQ', required: 5, available: 0, shortage: 5 },
                    { questionType: 'FITB', required: 3, available: 0, shortage: 3 },
                    { questionType: 'SA', required: 2, available: 0, shortage: 2 }
                  ]}
                  onSave={(questions: ManualQuestion[]) => {
                    console.log('Questions saved:', questions);
                    toast({
                      title: "Questions Created",
                      description: `${questions.length} question(s) created successfully with KG metadata`
                    });
                    setIsCreateContentOpen(false);
                  }}
                  onCancel={() => setIsCreateContentOpen(false)}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search by LO code, title, or content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            {/* Repository filter - only show if user has access to multiple repositories */}
            {canAccessRepository('Public') && canAccessRepository('Private') && (
              <Select value={selectedRepository} onValueChange={(value) => setSelectedRepository(value as RepositoryType | 'all')}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Repository" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Repositories</SelectItem>
                  <SelectItem value="Public">Public Repository</SelectItem>
                  <SelectItem value="Private">Private Repository</SelectItem>
                </SelectContent>
              </Select>
            )}
            
            <Select value={selectedLOCode} onValueChange={setSelectedLOCode}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="LO Code" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All LO Codes</SelectItem>
                <SelectItem value="ALG001">ALG001</SelectItem>
                <SelectItem value="GEO001">GEO001</SelectItem>
                <SelectItem value="CALC001">CALC001</SelectItem>
              </SelectContent>
            </Select>

            <Button className="bg-blue-600 hover:bg-blue-700">Search</Button>
          </div>
        </CardContent>
      </Card>

      {/* Status Filter Tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {['all', 'Drafts', 'Assigned for Review', 'Rejected', 'Approved', 'Published', 'Archived'].map((status) => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status)}
            className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
              selectedStatus === status
                ? 'bg-blue-600 text-white'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {status === 'all' ? 'All' : status}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="space-y-4">
        {filteredQuestions.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-32 h-32 mx-auto mb-4 opacity-50">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  <path d="M100 20 L100 180 M20 100 L180 100" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="2" fill="none"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                {user?.role === 'Admin' 
                  ? 'No private assessment content found matching your search.'
                  : 'Content matching your search will show up here.'
                }
              </h3>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex justify-between items-center">
              <p className="text-muted-foreground">
                Showing {filteredQuestions.length} content item(s)
              </p>
              <Select defaultValue="medium">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {filteredQuestions.map((question) => (
              <Card key={question.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold">{question.title}</h3>
                        <RepositoryBadge repository={question.repository} />
                        <Badge className={statusColors[question.status as keyof typeof statusColors]}>
                          {question.status}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-3">{question.content}</p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant="outline">LO: {question.loCode}</Badge>
                        <Badge variant="outline">Chapter: {question.chapter}</Badge>
                        <Badge variant="outline">Difficulty: {question.difficulty}</Badge>
                        <Badge variant="outline">Type: {question.questionType}</Badge>
                        {question.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">#{tag}</Badge>
                        ))}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Created by {question.createdBy} on {question.createdAt} • Modified {question.modifiedAt}
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      {hasPermission('canEditContent') && (
                        <Button variant="outline" size="sm">Edit</Button>
                      )}
                      <Button variant="outline" size="sm">Preview</Button>
                      {hasPermission('canDeleteContent') && (
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default QuestionLibrary;
