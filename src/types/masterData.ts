export interface MasterDataType {
  id: string;
  name: string;
  display_name: string;
  is_mandatory: boolean;
  is_hierarchical: boolean;
  parent_type_id: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface StateFieldConfig {
  id: string;
  state_id: string;
  field_type_id: string;
  is_active: boolean;
  is_required: boolean;
  created_at: string;
  updated_at: string;
  master_data_types?: MasterDataType;
}

export interface MasterDataEntry {
  id: string;
  type_id: string;
  name: Record<string, string>; // Multi-language support
  parent_id: string | null;
  state_id: string;
  metadata: Record<string, any>;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  master_data_types?: MasterDataType;
  parent?: MasterDataEntry;
  children?: MasterDataEntry[];
}

export interface CSVUploadJob {
  id: string;
  user_id: string;
  state_id: string;
  file_name: string;
  file_path: string | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  total_rows: number;
  processed_rows: number;
  error_rows: number;
  errors: Array<{
    row: number;
    column: string;
    message: string;
  }>;
  created_at: string;
  completed_at: string | null;
}

export interface MasterDataAudit {
  id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'BULK_UPLOAD';
  table_name: string;
  record_id: string;
  old_values: Record<string, any> | null;
  new_values: Record<string, any> | null;
  user_id: string;
  user_name: string | null;
  state_id: string | null;
  metadata: Record<string, any>;
  timestamp: string;
}

export interface ColumnMapping {
  csvColumn: string;
  dbField: string;
  isRequired: boolean;
  sampleValue?: string;
}

export interface ValidationError {
  row: number;
  column: string;
  message: string;
  value?: string;
}

export interface ProcessingResult {
  success: boolean;
  totalRows: number;
  processedRows: number;
  errorRows: number;
  errors: ValidationError[];
  jobId?: string;
}