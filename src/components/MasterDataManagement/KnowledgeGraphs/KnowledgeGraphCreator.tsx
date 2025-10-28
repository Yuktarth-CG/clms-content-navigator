import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Trash2, MoveUp, MoveDown, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMasterDataTypes } from '@/hooks/useMasterData';
import { useCreateKnowledgeGraph } from '@/hooks/useKnowledgeGraphs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Mandatory fields that should be pre-selected and locked
const MANDATORY_FIELDS = [
  'Subject',
  'Learning Outcome',
  'Skill',
  'Evidence of Misconception',
  'Evidence of Calculation Error'
];

interface CustomField {
  id: string;
  name: string;
  mapped_to_id?: string;
}

const KnowledgeGraphCreator = () => {
  const navigate = useNavigate();
  const { data: masterDataTypes } = useMasterDataTypes();
  const createGraph = useCreateKnowledgeGraph();

  const [graphName, setGraphName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [description, setDescription] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [selectedFields, setSelectedFields] = useState<Array<{
    id: string;
    field_type_id: string;
    hierarchy_level: number;
    is_mandatory: boolean;
    display_order: number;
    is_locked?: boolean;
    is_custom?: boolean;
    custom_name?: string;
  }>>([]);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [showCustomFieldDialog, setShowCustomFieldDialog] = useState(false);
  const [newCustomFieldName, setNewCustomFieldName] = useState('');
  const [customFieldMapping, setCustomFieldMapping] = useState<string>('');

  // Initialize with mandatory fields
  useEffect(() => {
    if (masterDataTypes && selectedFields.length === 0) {
      const mandatoryFieldTypes = masterDataTypes.filter(type =>
        MANDATORY_FIELDS.some(mf => type.display_name === mf || type.name === mf)
      );

      const initialFields = mandatoryFieldTypes.map((type, index) => ({
        id: crypto.randomUUID(),
        field_type_id: type.id,
        hierarchy_level: index,
        is_mandatory: true,
        display_order: index,
        is_locked: true, // Locked so users can't remove them
      }));

      setSelectedFields(initialFields);
    }
  }, [masterDataTypes]);

  const handleAddField = (fieldTypeId: string) => {
    if (selectedFields.find(f => f.field_type_id === fieldTypeId)) return;

    const newField = {
      id: crypto.randomUUID(),
      field_type_id: fieldTypeId,
      hierarchy_level: selectedFields.length,
      is_mandatory: false,
      display_order: selectedFields.length,
      is_locked: false,
    };

    setSelectedFields([...selectedFields, newField]);
  };

  const handleAddCustomField = () => {
    if (!newCustomFieldName.trim()) return;

    const customField: CustomField = {
      id: crypto.randomUUID(),
      name: newCustomFieldName.trim(),
      mapped_to_id: customFieldMapping || undefined,
    };

    setCustomFields([...customFields, customField]);

    // Add to selected fields
    const newField = {
      id: crypto.randomUUID(),
      field_type_id: customFieldMapping || '', // Will use custom handling if no mapping
      hierarchy_level: selectedFields.length,
      is_mandatory: false,
      display_order: selectedFields.length,
      is_locked: false,
      is_custom: true,
      custom_name: newCustomFieldName.trim(),
    };

    setSelectedFields([...selectedFields, newField]);

    // Reset dialog
    setNewCustomFieldName('');
    setCustomFieldMapping('');
    setShowCustomFieldDialog(false);
  };

  const handleRemoveField = (id: string) => {
    const field = selectedFields.find(f => f.id === id);
    if (field?.is_locked) return; // Can't remove locked mandatory fields

    setSelectedFields(selectedFields.filter(f => f.id !== id));

    // Remove from custom fields if it's a custom field
    if (field?.is_custom && field?.custom_name) {
      setCustomFields(customFields.filter(cf => cf.name !== field.custom_name));
    }
  };

  const handleToggleMandatory = (id: string) => {
    const field = selectedFields.find(f => f.id === id);
    if (field?.is_locked) return; // Can't toggle locked mandatory fields

    setSelectedFields(selectedFields.map(f =>
      f.id === id ? { ...f, is_mandatory: !f.is_mandatory } : f
    ));
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    
    // Don't allow moving above locked fields
    const lockedCount = selectedFields.filter(f => f.is_locked).length;
    if (index <= lockedCount) return;

    const newFields = [...selectedFields];
    [newFields[index - 1], newFields[index]] = [newFields[index], newFields[index - 1]];
    // Update hierarchy levels
    newFields.forEach((f, i) => {
      f.hierarchy_level = i;
      f.display_order = i;
    });
    setSelectedFields(newFields);
  };

  const handleMoveDown = (index: number) => {
    if (index === selectedFields.length - 1) return;
    
    // Don't allow moving locked fields
    const field = selectedFields[index];
    if (field.is_locked) return;

    const newFields = [...selectedFields];
    [newFields[index], newFields[index + 1]] = [newFields[index + 1], newFields[index]];
    // Update hierarchy levels
    newFields.forEach((f, i) => {
      f.hierarchy_level = i;
      f.display_order = i;
    });
    setSelectedFields(newFields);
  };

  const handleSubmit = async () => {
    if (!graphName || !displayName || selectedFields.length === 0) {
      return;
    }

    await createGraph.mutateAsync({
      name: graphName,
      display_name: displayName,
      description,
      state_id: 'default',
      is_default: isDefault,
      fields: selectedFields.map(({ id, is_locked, is_custom, custom_name, ...field }) => field),
    });

    navigate('/master-data/knowledge-graphs');
  };

  const availableFields = masterDataTypes?.filter(
    type => !selectedFields.find(f => f.field_type_id === type.id && !f.is_custom)
  );

  const getFieldDisplayName = (field: typeof selectedFields[0]) => {
    if (field.is_custom && field.custom_name) {
      const mappedType = masterDataTypes?.find(t => t.id === field.field_type_id);
      return (
        <div className="flex items-center gap-2">
          <span className="font-medium">{field.custom_name}</span>
          {mappedType && (
            <span className="text-xs text-muted-foreground">
              (mapped to {mappedType.display_name})
            </span>
          )}
        </div>
      );
    }
    const fieldType = masterDataTypes?.find(t => t.id === field.field_type_id);
    return <span className="font-medium">{fieldType?.display_name}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/master-data/knowledge-graphs')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h2 className="text-2xl font-bold">Create Knowledge Graph</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Graph Details */}
        <Card>
          <CardHeader>
            <CardTitle>Graph Details</CardTitle>
            <CardDescription>Basic information about this knowledge graph</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="graph-name">Graph Name (ID)</Label>
              <Input
                id="graph-name"
                placeholder="e.g., k8_math_2025"
                value={graphName}
                onChange={(e) => setGraphName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="display-name">Display Name</Label>
              <Input
                id="display-name"
                placeholder="e.g., K-8 Mathematics 2025"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe this knowledge graph..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is-default"
                checked={isDefault}
                onCheckedChange={(checked) => setIsDefault(checked as boolean)}
              />
              <Label htmlFor="is-default">Set as default graph</Label>
            </div>
          </CardContent>
        </Card>

        {/* Right: Field Hierarchy */}
        <Card>
          <CardHeader>
            <CardTitle>Field Hierarchy</CardTitle>
            <CardDescription>
              Mandatory fields are pre-selected. Add more fields or create custom fields.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add Field Selector */}
            <div className="flex gap-2">
              <div className="flex-1 space-y-2">
                <Label>Add Existing Field</Label>
                <Select onValueChange={handleAddField}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select a field to add..." />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    {availableFields?.map((field) => (
                      <SelectItem key={field.id} value={field.id}>
                        {field.display_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => setShowCustomFieldDialog(true)}
                  className="whitespace-nowrap"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Custom Field
                </Button>
              </div>
            </div>

            {/* Selected Fields List */}
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {selectedFields.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No fields added yet</p>
                  <p className="text-sm mt-1">Select fields to build your hierarchy</p>
                </div>
              ) : (
                selectedFields.map((field, index) => (
                  <div
                    key={field.id}
                    className={`flex items-center gap-2 p-3 border rounded-lg ${
                      field.is_locked ? 'bg-muted/50' : 'bg-muted/30'
                    }`}
                  >
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0 || field.is_locked}
                        className="h-6 w-6 p-0"
                      >
                        <MoveUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMoveDown(index)}
                        disabled={index === selectedFields.length - 1 || field.is_locked}
                        className="h-6 w-6 p-0"
                      >
                        <MoveDown className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{index + 1}</Badge>
                        {getFieldDisplayName(field)}
                        {field.is_locked && (
                          <Lock className="h-3 w-3 text-muted-foreground" />
                        )}
                        {field.is_custom && (
                          <Badge variant="secondary" className="text-xs">Custom</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Checkbox
                          checked={field.is_mandatory}
                          onCheckedChange={() => handleToggleMandatory(field.id)}
                          id={`mandatory-${field.id}`}
                          disabled={field.is_locked}
                        />
                        <Label
                          htmlFor={`mandatory-${field.id}`}
                          className={`text-sm ${field.is_locked ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
                        >
                          Mandatory
                        </Label>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveField(field.id)}
                      disabled={field.is_locked}
                    >
                      <Trash2 className={`h-4 w-4 ${field.is_locked ? 'text-muted-foreground' : 'text-destructive'}`} />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={() => navigate('/master-data/knowledge-graphs')}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!graphName || !displayName || selectedFields.length === 0 || createGraph.isPending}
        >
          {createGraph.isPending ? 'Creating...' : 'Create Knowledge Graph'}
        </Button>
      </div>

      {/* Custom Field Dialog */}
      <Dialog open={showCustomFieldDialog} onOpenChange={setShowCustomFieldDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Custom Field</DialogTitle>
            <DialogDescription>
              Create a custom field and optionally map it to an existing CLMS field type.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="custom-field-name">Custom Field Name</Label>
              <Input
                id="custom-field-name"
                placeholder="e.g., Custom Assessment Type"
                value={newCustomFieldName}
                onChange={(e) => setNewCustomFieldName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="custom-field-mapping">Map to Existing CLMS Field (Optional)</Label>
              <Select value={customFieldMapping} onValueChange={setCustomFieldMapping}>
                <SelectTrigger id="custom-field-mapping" className="bg-background">
                  <SelectValue placeholder="Select a field to map to..." />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  {masterDataTypes?.map((field) => (
                    <SelectItem key={field.id} value={field.id}>
                      {field.display_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Mapping allows the custom field to inherit properties and validation from an existing field type.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCustomFieldDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCustomField} disabled={!newCustomFieldName.trim()}>
              Add Custom Field
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default KnowledgeGraphCreator;
