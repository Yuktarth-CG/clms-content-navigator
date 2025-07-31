
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ClipboardList, BookOpen, Shield, Globe } from 'lucide-react';
import CreateAssessments from './CreateAssessments';

const QuestionPaperCreation = () => {
  const [activeTab, setActiveTab] = useState('worksheet');

  return <CreateAssessments />;
};

export default QuestionPaperCreation;
