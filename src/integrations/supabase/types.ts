export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      assessment_audit: {
        Row: {
          action: string
          assessment_id: string
          id: string
          ip_address: unknown
          metadata: Json | null
          timestamp: string
          user_id: string
          user_name: string
        }
        Insert: {
          action: string
          assessment_id: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          timestamp?: string
          user_id: string
          user_name: string
        }
        Update: {
          action?: string
          assessment_id?: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          timestamp?: string
          user_id?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessment_audit_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      assessments: {
        Row: {
          allowed_question_types: Database["public"]["Enums"]["question_type"][]
          bloom_l1: number
          bloom_l2: number
          bloom_l3: number
          bloom_l4: number
          bloom_l5: number
          bloom_l6: number
          blueprint_id: string | null
          blueprint_name: string | null
          chapters: string[] | null
          created_at: string
          created_by: string
          created_by_name: string
          created_by_role: string
          download_count: number
          duration: number | null
          grade: number
          has_manual_questions: boolean | null
          id: string
          learning_outcomes: string[] | null
          manual_questions_count: number | null
          manual_questions_data: Json | null
          medium: string
          mode: Database["public"]["Enums"]["assessment_mode"]
          pdf_hash: string | null
          pdf_url: string | null
          question_ids: string[] | null
          repository: Database["public"]["Enums"]["repository_type"]
          source: Database["public"]["Enums"]["assessment_source"]
          status: Database["public"]["Enums"]["assessment_status"]
          title: string
          total_marks: number | null
          total_questions: number
          updated_at: string
        }
        Insert: {
          allowed_question_types: Database["public"]["Enums"]["question_type"][]
          bloom_l1?: number
          bloom_l2?: number
          bloom_l3?: number
          bloom_l4?: number
          bloom_l5?: number
          bloom_l6?: number
          blueprint_id?: string | null
          blueprint_name?: string | null
          chapters?: string[] | null
          created_at?: string
          created_by: string
          created_by_name: string
          created_by_role: string
          download_count?: number
          duration?: number | null
          grade: number
          has_manual_questions?: boolean | null
          id?: string
          learning_outcomes?: string[] | null
          manual_questions_count?: number | null
          manual_questions_data?: Json | null
          medium: string
          mode?: Database["public"]["Enums"]["assessment_mode"]
          pdf_hash?: string | null
          pdf_url?: string | null
          question_ids?: string[] | null
          repository?: Database["public"]["Enums"]["repository_type"]
          source: Database["public"]["Enums"]["assessment_source"]
          status?: Database["public"]["Enums"]["assessment_status"]
          title: string
          total_marks?: number | null
          total_questions: number
          updated_at?: string
        }
        Update: {
          allowed_question_types?: Database["public"]["Enums"]["question_type"][]
          bloom_l1?: number
          bloom_l2?: number
          bloom_l3?: number
          bloom_l4?: number
          bloom_l5?: number
          bloom_l6?: number
          blueprint_id?: string | null
          blueprint_name?: string | null
          chapters?: string[] | null
          created_at?: string
          created_by?: string
          created_by_name?: string
          created_by_role?: string
          download_count?: number
          duration?: number | null
          grade?: number
          has_manual_questions?: boolean | null
          id?: string
          learning_outcomes?: string[] | null
          manual_questions_count?: number | null
          manual_questions_data?: Json | null
          medium?: string
          mode?: Database["public"]["Enums"]["assessment_mode"]
          pdf_hash?: string | null
          pdf_url?: string | null
          question_ids?: string[] | null
          repository?: Database["public"]["Enums"]["repository_type"]
          source?: Database["public"]["Enums"]["assessment_source"]
          status?: Database["public"]["Enums"]["assessment_status"]
          title?: string
          total_marks?: number | null
          total_questions?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessments_blueprint_id_fkey"
            columns: ["blueprint_id"]
            isOneToOne: false
            referencedRelation: "blueprints"
            referencedColumns: ["id"]
          },
        ]
      }
      blueprint_audit: {
        Row: {
          action: string
          blueprint_id: string
          diff: Json | null
          id: string
          timestamp: string
          user_id: string
          user_name: string
        }
        Insert: {
          action: string
          blueprint_id: string
          diff?: Json | null
          id?: string
          timestamp?: string
          user_id: string
          user_name: string
        }
        Update: {
          action?: string
          blueprint_id?: string
          diff?: Json | null
          id?: string
          timestamp?: string
          user_id?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "blueprint_audit_blueprint_id_fkey"
            columns: ["blueprint_id"]
            isOneToOne: false
            referencedRelation: "blueprints"
            referencedColumns: ["id"]
          },
        ]
      }
      blueprints: {
        Row: {
          allowed_question_types: Database["public"]["Enums"]["question_type"][]
          bloom_l1: number
          bloom_l2: number
          bloom_l3: number
          bloom_l4: number
          bloom_l5: number
          bloom_l6: number
          created_at: string
          created_by: string
          duration: number | null
          id: string
          is_active: boolean
          mode: Database["public"]["Enums"]["assessment_mode"]
          name: string
          total_marks: number | null
          total_questions: number
          updated_at: string
          version: number
        }
        Insert: {
          allowed_question_types: Database["public"]["Enums"]["question_type"][]
          bloom_l1?: number
          bloom_l2?: number
          bloom_l3?: number
          bloom_l4?: number
          bloom_l5?: number
          bloom_l6?: number
          created_at?: string
          created_by: string
          duration?: number | null
          id?: string
          is_active?: boolean
          mode?: Database["public"]["Enums"]["assessment_mode"]
          name: string
          total_marks?: number | null
          total_questions: number
          updated_at?: string
          version?: number
        }
        Update: {
          allowed_question_types?: Database["public"]["Enums"]["question_type"][]
          bloom_l1?: number
          bloom_l2?: number
          bloom_l3?: number
          bloom_l4?: number
          bloom_l5?: number
          bloom_l6?: number
          created_at?: string
          created_by?: string
          duration?: number | null
          id?: string
          is_active?: boolean
          mode?: Database["public"]["Enums"]["assessment_mode"]
          name?: string
          total_marks?: number | null
          total_questions?: number
          updated_at?: string
          version?: number
        }
        Relationships: []
      }
      chapters: {
        Row: {
          chapter_number: number
          created_at: string
          id: string
          marks_weightage: number | null
          name: string
          periods: number | null
          subject_id: string
          unit_name: string | null
          updated_at: string
        }
        Insert: {
          chapter_number: number
          created_at?: string
          id?: string
          marks_weightage?: number | null
          name: string
          periods?: number | null
          subject_id: string
          unit_name?: string | null
          updated_at?: string
        }
        Update: {
          chapter_number?: number
          created_at?: string
          id?: string
          marks_weightage?: number | null
          name?: string
          periods?: number | null
          subject_id?: string
          unit_name?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chapters_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      csv_upload_jobs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          error_rows: number | null
          errors: Json | null
          file_name: string
          file_path: string | null
          id: string
          processed_rows: number | null
          state_id: string
          status: string | null
          total_rows: number | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          error_rows?: number | null
          errors?: Json | null
          file_name: string
          file_path?: string | null
          id?: string
          processed_rows?: number | null
          state_id: string
          status?: string | null
          total_rows?: number | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          error_rows?: number | null
          errors?: Json | null
          file_name?: string
          file_path?: string | null
          id?: string
          processed_rows?: number | null
          state_id?: string
          status?: string | null
          total_rows?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      jobs: {
        Row: {
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          input_file_name: string
          input_file_path: string
          job_config: Json
          result_file_path: string | null
          scheduled_for: string
          started_at: string | null
          status: Database["public"]["Enums"]["job_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          input_file_name: string
          input_file_path: string
          job_config: Json
          result_file_path?: string | null
          scheduled_for: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["job_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          input_file_name?: string
          input_file_path?: string
          job_config?: Json
          result_file_path?: string | null
          scheduled_for?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["job_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      knowledge_graph_fields: {
        Row: {
          created_at: string | null
          display_order: number | null
          field_type_id: string
          graph_id: string
          hierarchy_level: number
          id: string
          is_mandatory: boolean | null
          parent_field_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          field_type_id: string
          graph_id: string
          hierarchy_level: number
          id?: string
          is_mandatory?: boolean | null
          parent_field_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          field_type_id?: string
          graph_id?: string
          hierarchy_level?: number
          id?: string
          is_mandatory?: boolean | null
          parent_field_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_graph_fields_field_type_id_fkey"
            columns: ["field_type_id"]
            isOneToOne: false
            referencedRelation: "master_data_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_graph_fields_graph_id_fkey"
            columns: ["graph_id"]
            isOneToOne: false
            referencedRelation: "knowledge_graphs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_graph_fields_parent_field_id_fkey"
            columns: ["parent_field_id"]
            isOneToOne: false
            referencedRelation: "knowledge_graph_fields"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_graphs: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          display_name: string
          id: string
          is_active: boolean | null
          is_default: boolean | null
          name: string
          state_id: string
          updated_at: string | null
          version: number | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          display_name: string
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name: string
          state_id?: string
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          display_name?: string
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name?: string
          state_id?: string
          updated_at?: string | null
          version?: number | null
        }
        Relationships: []
      }
      learning_outcomes: {
        Row: {
          bloom_level: number
          chapter_id: string
          created_at: string
          id: string
          outcome_text: string
          updated_at: string
        }
        Insert: {
          bloom_level: number
          chapter_id: string
          created_at?: string
          id?: string
          outcome_text: string
          updated_at?: string
        }
        Update: {
          bloom_level?: number
          chapter_id?: string
          created_at?: string
          id?: string
          outcome_text?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_outcomes_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      master_data_audit: {
        Row: {
          action: Database["public"]["Enums"]["master_data_action"]
          id: string
          metadata: Json | null
          new_values: Json | null
          old_values: Json | null
          record_id: string
          state_id: string | null
          table_name: string
          timestamp: string | null
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          action: Database["public"]["Enums"]["master_data_action"]
          id?: string
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          record_id: string
          state_id?: string | null
          table_name: string
          timestamp?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          action?: Database["public"]["Enums"]["master_data_action"]
          id?: string
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string
          state_id?: string | null
          table_name?: string
          timestamp?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: []
      }
      master_data_entries: {
        Row: {
          created_at: string | null
          created_by: string | null
          graph_id: string | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          name: Json
          parent_id: string | null
          published_at: string | null
          published_by: string | null
          state_id: string
          status: string | null
          type_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          graph_id?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          name: Json
          parent_id?: string | null
          published_at?: string | null
          published_by?: string | null
          state_id: string
          status?: string | null
          type_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          graph_id?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          name?: Json
          parent_id?: string | null
          published_at?: string | null
          published_by?: string | null
          state_id?: string
          status?: string | null
          type_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "master_data_entries_graph_id_fkey"
            columns: ["graph_id"]
            isOneToOne: false
            referencedRelation: "knowledge_graphs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "master_data_entries_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "master_data_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "master_data_entries_type_id_fkey"
            columns: ["type_id"]
            isOneToOne: false
            referencedRelation: "master_data_types"
            referencedColumns: ["id"]
          },
        ]
      }
      master_data_types: {
        Row: {
          created_at: string | null
          display_name: string
          display_order: number | null
          id: string
          is_hierarchical: boolean | null
          is_mandatory: boolean | null
          name: string
          parent_type_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_name: string
          display_order?: number | null
          id?: string
          is_hierarchical?: boolean | null
          is_mandatory?: boolean | null
          name: string
          parent_type_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_name?: string
          display_order?: number | null
          id?: string
          is_hierarchical?: boolean | null
          is_mandatory?: boolean | null
          name?: string
          parent_type_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "master_data_types_parent_type_id_fkey"
            columns: ["parent_type_id"]
            isOneToOne: false
            referencedRelation: "master_data_types"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          id: string
        }
        Insert: {
          avatar_url?: string | null
          full_name?: string | null
          id: string
        }
        Update: {
          avatar_url?: string | null
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      publication_audit: {
        Row: {
          graph_id: string
          id: string
          publication_metadata: Json | null
          published_by: string
          published_by_name: string
          records_count: number
          timestamp: string | null
        }
        Insert: {
          graph_id: string
          id?: string
          publication_metadata?: Json | null
          published_by: string
          published_by_name: string
          records_count: number
          timestamp?: string | null
        }
        Update: {
          graph_id?: string
          id?: string
          publication_metadata?: Json | null
          published_by?: string
          published_by_name?: string
          records_count?: number
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "publication_audit_graph_id_fkey"
            columns: ["graph_id"]
            isOneToOne: false
            referencedRelation: "knowledge_graphs"
            referencedColumns: ["id"]
          },
        ]
      }
      state_field_config: {
        Row: {
          created_at: string | null
          field_type_id: string | null
          id: string
          is_active: boolean | null
          is_required: boolean | null
          state_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          field_type_id?: string | null
          id?: string
          is_active?: boolean | null
          is_required?: boolean | null
          state_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          field_type_id?: string | null
          id?: string
          is_active?: boolean | null
          is_required?: boolean | null
          state_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "state_field_config_field_type_id_fkey"
            columns: ["field_type_id"]
            isOneToOne: false
            referencedRelation: "master_data_types"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          board: string
          created_at: string
          grade: number
          id: string
          medium: string
          name: string
          updated_at: string
        }
        Insert: {
          board?: string
          created_at?: string
          grade: number
          id?: string
          medium?: string
          name: string
          updated_at?: string
        }
        Update: {
          board?: string
          created_at?: string
          grade?: number
          id?: string
          medium?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      theme_audit: {
        Row: {
          action: string
          field_changes: Json | null
          id: string
          theme_id: string
          timestamp: string
          user_id: string
          user_name: string
        }
        Insert: {
          action: string
          field_changes?: Json | null
          id?: string
          theme_id: string
          timestamp?: string
          user_id: string
          user_name: string
        }
        Update: {
          action?: string
          field_changes?: Json | null
          id?: string
          theme_id?: string
          timestamp?: string
          user_id?: string
          user_name?: string
        }
        Relationships: []
      }
      themes: {
        Row: {
          background_url: string | null
          button_color: string
          created_at: string
          created_by: string
          id: string
          logo_url: string | null
          primary_color: string
          secondary_color: string
          state_name: string
          updated_at: string
        }
        Insert: {
          background_url?: string | null
          button_color?: string
          created_at?: string
          created_by: string
          id?: string
          logo_url?: string | null
          primary_color?: string
          secondary_color?: string
          state_name: string
          updated_at?: string
        }
        Update: {
          background_url?: string | null
          button_color?: string
          created_at?: string
          created_by?: string
          id?: string
          logo_url?: string | null
          primary_color?: string
          secondary_color?: string
          state_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_api_keys: {
        Row: {
          created_at: string
          encrypted_key: string
          id: string
          is_active: boolean
          is_exhausted: boolean
          key_preview: string
          last_used_at: string | null
          provider: string
          user_id: string
        }
        Insert: {
          created_at?: string
          encrypted_key: string
          id?: string
          is_active?: boolean
          is_exhausted?: boolean
          key_preview: string
          last_used_at?: string | null
          provider: string
          user_id: string
        }
        Update: {
          created_at?: string
          encrypted_key?: string
          id?: string
          is_active?: boolean
          is_exhausted?: boolean
          key_preview?: string
          last_used_at?: string | null
          provider?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          state_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          state_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          state_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      videos: {
        Row: {
          created_at: string
          grade: number
          id: string
          mini_course_id: string | null
          mini_course_name: string | null
          mini_course_sequence: string | null
          node_description: string | null
          node_ids: string | null
          sub_topic: string | null
          sub_topic_vernacular: string | null
          subject: string
          topic: string
          topic_id: string | null
          topic_vernacular: string | null
          updated_at: string
          video_id: string | null
          video_medium: string | null
          video_name: string
          video_provider: string | null
          video_tags_keywords: string | null
          video_tags_keywords_vernacular: string | null
          youtube_channel: string | null
          youtube_url: string
        }
        Insert: {
          created_at?: string
          grade: number
          id?: string
          mini_course_id?: string | null
          mini_course_name?: string | null
          mini_course_sequence?: string | null
          node_description?: string | null
          node_ids?: string | null
          sub_topic?: string | null
          sub_topic_vernacular?: string | null
          subject: string
          topic: string
          topic_id?: string | null
          topic_vernacular?: string | null
          updated_at?: string
          video_id?: string | null
          video_medium?: string | null
          video_name: string
          video_provider?: string | null
          video_tags_keywords?: string | null
          video_tags_keywords_vernacular?: string | null
          youtube_channel?: string | null
          youtube_url: string
        }
        Update: {
          created_at?: string
          grade?: number
          id?: string
          mini_course_id?: string | null
          mini_course_name?: string | null
          mini_course_sequence?: string | null
          node_description?: string | null
          node_ids?: string | null
          sub_topic?: string | null
          sub_topic_vernacular?: string | null
          subject?: string
          topic?: string
          topic_id?: string | null
          topic_vernacular?: string | null
          updated_at?: string
          video_id?: string | null
          video_medium?: string | null
          video_name?: string
          video_provider?: string | null
          video_tags_keywords?: string | null
          video_tags_keywords_vernacular?: string | null
          youtube_channel?: string | null
          youtube_url?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "system_admin"
        | "state_admin"
        | "lead_admin"
        | "content_creator"
      assessment_mode: "FA" | "SA"
      assessment_source: "Automated" | "Customised" | "CSV Upload" | "OCR"
      assessment_status: "Generated" | "Assigned" | "Archived"
      job_status: "pending" | "running" | "completed" | "failed" | "cancelled"
      master_data_action: "CREATE" | "UPDATE" | "DELETE" | "BULK_UPLOAD"
      question_type:
        | "MCQ"
        | "FITB"
        | "TF"
        | "Match"
        | "Short-Answer"
        | "Long-Answer"
        | "RC"
      repository_type: "Public" | "Private"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "system_admin",
        "state_admin",
        "lead_admin",
        "content_creator",
      ],
      assessment_mode: ["FA", "SA"],
      assessment_source: ["Automated", "Customised", "CSV Upload", "OCR"],
      assessment_status: ["Generated", "Assigned", "Archived"],
      job_status: ["pending", "running", "completed", "failed", "cancelled"],
      master_data_action: ["CREATE", "UPDATE", "DELETE", "BULK_UPLOAD"],
      question_type: [
        "MCQ",
        "FITB",
        "TF",
        "Match",
        "Short-Answer",
        "Long-Answer",
        "RC",
      ],
      repository_type: ["Public", "Private"],
    },
  },
} as const
