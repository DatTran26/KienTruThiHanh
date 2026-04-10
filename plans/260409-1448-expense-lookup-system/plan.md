---
title: "KienTruThiHanh — Expense Lookup Demo System"
description: "Full implementation of expense lookup, org validation, budget code suggestion, and PDF report export for competition demo"
status: completed
priority: P1
effort: ~40h (6 days)
issue:
branch: main
tags: [feature, frontend, backend, database, api, auth]
blockedBy: []
blocks: []
created: 2026-04-09
---

# KienTruThiHanh — Expense Lookup Demo System

## Overview

Competition demo web app: users validate org info against admin-uploaded master data, enter natural-language expense descriptions, receive AI-assisted budget code suggestions, and export PDF reimbursement reports.

Brainstorm report: [brainstorm-260409-1448-system-design.md](../reports/brainstorm-260409-1448-system-design.md)

## Stack

Next.js App Router + TypeScript + Tailwind + shadcn/ui + Supabase (Auth/DB/Storage) + OpenAI API + `@react-pdf/renderer`

## Phases

| Phase | Name | Status | Day |
|-------|------|--------|-----|
| 1 | [Scaffold + Auth + DB Schema](./phase-01-scaffold-auth-db.md) | Complete | 1 |
| 2 | [Excel Parser + Admin Upload](./phase-02-excel-parser-admin-upload.md) | Complete | 2 |
| 3 | [Analyze Description API + UI](./phase-03-analyze-description-api-ui.md) | Complete | 3 |
| 4 | [Validate Org + Dashboard](./phase-04-validate-org-dashboard.md) | Complete | 4 |
| 5 | [Report + PDF Export](./phase-05-report-pdf-export.md) | Complete | 5 |
| 6 | [Demo Polish + Deploy](./phase-06-demo-polish-deploy.md) | Complete | 6 |

## Key Dependencies

- `xlsx` — Excel parsing
- `@supabase/supabase-js` + `@supabase/ssr` — auth + DB
- `openai` — AI reranking
- `@react-pdf/renderer` — PDF export
- Supabase extensions: `pg_trgm`, `unaccent`

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
```

## Critical Path

Phase 1 → Phase 2 → Phase 3 (core "wow" feature) → Phase 4 → Phase 5 → Phase 6

Phase 3 is the highest-value, highest-risk phase — budget the most time here.
