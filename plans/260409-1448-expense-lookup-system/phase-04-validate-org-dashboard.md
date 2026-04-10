# Phase 4: Validate Org + Dashboard

**Day:** 4 | **Priority:** P1 | **Status:** Pending | **Effort:** ~6h

**Context:** [Brainstorm report](../reports/brainstorm-260409-1448-system-design.md) | [plan.md](./plan.md)

---

## Overview

Build organization info validation (fuzzy match against master data) and the dashboard home page. Lighter day — org validation logic reuses `pg_trgm` + `normalizeText` already built in Phase 2-3.

---

## Key Insights

- Org validation compares user-entered `unit_name`, `address`, `tax_code` against an admin-seeded reference record (single reference org or small table).
- `tax_code`: exact match only (no fuzzy — it's a code).
- `unit_name`: `similarity() > 0.85` = matched, `> 0.65` = near_match.
- `address`: `similarity() > 0.75` = matched, `> 0.55` = near_match.
- The master org reference data can be seeded directly into Supabase (no upload flow needed for demo).
- Dashboard should show recent analysis history + quick-access buttons — keep it simple.

---

## Requirements

### Org Validation
- Form: `unit_name`, `address`, `tax_code` fields
- `POST /api/validate-org` returns field-level match status + overall score
- UI shows per-field feedback: ✓ Matched / ≈ Near match / ✗ No match
- Near-match shows what the correct value is ("Did you mean: …")
- On match: save to `organization_profiles`, enable "Proceed to Analysis" button

### Dashboard
- Welcome message with user email
- Org info status card (validated / not validated)
- Recent analyses list (last 5 from `analysis_requests`)
- Quick action buttons: New Analysis, View Reports
- Recent reports list (last 3 from `reports`)

---

## Architecture

```
src/
  app/
    (protected)/
      dashboard/
        page.tsx              ← dashboard home (server component)
        _components/
          welcome-card.tsx
          recent-analyses.tsx
          recent-reports.tsx
          quick-actions.tsx
      profile/
        page.tsx              ← org info form + validation result
        _components/
          org-form.tsx
          validation-result.tsx
  app/api/
    validate-org/
      route.ts                ← POST handler
  lib/
    matching/
      org-validator.ts        ← field-level fuzzy matching logic
```

---

## Org Reference Data

Seed a reference organization record directly in Supabase (or via a simple admin page). For the demo, the reference org is fixed (VKSND Khu vực 5 - Đắk Lắk). Seed it once:

```sql
-- Run once in Supabase SQL editor for demo
CREATE TABLE IF NOT EXISTS org_reference (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_name TEXT NOT NULL,
  address TEXT NOT NULL,
  tax_code TEXT NOT NULL UNIQUE
);

INSERT INTO org_reference (unit_name, address, tax_code) VALUES
  (
    'VIỆN KIỂM SÁT NHÂN DÂN KHU VỰC 5 - ĐẮK LẮK',
    'Khu trung tâm hành chính, Xã Dray Bhăng - Tỉnh Đắk Lắk - VIỆT NAM',
    '6000930278'
  );

-- RLS: auth users can read
ALTER TABLE org_reference ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_org_reference" ON org_reference
  FOR SELECT USING (auth.role() = 'authenticated');
```

---

## Org Validator Logic

```typescript
// src/lib/matching/org-validator.ts

export interface OrgFieldResult {
  matched: boolean;
  isNearMatch: boolean;
  score: number;
  suggestion?: string;  // The correct value if near/no match
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
```

Use Supabase RPC for similarity queries (same pattern as Phase 3):
```sql
CREATE OR REPLACE FUNCTION validate_org_fields(
  p_unit_name TEXT,
  p_address TEXT,
  p_tax_code TEXT
)
RETURNS JSON LANGUAGE plpgsql AS $$
DECLARE
  ref org_reference%ROWTYPE;
BEGIN
  SELECT * INTO ref FROM org_reference LIMIT 1;
  RETURN json_build_object(
    'tax_code_match', ref.tax_code = p_tax_code,
    'unit_name_score', similarity(
      unaccent(lower(p_unit_name)), unaccent(lower(ref.unit_name))
    ),
    'address_score', similarity(
      unaccent(lower(p_address)), unaccent(lower(ref.address))
    ),
    'ref_unit_name', ref.unit_name,
    'ref_address', ref.address,
    'ref_tax_code', ref.tax_code
  );
END;
$$;
```

---

## Files to Create

| File | Action | Description |
|------|--------|-------------|
| `src/app/api/validate-org/route.ts` | Create | POST handler returning field-level results |
| `src/lib/matching/org-validator.ts` | Create | Supabase RPC call + score classification |
| `src/app/(protected)/profile/page.tsx` | Create | Org form page |
| `src/app/(protected)/profile/_components/org-form.tsx` | Create | react-hook-form org fields |
| `src/app/(protected)/profile/_components/validation-result.tsx` | Create | Per-field match indicators |
| `src/app/(protected)/dashboard/page.tsx` | Create | Dashboard server component |
| `src/app/(protected)/dashboard/_components/welcome-card.tsx` | Create | |
| `src/app/(protected)/dashboard/_components/recent-analyses.tsx` | Create | |
| `src/app/(protected)/dashboard/_components/quick-actions.tsx` | Create | |
| Supabase SQL: `org_reference` table + seed | Create | Run in SQL editor |
| Supabase SQL: `validate_org_fields` function | Create | Run in SQL editor |

---

## Implementation Steps

1. **Add `org_reference` table + seed data** in Supabase SQL editor

2. **Add `validate_org_fields` SQL function** in Supabase SQL editor

3. **Write `org-validator.ts`**:
   - Call `supabase.rpc('validate_org_fields', { p_unit_name, p_address, p_tax_code })`
   - Map scores to `OrgFieldResult` with thresholds:
     - `unit_name`: matched ≥ 0.85, near_match ≥ 0.65
     - `address`: matched ≥ 0.75, near_match ≥ 0.55
     - `tax_code`: exact boolean
   - `isMatch = true` only if all 3 fields are at least near_match

4. **Write `validate-org/route.ts`**:
   - Auth check
   - zod validate input (unit_name, address, tax_code)
   - Call `validateOrgFields()`
   - If match/near_match: upsert `organization_profiles` with `validation_status`
   - Return `OrgValidationResult`

5. **Build `org-form.tsx`**:
   - 3 fields with react-hook-form + zod
   - "Validate" button → POST to `/api/validate-org`
   - Pass results to `validation-result.tsx`

6. **Build `validation-result.tsx`**:
   - Per-field row: icon (✓/≈/✗) + label + score %
   - "Did you mean: [suggestion]" line for near/no match
   - "Proceed to Analysis →" button if overall isMatch

7. **Build dashboard page** (server component):
   - Fetch: `organization_profiles`, recent `analysis_requests`, recent `reports`
   - Compose cards

---

## Todo

- [ ] Add org_reference table + seed in Supabase
- [ ] Add validate_org_fields SQL function
- [ ] Write org-validator.ts
- [ ] Write validate-org API route
- [ ] Build org-form component
- [ ] Build validation-result component (per-field indicators)
- [ ] Build profile page
- [ ] Build dashboard page (server component)
- [ ] Build dashboard sub-components
- [ ] Test: enter exact org data → all matched
- [ ] Test: enter wrong tax code → tax_code = no match
- [ ] Test: enter slightly wrong unit_name → near_match with suggestion

---

## Success Criteria

- Entering exact org info returns all fields as "Matched"
- Wrong tax code shows "No match" for that field
- Near-match unit_name shows "Did you mean: VIỆN KIỂM SÁT..." suggestion
- Validated org saved in `organization_profiles`
- Dashboard shows recent analyses + quick actions

---

## Risk Assessment

| Risk | Mitigation |
|------|-----------|
| `unaccent` extension not available for SQL function | Extension enabled in Phase 1; fallback: do unaccent in JS before passing to function |
| pg_trgm similarity too strict for address tokens | Lower address threshold to 0.5 for near_match |

---

## Next Steps

→ Phase 5: Report + PDF Export
