import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

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

interface RawScores {
  tax_code_match: boolean;
  unit_name_score: number;
  address_score: number;
  ref_unit_name: string;
  ref_address: string;
  ref_tax_code: string;
  error?: string;
}

const THRESHOLDS = {
  unitName: { matched: 0.85, nearMatch: 0.65 },
  address:  { matched: 0.75, nearMatch: 0.50 },
};

function classifyField(score: number, t: { matched: number; nearMatch: number }, refValue: string): OrgFieldResult {
  return {
    score,
    matched: score >= t.matched,
    isNearMatch: score >= t.nearMatch && score < t.matched,
    suggestion: score < t.matched ? refValue : undefined,
  };
}

/**
 * Calls the validate_org_fields Supabase function and maps raw scores
 * to per-field results with matched/near_match classification.
 */
export async function validateOrgFields(
  supabase: SupabaseClient<Database>,
  unitName: string,
  address: string,
  taxCode: string,
): Promise<OrgValidationResult> {
  const { data, error } = await supabase.rpc('validate_org_fields', {
    p_unit_name: unitName,
    p_address: address,
    p_tax_code: taxCode,
  });

  if (error) throw new Error(error.message);

  const raw = data as unknown as RawScores;
  if (raw.error) throw new Error(raw.error);

  const unitNameResult = classifyField(raw.unit_name_score, THRESHOLDS.unitName, raw.ref_unit_name);
  const addressResult  = classifyField(raw.address_score,   THRESHOLDS.address,  raw.ref_address);
  const taxCodeResult: OrgFieldResult = {
    score: raw.tax_code_match ? 1 : 0,
    matched: raw.tax_code_match,
    isNearMatch: false,
    suggestion: raw.tax_code_match ? undefined : raw.ref_tax_code,
  };

  const isMatch =
    (unitNameResult.matched || unitNameResult.isNearMatch) &&
    (addressResult.matched  || addressResult.isNearMatch) &&
    taxCodeResult.matched;

  const overallScore = (raw.unit_name_score + raw.address_score + (raw.tax_code_match ? 1 : 0)) / 3;

  return { isMatch, overallScore, fields: { unitName: unitNameResult, address: addressResult, taxCode: taxCodeResult } };
}
