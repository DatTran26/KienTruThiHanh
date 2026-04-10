# Phase 3: Analyze Description API + UI

**Day:** 3 | **Priority:** P1 | **Status:** Pending | **Effort:** ~8h

**Context:** [Brainstorm report](../reports/brainstorm-260409-1448-system-design.md) | [plan.md](./plan.md)

---

## Overview

The core "wow" feature. User types a natural-language Vietnamese expense description → system returns AI-ranked budget code suggestions with confidence scores and explanations. This is the highest-value phase — allocate most of Day 3 here.

---

## Key Insights

- **pg_trgm handles fuzzy + exact matching** — no need for separate synonym expansion. OpenAI handles synonyms during reranking.
- Query against `normalized_text` (unaccented): run same normalization on user input before querying.
- The `similarity()` threshold of `0.1` is intentionally low — OpenAI will rerank; cast a wide net with pg_trgm.
- **Amount extraction happens client-side before API call** — simpler than doing it server-side only.
- Store `top_result_json` as JSONB — the raw OpenAI response stays available for debugging.
- OpenAI call can take 2-5s — use streaming or show animated skeleton while loading.
- When no active version exists, return a clear error (not a crash).

---

## Matching Pipeline

```
User input (Vietnamese)
  → normalizeText() → accent-stripped, lowercased
  → extractAmount() → strip amount from text
  → pg_trgm similarity search:
      SELECT * FROM master_items
      WHERE is_active AND version_id = active_version
        AND similarity(normalized_text, $query) > 0.1
      ORDER BY similarity DESC LIMIT 10
  → If < 3 results: fallback to ILIKE %keyword% search
  → OpenAI reranking with top 10 candidates
  → Parse OpenAI response → confidence classification
  → Return top 1 (≥0.85) or top 3 (0.6–0.84) or ask for more detail (<0.6)
```

---

## Requirements

- API: `POST /api/analyze-description`
  - Input: `{ description: string, orgProfileId?: string }`
  - Output: `{ amount, results: AnalysisResult[], requestId }`
- UI: expense analysis page with textarea + result cards
- Results: best match card (prominent) + up to 2 alternative cards
- Each card shows: group_code badge, sub_code badge, title, explanation, amount, confidence %
- "Add to report" button on each result card
- Analysis saved to `analysis_requests` table

---

## Architecture

```
src/
  app/
    (protected)/
      analyze/
        page.tsx          ← main analysis page
        _components/
          description-form.tsx    ← textarea + analyze button
          result-card.tsx         ← single result card
          result-section.tsx      ← best + alternatives layout
  app/api/
    analyze-description/
      route.ts            ← POST handler
  lib/
    matching/
      pg-trgm-search.ts   ← Supabase query for candidates
      openai-rerank.ts    ← OpenAI reranking call
    utils/
      amount-extractor.ts ← extract numeric amounts from text
      text-normalize.ts   ← (from Phase 2)
  types/
    analysis.ts           ← AnalysisResult, AnalysisResponse types
```

---

## Amount Extraction

```typescript
// src/lib/utils/amount-extractor.ts

export function extractAmount(text: string): number | null {
  // Patterns (in order of priority):
  // 1. "100k" → 100000
  // 2. "100.000" or "100,000" → 100000
  // 3. Plain number followed by currency: "100000 đồng", "100000 VND"

  const patterns = [
    { regex: /(\d+(?:[.,]\d{3})*)\s*(?:vnđ|vnd|đồng|đ)\b/gi, multiplier: 1 },
    { regex: /(\d+)k\b/gi, multiplier: 1000 },
    { regex: /(\d+(?:[.,]\d{3})+)(?!\s*%)/g, multiplier: 1 },
  ];

  for (const { regex, multiplier } of patterns) {
    const match = regex.exec(text);
    if (match) {
      const num = parseFloat(match[1].replace(/[.,]/g, ''));
      if (!isNaN(num)) return num * multiplier;
    }
  }
  return null;
}
```

---

## pg_trgm Search

```typescript
// src/lib/matching/pg-trgm-search.ts

export async function searchCandidates(
  supabase: SupabaseClient,
  normalizedQuery: string,
  limit = 10
): Promise<MasterItem[]> {
  // Get active version ID
  const { data: version } = await supabase
    .from('master_document_versions')
    .select('id')
    .eq('is_active', true)
    .single();

  if (!version) throw new Error('No active master data version');

  // pg_trgm similarity search via RPC
  const { data } = await supabase.rpc('search_master_items', {
    query_text: normalizedQuery,
    version_uuid: version.id,
    similarity_threshold: 0.1,
    result_limit: limit,
  });

  return data ?? [];
}
```

Create a Supabase SQL function for the search:
```sql
CREATE OR REPLACE FUNCTION search_master_items(
  query_text TEXT,
  version_uuid UUID,
  similarity_threshold FLOAT DEFAULT 0.1,
  result_limit INT DEFAULT 10
)
RETURNS TABLE (
  id UUID, group_code TEXT, group_title TEXT,
  sub_code TEXT, sub_title TEXT, description TEXT,
  keywords TEXT[], similarity_score FLOAT
)
LANGUAGE sql STABLE AS $$
  SELECT
    id, group_code, group_title, sub_code, sub_title, description, keywords,
    similarity(normalized_text, query_text) AS similarity_score
  FROM master_items
  WHERE version_id = version_uuid
    AND is_active = true
    AND similarity(normalized_text, query_text) > similarity_threshold
  ORDER BY similarity_score DESC
  LIMIT result_limit;
$$;
```

---

## OpenAI Reranking

```typescript
// src/lib/matching/openai-rerank.ts

const SYSTEM_PROMPT = `You are a Vietnamese government expense classification assistant.
Given a user's expense description and a list of candidate budget items retrieved from the database,
select the most appropriate candidate. Do not invent codes outside the provided list.`;

export async function rerankWithOpenAI(
  description: string,
  candidates: MasterItem[]
): Promise<RerankResult> {
  const candidateList = candidates
    .map((c, i) => `${i + 1}. ${c.group_code}-${c.sub_code}: ${c.sub_title}. ${c.description ?? ''}`)
    .join('\n');

  const prompt = `User description: "${description}"

Candidate list:
${candidateList}

Return JSON:
{
  "best_index": <1-based index>,
  "confidence": <0.0-1.0>,
  "reason": "<1-2 sentence Vietnamese or English explanation>",
  "alternatives": [<second_best_index>, <third_best_index>]
}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',      // fast + cheap for demo
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.1,
  });

  return JSON.parse(response.choices[0].message.content!);
}
```

---

## API Route

```typescript
// src/app/api/analyze-description/route.ts
// 1. Validate auth (get user from Supabase session)
// 2. Validate input with zod
// 3. normalizeText(description)
// 4. extractAmount(description)
// 5. searchCandidates() → top 10 from pg_trgm
// 6. rerankWithOpenAI() → best_index + confidence + reason
// 7. Map to AnalysisResult[] (top 1 or top 3 based on confidence)
// 8. Save to analysis_requests
// 9. Return { requestId, amount, results }
```

---

## UI — Result Cards

Result card design (shadcn Card):
```
┌─────────────────────────────────────────────┐
│  [6100]  [6113]                  93% ████░░ │
│  Phụ cấp trách nhiệm nghề nghiệp            │
│  Matched: Phụ cấp hướng dẫn tập sự          │
│  ─────────────────────────────────          │
│  "Mô tả gần với hướng dẫn tập sự..."        │
│  Amount: 100,000 VND                        │
│  [+ Add to Report]                          │
└─────────────────────────────────────────────┘
```

Best match: full card, prominent. Alternatives: smaller cards side-by-side below.

Confidence thresholds:
- ≥85%: green badge, show only best result
- 60–84%: yellow badge, show top 3
- <60%: orange badge, show top 3 + "consider adding more detail" note

---

## Files to Create

| File | Action | Description |
|------|--------|-------------|
| `src/lib/utils/amount-extractor.ts` | Create | Regex amount extraction |
| `src/lib/matching/pg-trgm-search.ts` | Create | Supabase RPC wrapper |
| `src/lib/matching/openai-rerank.ts` | Create | OpenAI reranking call |
| `src/app/api/analyze-description/route.ts` | Create | POST handler |
| `src/app/(protected)/analyze/page.tsx` | Create | Analysis page |
| `src/app/(protected)/analyze/_components/description-form.tsx` | Create | Textarea + button |
| `src/app/(protected)/analyze/_components/result-card.tsx` | Create | Single result card |
| `src/app/(protected)/analyze/_components/result-section.tsx` | Create | Best + alternatives |
| `src/types/analysis.ts` | Create | AnalysisResult type |
| Supabase SQL: `search_master_items` function | Create | Run in SQL editor |

---

## Implementation Steps

1. **Install openai**
   ```bash
   npm install openai
   ```

2. **Add `search_master_items` SQL function** in Supabase SQL editor

3. **Write `amount-extractor.ts`** with regex patterns above

4. **Write `pg-trgm-search.ts`** — wraps `supabase.rpc('search_master_items', ...)`

5. **Write `openai-rerank.ts`** — uses `gpt-4o-mini` with `response_format: json_object`

6. **Write API route** — chain: auth check → validate → normalize → search → rerank → save → respond

7. **Define `src/types/analysis.ts`**:
   ```typescript
   export interface AnalysisResult {
     groupCode: string;
     groupTitle: string;
     subCode: string;
     subTitle: string;
     matchedContent: string;
     amount: number | null;
     confidence: number;
     reason: string;
   }
   ```

8. **Build `description-form.tsx`** — Textarea (react-hook-form), "Analyze" button, loading state

9. **Build `result-card.tsx`** — Card with badges, confidence bar, reason, "Add to Report" button (stores to localStorage pending report or calls API)

10. **Build `result-section.tsx`** — Conditional: show best-match card full-width, alternatives below in 2-col grid

11. **Build `analyze/page.tsx`** — Compose form + result section, manage state (idle/loading/results/error)

---

## Todo

- [ ] Install openai
- [ ] Add search_master_items SQL function in Supabase
- [ ] Write amount-extractor.ts
- [ ] Write pg-trgm-search.ts
- [ ] Write openai-rerank.ts
- [ ] Write analyze-description API route
- [ ] Define AnalysisResult type
- [ ] Build description-form component
- [ ] Build result-card component (with confidence badge)
- [ ] Build result-section component
- [ ] Build analyze page
- [ ] Test: enter Vietnamese description → verify DB candidates + OpenAI response
- [ ] Test: amount extraction for "100k", "100.000 đồng"

---

## Success Criteria

- Entering "hướng dẫn tập sự nhận 100k" returns `6100 / 6113` as top result with ≥80% confidence
- Amount extracted as `100000`
- Result card shows group badge, sub badge, explanation from OpenAI
- Analysis saved in `analysis_requests` table
- Loading state shown during API call (skeleton or spinner)
- Error state shown if no active master version

---

## Risk Assessment

| Risk | Mitigation |
|------|-----------|
| pg_trgm returns 0 results for Vietnamese input | Lower threshold to 0.05; add ILIKE fallback on normalized_text |
| OpenAI API key not set / quota exceeded | Show clear error message; test with a real key before demo |
| OpenAI returns malformed JSON | Wrap parse in try/catch; fallback to returning top pg_trgm result directly |
| Slow response (>5s) | Use `gpt-4o-mini` (faster); show animated skeleton; consider streaming |

---

## Security

- Validate auth session before any DB/OpenAI call
- Never expose `OPENAI_API_KEY` or `SUPABASE_SERVICE_ROLE_KEY` to client
- Sanitize `description` input (zod: max 500 chars, string)

---

## Next Steps

→ Phase 4: Validate Org + Dashboard
