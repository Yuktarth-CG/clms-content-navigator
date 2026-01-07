import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings as SettingsIcon, 
  Palette, 
  User, 
  Bell, 
  Shield, 
  Database,
  Scale
} from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import BrandingManagement from '@/components/BrandingManagement';
import ReleaseManagement from '@/components/ReleaseManagement';

const Settings = () => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('general');

  // Check if user is Super Admin for certain tabs
  const isSuperAdmin = user?.role === 'SuperAdmin';

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Configure your system preferences and manage platform settings
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-7">
          <TabsTrigger value="general" className="flex items-center space-x-2">
            <SettingsIcon className="w-4 h-4" />
            <span>General</span>
          </TabsTrigger>
          
          <TabsTrigger value="profile" className="flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span>Profile</span>
          </TabsTrigger>
          
          <TabsTrigger value="notifications" className="flex items-center space-x-2">
            <Bell className="w-4 h-4" />
            <span>Notifications</span>
          </TabsTrigger>
          
          {isSuperAdmin && (
            <TabsTrigger value="branding" className="flex items-center space-x-2">
              <Palette className="w-4 h-4" />
              <span>Branding</span>
            </TabsTrigger>
          )}

          {isSuperAdmin && (
            <TabsTrigger value="legal" className="flex items-center space-x-2">
              <Scale className="w-4 h-4" />
              <span>Legal & Releases</span>
            </TabsTrigger>
          )}
          
          <TabsTrigger value="security" className="flex items-center space-x-2">
            <Shield className="w-4 h-4" />
            <span>Security</span>
          </TabsTrigger>
          
          <TabsTrigger value="data" className="flex items-center space-x-2">
            <Database className="w-4 h-4" />
            <span>Data</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6">
          <GeneralSettings />
        </TabsContent>

        <TabsContent value="profile" className="mt-6">
          <ProfileSettings />
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <NotificationSettings />
        </TabsContent>

        {isSuperAdmin && (
          <TabsContent value="branding" className="mt-6">
            <BrandingManagement />
          </TabsContent>
        )}

        {isSuperAdmin && (
          <TabsContent value="legal" className="mt-6">
            <ReleaseManagement />
          </TabsContent>
        )}

        <TabsContent value="security" className="mt-6">
          <SecuritySettings />
        </TabsContent>

        <TabsContent value="data" className="mt-6">
          <DataSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const GeneralSettings = () => (
  <Card>
    <CardHeader>
      <CardTitle>General Preferences</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium mb-2">Language & Region</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground">Interface Language</label>
              <select className="w-full mt-1 p-2 border rounded-md">
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="ta">Tamil</option>
                <option value="te">Telugu</option>
                <option value="kn">Kannada</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Time Zone</label>
              <select className="w-full mt-1 p-2 border rounded-md">
                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-2">Display Preferences</h3>
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked />
              <span className="text-sm">Show tooltips on navigation items</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked />
              <span className="text-sm">Enable animations</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" />
              <span className="text-sm">Compact layout mode</span>
            </label>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const ProfileSettings = () => {
  const { user } = useUser();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground">Full Name</label>
              <input 
                type="text" 
                defaultValue={user?.name || ''} 
                className="w-full mt-1 p-2 border rounded-md" 
                disabled
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Email</label>
              <input 
                type="email" 
                defaultValue={user?.email || ''} 
                className="w-full mt-1 p-2 border rounded-md" 
                disabled
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground">Role</label>
              <input 
                type="text" 
                value={user?.role || 'Unknown'} 
                className="w-full mt-1 p-2 border rounded-md bg-muted" 
                disabled 
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Last Login</label>
              <input 
                type="text" 
                value={user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'} 
                className="w-full mt-1 p-2 border rounded-md bg-muted" 
                disabled
              />
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              To update your profile information, please contact your system administrator.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const NotificationSettings = () => (
  <Card>
    <CardHeader>
      <CardTitle>Notification Preferences</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium mb-3">Email Notifications</h3>
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked />
              <span className="text-sm">Content approval requests</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked />
              <span className="text-sm">System maintenance alerts</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" />
              <span className="text-sm">Weekly usage reports</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked />
              <span className="text-sm">Security notifications</span>
            </label>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-3">In-App Notifications</h3>
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked />
              <span className="text-sm">Task assignments</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked />
              <span className="text-sm">Content expiry warnings</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" />
              <span className="text-sm">New feature announcements</span>
            </label>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-3">Frequency Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground">Digest Frequency</label>
              <select className="w-full mt-1 p-2 border rounded-md">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="never">Never</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Reminder Timing</label>
              <select className="w-full mt-1 p-2 border rounded-md">
                <option value="immediate">Immediate</option>
                <option value="1hour">1 Hour</option>
                <option value="24hours">24 Hours</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const SecuritySettings = () => (
  <Card>
    <CardHeader>
      <CardTitle>Security & Privacy</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium mb-3">Account Security</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 border rounded-lg">
              <div>
                <p className="text-sm font-medium">Password</p>
                <p className="text-xs text-muted-foreground">Last changed 30 days ago</p>
              </div>
              <button className="text-sm text-blue-600 hover:text-blue-800">Change Password</button>
            </div>
            
            <div className="flex justify-between items-center p-3 border rounded-lg">
              <div>
                <p className="text-sm font-medium">Two-Factor Authentication</p>
                <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
              </div>
              <button className="text-sm text-green-600 hover:text-green-800">Enable 2FA</button>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-3">Session Management</h3>
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked />
              <span className="text-sm">Auto-logout after 8 hours of inactivity</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" />
              <span className="text-sm">Require password for sensitive actions</span>
            </label>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-3">Activity Log</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Last login</span>
              <span className="text-muted-foreground">Today at 9:15 AM</span>
            </div>
            <div className="flex justify-between">
              <span>Last password change</span>
              <span className="text-muted-foreground">30 days ago</span>
            </div>
            <div className="flex justify-between">
              <span>Recent locations</span>
              <span className="text-muted-foreground">Mumbai, Delhi</span>
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const DataSettings = () => (
  <Card>
    <CardHeader>
      <CardTitle>Data Management</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium mb-3">Data Export</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 border rounded-lg">
              <div>
                <p className="text-sm font-medium">Export Personal Data</p>
                <p className="text-xs text-muted-foreground">Download all your account data</p>
              </div>
              <button className="text-sm text-blue-600 hover:text-blue-800">Request Export</button>
            </div>
            
            <div className="flex justify-between items-center p-3 border rounded-lg">
              <div>
                <p className="text-sm font-medium">Content Backup</p>
                <p className="text-xs text-muted-foreground">Backup your created content</p>
              </div>
              <button className="text-sm text-blue-600 hover:text-blue-800">Create Backup</button>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-3">Storage Usage</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Questions created</span>
              <span>1,234 items</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Files uploaded</span>
              <span>45.6 MB</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Total storage used</span>
              <span className="font-medium">67.8 MB of 1 GB</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '6.78%' }}></div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-3">Data Retention</h3>
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked />
              <span className="text-sm">Automatically archive old content after 2 years</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" />
              <span className="text-sm">Delete activity logs older than 1 year</span>
            </label>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default Settings;