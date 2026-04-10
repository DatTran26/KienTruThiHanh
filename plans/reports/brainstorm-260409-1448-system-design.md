# Brainstorm Report: KienTruThiHanh System Design

**Date:** 2026-04-09 | **Deadline:** < 1 week | **Starting state:** zero code

---

## Problem Statement

Build a competition demo web app that:
1. Validates organization info against admin-uploaded master data
2. Suggests budget group/sub-item codes from natural-language expense descriptions (AI-assisted)
3. Exports a reimbursement report as PDF

Constraints: < 1 week, zero code, 2 roles (User + Admin).

---

## Evaluated Approaches

### Option A — Pragmatic Hybrid (Selected)
- PostgreSQL `pg_trgm` for fuzzy/keyword candidate retrieval
- OpenAI reranks candidates, handles synonyms + semantics implicitly
- Simplified schema: 5 tables (collapse keywords + groups into `master_items`)
- Targeted Excel parser (known file structure)
- `@react-pdf/renderer` for PDF export

**Pros:** Achievable in < 1 week, demo-quality output, accurate matching, no over-engineering
**Cons:** pg_trgm requires Vietnamese accent handling; PDF renderer has layout limits

### Option B — Full spec (Rejected for timeline)
- 4-layer matching + 7 tables + admin master-items view
- Too ambitious; high risk of incomplete demo

### Option C — OpenAI-first (Rejected)
- Pass all master data + description directly to GPT (no DB matching)
- Only viable if dataset < ~200 items; loses confidence scoring + explainability

---

## Final Solution

**Stack:** Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui + Supabase + OpenAI API + `@react-pdf/renderer`

### Matching Pipeline
```
Input → normalize (unaccent + lowercase) → extract amount (regex)
→ pg_trgm similarity against master_items.normalized_text + keywords[]
→ top 10 candidates
→ OpenAI reranks → best_candidate + confidence + reason
→ return top 1 (≥85%) or top 3 (60-84%)
```

Key insight: the spec's 4-layer system (exact → fuzzy → synonyms → semantic) collapses to **2 effective layers** when combining pg_trgm + OpenAI. Synonym expansion as a separate step is redundant — OpenAI handles it during reranking.

### DB Schema (5 tables)

```sql
organization_profiles (id, user_id, unit_name, address, tax_code, validation_status, created_at)

master_document_versions (id, file_name, version_no, uploaded_by, uploaded_at, is_active)

master_items (
  id, version_id,
  group_code, group_title,     -- no separate groups table
  sub_code, sub_title, description,
  normalized_text,             -- accent-stripped + lowercased for pg_trgm
  keywords text[],             -- GIN index; no separate keywords table
  is_active
)

analysis_requests (
  id, user_id, org_profile_id,
  raw_description, extracted_amount,
  top_result_json,             -- full OpenAI response stored as JSONB
  selected_item_id, confidence, created_at
)

reports (id, user_id, report_code, report_name, total_amount, status, created_at)
report_items (id, report_id, analysis_request_id, amount, note)
```

Required Supabase extensions: `pg_trgm`, `unaccent`

### API Routes

| Route | Method | Purpose |
|---|---|---|
| `/api/analyze-description` | POST | pg_trgm search → OpenAI rerank → return results |
| `/api/validate-org` | POST | pg_trgm match org fields → field-level feedback |
| `/api/upload-master-file` | POST | xlsx parse → normalize → seed DB version |
| `/api/export-report` | POST | generate PDF via @react-pdf/renderer, return blob |

### 6-Day Build Sequence

| Day | Deliverable | Notes |
|---|---|---|
| 1 | Scaffold + auth + DB schema + base layout | Low risk |
| 2 | Excel parser + admin upload + DB seeding | **Inspect file early; JSON fallback if parser fails** |
| 3 | analyze-description API + result cards UI | Core "wow" feature; budget most time here |
| 4 | validate-org API + org form UI + dashboard | |
| 5 | Report save + PDF export | Keep PDF template minimal |
| 6 | Demo data, polish, Vercel deploy | |

---

## Feature Cuts

| Feature | Decision | Reason |
|---|---|---|
| Admin master-items view | Cut | Use Supabase dashboard |
| Search history UI | Cut | Saved in DB, not worth building UI |
| Synonym expansion (separate service) | Cut | OpenAI handles this |
| master_item_groups table | Cut | Inline into master_items |
| master_item_keywords table | Cut | Use keywords text[] array + GIN index |

---

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Excel merged cells break parser | Inspect file Day 2 before writing parser; keep a manual JSON import as fallback |
| Vietnamese diacritics reduce pg_trgm accuracy | Store both original + unaccented text in `normalized_text`; enable `unaccent` extension |
| OpenAI slow (2-5s per call) | Streaming response or animated loading skeleton |
| @react-pdf/renderer layout limits | Keep PDF template simple: org header + item table + total |
| Supabase RLS misconfiguration | Define RLS policies at schema creation time, not after |

---

## Success Criteria

- User can register/login
- Admin can upload Excel file and see it parsed into master items
- User can enter org info and receive field-level match feedback
- User can type an expense description and receive ≥1 budget code suggestion with confidence + explanation
- User can add results to a report and download a PDF

---

## Vietnamese Text Handling

All matching relies on text similarity. For Vietnamese:
- Store original text in display columns
- Store `unaccented + lowercased` version in `normalized_text` (pg `unaccent` extension or JS `removeAccents`)
- Run same normalization on query input before pg_trgm search
- Ensures "hướng dẫn tập sự" matches "huong dan tap su" etc.

---

*Approved by user. Proceed to implementation planning.*
