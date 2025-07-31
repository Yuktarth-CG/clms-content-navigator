
import React from 'react';
import BulkImport from './BulkImport';

// This is a wrapper to maintain backward compatibility
// The main BulkImport component now handles both users and roles as per PRD 6.6
const CombinedBulkImport = () => {
  return <BulkImport />;
};

export default CombinedBulkImport;
