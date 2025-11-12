import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Edit, Trash2, Search, Users, Shield, AlertTriangle, Upload, Download } from 'lucide-react';
import { User, UserRole } from '@/types/content';
import { getRolePermissions } from '@/utils/permissions';
import BulkUserUpload from './BulkUserUpload';
import PermissionsMatrix from './PermissionsMatrix';

interface CMSPermissions {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  approve: boolean;
  reject: boolean;
  translate: boolean;
  publish: boolean;
  archive: boolean;
  comment: boolean;
}

interface LMSPermissions {
  viewWorksheet: boolean;
  createWorksheet: boolean;
  editWorksheet: boolean;
  deleteWorksheet: boolean;
  publishWorksheet: boolean;
  archiveWorksheet: boolean;
  downloadWorksheet: boolean;
  viewTestPaper: boolean;
  createTestPaper: boolean;
  editTestPaper: boolean;
  deleteTestPaper: boolean;
  publishTestPaper: boolean;
  archiveTestPaper: boolean;
  downloadTestPaper: boolean;
  createMapping: boolean;
  editMapping: boolean;
  publishMapping: boolean;
}

interface ExportPermissions {
  downloadCSV: boolean;
  exportToProduct: boolean;
}

interface UserMgmtPermissions {
  viewUsers: boolean;
  createUsers: boolean;
  editUsers: boolean;
  deleteUsers: boolean;
  viewRoles: boolean;
  createRoles: boolean;
  editRoles: boolean;
  deleteRoles: boolean;
}

interface TaggingPermissions {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

interface ExtendedUser extends User {
  phone?: string;
  roles: string[]; // Changed from single role to multiple roles
  cmsPermissions: CMSPermissions;
  lmsPermissions: LMSPermissions;
  exportPermissions: ExportPermissions;
  userMgmtPermissions: UserMgmtPermissions;
  taggingPermissions: TaggingPermissions;
  languages?: string[];
}

interface Role {
  id: string;
  name: string;
  description: string;
  defaultPermissions: {
    cms: CMSPermissions;
    lms: LMSPermissions;
    export: ExportPermissions;
    userMgmt: UserMgmtPermissions;
    tagging: TaggingPermissions;
  };
}

const UserManagement = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<ExtendedUser | null>(null);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  // Updated mock data with PRD-compliant roles (removed State Official)
  const [users, setUsers] = useState<ExtendedUser[]>([
    {
      id: 'user-001',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
      phone: '+91-9876543210',
      role: 'SuperAdmin', // Keep for compatibility
      roles: ['SuperAdmin'], // New multiple roles field
      permissions: getRolePermissions('SuperAdmin'),
      createdAt: '2024-01-01',
      lastLogin: '2024-06-24',
      isActive: true,
      cmsPermissions: {
        view: true,
        create: true,
        edit: true,
        delete: true,  // SuperAdmin can delete per PRD
        approve: true,
        reject: true,
        translate: true,
        publish: true,
        archive: true,
        comment: true
      },
      lmsPermissions: {
        viewWorksheet: true,
        createWorksheet: true,
        editWorksheet: true,
        deleteWorksheet: true,  // SuperAdmin can delete per PRD
        publishWorksheet: true,
        archiveWorksheet: true,
        downloadWorksheet: true,
        viewTestPaper: true,
        createTestPaper: true,
        editTestPaper: true,
        deleteTestPaper: true,  // SuperAdmin can delete per PRD
        publishTestPaper: true,
        archiveTestPaper: true,
        downloadTestPaper: true,
        createMapping: true,
        editMapping: true,
        publishMapping: true
      },
      exportPermissions: {
        downloadCSV: true,  // SuperAdmin has export rights per PRD
        exportToProduct: true
      },
      userMgmtPermissions: {
        viewUsers: true,
        createUsers: true,
        editUsers: true,
        deleteUsers: true,
        viewRoles: true,
        createRoles: true,
        editRoles: true,
        deleteRoles: true
      },
      taggingPermissions: {
        view: true,
        create: true,
        edit: true,
        delete: true
      }
    },
    {
      id: 'user-002',
      name: 'John Admin',
      email: 'john.admin@example.com',
      phone: '+91-9876543211',
      role: 'Admin', // Keep for compatibility
      roles: ['Admin', 'Creator'], // Multiple roles example
      permissions: getRolePermissions('Admin'),
      createdAt: '2024-02-01',
      lastLogin: '2024-06-23',
      isActive: true,
      cmsPermissions: {
        view: true,
        create: true,
        edit: true,
        delete: false, // Admin cannot delete per PRD
        approve: true,
        reject: true,
        translate: true,
        publish: true,
        archive: true,
        comment: true
      },
      lmsPermissions: {
        viewWorksheet: true,
        createWorksheet: true,
        editWorksheet: true,
        deleteWorksheet: false, // Admin cannot delete per PRD
        publishWorksheet: true,
        archiveWorksheet: true,
        downloadWorksheet: true,
        viewTestPaper: true,
        createTestPaper: true,
        editTestPaper: true,
        deleteTestPaper: false, // Admin cannot delete per PRD
        publishTestPaper: true,
        archiveTestPaper: true,
        downloadTestPaper: true,
        createMapping: true,
        editMapping: true,
        publishMapping: true
      },
      exportPermissions: {
        downloadCSV: false, // Export limited to Super Admin by default per PRD
        exportToProduct: false
      },
      userMgmtPermissions: {
        viewUsers: true, // Admin can view users per PRD
        createUsers: false,
        editUsers: false,
        deleteUsers: false,
        viewRoles: false,
        createRoles: false,
        editRoles: false,
        deleteRoles: false
      },
      taggingPermissions: {
        view: false,
        create: false,
        edit: false,
        delete: false
      }
    }
  ]);

  // Updated roles to match PRD exactly (only 5 roles)
  const [roles, setRoles] = useState<Role[]>([
    {
      id: 'role-001',
      name: 'SuperAdmin',
      description: 'Full system access with all permissions across all modules',
      defaultPermissions: {
        cms: {
          view: true,
          create: true,
          edit: true,
          delete: true,
          approve: true,
          reject: true,
          translate: true,
          publish: true,
          archive: true,
          comment: true
        },
        lms: {
          viewWorksheet: true,
          createWorksheet: true,
          editWorksheet: true,
          deleteWorksheet: true,
          publishWorksheet: true,
          archiveWorksheet: true,
          downloadWorksheet: true,
          viewTestPaper: true,
          createTestPaper: true,
          editTestPaper: true,
          deleteTestPaper: true,
          publishTestPaper: true,
          archiveTestPaper: true,
          downloadTestPaper: true,
          createMapping: true,
          editMapping: true,
          publishMapping: true
        },
        export: {
          downloadCSV: true,
          exportToProduct: true
        },
        userMgmt: {
          viewUsers: true,
          createUsers: true,
          editUsers: true,
          deleteUsers: true,
          viewRoles: true,
          createRoles: true,
          editRoles: true,
          deleteRoles: true
        },
        tagging: {
          view: true,
          create: true,
          edit: true,
          delete: true
        }
      }
    },
    {
      id: 'role-002',
      name: 'Admin',
      description: 'Can create, edit, approve, and publish content. Can view users but cannot manage them. Cannot delete content.',
      defaultPermissions: {
        cms: {
          view: true,
          create: true,
          edit: true,
          delete: false, // Admin cannot delete per PRD
          approve: true,
          reject: true,
          translate: true,
          publish: true,
          archive: true,
          comment: true
        },
        lms: {
          viewWorksheet: true,
          createWorksheet: true,
          editWorksheet: true,
          deleteWorksheet: false,
          publishWorksheet: true,
          archiveWorksheet: true,
          downloadWorksheet: true,
          viewTestPaper: true,
          createTestPaper: true,
          editTestPaper: true,
          deleteTestPaper: false,
          publishTestPaper: true,
          archiveTestPaper: true,
          downloadTestPaper: true,
          createMapping: true,
          editMapping: true,
          publishMapping: true
        },
        export: {
          downloadCSV: false,
          exportToProduct: false
        },
        userMgmt: {
          viewUsers: true, // Admin can view users per PRD
          createUsers: false,
          editUsers: false,
          deleteUsers: false,
          viewRoles: false,
          createRoles: false,
          editRoles: false,
          deleteRoles: false
        },
        tagging: {
          view: false,
          create: false,
          edit: false,
          delete: false
        }
      }
    },
    {
      id: 'role-003',
      name: 'Reviewer',
      description: 'Can review, approve, reject, and edit content during review process',
      defaultPermissions: {
        cms: {
          view: true,
          create: false,
          edit: true, // Can edit during review
          delete: false,
          approve: true,
          reject: true,
          translate: false,
          publish: false,
          archive: false,
          comment: true
        },
        lms: {
          viewWorksheet: false,
          createWorksheet: false,
          editWorksheet: false,
          deleteWorksheet: false,
          publishWorksheet: false,
          archiveWorksheet: false,
          downloadWorksheet: false,
          viewTestPaper: false,
          createTestPaper: false,
          editTestPaper: false,
          deleteTestPaper: false,
          publishTestPaper: false,
          archiveTestPaper: false,
          downloadTestPaper: false,
          createMapping: false,
          editMapping: false,
          publishMapping: false
        },
        export: {
          downloadCSV: false,
          exportToProduct: false
        },
        userMgmt: {
          viewUsers: false,
          createUsers: false,
          editUsers: false,
          deleteUsers: false,
          viewRoles: false,
          createRoles: false,
          editRoles: false,
          deleteRoles: false
        },
        tagging: {
          view: false,
          create: false,
          edit: false,
          delete: false
        }
      }
    },
    {
      id: 'role-004',
      name: 'Creator',
      description: 'Can create and submit content for review',
      defaultPermissions: {
        cms: {
          view: true,
          create: true,
          edit: true, // Can edit own content
          delete: false,
          approve: false,
          reject: false,
          translate: false,
          publish: false,
          archive: false,
          comment: true
        },
        lms: {
          viewWorksheet: true,
          createWorksheet: true,
          editWorksheet: true,
          deleteWorksheet: false,
          publishWorksheet: false,
          archiveWorksheet: false,
          downloadWorksheet: false,
          viewTestPaper: true,
          createTestPaper: true,
          editTestPaper: true,
          deleteTestPaper: false,
          publishTestPaper: false,
          archiveTestPaper: false,
          downloadTestPaper: false,
          createMapping: true,
          editMapping: true,
          publishMapping: false
        },
        export: {
          downloadCSV: false,
          exportToProduct: false
        },
        userMgmt: {
          viewUsers: false,
          createUsers: false,
          editUsers: false,
          deleteUsers: false,
          viewRoles: false,
          createRoles: false,
          editRoles: false,
          deleteRoles: false
        },
        tagging: {
          view: false,
          create: false,
          edit: false,
          delete: false
        }
      }
    },
    {
      id: 'role-005',
      name: 'Translator',
      description: 'Can translate published content to different languages',
      defaultPermissions: {
        cms: {
          view: true,
          create: false,
          edit: false,
          delete: false,
          approve: false,
          reject: false,
          translate: true,
          publish: false,
          archive: false,
          comment: true
        },
        lms: {
          viewWorksheet: false,
          createWorksheet: false,
          editWorksheet: false,
          deleteWorksheet: false,
          publishWorksheet: false,
          archiveWorksheet: false,
          downloadWorksheet: false,
          viewTestPaper: false,
          createTestPaper: false,
          editTestPaper: false,
          deleteTestPaper: false,
          publishTestPaper: false,
          archiveTestPaper: false,
          downloadTestPaper: false,
          createMapping: false,
          editMapping: false,
          publishMapping: false
        },
        export: {
          downloadCSV: false,
          exportToProduct: false
        },
        userMgmt: {
          viewUsers: false,
          createUsers: false,
          editUsers: false,
          deleteUsers: false,
          viewRoles: false,
          createRoles: false,
          editRoles: false,
          deleteRoles: false
        },
        tagging: {
          view: false,
          create: false,
          edit: false,
          delete: false
        }
      }
    }
  ]);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.roles.some(role => role.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">User Management</h1>
        <p className="text-muted-foreground mt-1">
          Manage users, roles, and permissions across the CLMS platform according to PRD requirements
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users" className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Users</span>
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center space-x-2">
            <Shield className="w-4 h-4" />
            <span>Roles</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>User Management</span>
                </CardTitle>
                <div className="flex space-x-2">
                  <Dialog open={isBulkUploadOpen} onOpenChange={setIsBulkUploadOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Upload className="w-4 h-4 mr-2" />
                        Bulk Import Users & Roles
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Bulk Import - Users & Roles</DialogTitle>
                      </DialogHeader>
                      <BulkUserUpload onClose={() => setIsBulkUploadOpen(false)} />
                    </DialogContent>
                  </Dialog>
                  <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Create User
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Create New User</DialogTitle>
                      </DialogHeader>
                      <CreateUserForm 
                        onClose={() => setIsCreateUserOpen(false)}
                        onSave={(user) => {
                          setUsers([...users, { ...user, id: `user-${Date.now()}` }]);
                          setIsCreateUserOpen(false);
                        }}
                        roles={roles}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search users by name, email, or role..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone || 'N/A'}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.roles.map((role) => (
                            <Badge key={role} variant="secondary">{role}</Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.isActive ? 'default' : 'destructive'}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingUser(user)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (user.role === 'SuperAdmin' && users.filter(u => u.role === 'SuperAdmin' && u.isActive).length === 1) {
                                alert('Cannot delete the only active Super Admin');
                                return;
                              }
                              setUsers(users.filter(u => u.id !== user.id));
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>Role Management</span>
                </CardTitle>
                <Dialog open={isCreateRoleOpen} onOpenChange={setIsCreateRoleOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Role
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create New Role</DialogTitle>
                    </DialogHeader>
                    <CreateRoleForm 
                      onClose={() => setIsCreateRoleOpen(false)}
                      onSave={(role) => {
                        setRoles([...roles, { ...role, id: `role-${Date.now()}` }]);
                        setIsCreateRoleOpen(false);
                      }}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search roles by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Users Count</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRoles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell className="font-medium">{role.name}</TableCell>
                      <TableCell>{role.description}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {users.filter(u => u.role === role.name).length} users
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingRole(role)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const usersWithRole = users.filter(u => u.roles.includes(role.name));
                              if (usersWithRole.length > 0) {
                                alert('Cannot delete role with assigned users. Please reassign users first.');
                                return;
                              }
                              setRoles(roles.filter(r => r.id !== role.id));
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {editingUser && (
        <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit User: {editingUser.name}</DialogTitle>
            </DialogHeader>
            <CreateUserForm 
              editingUser={editingUser}
              onClose={() => setEditingUser(null)}
              onSave={(updatedUser) => {
                setUsers(users.map(u => u.id === editingUser.id ? { ...updatedUser, id: editingUser.id } : u));
                setEditingUser(null);
              }}
              roles={roles}
            />
          </DialogContent>
        </Dialog>
      )}

      {editingRole && (
        <Dialog open={!!editingRole} onOpenChange={() => setEditingRole(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Role: {editingRole.name}</DialogTitle>
            </DialogHeader>
            <CreateRoleForm 
              editingRole={editingRole}
              onClose={() => setEditingRole(null)}
              onSave={(updatedRole) => {
                setRoles(roles.map(r => r.id === editingRole.id ? { ...updatedRole, id: editingRole.id } : r));
                setEditingRole(null);
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

const CreateUserForm = ({ 
  editingUser, 
  onClose, 
  onSave, 
  roles 
}: { 
  editingUser?: ExtendedUser | null;
  onClose: () => void;
  onSave: (user: ExtendedUser) => void;
  roles: Role[];
}) => {
  const getDefaultCMSPermissions = (): CMSPermissions => ({
    view: false,
    create: false,
    edit: false,
    delete: false,
    approve: false,
    reject: false,
    translate: false,
    publish: false,
    archive: false,
    comment: false
  });

  const getDefaultLMSPermissions = (): LMSPermissions => ({
    viewWorksheet: false,
    createWorksheet: false,
    editWorksheet: false,
    deleteWorksheet: false,
    publishWorksheet: false,
    archiveWorksheet: false,
    downloadWorksheet: false,
    viewTestPaper: false,
    createTestPaper: false,
    editTestPaper: false,
    deleteTestPaper: false,
    publishTestPaper: false,
    archiveTestPaper: false,
    downloadTestPaper: false,
    createMapping: false,
    editMapping: false,
    publishMapping: false
  });

  const getDefaultExportPermissions = (): ExportPermissions => ({
    downloadCSV: false,
    exportToProduct: false
  });

  const getDefaultUserMgmtPermissions = (): UserMgmtPermissions => ({
    viewUsers: false,
    createUsers: false,
    editUsers: false,
    deleteUsers: false,
    viewRoles: false,
    createRoles: false,
    editRoles: false,
    deleteRoles: false
  });

  const getDefaultTaggingPermissions = (): TaggingPermissions => ({
    view: false,
    create: false,
    edit: false,
    delete: false
  });

  const [formData, setFormData] = useState({
    name: editingUser?.name || '',
    email: editingUser?.email || '',
    phone: editingUser?.phone || '',
    roles: editingUser?.roles || [], // Changed to multiple roles
    languages: editingUser?.languages || [],
    enhancedPermissions: editingUser?.cmsPermissions || {}
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [showCriticalWarning, setShowCriticalWarning] = useState(false);

  const availableLanguages = ['English', 'Hindi', 'Tamil', 'Telugu', 'Marathi', 'Bengali'];

  const handleRoleToggle = (roleName: string) => {
    const newRoles = formData.roles.includes(roleName)
      ? formData.roles.filter(r => r !== roleName)
      : [...formData.roles, roleName];
    
    setFormData(prev => ({
      ...prev,
      roles: newRoles
    }));
  };

  // Calculate merged permissions from all selected roles
  const getMergedPermissions = () => {
    if (formData.roles.length === 0) return {};
    
    // Start with the first role's permissions
    const merged = { ...roles.find(r => r.name === formData.roles[0])?.defaultPermissions };
    
    // Merge permissions from all roles (union of permissions)
    formData.roles.forEach(roleName => {
      const role = roles.find(r => r.name === roleName);
      if (role) {
        Object.keys(role.defaultPermissions).forEach(module => {
          Object.keys(role.defaultPermissions[module]).forEach(permission => {
            if (!merged[module]) merged[module] = {};
            merged[module][permission] = merged[module][permission] || role.defaultPermissions[module][permission];
          });
        });
      }
    });
    
    return merged;
  };

  const handlePermissionChange = (path: string[], value: boolean) => {
    setFormData(prev => {
      const newPermissions = { ...prev.enhancedPermissions };
      let current = newPermissions;
      
      for (let i = 0; i < path.length - 1; i++) {
        if (!current[path[i]]) {
          current[path[i]] = {};
        }
        current = current[path[i]];
      }
      
      current[path[path.length - 1]] = value;
      
      return {
        ...prev,
        enhancedPermissions: newPermissions
      };
    });
  };

  const handleSave = () => {
    const newErrors: string[] = [];
    
    if (!formData.name.trim()) newErrors.push('Name is required');
    if (!formData.email.trim()) newErrors.push('Email is required');
    if (formData.roles.length === 0) newErrors.push('At least one role is required');
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.push('Please enter a valid email address');
    }
    
    // Translator validation
    if (formData.roles.includes('Translator') && formData.languages.length === 0) {
      newErrors.push('Select at least one language for translation');
    }
    
    setErrors(newErrors);
    
    if (newErrors.length === 0) {
      const mergedPerms = getMergedPermissions();
      const userData: ExtendedUser = {
        id: editingUser?.id || '',
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.roles[0] as UserRole, // Keep first role for compatibility
        roles: formData.roles,
        permissions: getRolePermissions(formData.roles[0] as UserRole),
        createdAt: editingUser?.createdAt || new Date().toISOString(),
        lastLogin: editingUser?.lastLogin,
        isActive: editingUser?.isActive ?? true,
        cmsPermissions: (mergedPerms as any).cms || getDefaultCMSPermissions(),
        lmsPermissions: (mergedPerms as any).lms || getDefaultLMSPermissions(),
        exportPermissions: (mergedPerms as any).export || getDefaultExportPermissions(),
        userMgmtPermissions: (mergedPerms as any).userMgmt || getDefaultUserMgmtPermissions(),
        taggingPermissions: (mergedPerms as any).tagging || getDefaultTaggingPermissions(),
        languages: formData.languages
      };
      
      onSave(userData);
    }
  };

  return (
    <div className="space-y-6">
      {showCriticalWarning && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You are assigning critical permissions (User Management, Master Data). 
            This grants significant access to the system. Continue?
            <div className="mt-2 space-x-2">
              <Button size="sm" onClick={handleSave}>Continue</Button>
              <Button size="sm" variant="outline" onClick={() => setShowCriticalWarning(false)}>Review</Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertDescription>
            <ul className="list-disc list-inside">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-4 gap-4">
        <div>
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter full name"
          />
        </div>
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="user@domain.com"
          />
        </div>
        <div>
          <Label htmlFor="password">Password {!editingUser && '*'}</Label>
          <Input
            id="password"
            type="password"
            placeholder="user@domain.com"
            disabled={!!editingUser}
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+1 (555) 123-4567"
          />
        </div>
      </div>

      <div>
        <Label>Role</Label>
        <div className="space-y-3 mt-2">
          {roles.map((role) => (
            <div key={role.id} className="flex items-start space-x-3">
              <Checkbox
                id={`role-${role.id}`}
                checked={formData.roles.includes(role.name)}
                onCheckedChange={() => handleRoleToggle(role.name)}
              />
              <div className="flex-1">
                <Label htmlFor={`role-${role.id}`} className="cursor-pointer font-medium">
                  {role.name}
                </Label>
                <p className="text-sm text-muted-foreground">{role.description}</p>
              </div>
            </div>
          ))}
        </div>
        
        {formData.roles.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {formData.roles.map((roleName) => (
              <Badge key={roleName} variant="default" className="px-3 py-1">
                {roleName}
                <button
                  type="button"
                  onClick={() => handleRoleToggle(roleName)}
                  className="ml-2 hover:text-destructive"
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {formData.roles.includes('Translator') && (
        <div>
          <Label>Translation Languages *</Label>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {availableLanguages.map((lang) => (
              <div key={lang} className="flex items-center space-x-2">
                <Checkbox
                  id={lang}
                  checked={formData.languages.includes(lang)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setFormData({
                        ...formData,
                        languages: [...formData.languages, lang]
                      });
                    } else {
                      setFormData({
                        ...formData,
                        languages: formData.languages.filter(l => l !== lang)
                      });
                    }
                  }}
                />
                <Label htmlFor={lang} className="text-sm">{lang}</Label>
              </div>
            ))}
          </div>
        </div>
      )}

      <PermissionsMatrix 
        selectedRoles={formData.roles}
        mergedPermissions={getMergedPermissions()}
      />

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          {editingUser ? 'Update User' : 'Save User'}
        </Button>
      </div>
    </div>
  );
};

const CreateRoleForm = ({ 
  editingRole, 
  onClose, 
  onSave 
}: { 
  editingRole?: Role | null;
  onClose: () => void;
  onSave: (role: Role) => void;
}) => {
  const [formData, setFormData] = useState({
    name: editingRole?.name || '',
    description: editingRole?.description || '',
    defaultPermissions: editingRole?.defaultPermissions || {
      cms: {
        view: false, create: false, edit: false, delete: false,
        approve: false, reject: false, translate: false, publish: false,
        archive: false, comment: false
      },
      lms: {
        viewWorksheet: false, createWorksheet: false, editWorksheet: false,
        deleteWorksheet: false, publishWorksheet: false, archiveWorksheet: false,
        downloadWorksheet: false, viewTestPaper: false, createTestPaper: false,
        editTestPaper: false, deleteTestPaper: false, publishTestPaper: false,
        archiveTestPaper: false, downloadTestPaper: false, createMapping: false,
        editMapping: false, publishMapping: false
      },
      export: {
        downloadCSV: false, exportToProduct: false
      },
      userMgmt: {
        viewUsers: false, createUsers: false, editUsers: false, deleteUsers: false,
        viewRoles: false, createRoles: false, editRoles: false, deleteRoles: false
      },
      tagging: {
        view: false, create: false, edit: false, delete: false
      }
    }
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [showCriticalWarning, setShowCriticalWarning] = useState(false);

  const handlePermissionChange = (path: string[], value: boolean) => {
    setFormData(prev => {
      const newPermissions = { ...prev.defaultPermissions };
      let current = newPermissions;
      
      for (let i = 0; i < path.length - 1; i++) {
        if (!current[path[i]]) {
          current[path[i]] = {};
        }
        current = current[path[i]];
      }
      
      current[path[path.length - 1]] = value;
      
      return {
        ...prev,
        defaultPermissions: newPermissions
      };
    });
  };

  const handleSave = () => {
    const newErrors: string[] = [];
    
    if (!formData.name.trim()) newErrors.push('Role name is required');
    if (!formData.description.trim()) newErrors.push('Role description is required');
    
    // Role name validation
    if (formData.name && formData.name.length < 3) {
      newErrors.push('Role name must be at least 3 characters long');
    }
    
    const hasPermissions = Object.values(formData.defaultPermissions).some(module =>
      Object.values(module).some(permission => permission)
    );
    
    if (!hasPermissions) newErrors.push('At least one permission must be selected');
    
    // Check for critical permissions that need confirmation
    const hasCriticalPermissions = 
      formData.defaultPermissions.userMgmt.createUsers ||
      formData.defaultPermissions.userMgmt.deleteUsers ||
      formData.defaultPermissions.userMgmt.createRoles ||
      formData.defaultPermissions.userMgmt.deleteRoles ||
      formData.defaultPermissions.cms.delete ||
      formData.defaultPermissions.lms.deleteWorksheet ||
      formData.defaultPermissions.lms.deleteTestPaper;
    
    setErrors(newErrors);
    
    if (newErrors.length === 0) {
      if (hasCriticalPermissions && !showCriticalWarning) {
        setShowCriticalWarning(true);
        return;
      }
      
      const roleData: Role = {
        id: editingRole?.id || '',
        name: formData.name,
        description: formData.description,
        defaultPermissions: formData.defaultPermissions
      };
      
      onSave(roleData);
    }
  };

  return (
    <div className="space-y-6">
      {showCriticalWarning && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You are assigning critical permissions (User Management, Delete operations). 
            This grants significant access to the system. Continue?
            <div className="mt-2 space-x-2">
              <Button size="sm" onClick={handleSave}>Continue</Button>
              <Button size="sm" variant="outline" onClick={() => setShowCriticalWarning(false)}>Review</Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertDescription>
            <ul className="list-disc list-inside">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="roleName">Role Name *</Label>
          <Input
            id="roleName"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter role name"
          />
        </div>
        <div>
          <Label htmlFor="roleDescription">Description *</Label>
          <Input
            id="roleDescription"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Enter role description"
          />
        </div>
      </div>

      <PermissionsMatrix 
        selectedRoles={[formData.name]}
        mergedPermissions={formData.defaultPermissions}
      />

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          {editingRole ? 'Update Role' : 'Save Role'}
        </Button>
      </div>
    </div>
  );
};

export default UserManagement;
