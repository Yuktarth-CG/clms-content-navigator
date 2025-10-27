import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, GitBranch, CheckCircle2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useKnowledgeGraphs, useDeleteKnowledgeGraph } from '@/hooks/useKnowledgeGraphs';
import { useHasRole } from '@/hooks/useUserRoles';

const KnowledgeGraphList = () => {
  const navigate = useNavigate();
  const { data: graphs, isLoading } = useKnowledgeGraphs();
  const deleteGraph = useDeleteKnowledgeGraph();
  const { hasRole: isSystemAdmin } = useHasRole('system_admin');

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this knowledge graph?')) {
      await deleteGraph.mutateAsync(id);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Knowledge Graphs</h2>
          <p className="text-muted-foreground mt-2">
            Manage curriculum structures for different contexts
          </p>
        </div>
        {isSystemAdmin && (
          <Button onClick={() => navigate('/master-data/knowledge-graphs/create')}>
            <Plus className="h-4 w-4 mr-2" />
            Create Knowledge Graph
          </Button>
        )}
      </div>

      {!graphs || graphs.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <GitBranch className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Knowledge Graphs</h3>
              <p className="text-muted-foreground mb-4">
                Create your first knowledge graph to define curriculum structures
              </p>
              {isSystemAdmin && (
                <Button onClick={() => navigate('/master-data/knowledge-graphs/create')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Knowledge Graph
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {graphs.map((graph) => (
            <Card key={graph.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {graph.display_name}
                      {graph.is_default && (
                        <Badge variant="secondary">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Default
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {graph.description || 'No description'}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Version:</span>
                    <Badge variant="outline">v{graph.version}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">State:</span>
                    <span className="font-medium">{graph.state_id}</span>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate(`/master-data/knowledge-graphs/${graph.id}`)}
                    >
                      View Details
                    </Button>
                    {isSystemAdmin && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(graph.id)}
                        disabled={deleteGraph.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default KnowledgeGraphList;
