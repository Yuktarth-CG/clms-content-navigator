import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MasterDataDashboard from './MasterDataDashboard';
import ManualEntry from './ManualEntry/ManualEntry';
import CSVUpload from './CSVUpload/CSVUpload';
import HierarchyConfig from './Configuration/HierarchyConfig';
import DataView from './DataView/DataView';

const MasterDataManagement = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold text-foreground">Master Data Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage your curriculum framework and content taxonomy with flexible data management tools.
        </p>
      </div>
      
      <Routes>
        <Route index element={<MasterDataDashboard />} />
        <Route path="manual-entry" element={<ManualEntry />} />
        <Route path="csv-upload" element={<CSVUpload />} />
        <Route path="hierarchy-config" element={<HierarchyConfig />} />
        <Route path="data-view" element={<DataView />} />
      </Routes>
    </div>
  );
};

export default MasterDataManagement;