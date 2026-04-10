# Phase 6: Demo Polish + Deploy

**Day:** 6 | **Priority:** P1 | **Status:** Pending | **Effort:** ~4h

**Context:** [Brainstorm report](../reports/brainstorm-260409-1448-system-design.md) | [plan.md](./plan.md)

---

## Overview

Seed realistic demo data, fix remaining bugs, polish UI, deploy to Vercel, and rehearse the 4 demo scenarios from `overall.md §24`. This phase is about making the demo feel complete and professional.

---

## Key Insights

- Deploy to Vercel early (start of Day 6) — production environment issues are different from local.
- Demo data must be pre-seeded and ready (don't rely on live uploads during the actual demo).
- Have a fallback plan: if Vercel deploy fails, demo from localhost.
- The `SUPABASE_SERVICE_ROLE_KEY` must be added to Vercel environment — easy to forget.
- Test the full 4 demo scenarios end-to-end before the competition.

---

## Requirements

- App deployed to Vercel with correct env vars
- Demo org reference data seeded
- Demo master data (Excel uploaded + published)
- Demo user account pre-created (or register live during demo)
- All 4 demo scenarios work end-to-end without errors
- UI polish: consistent spacing, loading states, empty states

---

## Demo Scenarios (from overall.md §24)

### Scenario 1 — New user flow
1. Register account
2. Log in
3. Enter org info → system confirms match

### Scenario 2 — Clear expense description
1. Enter: "Tuần này tôi hướng dẫn tập sự và nhận 100.000"
2. System returns: 6100 / 6113 / Phụ cấp hướng dẫn tập sự / 100000

### Scenario 3 — General description (top 3 results)
1. Enter: "nhận thêm hỗ trợ cho việc giám sát nhân viên mới"
2. System returns top 3 results
3. User selects most suitable

### Scenario 4 — Report export
1. Add selected items to report
2. Click Export
3. Download PDF to show accounting department

---

## Demo Data Seed Script

Create a seed script at `scripts/seed-demo-data.ts`:

```typescript
// scripts/seed-demo-data.ts
// Run: npx tsx scripts/seed-demo-data.ts
//
// Seeds:
// 1. org_reference record
// 2. Uploads + publishes the Excel master file
// 3. Creates a demo user account
```

Or seed directly in Supabase SQL editor for simplicity.

---

## Vercel Deployment

1. Push code to GitHub (if not already)
2. Connect repo to Vercel at vercel.com
3. Set environment variables in Vercel dashboard:
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY
   OPENAI_API_KEY
   ```
4. Deploy → verify build passes
5. Test all routes on production URL

**Key Vercel config** — ensure API routes use Node.js runtime (not Edge), since `@react-pdf/renderer` requires it. Add to export routes if needed:
```typescript
export const runtime = 'nodejs';
export const maxDuration = 60; // PDF generation can be slow
```

---

## UI Polish Checklist

- [ ] All pages have consistent page titles and breadcrumbs
- [ ] Loading skeletons on all async data fetches
- [ ] Empty states: "No analyses yet", "No reports yet"
- [ ] Toast notifications for: successful analysis, item added to report, export success
- [ ] Error states: "No master data uploaded", "Analysis failed", "Export failed"
- [ ] Mobile responsive (basic — at least tablet-friendly for demo)
- [ ] Sidebar highlights active route
- [ ] Confidence badge colors consistent (green/yellow/orange thresholds)

---

## Files to Create / Modify

| File | Action | Description |
|------|--------|-------------|
| `scripts/seed-demo-data.ts` | Create | Optional: seed script for demo data |
| `src/app/(protected)/analyze/page.tsx` | Modify | Add loading skeleton, empty state |
| `src/app/(protected)/dashboard/page.tsx` | Modify | Add empty states |
| `src/app/(protected)/reports/page.tsx` | Modify | Add empty state |
| `vercel.json` | Create (optional) | Only if custom config needed |

---

## Implementation Steps

1. **Deploy to Vercel**
   - Push to GitHub
   - Import project in Vercel
   - Add all 4 env vars
   - Trigger deploy, verify build

2. **Seed demo data in production Supabase**:
   - Ensure `org_reference` is populated
   - Upload + publish `MLNS_KB Tinh.xls` via admin upload page
   - Verify `master_items` count > 0

3. **Add `export const runtime = 'nodejs'`** to the PDF export API route if seeing Edge runtime errors

4. **Run through all 4 demo scenarios on production URL** — fix any bugs

5. **Polish UI**:
   - Add loading skeletons to analyze page (Scenario 2 takes 2-5s)
   - Add empty states
   - Check spacing / font sizes
   - Verify Vietnamese text renders correctly everywhere

6. **Performance check**:
   - Test analysis API response time — if > 5s, check OpenAI model (ensure `gpt-4o-mini`, not `gpt-4o`)
   - Test PDF export — if slow, add loading indicator

7. **Prepare demo talking points** for each scenario

---

## Todo

- [ ] Push final code to GitHub
- [ ] Deploy to Vercel + set all env vars
- [ ] Verify build passes on Vercel
- [ ] Seed org_reference in production DB
- [ ] Upload + publish master Excel on production
- [ ] Create demo user account
- [ ] Run Scenario 1 (register → login → org validation)
- [ ] Run Scenario 2 (clear description → 6113 result)
- [ ] Run Scenario 3 (general description → top 3)
- [ ] Run Scenario 4 (add to report → export PDF)
- [ ] Add loading skeletons to key pages
- [ ] Add empty states
- [ ] Add toast notifications
- [ ] Final check: all Vietnamese text renders correctly

---

## Success Criteria

- App accessible at Vercel production URL
- All 4 demo scenarios pass end-to-end without errors
- Analysis response time < 5s
- PDF downloads with correct Vietnamese text
- No console errors during demo flow

---

## Risk Assessment

| Risk | Mitigation |
|------|-----------|
| Vercel build fails | Test `npm run build` locally first before pushing |
| Edge runtime error for PDF route | Add `export const runtime = 'nodejs'` to export route |
| OpenAI slow in production | Use `gpt-4o-mini`; add 5s timeout + fallback to top pg_trgm result |
| Supabase connection error | Verify env vars are set correctly in Vercel (not just `.env.local`) |
| Demo internet connection unreliable | Test on mobile hotspot; have localhost fallback ready |

---

## Fallback Plan

If production deploy has issues during the competition:
1. Run `npm run dev` on localhost
2. Use local `.env.local` with production Supabase URL (same data)
3. Demo from laptop browser

---

## Next Steps

All phases complete → competition ready.
