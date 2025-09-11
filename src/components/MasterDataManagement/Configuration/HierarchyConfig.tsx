import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Settings, Save, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useMasterDataTypes, useStateFieldConfig, useUpdateStateFieldConfig } from '@/hooks/useMasterData';
import { useToast } from '@/hooks/use-toast';

const HierarchyConfig = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedState, setSelectedState] = useState('default');
  
  const { data: masterDataTypes, isLoading: typesLoading } = useMasterDataTypes();
  const { data: stateConfig, isLoading: configLoading } = useStateFieldConfig(selectedState);
  const updateConfig = useUpdateStateFieldConfig();

  const [localConfig, setLocalConfig] = useState<Record<string, { is_active: boolean; is_required: boolean }>>({});

  React.useEffect(() => {
    if (stateConfig && masterDataTypes) {
      const configMap: Record<string, { is_active: boolean; is_required: boolean }> = {};
      
      masterDataTypes.forEach(type => {
        const existingConfig = stateConfig.find(config => config.field_type_id === type.id);
        configMap[type.id] = {
          is_active: existingConfig?.is_active ?? type.is_mandatory,
          is_required: existingConfig?.is_required ?? type.is_mandatory
        };
      });
      
      setLocalConfig(configMap);
    }
  }, [stateConfig, masterDataTypes]);

  const handleSaveConfiguration = async () => {
    if (!masterDataTypes) return;

    const configsToSave = masterDataTypes.map(type => {
      const config = localConfig[type.id] || { is_active: false, is_required: false };
      const existingConfig = stateConfig?.find(c => c.field_type_id === type.id);
      
      return {
        id: existingConfig?.id,
        state_id: selectedState,
        field_type_id: type.id,
        is_active: config.is_active,
        is_required: config.is_required
      };
    });

    try {
      await updateConfig.mutateAsync(configsToSave);
      toast({
        title: "Configuration Saved",
        description: "Field configuration has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save configuration. Please try again.",
        variant: "destructive",
      });
    }
  };

  const updateFieldConfig = (typeId: string, field: 'is_active' | 'is_required', value: boolean) => {
    setLocalConfig(prev => ({
      ...prev,
      [typeId]: {
        ...prev[typeId],
        [field]: value
      }
    }));
  };

  const getHierarchyLevel = (type: any): number => {
    if (!type.parent_type_id) return 0;
    const parent = masterDataTypes?.find(t => t.id === type.parent_type_id);
    return parent ? getHierarchyLevel(parent) + 1 : 0;
  };

  const sortedTypes = masterDataTypes?.sort((a, b) => {
    const levelA = getHierarchyLevel(a);
    const levelB = getHierarchyLevel(b);
    if (levelA !== levelB) return levelA - levelB;
    return a.display_order - b.display_order;
  });

  if (typesLoading || configLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/master-data')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Hierarchy Configuration</h2>
            <p className="text-muted-foreground">Loading configuration...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/master-data')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Hierarchy Configuration</h2>
            <p className="text-muted-foreground">Configure your state's curriculum hierarchy</p>
          </div>
        </div>
        <Button onClick={handleSaveConfiguration} disabled={updateConfig.isPending}>
          <Save className="h-4 w-4 mr-2" />
          {updateConfig.isPending ? 'Saving...' : 'Save Configuration'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* State Selection */}
        <Card>
          <CardHeader>
            <CardTitle>State Selection</CardTitle>
            <CardDescription>
              Select the state to configure field requirements for.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="state-select">State</Label>
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger>
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
            </div>
          </CardContent>
        </Card>

        {/* Field Configuration */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Field Configuration
            </CardTitle>
            <CardDescription>
              Configure which fields are active and required for the selected state.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-6">
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Active:</strong> Field will be available for data entry. 
                <strong className="ml-4">Required:</strong> Field must be filled when creating entries.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              {sortedTypes?.map((type) => {
                const level = getHierarchyLevel(type);
                const config = localConfig[type.id] || { is_active: false, is_required: false };
                
                return (
                  <div key={type.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div style={{ marginLeft: `${level * 20}px` }} className="flex items-center space-x-2">
                          <h4 className="font-medium">{type.display_name}</h4>
                          {type.is_mandatory && (
                            <Badge variant="secondary">System Required</Badge>
                          )}
                          {type.is_hierarchical && (
                            <Badge variant="outline">Hierarchical</Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Order: {type.display_order}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`active-${type.id}`}
                          checked={config.is_active}
                          onCheckedChange={(checked) => updateFieldConfig(type.id, 'is_active', checked)}
                          disabled={type.is_mandatory}
                        />
                        <Label htmlFor={`active-${type.id}`}>Active</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`required-${type.id}`}
                          checked={config.is_required}
                          onCheckedChange={(checked) => updateFieldConfig(type.id, 'is_required', checked)}
                          disabled={!config.is_active || type.is_mandatory}
                        />
                        <Label htmlFor={`required-${type.id}`}>Required</Label>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HierarchyConfig;