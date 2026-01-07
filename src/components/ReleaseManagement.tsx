import React, { useState } from 'react';
import { 
  Rocket, 
  FileText, 
  Users, 
  History, 
  AlertTriangle, 
  Download,
  Search,
  RotateCcw,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import CreateReleaseDialog from './CreateReleaseDialog';
import { useTermsConsent } from '@/hooks/useTermsConsent';
import {
  CURRENT_TC_VERSION,
  mockConsentLogs,
  mockVersionHistory,
  mockReleaseHistory,
  mockPrivacyPolicy,
  mockTermsConditions,
} from '@/data/mockTermsData';

const ReleaseManagement: React.FC = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [privacyText, setPrivacyText] = useState(mockPrivacyPolicy);
  const [termsText, setTermsText] = useState(mockTermsConditions);
  const { resetConsent } = useTermsConsent();

  const currentRelease = mockReleaseHistory[0];
  
  const filteredLogs = mockConsentLogs.filter(log => 
    log.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.user_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.policy_version.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateRelease = (release: { version: string; type: 'Minor' | 'Major'; notes: string }) => {
    toast.success(`Release ${release.version} created successfully!`, {
      description: release.type === 'Major' 
        ? 'All users will be prompted to accept T&C on next login.'
        : 'Minor release deployed. No T&C prompt required.',
    });
  };

  const handlePublishTC = () => {
    toast.success('Terms & Conditions updated!', {
      description: 'This will trigger a Major release. All users must re-accept.',
    });
  };

  const handleExportLogs = () => {
    toast.success('Export started', {
      description: 'Consent logs will be downloaded as CSV.',
    });
  };

  const handleSimulateMajorRelease = () => {
    resetConsent();
    toast.info('Major release simulated!', {
      description: 'Refresh the page to see the T&C overlay.',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Legal & Release Management</h2>
          <p className="text-muted-foreground">
            Manage platform releases and Terms & Conditions compliance
          </p>
        </div>
        <Button variant="outline" onClick={handleSimulateMajorRelease}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Simulate Major Release
        </Button>
      </div>

      <Tabs defaultValue="current" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="current" className="flex items-center gap-2">
            <Rocket className="h-4 w-4" />
            Current Release
          </TabsTrigger>
          <TabsTrigger value="editor" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            T&C Editor
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Consent Logs
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Version History
          </TabsTrigger>
        </TabsList>

        {/* Current Release Tab */}
        <TabsContent value="current" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Active Release</span>
                <Badge 
                  variant={currentRelease.release_type === 'Major' ? 'destructive' : 'default'}
                  className="text-sm"
                >
                  {currentRelease.release_type}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-5xl font-bold font-mono text-primary">
                    {currentRelease.version}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Current Version</p>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Release Date:</span>
                    <span className="font-medium">{currentRelease.release_date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">T&C Updated:</span>
                    <Badge variant={currentRelease.tc_updated ? 'secondary' : 'outline'}>
                      {currentRelease.tc_updated ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Release Notes</h4>
                <p className="text-sm text-muted-foreground">{currentRelease.notes}</p>
              </div>

              <Button onClick={() => setCreateDialogOpen(true)} className="w-full">
                <Rocket className="h-4 w-4 mr-2" />
                Create New Release
              </Button>
            </CardContent>
          </Card>

          {/* Release History Table */}
          <Card>
            <CardHeader>
              <CardTitle>Release History</CardTitle>
              <CardDescription>All platform releases</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Version</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>T&C Updated</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockReleaseHistory.map((release) => (
                    <TableRow key={release.version}>
                      <TableCell className="font-mono font-medium">{release.version}</TableCell>
                      <TableCell>
                        <Badge variant={release.release_type === 'Major' ? 'destructive' : 'secondary'}>
                          {release.release_type}
                        </Badge>
                      </TableCell>
                      <TableCell>{release.release_date}</TableCell>
                      <TableCell>
                        {release.tc_updated ? (
                          <Badge variant="default">Yes</Badge>
                        ) : (
                          <Badge variant="outline">No</Badge>
                        )}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">{release.notes}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* T&C Editor Tab */}
        <TabsContent value="editor" className="space-y-6">
          <Alert variant="destructive" className="border-orange-500 bg-orange-50 dark:bg-orange-950/30">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800 dark:text-orange-200">
              <strong>Warning:</strong> Modifying the Terms & Conditions or Privacy Policy will automatically trigger a <strong>Major Release</strong>. All users will be required to re-accept the terms.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Privacy Policy</CardTitle>
                <CardDescription>
                  Last updated: {mockVersionHistory[0].created_at.split(' ')[0]}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={privacyText}
                  onChange={(e) => setPrivacyText(e.target.value)}
                  rows={15}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {privacyText.length} characters
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Terms & Conditions</CardTitle>
                <CardDescription>
                  Last updated: {mockVersionHistory[0].created_at.split(' ')[0]}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={termsText}
                  onChange={(e) => setTermsText(e.target.value)}
                  rows={15}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {termsText.length} characters
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button onClick={handlePublishTC}>
              <Rocket className="h-4 w-4 mr-2" />
              Publish Changes
            </Button>
          </div>
        </TabsContent>

        {/* Consent Logs Tab */}
        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>User Consent Logs</CardTitle>
                  <CardDescription>
                    Audit trail of all T&C acceptances with millisecond precision
                  </CardDescription>
                </div>
                <Button variant="outline" onClick={handleExportLogs}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by user name, ID, or version..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-sm"
                />
              </div>

              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User ID</TableHead>
                      <TableHead>User Name</TableHead>
                      <TableHead>Policy Version</TableHead>
                      <TableHead>Release Tag</TableHead>
                      <TableHead>Accepted At (with ms)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-sm">{log.user_id}</TableCell>
                        <TableCell className="font-medium">{log.user_name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono">
                            {log.policy_version}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="font-mono">
                            {log.release_tag}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm text-muted-foreground">
                          {log.accepted_at}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>

              <div className="mt-4 text-sm text-muted-foreground">
                Showing {filteredLogs.length} of {mockConsentLogs.length} records
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Version History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>T&C Version History</CardTitle>
              <CardDescription>
                Complete history of Terms & Conditions updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Version</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Changes Summary</TableHead>
                    <TableHead>Updated By</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockVersionHistory.map((version) => (
                    <TableRow key={version.version_id}>
                      <TableCell className="font-mono font-medium">{version.version_id}</TableCell>
                      <TableCell>
                        {version.is_current ? (
                          <Badge variant="default">Current</Badge>
                        ) : (
                          <Badge variant="outline">Archived</Badge>
                        )}
                      </TableCell>
                      <TableCell className="max-w-[300px]">
                        <p className="text-sm text-muted-foreground truncate">
                          {version.content_diff}
                        </p>
                      </TableCell>
                      <TableCell>{version.updated_by_name}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {version.created_at}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CreateReleaseDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        currentVersion={CURRENT_TC_VERSION}
        onCreateRelease={handleCreateRelease}
      />
    </div>
  );
};

export default ReleaseManagement;
