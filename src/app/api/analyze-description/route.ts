import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { normalizeText } from '@/lib/utils/text-normalize';
import { extractAmount, stripAmountTokens } from '@/lib/utils/amount-extractor';
import { searchCandidates } from '@/lib/matching/pg-trgm-search';
import { rerankWithOpenAI } from '@/lib/matching/openai-rerank';
import { extractExpensesFromPrompt } from '@/lib/matching/openai-multi-extractor';
import type { AnalysisResponse, AnalysisResult, ExpenseGroup } from '@/types/analysis';

const InputSchema = z.object({
  description: z.string().min(3).max(5000),
  orgProfileId: z.string().uuid().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = InputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
    }
    const { description, orgProfileId } = parsed.data;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // AI extracting multiple expenses (if present)
    const extractedList = await extractExpensesFromPrompt(description);

    const expenseGroups: ExpenseGroup[] = [];
    let overallMinConfidence = 1.0;

    for (const ex of extractedList) {
      const cleanDesc = stripAmountTokens(ex.originalDesc);
      const normalizedQuery = normalizeText(cleanDesc);

      let candidates;
      try {
        candidates = await searchCandidates(supabase, normalizedQuery);
      } catch (err: unknown) {
        if (err instanceof Error && err.message === 'NO_ACTIVE_VERSION') {
          return NextResponse.json(
            { error: 'Chưa có dữ liệu danh mục. Vui lòng yêu cầu admin tải lên file danh mục.' },
            { status: 422 },
          );
        }
        throw err;
      }

      if (!candidates.length) continue;

      const rerank = await rerankWithOpenAI(ex.originalDesc, candidates);

      const bestCandidate = candidates[rerank.best_index - 1];
      if (!bestCandidate) continue;

      const altCandidates = rerank.alternatives
        .map(i => candidates[i - 1])
        .filter(Boolean)
        .slice(0, 2);

      const toResult = (c: typeof bestCandidate, confidence: number, reason: string): AnalysisResult => ({
        groupCode: c.group_code,
        groupTitle: c.group_title,
        subCode: c.sub_code,
        subTitle: c.sub_title,
        description: c.description,
        amount: ex.amount,
        confidence,
        reason,
      });

      overallMinConfidence = Math.min(overallMinConfidence, rerank.confidence);

      const groupBest = toResult(bestCandidate, rerank.confidence, rerank.reason);
      const groupAlts = altCandidates.map(c => toResult(c, c.similarity_score, ''));

      expenseGroups.push({
        originalDesc: ex.originalDesc,
        amount: ex.amount,
        bestItem: groupBest,
        alternatives: groupAlts,
      });
    }

    if (!expenseGroups.length) {
      return NextResponse.json(
        { error: 'Không tìm thấy mục phù hợp. Hãy thử mô tả chi tiết hơn.' },
        { status: 404 },
      );
    }

    const confidenceLevel = overallMinConfidence >= 0.85 ? 'high' : overallMinConfidence >= 0.6 ? 'medium' : 'low';

    // Backwards compatibility for DB storing (uses first item)
    const firstGroup = expenseGroups[0];
    const results: AnalysisResult[] = [firstGroup.bestItem, ...firstGroup.alternatives];

    // Persist analysis request
    const { data: saved } = await supabase
      .from('analysis_requests')
      .insert({
        user_id: user.id,
        organization_profile_id: orgProfileId ?? null,
        raw_description: description,
        extracted_amount: firstGroup.amount,
        top_result_json: results as unknown as import('@/types/database').Json,
        selected_item_id: firstGroup.bestItem.subCode, // DB doesn't strongly FK on id, keeping a string fallback
        confidence: firstGroup.bestItem.confidence,
      })
      .select('id')
      .single();

    const response: AnalysisResponse = {
      requestId: saved?.id ?? '',
      amount: firstGroup.amount,
      results,
      expenseGroups,
      confidenceLevel,
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error('[analyze-description]', err);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
