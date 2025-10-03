import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Info, Plus, Trash2, Link2, CheckCircle2 } from 'lucide-react';
import { useMasterDataTypes, useMasterDataEntries, useCreateMasterDataEntry, useDeleteMasterDataEntry } from '@/hooks/useMasterData';
import { useToast } from '@/hooks/use-toast';

const MasterDataDashboard = () => {
  const { toast } = useToast();
  const [selectedState, setSelectedState] = useState('default');
  const [selectedCLMSTag, setSelectedCLMSTag] = useState<string | null>(null);
  const [newTagName, setNewTagName] = useState('');
  const [newTagNameHindi, setNewTagNameHindi] = useState('');

  const { data: clmsTags } = useMasterDataTypes();
  const { data: userTags } = useMasterDataEntries(selectedState, selectedCLMSTag || undefined);
  const createTag = useCreateMasterDataEntry();
  const deleteTag = useDeleteMasterDataEntry();

  const handleAddTag = async () => {
    if (!newTagName || !selectedCLMSTag) {
      toast({
        title: "Missing Information",
        description: "Please select a CLMS tag and enter a tag name.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Get current user ID from Supabase auth
      const { data: { user } } = await import('@/integrations/supabase/client').then(m => m.supabase.auth.getUser());
      
      if (!user) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to add tags.",
          variant: "destructive",
        });
        return;
      }

      await createTag.mutateAsync({
        state_id: selectedState,
        type_id: selectedCLMSTag,
        name: {
          en: newTagName,
          hi: newTagNameHindi || newTagName,
        },
        metadata: {},
        created_by: user.id,
      });

      toast({
        title: "Tag Added",
        description: "Your tag has been added successfully.",
      });

      setNewTagName('');
      setNewTagNameHindi('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add tag. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    try {
      await deleteTag.mutateAsync(tagId);
      toast({
        title: "Tag Deleted",
        description: "Tag has been removed successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete tag.",
        variant: "destructive",
      });
    }
  };

  const selectedCLMSTagData = clmsTags?.find(tag => tag.id === selectedCLMSTag);

  return (
    <div className="space-y-4">
      {/* State Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Your State</CardTitle>
          <CardDescription>Choose which state's curriculum you're working with</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedState} onValueChange={setSelectedState}>
            <SelectTrigger className="w-full max-w-xs">
              <SelectValue placeholder="Select a state" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default State</SelectItem>
              <SelectItem value="maharashtra">Maharashtra</SelectItem>
              <SelectItem value="karnataka">Karnataka</SelectItem>
              <SelectItem value="tamil_nadu">Tamil Nadu</SelectItem>
              <SelectItem value="gujarat">Gujarat</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Main Mapping Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Side: CLMS Tags */}
        <Card className="h-[600px] flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              CLMS Tags
            </CardTitle>
            <CardDescription>
              Standard curriculum tags - hover to see descriptions
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            <ScrollArea className="h-full pr-4">
              <div className="space-y-2">
                {clmsTags?.map((tag) => (
                  <TooltipProvider key={tag.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={selectedCLMSTag === tag.id ? "default" : "outline"}
                          className="w-full justify-between h-auto py-3"
                          onClick={() => setSelectedCLMSTag(tag.id)}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{tag.display_name}</span>
                            {tag.is_mandatory && (
                              <Badge variant="secondary" className="text-xs">Required</Badge>
                            )}
                          </div>
                          {selectedCLMSTag === tag.id && (
                            <CheckCircle2 className="h-4 w-4" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        <p className="font-semibold">{tag.display_name}</p>
                        <p className="text-sm mt-1">
                          {tag.is_hierarchical 
                            ? "This is a hierarchical field that can have parent-child relationships." 
                            : "This is a standalone field."}
                        </p>
                        {tag.is_mandatory && (
                          <p className="text-sm mt-1 text-amber-500">This field is required for all entries.</p>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Right Side: Your Tags */}
        <Card className="h-[600px] flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-primary" />
              Your Tags
            </CardTitle>
            <CardDescription>
              {selectedCLMSTagData 
                ? `Add your own ${selectedCLMSTagData.display_name.toLowerCase()} tags`
                : "Select a CLMS tag to add your own tags"}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-4">
            {/* Add New Tag Form */}
            {selectedCLMSTag && (
              <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
                <div className="space-y-2">
                  <Label htmlFor="tag-name">Tag Name (English)</Label>
                  <Input
                    id="tag-name"
                    placeholder="e.g., Maharashtra State Board"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tag-name-hindi">Tag Name (Hindi - Optional)</Label>
                  <Input
                    id="tag-name-hindi"
                    placeholder="e.g., महाराष्ट्र राज्य मंडळ"
                    value={newTagNameHindi}
                    onChange={(e) => setNewTagNameHindi(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={handleAddTag} 
                  disabled={createTag.isPending}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {createTag.isPending ? 'Adding...' : 'Add Tag'}
                </Button>
              </div>
            )}

            {/* List of User Tags */}
            <ScrollArea className="flex-1">
              <div className="space-y-2">
                {!selectedCLMSTag ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Info className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Select a CLMS tag from the left to view and add your tags</p>
                  </div>
                ) : userTags && userTags.length > 0 ? (
                  userTags.map((tag) => (
                    <div
                      key={tag.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div>
                        <p className="font-medium">{(tag.name as any)?.en || 'Unnamed'}</p>
                        {(tag.name as any)?.hi && (
                          <p className="text-sm text-muted-foreground">{(tag.name as any).hi}</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTag(tag.id)}
                        disabled={deleteTag.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No tags added yet for {selectedCLMSTagData?.display_name}</p>
                    <p className="text-sm mt-1">Use the form above to add your first tag</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MasterDataDashboard;