import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database, Upload, Settings, Eye, Plus, BarChart3 } from 'lucide-react';
import { useMasterDataEntries, useMasterDataTypes } from '@/hooks/useMasterData';

const MasterDataDashboard = () => {
  const { data: masterDataTypes } = useMasterDataTypes();
  const { data: entries } = useMasterDataEntries('default'); // Using 'default' as demo state

  const totalEntries = entries?.length || 0;
  const totalTypes = masterDataTypes?.length || 0;

  const dashboardCards = [
    {
      title: 'Manual Entry',
      description: 'Add, edit, and manage individual master data records through a user-friendly interface.',
      icon: Plus,
      href: '/master-data/manual-entry',
      color: 'bg-blue-500',
    },
    {
      title: 'CSV Upload',
      description: 'Bulk upload master data using CSV files with automatic validation and error reporting.',
      icon: Upload,
      href: '/master-data/csv-upload',
      color: 'bg-green-500',
    },
    {
      title: 'Hierarchy Configuration',
      description: 'Configure your state\'s unique curriculum hierarchy and field requirements.',
      icon: Settings,
      href: '/master-data/hierarchy-config',
      color: 'bg-purple-500',
    },
    {
      title: 'View Data',
      description: 'Browse, search, and manage all your master data entries in a comprehensive interface.',
      icon: Eye,
      href: '/master-data/data-view',
      color: 'bg-orange-500',
    },
  ];

  const stats = [
    {
      title: 'Total Data Types',
      value: totalTypes,
      icon: Database,
      description: 'Configured data types',
    },
    {
      title: 'Total Entries',
      value: totalEntries,
      icon: BarChart3,
      description: 'Master data records',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {dashboardCards.map((card, index) => (
          <Card key={index} className="transition-all hover:shadow-lg">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg ${card.color} text-white`}>
                  <card.icon className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-xl">{card.title}</CardTitle>
                  <CardDescription className="mt-2">{card.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Link to={card.href}>
                <Button className="w-full">
                  Get Started
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Access Section */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks and shortcuts for efficient master data management.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/master-data/manual-entry">
              <Button variant="outline" className="w-full justify-start">
                <Plus className="mr-2 h-4 w-4" />
                Add New Entry
              </Button>
            </Link>
            <Link to="/master-data/csv-upload">
              <Button variant="outline" className="w-full justify-start">
                <Upload className="mr-2 h-4 w-4" />
                Bulk Upload
              </Button>
            </Link>
            <Link to="/master-data/data-view">
              <Button variant="outline" className="w-full justify-start">
                <Eye className="mr-2 h-4 w-4" />
                Browse Data
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MasterDataDashboard;