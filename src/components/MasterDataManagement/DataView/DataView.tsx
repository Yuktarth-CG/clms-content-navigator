import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Eye, Search, Plus, Edit, Trash2, Filter } from 'lucide-react';
import { useMasterDataTypes, useMasterDataEntries, useCreateMasterDataEntry, useUpdateMasterDataEntry, useDeleteMasterDataEntry } from '@/hooks/useMasterData';
import { useToast } from '@/hooks/use-toast';

// Mock data to demonstrate functionality
const mockEntries = [
  {
    id: '1',
    type_id: 'subject',
    name: { en: 'Mathematics', hi: 'गणित' },
    parent_id: null,
    state_id: 'default',
    metadata: { code: 'MATH', description: 'Core mathematical concepts' },
    is_active: true,
    created_by: 'admin',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    type_id: 'grade',
    name: { en: 'Grade 10', hi: 'कक्षा 10' },
    parent_id: null,
    state_id: 'default',
    metadata: { level: 'secondary', board: 'CBSE' },
    is_active: true,
    created_by: 'admin',
    created_at: '2024-01-15T10:05:00Z',
    updated_at: '2024-01-15T10:05:00Z',
  },
  {
    id: '3',
    type_id: 'chapter',
    name: { en: 'Algebra', hi: 'बीजगणित' },
    parent_id: '1',
    state_id: 'default',
    metadata: { unit: 1, duration: '20 hours', difficulty: 'medium' },
    is_active: true,
    created_by: 'admin',
    created_at: '2024-01-15T10:10:00Z',
    updated_at: '2024-01-15T10:10:00Z',
  },
  {
    id: '4',
    type_id: 'topic',
    name: { en: 'Linear Equations', hi: 'रैखिक समीकरण' },
    parent_id: '3',
    state_id: 'default',
    metadata: { subtopics: 3, exercises: 15 },
    is_active: true,
    created_by: 'admin',
    created_at: '2024-01-15T10:15:00Z',
    updated_at: '2024-01-15T10:15:00Z',
  },
  {
    id: '5',
    type_id: 'learning_outcome',
    name: { en: 'Solve linear equations in one variable', hi: 'एक चर में रैखिक समीकरण हल करना' },
    parent_id: '4',
    state_id: 'default',
    metadata: { bloom_level: 3, assessment_type: 'formative' },
    is_active: true,
    created_by: 'admin',
    created_at: '2024-01-15T10:20:00Z',
    updated_at: '2024-01-15T10:20:00Z',
  }
];

const DataView = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedState, setSelectedState] = useState('default');
  const [selectedType, setSelectedType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<any>(null);

  const { data: masterDataTypes } = useMasterDataTypes();
  const { data: realEntries } = useMasterDataEntries(selectedState, selectedType === 'all' ? undefined : selectedType);
  
  // Use mock data for demonstration, fall back to real data when available
  const entries = realEntries?.length ? realEntries : mockEntries;

  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      const matchesSearch = searchQuery === '' || 
        Object.values(entry.name).some(name => 
          name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      
      const matchesType = selectedType === 'all' || entry.type_id === selectedType;
      
      return matchesSearch && matchesType;
    });
  }, [entries, searchQuery, selectedType]);

  const getTypeName = (typeId: string) => {
    const type = masterDataTypes?.find(t => t.name === typeId);
    return type?.display_name || typeId;
  };

  const getParentName = (parentId: string | null) => {
    if (!parentId) return null;
    const parent = entries.find(e => e.id === parentId);
    if (!parent) return null;
    return typeof parent.name === 'object' && parent.name && 'en' in parent.name 
      ? parent.name.en 
      : String(parent.name);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/master-data')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Data View</h2>
            <p className="text-muted-foreground">Browse and manage master data entries</p>
          </div>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Entry
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingEntry ? 'Edit Entry' : 'Add New Entry'}</DialogTitle>
              <DialogDescription>
                {editingEntry ? 'Update the master data entry details.' : 'Create a new master data entry.'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {masterDataTypes?.map(type => (
                      <SelectItem key={type.id} value={type.name}>
                        {type.display_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Name (English)</Label>
                <Input placeholder="Enter English name" />
              </div>
              <div className="space-y-2">
                <Label>Name (Hindi)</Label>
                <Input placeholder="Enter Hindi name" />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  toast({
                    title: "Demo Mode",
                    description: "This is a demonstration. In the live system, this would save the entry.",
                  });
                  setIsDialogOpen(false);
                }}>
                  Save
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>State</Label>
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default State</SelectItem>
                  <SelectItem value="maharashtra">Maharashtra</SelectItem>
                  <SelectItem value="karnataka">Karnataka</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="subject">Subject</SelectItem>
                  <SelectItem value="grade">Grade</SelectItem>
                  <SelectItem value="chapter">Chapter</SelectItem>
                  <SelectItem value="topic">Topic</SelectItem>
                  <SelectItem value="learning_outcome">Learning Outcome</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search entries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Eye className="h-5 w-5 mr-2" />
              Master Data Entries
            </div>
            <Badge variant="secondary">
              {filteredEntries.length} entries
            </Badge>
          </CardTitle>
          <CardDescription>
            {realEntries?.length ? 'Live data from database' : 'Showing mock data for demonstration'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Parent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <Badge variant="outline">
                        {getTypeName(entry.type_id)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">
                          {typeof entry.name === 'object' && entry.name && 'en' in entry.name 
                            ? String(entry.name.en)
                            : String(entry.name)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {typeof entry.name === 'object' && entry.name && 'hi' in entry.name 
                            ? String(entry.name.hi)
                            : ''}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {String(getParentName(entry.parent_id) || '-')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={entry.is_active ? "default" : "secondary"}>
                        {entry.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatDate(entry.created_at)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingEntry(entry);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            toast({
                              title: "Demo Mode",
                              description: "This is a demonstration. In the live system, this would delete the entry.",
                            });
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredEntries.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No entries found matching your filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataView;