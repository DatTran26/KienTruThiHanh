# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Overview

**KienTruThiHanh** is a competition/demo web application for expense lookup and reimbursement report preparation. It helps users find the correct budget group/sub-item codes from natural-language expense descriptions, validates organization information against admin-uploaded master data, and exports reimbursement reports.

Full requirements specification: `overall.md`

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router) + TypeScript |
| UI | Tailwind CSS + shadcn/ui + lucide-react |
| Forms | react-hook-form + zod + @hookform/resolvers |
| Auth / DB / Storage | Supabase (Auth, PostgreSQL, Storage) |
| File Parsing | xlsx (Excel), pdf-parse (PDF) |
| AI | OpenAI API |
| Utilities | date-fns, clsx, tailwind-merge, uuid |

---

## Development Commands

```bash
npm run dev        # Start dev server
npm run build      # Production build
npm run lint       # ESLint
npm run type-check # TypeScript check (tsc --noEmit)
```

---

## Environment Variables

Copy `.env.local` from `.env.example` (at project root, not `.claude/.env.example`):

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
```

---

## Architecture

```
src/
  app/
    (auth)/login, register/     # Public auth pages
    dashboard/                  # User home
    analyze/                    # Expense description analysis
    reports/                    # Report management + export
    admin/upload-master/        # Admin: upload Excel/PDF master data
    admin/master-items/         # Admin: view parsed master data
    api/
      validate-org/             # POST — fuzzy match org info vs master data
      analyze-description/      # POST — hybrid match + AI reranking
      upload-master-file/       # POST — parse Excel → normalize → store in DB
      export-report/            # POST — generate PDF/Excel, return download URL
  components/
    common/, forms/, cards/, layout/, analysis/
  lib/
    supabase/                   # Client + server Supabase helpers
    excel/                      # xlsx parsing logic
    matching/                   # Keyword, fuzzy, and semantic matching
    ai/                         # OpenAI prompts and reranking
    utils/                      # Text normalization, amount extraction
  types/
  hooks/
```

---

## Key Data Flow

### Master Data (Admin)
```
Admin uploads Excel → xlsx parses → normalize to JSON → store in PostgreSQL
(master_document_versions + master_item_groups + master_items + master_item_keywords)
```
**Never read Excel at query time.** DB is the operational source.

### Expense Analysis (User)
```
Input text → normalize → extract amount → expand synonyms
→ keyword/fuzzy DB query for candidates
→ OpenAI reranks + explains
→ return top 1 (≥85% confidence) or top 3 (60–84%)
```
AI receives only pre-retrieved candidates — it reranks, never invents new codes.

### Organization Validation
```
Input: unit_name + address + tax_code
→ exact match for tax_code
→ fuzzy match (score ≥ 0.9) for unit_name
→ token match for address
→ field-level feedback returned
```

---

## Database Tables (Supabase)

`users`, `organization_profiles`, `master_document_versions`, `master_item_groups`, `master_items`, `master_item_keywords`, `analysis_requests`, `reports`, `report_items`

Schema details in `overall.md` §16.

---

## User Roles

- **User**: register/login, validate org info, analyze expense descriptions, save/export reports
- **Admin**: upload Excel/PDF master files, manage active data version

---

## UI Principles

- Card-based, not table-based
- Confidence badges and progress bars for analysis results
- Results: best match card (prominent) + 2 alternative cards below
- Modern, bright, and demo-ready

---

## Notes for Competition Context

- This is a **one-time demo** — avoid over-engineering (no queues, microservices, fine-tuning)
- Priority order if time is short: Auth → Excel upload/parse → Org validation → Description analysis → Result UI → Report export
- Sample demo data and scenario scripts should live in a `demo/` folder or Supabase seed file
