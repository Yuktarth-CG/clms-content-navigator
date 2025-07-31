import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Upload, 
  Eye, 
  AlertTriangle, 
  CheckCircle,
  Palette,
  ImageIcon,
  FileUp,
  Save,
  X
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/contexts/UserContext';

interface Theme {
  id: string;
  state_name: string;
  logo_url?: string;
  background_url?: string;
  primary_color: string;
  secondary_color: string;
  button_color: string;
  created_at: string;
  updated_at: string;
}

interface ColorValidation {
  isValid: boolean;
  contrast: number;
  wcagLevel: 'AAA' | 'AA' | 'A' | 'FAIL';
}

const BrandingManagement = () => {
  const { user } = useUser();
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTheme, setEditingTheme] = useState<Theme | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    state_name: '',
    logo_url: '',
    background_url: '',
    primary_color: '#3b82f6',
    secondary_color: '#64748b',
    button_color: '#059669'
  });
  const [colorValidation, setColorValidation] = useState<{
    primary: ColorValidation;
    secondary: ColorValidation;
    button: ColorValidation;
  }>({
    primary: { isValid: true, contrast: 4.5, wcagLevel: 'AA' },
    secondary: { isValid: true, contrast: 4.5, wcagLevel: 'AA' },
    button: { isValid: true, contrast: 4.5, wcagLevel: 'AA' }
  });

  // Check if user is Super Admin
  const isSuperAdmin = user?.role === 'SuperAdmin';

  useEffect(() => {
    if (!isSuperAdmin) {
      return;
    }
    fetchThemes();
  }, [isSuperAdmin]);

  const fetchThemes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('themes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching themes:', error);
        toast({
          title: "Error",
          description: "Failed to load themes",
          variant: "destructive",
        });
        return;
      }

      setThemes(data || []);
    } catch (error) {
      console.error('Error fetching themes:', error);
      toast({
        title: "Error",
        description: "Failed to load themes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const validateColor = (color: string): ColorValidation => {
    // Convert hex to RGB
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Calculate contrast with white background
    const contrast = luminance > 0.5 ? (1 + 0.05) / (luminance + 0.05) : (luminance + 0.05) / (1 + 0.05);
    
    let wcagLevel: 'AAA' | 'AA' | 'A' | 'FAIL' = 'FAIL';
    if (contrast >= 7) wcagLevel = 'AAA';
    else if (contrast >= 4.5) wcagLevel = 'AA';
    else if (contrast >= 3) wcagLevel = 'A';
    
    return {
      isValid: contrast >= 3,
      contrast: Math.round(contrast * 100) / 100,
      wcagLevel
    };
  };

  useEffect(() => {
    setColorValidation({
      primary: validateColor(formData.primary_color),
      secondary: validateColor(formData.secondary_color),
      button: validateColor(formData.button_color)
    });
  }, [formData.primary_color, formData.secondary_color, formData.button_color]);

  const handleFileUpload = async (file: File, type: 'logo' | 'background') => {
    const maxSize = type === 'logo' ? 150 * 1024 : 500 * 1024; // 150KB for logo, 500KB for background
    
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: `${type === 'logo' ? 'Logo' : 'Background'} must be under ${maxSize / 1024}KB`,
        variant: "destructive",
      });
      return;
    }

    const allowedTypes = type === 'logo' 
      ? ['image/png', 'image/svg+xml'] 
      : ['image/jpeg', 'image/png'];
    
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: `${type === 'logo' ? 'Logo must be PNG or SVG' : 'Background must be JPG or PNG'}`,
        variant: "destructive",
      });
      return;
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${type}.${fileExt}`;
      const filePath = `${type}s/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('theme-assets')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast({
          title: "Upload failed",
          description: "Failed to upload file",
          variant: "destructive",
        });
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('theme-assets')
        .getPublicUrl(filePath);

      setFormData(prev => ({
        ...prev,
        [type === 'logo' ? 'logo_url' : 'background_url']: publicUrl
      }));

      toast({
        title: "Upload successful",
        description: `${type} uploaded successfully`,
      });
    } catch (error) {
      console.error('File upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload file",
        variant: "destructive",
      });
    }
  };

  const handleCreateTheme = async () => {
    if (!formData.state_name.trim()) {
      toast({
        title: "Validation Error",
        description: "State name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('themes')
        .insert([{
          ...formData,
          created_by: user?.id
        }]);

      if (error) {
        console.error('Error creating theme:', error);
        toast({
          title: "Error",
          description: "Failed to create theme",
          variant: "destructive",
        });
        return;
      }

      // Log audit entry
      await supabase
        .from('theme_audit')
        .insert([{
          theme_id: '', // Will be updated with actual ID in trigger
          user_id: user?.id,
          user_name: user?.name || 'Unknown',
          action: 'Create',
          field_changes: formData
        }]);

      toast({
        title: "Success",
        description: "Theme created successfully",
      });

      setShowCreateForm(false);
      setFormData({
        state_name: '',
        logo_url: '',
        background_url: '',
        primary_color: '#3b82f6',
        secondary_color: '#64748b',
        button_color: '#059669'
      });
      fetchThemes();
    } catch (error) {
      console.error('Error creating theme:', error);
      toast({
        title: "Error",
        description: "Failed to create theme",
        variant: "destructive",
      });
    }
  };

  const handleEditTheme = async () => {
    if (!editingTheme || !formData.state_name.trim()) {
      return;
    }

    try {
      const { error } = await supabase
        .from('themes')
        .update(formData)
        .eq('id', editingTheme.id);

      if (error) {
        console.error('Error updating theme:', error);
        toast({
          title: "Error",
          description: "Failed to update theme",
          variant: "destructive",
        });
        return;
      }

      // Log audit entry
      await supabase
        .from('theme_audit')
        .insert([{
          theme_id: editingTheme.id,
          user_id: user?.id,
          user_name: user?.name || 'Unknown',
          action: 'Edit',
          field_changes: formData
        }]);

      toast({
        title: "Success",
        description: "Theme updated successfully",
      });

      setEditingTheme(null);
      fetchThemes();
    } catch (error) {
      console.error('Error updating theme:', error);
      toast({
        title: "Error",
        description: "Failed to update theme",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTheme = async (theme: Theme) => {
    if (!confirm(`Are you sure you want to delete the theme for ${theme.state_name}?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('themes')
        .delete()
        .eq('id', theme.id);

      if (error) {
        console.error('Error deleting theme:', error);
        toast({
          title: "Error",
          description: "Failed to delete theme",
          variant: "destructive",
        });
        return;
      }

      // Log audit entry
      await supabase
        .from('theme_audit')
        .insert([{
          theme_id: theme.id,
          user_id: user?.id,
          user_name: user?.name || 'Unknown',
          action: 'Delete',
          field_changes: { state_name: theme.state_name }
        }]);

      toast({
        title: "Success",
        description: "Theme deleted successfully",
      });

      fetchThemes();
    } catch (error) {
      console.error('Error deleting theme:', error);
      toast({
        title: "Error",
        description: "Failed to delete theme",
        variant: "destructive",
      });
    }
  };

  const startEdit = (theme: Theme) => {
    setEditingTheme(theme);
    setFormData({
      state_name: theme.state_name,
      logo_url: theme.logo_url || '',
      background_url: theme.background_url || '',
      primary_color: theme.primary_color,
      secondary_color: theme.secondary_color,
      button_color: theme.button_color
    });
  };

  const cancelEdit = () => {
    setEditingTheme(null);
    setShowCreateForm(false);
    setFormData({
      state_name: '',
      logo_url: '',
      background_url: '',
      primary_color: '#3b82f6',
      secondary_color: '#64748b',
      button_color: '#059669'
    });
  };

  if (!isSuperAdmin) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <AlertTriangle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">Access Restricted</h3>
            <p className="text-muted-foreground">Only Super Admins can access the Branding management.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">Loading themes...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Branding Management</h1>
          <p className="text-muted-foreground mt-1">
            Customize state-specific branding with logos, backgrounds, and color schemes
          </p>
        </div>
        
        {!showCreateForm && !editingTheme && (
          <Button onClick={() => setShowCreateForm(true)} className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Add Theme</span>
          </Button>
        )}
      </div>

      {(showCreateForm || editingTheme) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Palette className="w-5 h-5" />
              <span>{editingTheme ? 'Edit Theme' : 'Create New Theme'}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Form Section */}
              <div className="space-y-6">
                <div>
                  <Label htmlFor="state_name">State Name *</Label>
                  <Input
                    id="state_name"
                    value={formData.state_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, state_name: e.target.value }))}
                    placeholder="e.g., Maharashtra, Karnataka"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Logo Upload (PNG/SVG, ≤150KB)</Label>
                  <div className="mt-1 flex items-center space-x-4">
                    <input
                      type="file"
                      accept=".png,.svg"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'logo')}
                      className="hidden"
                      id="logo-upload"
                    />
                    <Label htmlFor="logo-upload" className="cursor-pointer">
                      <div className="flex items-center space-x-2 px-4 py-2 border border-dashed rounded-lg hover:bg-muted/50">
                        <FileUp className="w-4 h-4" />
                        <span>Upload Logo</span>
                      </div>
                    </Label>
                    {formData.logo_url && (
                      <img src={formData.logo_url} alt="Logo preview" className="h-12 w-auto" />
                    )}
                  </div>
                </div>

                <div>
                  <Label>Background Image (JPG/PNG, ≤500KB)</Label>
                  <div className="mt-1 flex items-center space-x-4">
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'background')}
                      className="hidden"
                      id="background-upload"
                    />
                    <Label htmlFor="background-upload" className="cursor-pointer">
                      <div className="flex items-center space-x-2 px-4 py-2 border border-dashed rounded-lg hover:bg-muted/50">
                        <ImageIcon className="w-4 h-4" />
                        <span>Upload Background</span>
                      </div>
                    </Label>
                    {formData.background_url && (
                      <img src={formData.background_url} alt="Background preview" className="h-12 w-auto" />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="primary_color">Primary Color</Label>
                    <div className="mt-1 space-y-2">
                      <Input
                        id="primary_color"
                        type="color"
                        value={formData.primary_color}
                        onChange={(e) => setFormData(prev => ({ ...prev, primary_color: e.target.value }))}
                        className="h-12"
                      />
                      <div className="text-xs">
                        Contrast: {colorValidation.primary.contrast}:1 
                        <span className={`ml-1 px-1 rounded text-xs ${
                          colorValidation.primary.wcagLevel === 'AAA' ? 'bg-green-100 text-green-800' :
                          colorValidation.primary.wcagLevel === 'AA' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {colorValidation.primary.wcagLevel}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="secondary_color">Secondary Color</Label>
                    <div className="mt-1 space-y-2">
                      <Input
                        id="secondary_color"
                        type="color"
                        value={formData.secondary_color}
                        onChange={(e) => setFormData(prev => ({ ...prev, secondary_color: e.target.value }))}
                        className="h-12"
                      />
                      <div className="text-xs">
                        Contrast: {colorValidation.secondary.contrast}:1 
                        <span className={`ml-1 px-1 rounded text-xs ${
                          colorValidation.secondary.wcagLevel === 'AAA' ? 'bg-green-100 text-green-800' :
                          colorValidation.secondary.wcagLevel === 'AA' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {colorValidation.secondary.wcagLevel}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="button_color">Button Color</Label>
                    <div className="mt-1 space-y-2">
                      <Input
                        id="button_color"
                        type="color"
                        value={formData.button_color}
                        onChange={(e) => setFormData(prev => ({ ...prev, button_color: e.target.value }))}
                        className="h-12"
                      />
                      <div className="text-xs">
                        Contrast: {colorValidation.button.contrast}:1 
                        <span className={`ml-1 px-1 rounded text-xs ${
                          colorValidation.button.wcagLevel === 'AAA' ? 'bg-green-100 text-green-800' :
                          colorValidation.button.wcagLevel === 'AA' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {colorValidation.button.wcagLevel}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <Button 
                    onClick={editingTheme ? handleEditTheme : handleCreateTheme}
                    disabled={!formData.state_name.trim()}
                    className="flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{editingTheme ? 'Update Theme' : 'Create Theme'}</span>
                  </Button>
                  <Button variant="outline" onClick={cancelEdit} className="flex items-center space-x-2">
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </Button>
                </div>
              </div>

              {/* Preview Section */}
              <div>
                <h3 className="text-lg font-medium mb-4 flex items-center space-x-2">
                  <Eye className="w-5 h-5" />
                  <span>Live Preview</span>
                </h3>
                
                <div className="space-y-4">
                  {/* Login Page Preview */}
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-100 p-2 text-xs text-gray-600 border-b">Login Page Preview</div>
                    <div 
                      className="relative h-32 flex items-center justify-center"
                      style={{ 
                        backgroundColor: formData.primary_color,
                        backgroundImage: formData.background_url ? `url(${formData.background_url})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    >
                      <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
                        {formData.logo_url && (
                          <img src={formData.logo_url} alt="Logo" className="h-8 w-auto mx-auto mb-2" />
                        )}
                        <div className="text-center">
                          <h3 className="font-bold" style={{ color: formData.primary_color }}>
                            {formData.state_name || 'State Name'} CLMS
                          </h3>
                          <button 
                            className="mt-2 px-4 py-1 rounded text-white text-xs"
                            style={{ backgroundColor: formData.button_color }}
                          >
                            Sign In
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dashboard Preview */}
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-100 p-2 text-xs text-gray-600 border-b">Dashboard Preview</div>
                    <div className="p-4 bg-white">
                      <div 
                        className="flex items-center space-x-2 p-2 rounded"
                        style={{ backgroundColor: formData.primary_color }}
                      >
                        {formData.logo_url && (
                          <img src={formData.logo_url} alt="Logo" className="h-6 w-auto" />
                        )}
                        <span className="text-white text-sm font-medium">
                          {formData.state_name || 'State'} Dashboard
                        </span>
                      </div>
                      <div className="mt-2 flex space-x-2">
                        <div 
                          className="px-3 py-1 rounded text-xs text-white"
                          style={{ backgroundColor: formData.button_color }}
                        >
                          Primary Action
                        </div>
                        <div 
                          className="px-3 py-1 rounded text-xs text-white"
                          style={{ backgroundColor: formData.secondary_color }}
                        >
                          Secondary
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Themes List */}
      {!showCreateForm && !editingTheme && (
        <Card>
          <CardHeader>
            <CardTitle>Existing Themes</CardTitle>
          </CardHeader>
          <CardContent>
            {themes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No themes created yet. Click "Add Theme" to create your first state theme.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {themes.map((theme) => (
                  <div key={theme.id} className="border rounded-lg overflow-hidden">
                    <div 
                      className="h-24 relative"
                      style={{ 
                        backgroundColor: theme.primary_color,
                        backgroundImage: theme.background_url ? `url(${theme.background_url})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    >
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        {theme.logo_url && (
                          <img src={theme.logo_url} alt={`${theme.state_name} logo`} className="h-12 w-auto" />
                        )}
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-semibold text-lg">{theme.state_name}</h3>
                      <div className="flex space-x-2 mt-2">
                        <div 
                          className="w-6 h-6 rounded border"
                          style={{ backgroundColor: theme.primary_color }}
                          title="Primary Color"
                        />
                        <div 
                          className="w-6 h-6 rounded border"
                          style={{ backgroundColor: theme.secondary_color }}
                          title="Secondary Color"
                        />
                        <div 
                          className="w-6 h-6 rounded border"
                          style={{ backgroundColor: theme.button_color }}
                          title="Button Color"
                        />
                      </div>
                      
                      <div className="flex justify-between items-center mt-4">
                        <span className="text-xs text-muted-foreground">
                          {new Date(theme.created_at).toLocaleDateString()}
                        </span>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => startEdit(theme)}
                            className="flex items-center space-x-1"
                          >
                            <Edit className="w-3 h-3" />
                            <span>Edit</span>
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleDeleteTheme(theme)}
                            className="flex items-center space-x-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Powered by ConveGenius Badge Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span>Branding Guidelines</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>• Logo files must be PNG or SVG format, maximum 150KB</p>
            <p>• Background images must be JPG or PNG format, maximum 500KB</p>
            <p>• Color contrast ratios are checked automatically for accessibility compliance</p>
            <p>• A permanent "Powered by ConveGenius" badge will appear on all pages</p>
            <p>• Changes take effect immediately for all users in the selected state</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BrandingManagement;