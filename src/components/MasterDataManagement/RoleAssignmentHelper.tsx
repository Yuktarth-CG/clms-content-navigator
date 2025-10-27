import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, CheckCircle } from 'lucide-react';
import { useUserRoles } from '@/hooks/useUserRoles';
import { assignMockRole } from '@/utils/mockRoleAssignment';
import { useToast } from '@/hooks/use-toast';

const RoleAssignmentHelper = () => {
  const { toast } = useToast();
  const { data: currentRoles, refetch } = useUserRoles();
  const [assigning, setAssigning] = useState(false);

  const roles = [
    {
      role: 'system_admin' as const,
      title: 'System Admin',
      description: 'Can create and manage Knowledge Graphs',
      color: 'bg-red-500',
    },
    {
      role: 'lead_admin' as const,
      title: 'Lead Admin',
      description: 'Can publish draft data to live',
      color: 'bg-orange-500',
    },
    {
      role: 'state_admin' as const,
      title: 'State Admin',
      description: 'Can upload and manage draft data',
      color: 'bg-blue-500',
    },
    {
      role: 'content_creator' as const,
      title: 'Content Creator',
      description: 'Can create content using live data',
      color: 'bg-green-500',
    },
  ];

  const handleAssignRole = async (role: typeof roles[0]['role']) => {
    setAssigning(true);
    try {
      await assignMockRole(role);
      await refetch();
      toast({
        title: "Role Assigned",
        description: `You now have ${role.replace('_', ' ')} access`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setAssigning(false);
    }
  };

  const hasRole = (role: string) => {
    return currentRoles?.some(r => r.role === role) || false;
  };

  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Role Assignment (Mock/Testing)
        </CardTitle>
        <CardDescription>
          For testing purposes, assign yourself roles to access different features
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {roles.map((roleInfo) => (
            <div
              key={roleInfo.role}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${roleInfo.color}`} />
                <div>
                  <p className="font-medium">{roleInfo.title}</p>
                  <p className="text-sm text-muted-foreground">{roleInfo.description}</p>
                </div>
              </div>
              {hasRole(roleInfo.role) ? (
                <Badge variant="secondary">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAssignRole(roleInfo.role)}
                  disabled={assigning}
                >
                  Assign
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RoleAssignmentHelper;
