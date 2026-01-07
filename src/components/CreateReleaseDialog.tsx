import React, { useState } from 'react';
import { AlertTriangle, Rocket } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

interface CreateReleaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentVersion: string;
  onCreateRelease: (release: {
    version: string;
    type: 'Minor' | 'Major';
    notes: string;
  }) => void;
}

const CreateReleaseDialog: React.FC<CreateReleaseDialogProps> = ({
  open,
  onOpenChange,
  currentVersion,
  onCreateRelease,
}) => {
  const [version, setVersion] = useState('');
  const [releaseType, setReleaseType] = useState<'Minor' | 'Major'>('Minor');
  const [notes, setNotes] = useState('');

  // Suggest next version based on current
  const suggestNextVersion = () => {
    const parts = currentVersion.replace('v', '').split('.');
    if (releaseType === 'Major') {
      return `v${parseInt(parts[0]) + 1}.0.0`;
    } else {
      return `v${parts[0]}.${parseInt(parts[1]) + 1}.0`;
    }
  };

  const handleCreate = () => {
    if (!version.trim()) {
      toast.error('Please enter a version number');
      return;
    }
    onCreateRelease({
      version: version.startsWith('v') ? version : `v${version}`,
      type: releaseType,
      notes,
    });
    onOpenChange(false);
    setVersion('');
    setNotes('');
    setReleaseType('Minor');
  };

  React.useEffect(() => {
    if (open) {
      setVersion(suggestNextVersion());
    }
  }, [open, releaseType]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5" />
            Create New Release
          </DialogTitle>
          <DialogDescription>
            Deploy a new version of the CLMS platform.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Version Input */}
          <div className="space-y-2">
            <Label htmlFor="version">Version Number</Label>
            <Input
              id="version"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="e.g., v2.1.0"
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Current version: <span className="font-mono font-medium">{currentVersion}</span>
            </p>
          </div>

          {/* Release Type */}
          <div className="space-y-3">
            <Label>Release Type</Label>
            <RadioGroup
              value={releaseType}
              onValueChange={(value) => setReleaseType(value as 'Minor' | 'Major')}
              className="grid grid-cols-2 gap-4"
            >
              <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="Minor" id="minor" />
                <Label htmlFor="minor" className="cursor-pointer flex-1">
                  <div className="font-medium text-green-600">Minor</div>
                  <div className="text-xs text-muted-foreground">Bug fixes, small updates</div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="Major" id="major" />
                <Label htmlFor="major" className="cursor-pointer flex-1">
                  <div className="font-medium text-red-600">Major</div>
                  <div className="text-xs text-muted-foreground">Feature updates, T&C changes</div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Major Release Warning */}
          {releaseType === 'Major' && (
            <Alert variant="destructive" className="border-orange-500 bg-orange-50 dark:bg-orange-950/30">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800 dark:text-orange-200">
                <strong>Major Release Warning:</strong> All existing users will be required to re-accept the Terms & Conditions before accessing the platform.
              </AlertDescription>
            </Alert>
          )}

          {/* Release Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Release Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe the changes in this release..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate}>
            <Rocket className="h-4 w-4 mr-2" />
            Create Release
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateReleaseDialog;
