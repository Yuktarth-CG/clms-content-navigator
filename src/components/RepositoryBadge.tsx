
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Lock, Globe } from 'lucide-react';
import { RepositoryType } from '@/types/content';

interface RepositoryBadgeProps {
  repository: RepositoryType;
  className?: string;
}

const RepositoryBadge = ({ repository, className }: RepositoryBadgeProps) => {
  const isPrivate = repository === 'Private';
  
  return (
    <Badge 
      className={`flex items-center space-x-1 ${
        isPrivate 
          ? 'bg-gray-800 text-white hover:bg-gray-700' 
          : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
      } ${className || ''}`}
    >
      {isPrivate ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
      <span>{repository}</span>
    </Badge>
  );
};

export default RepositoryBadge;
