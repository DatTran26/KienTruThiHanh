import type { Database } from './database';

// Table row types
export type OrgProfile = Database['public']['Tables']['organization_profiles']['Row'];
export type MasterItem = Database['public']['Tables']['master_items']['Row'];
export type AnalysisRequest = Database['public']['Tables']['analysis_requests']['Row'];
export type Report = Database['public']['Tables']['reports']['Row'];
export type ReportItem = Database['public']['Tables']['report_items']['Row'];
export type MasterVersion = Database['public']['Tables']['master_document_versions']['Row'];

// Analysis types
export interface AnalysisResult {
  groupCode: string;
  groupTitle: string;
  subCode: string;
  subTitle: string;
  matchedContent: string;
  amount: number | null;
  confidence: number;
  reason: string;
  itemId?: string;
}

export interface AnalysisResponse {
  requestId: string;
  amount: number | null;
  results: AnalysisResult[];
}

// Org validation types
export interface OrgFieldResult {
  matched: boolean;
  isNearMatch: boolean;
  score: number;
  suggestion?: string;
}

export interface OrgValidationResult {
  isMatch: boolean;
  overallScore: number;
  fields: {
    unitName: OrgFieldResult;
    address: OrgFieldResult;
    taxCode: OrgFieldResult;
  };
}
