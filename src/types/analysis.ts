export interface AnalysisResult {
  groupCode: string;
  groupTitle: string;
  subCode: string;
  subTitle: string;
  description: string | null;
  amount: number | null;
  confidence: number;  // 0.0 – 1.0
  reason: string;
}

export interface ExpenseGroup {
  originalDesc: string;
  amount: number | null;
  bestItem: AnalysisResult;
  alternatives: AnalysisResult[];
}

export interface AnalysisResponse {
  requestId: string;
  amount: number | null;
  results: AnalysisResult[];
  expenseGroups?: ExpenseGroup[];
  /** "high" ≥0.85 | "medium" 0.60–0.84 | "low" <0.60 */
  confidenceLevel: 'high' | 'medium' | 'low';
}
