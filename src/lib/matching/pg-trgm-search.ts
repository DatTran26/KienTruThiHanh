import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

export type SearchCandidate = Database['public']['Functions']['search_master_items']['Returns'][number];

/**
 * Search master items using pg_trgm similarity on normalized_text + keywords.
 * Falls back to ILIKE search if similarity returns < 3 results.
 */
export async function searchCandidates(
  supabase: SupabaseClient<Database>,
  normalizedQuery: string,
  limit = 10,
): Promise<SearchCandidate[]> {
  // Get active version
  const { data: version, error: versionError } = await supabase
    .from('master_document_versions')
    .select('id')
    .eq('is_active', true)
    .single();

  if (versionError || !version) {
    if (versionError?.code === 'PGRST116') {
      throw new Error('NO_ACTIVE_VERSION');
    }
    console.error('[searchCandidates] version fetch error:', versionError);
    throw new Error('VERSION_FETCH_FAILED');
  }

  // Primary: pg_trgm similarity search
  const { data: trgmResults } = await supabase.rpc('search_master_items', {
    query_text: normalizedQuery,
    version_uuid: version.id,
    similarity_threshold: 0.1,
    result_limit: limit,
  });

  if (trgmResults && trgmResults.length >= 3) {
    return trgmResults;
  }

  // Fallback: ILIKE on normalized_text for very short or unusual inputs
  const { data: ilikeResults } = await supabase
    .from('master_items')
    .select('id, group_code, group_title, sub_code, sub_title, description, keywords')
    .eq('version_id', version.id)
    .eq('is_active', true)
    .ilike('normalized_text', `%${normalizedQuery.slice(0, 30)}%`)
    .limit(limit);

  if (!ilikeResults?.length) return trgmResults ?? [];

  // Merge: trgm results first, then ILIKE extras not already present
  const seen = new Set((trgmResults ?? []).map(r => r.id));
  const merged: SearchCandidate[] = [...(trgmResults ?? [])];
  for (const r of ilikeResults) {
    if (!seen.has(r.id)) {
      merged.push({ ...r, similarity_score: 0 });
    }
  }
  return merged.slice(0, limit);
}
