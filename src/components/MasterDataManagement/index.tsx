import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MasterDataDashboard from './MasterDataDashboard';
import KnowledgeGraphList from './KnowledgeGraphs/KnowledgeGraphList';
import KnowledgeGraphCreator from './KnowledgeGraphs/KnowledgeGraphCreator';
import DraftUploadInterface from './Upload/DraftUploadInterface';
import DataView from './DataView/DataView';

const MasterDataManagement = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <Routes>
        <Route index element={<MasterDataDashboard />} />
        <Route path="knowledge-graphs" element={<KnowledgeGraphList />} />
        <Route path="knowledge-graphs/create" element={<KnowledgeGraphCreator />} />
        <Route path="upload" element={<DraftUploadInterface />} />
        <Route path="data-view" element={<DataView />} />
      </Routes>
    </div>
  );
};

export default MasterDataManagement;