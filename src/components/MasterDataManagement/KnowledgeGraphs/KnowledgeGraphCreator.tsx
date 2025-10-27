import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Trash2, MoveUp, MoveDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMasterDataTypes } from '@/hooks/useMasterData';
import { useCreateKnowledgeGraph } from '@/hooks/useKnowledgeGraphs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

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
  }>>([]);

  const handleAddField = (fieldTypeId: string) => {
    if (selectedFields.find(f => f.field_type_id === fieldTypeId)) return;

    const newField = {
      id: crypto.randomUUID(),
      field_type_id: fieldTypeId,
      hierarchy_level: selectedFields.length,
      is_mandatory: false,
      display_order: selectedFields.length,
    };

    setSelectedFields([...selectedFields, newField]);
  };

  const handleRemoveField = (id: string) => {
    setSelectedFields(selectedFields.filter(f => f.id !== id));
  };

  const handleToggleMandatory = (id: string) => {
    setSelectedFields(selectedFields.map(f =>
      f.id === id ? { ...f, is_mandatory: !f.is_mandatory } : f
    ));
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
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
      fields: selectedFields.map(({ id, ...field }) => field),
    });

    navigate('/master-data/knowledge-graphs');
  };

  const availableFields = masterDataTypes?.filter(
    type => !selectedFields.find(f => f.field_type_id === type.id)
  );

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
            <CardDescription>Define the fields and their order for this graph</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add Field Selector */}
            <div className="space-y-2">
              <Label>Add Field</Label>
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

            {/* Selected Fields List */}
            <div className="space-y-2">
              {selectedFields.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No fields added yet</p>
                  <p className="text-sm mt-1">Select fields to build your hierarchy</p>
                </div>
              ) : (
                selectedFields.map((field, index) => {
                  const fieldType = masterDataTypes?.find(t => t.id === field.field_type_id);
                  return (
                    <div
                      key={field.id}
                      className="flex items-center gap-2 p-3 border rounded-lg bg-muted/30"
                    >
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMoveUp(index)}
                          disabled={index === 0}
                          className="h-6 w-6 p-0"
                        >
                          <MoveUp className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMoveDown(index)}
                          disabled={index === selectedFields.length - 1}
                          className="h-6 w-6 p-0"
                        >
                          <MoveDown className="h-3 w-3" />
                        </Button>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{index + 1}</Badge>
                          <span className="font-medium">{fieldType?.display_name}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Checkbox
                            checked={field.is_mandatory}
                            onCheckedChange={() => handleToggleMandatory(field.id)}
                            id={`mandatory-${field.id}`}
                          />
                          <Label htmlFor={`mandatory-${field.id}`} className="text-sm cursor-pointer">
                            Mandatory
                          </Label>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveField(field.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  );
                })
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
    </div>
  );
};

export default KnowledgeGraphCreator;
