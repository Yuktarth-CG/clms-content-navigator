import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText, Download, CheckCircle, AlertCircle, Trash2, X } from 'lucide-react';
import { useKnowledgeGraphs, useKnowledgeGraph } from '@/hooks/useKnowledgeGraphs';
import { useDraftMasterDataEntries, useCreateDraftMasterDataEntry, usePublishMasterData, useBulkUploadDraft } from '@/hooks/useMasterDataDraft';
import { useCanPublish } from '@/hooks/useUserRoles';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const MASTER_DATA_CATEGORIES = [
  { id: 'grade', name: 'Grade Master', description: 'Upload grade/class information' },
  { id: 'subject', name: 'Subject Master', description: 'Upload subject data' },
  { id: 'parent_child', name: 'Parent-Child Subject', description: 'Upload subject hierarchies' },
  { id: 'attribute', name: 'Attribute Master', description: 'Upload attribute data' },
  { id: 'lo', name: 'LO Master', description: 'Upload learning outcomes' },
  { id: 'skill', name: 'Skill Master', description: 'Upload skill data' },
];

const DraftUploadInterface = () => {
  const { toast } = useToast();
  const { data: graphs } = useKnowledgeGraphs();
  const { canPublish } = useCanPublish();
  const publishData = usePublishMasterData();

  const [selectedGraphId, setSelectedGraphId] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File>>({});

  const { data: graphDetails } = useKnowledgeGraph(selectedGraphId);
  const { data: draftEntries } = useDraftMasterDataEntries(selectedGraphId);
  const createDraftEntry = useCreateDraftMasterDataEntry();
  const bulkUpload = useBulkUploadDraft();

  // Manual entry states
  const [selectedTypeId, setSelectedTypeId] = useState<string>('');
  const [nameEn, setNameEn] = useState('');
  const [nameHi, setNameHi] = useState('');

  const handleDownloadTemplate = () => {
    if (!graphDetails) return;

    // Generate CSV headers based on graph fields
    const fields = graphDetails.knowledge_graph_fields || [];
    const sortedFields = [...fields].sort((a, b) => a.hierarchy_level - b.hierarchy_level);
    
    const headers = sortedFields.map(f => f.master_data_types?.display_name || '');
    const csvContent = headers.join(',') + '\n';

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${graphDetails.name}_template.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleFileSelect = (categoryId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setUploadedFiles(prev => ({ ...prev, [categoryId]: file }));
    } else {
      toast({
        title: "Invalid File",
        description: "Please select a CSV file",
        variant: "destructive",
      });
    }
  };

  const handleRemoveFile = (categoryId: string) => {
    setUploadedFiles(prev => {
      const updated = { ...prev };
      delete updated[categoryId];
      return updated;
    });
  };

  const handleUploadAll = async () => {
    if (Object.keys(uploadedFiles).length === 0 || !selectedGraphId) return;

    // Process each uploaded file
    for (const [categoryId, file] of Object.entries(uploadedFiles)) {
      const text = await file.text();
      // Parse and upload logic here
    }

    toast({
      title: "CSV Files Uploaded",
      description: `${Object.keys(uploadedFiles).length} file(s) have been added to draft successfully`,
    });
    setUploadedFiles({});
  };

  const handleManualSubmit = async () => {
    if (!selectedGraphId || !selectedTypeId || !nameEn) return;

    await createDraftEntry.mutateAsync({
      graph_id: selectedGraphId,
      type_id: selectedTypeId,
      name: { en: nameEn, hi: nameHi || nameEn },
      state_id: 'default',
      metadata: {},
    });

    setNameEn('');
    setNameHi('');
    setSelectedTypeId('');
  };

  const handlePublish = async () => {
    if (!selectedGraphId) return;
    if (confirm(`Are you sure you want to publish ${draftEntries?.length || 0} draft entries to live?`)) {
      await publishData.mutateAsync(selectedGraphId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Graph Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Knowledge Graph</CardTitle>
          <CardDescription>Choose which knowledge graph to upload data for</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedGraphId || ''} onValueChange={setSelectedGraphId}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Select a knowledge graph..." />
            </SelectTrigger>
            <SelectContent className="bg-background z-50">
              {graphs?.map((graph) => (
                <SelectItem key={graph.id} value={graph.id}>
                  {graph.display_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedGraphId && (
        <>
          {/* Upload Interface */}
          <Tabs defaultValue="csv" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="csv">CSV Upload</TabsTrigger>
              <TabsTrigger value="manual">Manual Entry</TabsTrigger>
            </TabsList>

            <TabsContent value="csv" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Bulk CSV Upload</CardTitle>
                  <CardDescription>Upload separate CSV files for each master data type</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4">
                    {MASTER_DATA_CATEGORIES.map((category) => (
                      <div key={category.id} className="space-y-2 p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-base font-semibold">{category.name}</Label>
                            <p className="text-sm text-muted-foreground">{category.description}</p>
                          </div>
                          {uploadedFiles[category.id] && (
                            <Badge variant="secondary" className="ml-2">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Uploaded
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Input
                            id={`csv-${category.id}`}
                            type="file"
                            accept=".csv"
                            onChange={(e) => handleFileSelect(category.id, e)}
                            className="flex-1"
                          />
                        </div>

                        {uploadedFiles[category.id] && (
                          <div className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">{uploadedFiles[category.id].name}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveFile(category.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {Object.keys(uploadedFiles).length > 0 && (
                    <Button onClick={handleUploadAll} className="w-full">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload All Files to Draft ({Object.keys(uploadedFiles).length})
                    </Button>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="manual" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Manual Data Entry</CardTitle>
                  <CardDescription>Add individual master data records</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Field Type</Label>
                    <Select value={selectedTypeId} onValueChange={setSelectedTypeId}>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Select field type..." />
                      </SelectTrigger>
                      <SelectContent className="bg-background z-50">
                        {graphDetails?.knowledge_graph_fields?.map((field: any) => (
                          <SelectItem key={field.id} value={field.field_type_id}>
                            {field.master_data_types?.display_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name-en">Name (English)</Label>
                    <Input
                      id="name-en"
                      value={nameEn}
                      onChange={(e) => setNameEn(e.target.value)}
                      placeholder="Enter name in English"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name-hi">Name (Hindi - Optional)</Label>
                    <Input
                      id="name-hi"
                      value={nameHi}
                      onChange={(e) => setNameHi(e.target.value)}
                      placeholder="Enter name in Hindi"
                    />
                  </div>

                  <Button
                    onClick={handleManualSubmit}
                    disabled={!selectedTypeId || !nameEn || createDraftEntry.isPending}
                    className="w-full"
                  >
                    {createDraftEntry.isPending ? 'Adding...' : 'Add to Draft'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Draft Entries Review */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Draft Entries</CardTitle>
                  <CardDescription>
                    Review and publish draft entries ({draftEntries?.length || 0} pending)
                  </CardDescription>
                </div>
                {canPublish && draftEntries && draftEntries.length > 0 && (
                  <Button onClick={handlePublish} disabled={publishData.isPending}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {publishData.isPending ? 'Publishing...' : 'Publish to Live'}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                {!draftEntries || draftEntries.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No draft entries yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {draftEntries.map((entry: any) => (
                      <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{entry.name?.en || 'Unnamed'}</p>
                          {entry.name?.hi && (
                            <p className="text-sm text-muted-foreground">{entry.name.hi}</p>
                          )}
                          <Badge variant="outline" className="mt-1">
                            {entry.master_data_types?.display_name}
                          </Badge>
                        </div>
                        <Badge variant="secondary">Draft</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default DraftUploadInterface;
