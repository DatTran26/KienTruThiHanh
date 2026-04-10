# Phase 1: Scaffold + Auth + DB Schema

**Day:** 1 | **Priority:** P1 | **Status:** Pending | **Effort:** ~6h

**Context:** [Brainstorm report](../reports/brainstorm-260409-1448-system-design.md) | [plan.md](./plan.md)

---

## Overview

Bootstrap the entire project foundation: Next.js project, all dependencies, Supabase project + DB schema, auth (login/register), base layout, and middleware.

This phase must be done first — everything else blocks on it.

---

## Key Insights

- Use `@supabase/ssr` (not deprecated `auth-helpers`) for cookie-based auth in App Router
- Enable `pg_trgm` and `unaccent` Supabase extensions at schema creation time — needed for Phase 3 matching
- RLS policies must be defined now; debugging auth issues mid-project wastes time
- `master_items.normalized_text` column stores unaccented + lowercased text — GIN index on this column is critical for Phase 3 performance

---

## Requirements

- Next.js 14+ App Router + TypeScript
- Tailwind CSS + shadcn/ui initialized
- Supabase project connected (Auth + PostgreSQL)
- All 5 DB tables created with correct RLS
- Login + Register pages functional (email/password)
- Protected routes via middleware
- Base layout with sidebar/header

---

## Architecture

```
src/
  app/
    (auth)/
      login/page.tsx
      register/page.tsx
      layout.tsx            ← centered auth card layout
    (protected)/
      layout.tsx            ← sidebar + header shell
    layout.tsx              ← root layout (fonts, providers)
  lib/
    supabase/
      client.ts             ← createBrowserClient()
      server.ts             ← createServerClient() with cookies
  middleware.ts             ← auth guard, redirect logic
  types/
    database.ts             ← manual DB type definitions
    index.ts                ← app-level types
```

---

## DB Schema (run in Supabase SQL editor)

```sql
-- Extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Organization profiles (one per user, updatable)
CREATE TABLE organization_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  unit_name TEXT NOT NULL,
  address TEXT NOT NULL,
  tax_code TEXT NOT NULL,
  validation_status TEXT DEFAULT 'pending'
    CHECK (validation_status IN ('pending', 'matched', 'near_match', 'no_match')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Master file upload tracking
CREATE TABLE master_document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('xlsx', 'xls', 'pdf')),
  storage_path TEXT,
  version_no INTEGER NOT NULL DEFAULT 1,
  uploaded_by UUID REFERENCES auth.users(id),
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT FALSE,
  checksum TEXT
);

-- Parsed + normalized budget items
CREATE TABLE master_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id UUID REFERENCES master_document_versions(id) ON DELETE CASCADE NOT NULL,
  group_code TEXT NOT NULL,
  group_title TEXT NOT NULL,
  sub_code TEXT NOT NULL,
  sub_title TEXT NOT NULL,
  description TEXT,
  normalized_text TEXT,   -- unaccented + lowercased; used by pg_trgm
  keywords TEXT[],        -- GIN indexed; extra match surface
  is_active BOOLEAN DEFAULT TRUE
);
CREATE INDEX master_items_normalized_trgm_idx
  ON master_items USING GIN (normalized_text gin_trgm_ops);
CREATE INDEX master_items_keywords_gin_idx
  ON master_items USING GIN (keywords);
CREATE INDEX master_items_version_active_idx
  ON master_items (version_id, is_active);

-- User expense analysis history
CREATE TABLE analysis_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  org_profile_id UUID REFERENCES organization_profiles(id),
  raw_description TEXT NOT NULL,
  extracted_amount NUMERIC,
  top_result_json JSONB,    -- full OpenAI response stored as JSONB
  selected_item_id UUID REFERENCES master_items(id),
  confidence NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User-created reimbursement reports
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  report_code TEXT,
  report_name TEXT NOT NULL,
  total_amount NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'exported')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE report_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE NOT NULL,
  analysis_request_id UUID REFERENCES analysis_requests(id),
  group_code TEXT,
  sub_code TEXT,
  expense_content TEXT,
  amount NUMERIC NOT NULL,
  note TEXT
);

-- RLS
ALTER TABLE organization_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_org_profiles" ON organization_profiles
  FOR ALL USING (auth.uid() = user_id);

ALTER TABLE analysis_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_analysis_requests" ON analysis_requests
  FOR ALL USING (auth.uid() = user_id);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_reports" ON reports
  FOR ALL USING (auth.uid() = user_id);

ALTER TABLE report_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_report_items" ON report_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM reports r WHERE r.id = report_id AND r.user_id = auth.uid())
  );

ALTER TABLE master_document_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_master_versions" ON master_document_versions
  FOR SELECT USING (auth.role() = 'authenticated');

ALTER TABLE master_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_active_master_items" ON master_items
  FOR SELECT USING (auth.role() = 'authenticated' AND is_active = true);
```

---

## Files to Create

| File | Action | Description |
|------|--------|-------------|
| `src/lib/supabase/client.ts` | Create | `createBrowserClient()` from `@supabase/ssr` |
| `src/lib/supabase/server.ts` | Create | `createServerClient()` with Next.js cookies |
| `src/middleware.ts` | Create | Auth guard + route protection |
| `src/app/layout.tsx` | Create | Root layout with font + providers |
| `src/app/(auth)/layout.tsx` | Create | Centered card layout for auth pages |
| `src/app/(auth)/login/page.tsx` | Create | Login form (email + password) |
| `src/app/(auth)/register/page.tsx` | Create | Register form (email + password) |
| `src/app/(protected)/layout.tsx` | Create | Sidebar + header shell |
| `src/types/database.ts` | Create | DB table types matching schema above |
| `src/types/index.ts` | Create | App-level shared types |

---

## Implementation Steps

1. **Scaffold project**
   ```bash
   npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
   ```

2. **Install dependencies**
   ```bash
   npm install @supabase/supabase-js @supabase/ssr
   npm install react-hook-form @hookform/resolvers zod
   npm install date-fns clsx tailwind-merge
   npm install uuid && npm install -D @types/uuid
   npm install lucide-react
   ```

3. **Initialize shadcn/ui**
   ```bash
   npx shadcn@latest init
   npx shadcn@latest add button input label card form toast sonner
   ```

4. **Create Supabase project** at supabase.com, copy `SUPABASE_URL` and `ANON_KEY`

5. **Create `.env.local`** with all 4 env vars

6. **Run DB schema SQL** in Supabase SQL editor (schema from above)

7. **Create `src/lib/supabase/client.ts`**
   ```typescript
   import { createBrowserClient } from '@supabase/ssr';
   export const createClient = () =>
     createBrowserClient(
       process.env.NEXT_PUBLIC_SUPABASE_URL!,
       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
     );
   ```

8. **Create `src/lib/supabase/server.ts`** — server client using `cookies()` from `next/headers`

9. **Create `src/middleware.ts`** — refresh session, redirect `/` → `/dashboard` if authed, protect `/(protected)` routes

10. **Create auth pages** — login/register with react-hook-form + zod, Supabase `signInWithPassword` / `signUp` calls

11. **Create base layout** — sidebar with nav links (Dashboard, Analyze, Reports, Admin), header with user avatar + logout

12. **Define TypeScript types** in `src/types/database.ts` matching the SQL schema

---

## Todo

- [ ] Scaffold Next.js project
- [ ] Install all dependencies
- [ ] Initialize shadcn/ui
- [ ] Create Supabase project
- [ ] Set up `.env.local`
- [ ] Run DB schema SQL (with extensions)
- [ ] Create Supabase client helpers (client.ts + server.ts)
- [ ] Create middleware.ts
- [ ] Create root layout
- [ ] Create (auth) layout + login page
- [ ] Create register page
- [ ] Create (protected) layout with sidebar
- [ ] Define TypeScript types

---

## Success Criteria

- `npm run dev` starts without errors
- `/login` renders login form, successful login redirects to `/dashboard`
- `/register` renders register form, successful register redirects to `/dashboard`
- Visiting `/dashboard` unauthenticated redirects to `/login`
- Supabase dashboard shows users table populated after registration
- All 5 app tables exist in Supabase with correct columns and RLS

---

## Risk Assessment

| Risk | Mitigation |
|------|-----------|
| `@supabase/ssr` cookie handling breaks in middleware | Follow official Supabase Next.js guide exactly; don't use deprecated `auth-helpers` |
| RLS policies lock out admin operations | Use `SUPABASE_SERVICE_ROLE_KEY` in API routes for admin write operations |

---

## Next Steps

→ Phase 2: Excel Parser + Admin Upload
