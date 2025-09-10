import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, Plus } from 'lucide-react';
import { useMasterDataTypes, useCreateMasterDataEntry, useMasterDataEntries } from '@/hooks/useMasterData';
import { useToast } from '@/hooks/use-toast';

const ManualEntry = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: masterDataTypes } = useMasterDataTypes();
  const createEntry = useCreateMasterDataEntry();

  const [selectedType, setSelectedType] = useState('');
  const [parentId, setParentId] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [nameHi, setNameHi] = useState('');
  const [description, setDescription] = useState('');

  // Get parent entries if selected type is hierarchical
  const selectedTypeData = masterDataTypes?.find(type => type.id === selectedType);
  const { data: parentEntries } = useMasterDataEntries(
    'default', 
    selectedTypeData?.parent_type_id || undefined
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedType || !nameEn) {
      toast({
        title: "Validation Error",
        description: "Please select a type and provide an English name.",
        variant: "destructive",
      });
      return;
    }

    const entryData = {
      type_id: selectedType,
      name: {
        en: nameEn,
        ...(nameHi && { hi: nameHi })
      },
      parent_id: parentId || null,
      state_id: 'default', // Demo state
      metadata: {
        description: description || undefined
      },
      created_by: 'demo-user', // In real app, get from auth
    };

    try {
      await createEntry.mutateAsync(entryData);
      
      // Reset form
      setSelectedType('');
      setParentId('');
      setNameEn('');
      setNameHi('');
      setDescription('');
      
      toast({
        title: "Success",
        description: "Master data entry created successfully!",
      });
    } catch (error) {
      console.error('Failed to create entry:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/master-data')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Manual Entry</h2>
          <p className="text-muted-foreground">Add individual master data records manually</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            Create New Master Data Entry
          </CardTitle>
          <CardDescription>
            Fill in the details below to create a new master data record. Required fields are marked with *.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Data Type Selection */}
            <div className="space-y-2">
              <Label htmlFor="type">Data Type *</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a data type" />
                </SelectTrigger>
                <SelectContent>
                  {masterDataTypes?.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.display_name}
                      {type.is_mandatory && ' (Mandatory)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Parent Selection (if hierarchical) */}
            {selectedTypeData?.is_hierarchical && selectedTypeData.parent_type_id && (
              <div className="space-y-2">
                <Label htmlFor="parent">
                  Parent {masterDataTypes?.find(t => t.id === selectedTypeData.parent_type_id)?.display_name} *
                </Label>
                <Select value={parentId} onValueChange={setParentId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a parent entry" />
                  </SelectTrigger>
                  <SelectContent>
                    {parentEntries?.map((entry) => (
                      <SelectItem key={entry.id} value={entry.id}>
                        {typeof entry.name === 'object' && entry.name && 'en' in entry.name 
                          ? (entry.name as any).en 
                          : String(entry.name)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nameEn">Name (English) *</Label>
                <Input
                  id="nameEn"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  placeholder="Enter name in English"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nameHi">Name (Hindi)</Label>
                <Input
                  id="nameHi"
                  value={nameHi}
                  onChange={(e) => setNameHi(e.target.value)}
                  placeholder="हिंदी में नाम दर्ज करें"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description for this entry"
                rows={3}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setSelectedType('');
                  setParentId('');
                  setNameEn('');
                  setNameHi('');
                  setDescription('');
                }}
              >
                Clear Form
              </Button>
              <Button 
                type="submit" 
                disabled={createEntry.isPending || !selectedType || !nameEn}
              >
                <Save className="h-4 w-4 mr-2" />
                {createEntry.isPending ? 'Creating...' : 'Create Entry'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManualEntry;