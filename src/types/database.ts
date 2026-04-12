export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      organization_profiles: {
        Row: {
          id: string;
          user_id: string;
          unit_name: string;
          address: string;
          tax_code: string;
          validation_status: 'pending' | 'matched' | 'near_match' | 'no_match';
          matched_version_id: string | null;
          validation_result: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['organization_profiles']['Row'], 'id' | 'created_at' | 'updated_at' | 'matched_version_id' | 'validation_result'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
          validation_status?: 'pending' | 'matched' | 'near_match' | 'no_match';
          matched_version_id?: string | null;
          validation_result?: Json | null;
        };
        Update: Partial<Database['public']['Tables']['organization_profiles']['Insert']>;
        Relationships: [];
      };
      master_document_versions: {
        Row: {
          id: string;
          file_name: string;
          file_type: string;
          storage_path: string | null;
          version_no: number;
          uploaded_by: string | null;
          uploaded_at: string;
          is_active: boolean;
          checksum: string | null;
          item_count: number | null;
          parse_errors: Json | null;
          doc_title: string | null;
          doc_period: string | null;
          effective_date: string | null;
          ai_model: string | null;
          doc_unit: string | null;
          parsed_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['master_document_versions']['Row'], 'id' | 'uploaded_at' | 'doc_title' | 'doc_period' | 'effective_date' | 'ai_model' | 'doc_unit' | 'parsed_at'> & {
          id?: string;
          uploaded_at?: string;
          is_active?: boolean;
          item_count?: number | null;
          parse_errors?: Json | null;
          doc_title?: string | null;
          doc_period?: string | null;
          effective_date?: string | null;
          ai_model?: string | null;
          doc_unit?: string | null;
          parsed_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['master_document_versions']['Insert']>;
        Relationships: [];
      };
      master_items: {
        Row: {
          id: string;
          version_id: string;
          group_code: string;
          group_title: string;
          sub_code: string;
          sub_title: string;
          description: string | null;
          normalized_text: string | null;
          keywords: string[] | null;
          is_active: boolean;
          notes: string | null;
          source_row: number | null;
        };
        Insert: Omit<Database['public']['Tables']['master_items']['Row'], 'id' | 'notes' | 'source_row'> & {
          id?: string;
          is_active?: boolean;
          notes?: string | null;
          source_row?: number | null;
        };
        Update: Partial<Database['public']['Tables']['master_items']['Insert']>;
        Relationships: [];
      };
      analysis_requests: {
        Row: {
          id: string;
          user_id: string;
          organization_profile_id: string | null;
          raw_description: string;
          extracted_amount: number | null;
          top_result_json: Json | null;
          selected_item_id: string | null;
          confidence: number | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['analysis_requests']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['analysis_requests']['Insert']>;
        Relationships: [];
      };
      reports: {
        Row: {
          id: string;
          user_id: string;
          organization_profile_id: string | null;
          report_code: string | null;
          report_name: string;
          total_amount: number;
          status: 'draft' | 'exported';
          exported_file_path: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['reports']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
          total_amount?: number;
          status?: 'draft' | 'exported';
          organization_profile_id?: string | null;
          exported_file_path?: string | null;
        };
        Update: Partial<Database['public']['Tables']['reports']['Insert']>;
        Relationships: [];
      };
      report_items: {
        Row: {
          id: string;
          report_id: string;
          analysis_request_id: string | null;
          group_code: string | null;
          group_title: string | null;
          sub_code: string | null;
          sub_title: string | null;
          expense_content: string | null;
          amount: number;
          note: string | null;
          sort_order: number | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['report_items']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['report_items']['Insert']>;
        Relationships: [];
      };
      org_reference: {
        Row: {
          id: string;
          unit_name: string;
          address: string | null;
          tax_code: string | null;
          normalized_name: string | null;
        };
        Insert: Omit<Database['public']['Tables']['org_reference']['Row'], 'id'> & { id?: string };
        Update: Partial<Database['public']['Tables']['org_reference']['Insert']>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
    Functions: {
      search_master_items: {
        Args: {
          query_text: string;
          version_uuid: string;
          similarity_threshold?: number;
          result_limit?: number;
        };
        Returns: {
          id: string;
          group_code: string;
          group_title: string;
          sub_code: string;
          sub_title: string;
          description: string | null;
          keywords: string[] | null;
          similarity_score: number;
        }[];
      };
      validate_org_fields: {
        Args: { p_unit_name: string; p_address: string; p_tax_code: string };
        Returns: Json;
      };
    };
  };
}
