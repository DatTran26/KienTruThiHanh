import OpenAI from 'openai';
import type { SearchCandidate } from './pg-trgm-search';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface RerankResult {
  best_index: number;       // 1-based index into candidates array
  confidence: number;       // 0.0 – 1.0
  reason: string;           // explanation in Vietnamese or English
  alternatives: number[];   // 1-based indices of 2nd/3rd choices
}

const SYSTEM_PROMPT = `You are a Vietnamese government expense classification assistant.
Given a user's expense description and candidate budget items from the database, select the most appropriate match.
IMPORTANT: Only choose from the provided candidates — never invent new codes or descriptions.
Return a JSON object only.`;

/**
 * Ask OpenAI gpt-4o-mini to rerank pg_trgm candidates and pick the best match.
 * Falls back to top trgm result if OpenAI call fails or returns malformed JSON.
 */
export async function rerankWithOpenAI(
  description: string,
  candidates: SearchCandidate[],
): Promise<RerankResult> {
  if (!candidates.length) {
    throw new Error('NO_CANDIDATES');
  }

  // Fallback if no API key configured
  if (!process.env.OPENAI_API_KEY) {
    return { best_index: 1, confidence: candidates[0].similarity_score, reason: 'Kết quả khớp gần nhất.', alternatives: [2, 3] };
  }

  const candidateList = candidates
    .map((c, i) => `${i + 1}. [${c.group_code}-${c.sub_code}] ${c.sub_title}${c.description ? '. ' + c.description : ''}`)
    .join('\n');

  const userPrompt = `User expense description: "${description}"

Candidate budget items:
${candidateList}

Return JSON with exactly these fields:
{
  "best_index": <1-based integer>,
  "confidence": <float 0.0 to 1.0>,
  "reason": "<1-2 sentence explanation in Vietnamese>",
  "alternatives": [<second_best_index_or_null>, <third_best_index_or_null>]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
      max_tokens: 300,
    });

    const raw = response.choices[0]?.message?.content;
    if (!raw) throw new Error('Empty OpenAI response');

    const parsed = JSON.parse(raw) as RerankResult;

    // Validate indices are in range
    const clamp = (n: unknown) => {
      const i = Number(n);
      return i >= 1 && i <= candidates.length ? i : 1;
    };
    return {
      best_index: clamp(parsed.best_index),
      confidence: Math.max(0, Math.min(1, Number(parsed.confidence) || 0.5)),
      reason: String(parsed.reason || ''),
      alternatives: (parsed.alternatives ?? []).map(clamp).filter(i => i !== clamp(parsed.best_index)),
    };
  } catch (err) {
    console.error('[openai-rerank] error:', err);
    // Fallback: return top trgm result with its similarity score as confidence
    return {
      best_index: 1,
      confidence: candidates[0].similarity_score,
      reason: 'Kết quả tìm kiếm gần nhất (AI không khả dụng).',
      alternatives: candidates.length > 1 ? [2] : [],
    };
  }
}
