# Phase 2: Excel Parser + Admin Upload

**Day:** 2 | **Priority:** P1 | **Status:** Pending | **Effort:** ~6h

**Context:** [Brainstorm report](../reports/brainstorm-260409-1448-system-design.md) | [plan.md](./plan.md)

---

## Overview

Write a targeted parser for the known `MLNS_KB Tinh.xls` file, build the admin upload API route, and seed master data into `master_items`. The parser is the highest-risk task in this phase — inspect the file first before writing code.

---

## Key Insights

- **Inspect the file first.** The Excel likely has: group rows (4-digit code like `6100`) with merged cells, and child sub-item rows (4-digit code like `6113`) where the group code must be inherited from the nearest group row above.
- Store both `group_code + group_title` directly in `master_items` — no separate groups table.
- `normalized_text` = concatenation of `sub_title + description + keywords.join(' ')` → then unaccented + lowercased. This is what pg_trgm searches.
- Use `SUPABASE_SERVICE_ROLE_KEY` in the upload API (bypasses RLS for bulk insert).
- One version is marked `is_active = true` at a time — deactivate all others on publish.

---

## Requirements

- Admin can upload `.xls` / `.xlsx` file
- System parses file → creates normalized records
- Preview of parsed rows shown before publishing
- "Publish" action sets version as active
- All previous active versions deactivated on publish
- Parsing errors logged (row number + reason)

---

## Architecture

```
Admin uploads file
  → POST /api/upload-master-file (multipart/form-data)
  → xlsx reads workbook
  → parseMasterExcel() → RawRow[]
  → normalizeMasterRows() → NormalizedItem[]
  → insert master_document_versions (is_active=false)
  → insert master_items (bulk)
  → return preview data

Admin clicks "Publish"
  → POST /api/publish-master-version
  → UPDATE master_document_versions SET is_active=false WHERE id != this_id
  → UPDATE master_document_versions SET is_active=true WHERE id = this_id
  → UPDATE master_items SET is_active=true WHERE version_id = this_id
```

---

## Vietnamese Text Normalization

The unaccent function is critical for matching. Implement as a JS utility (not relying on DB unaccent at insert time):

```typescript
// src/lib/utils/text-normalize.ts
const VIET_MAP: Record<string, string> = {
  'à':'a','á':'a','ả':'a','ã':'a','ạ':'a',
  'ă':'a','ằ':'a','ắ':'a','ẳ':'a','ẵ':'a','ặ':'a',
  'â':'a','ầ':'a','ấ':'a','ẩ':'a','ẫ':'a','ậ':'a',
  'è':'e','é':'e','ẻ':'e','ẽ':'e','ẹ':'e',
  'ê':'e','ề':'e','ế':'e','ể':'e','ễ':'e','ệ':'e',
  'ì':'i','í':'i','ỉ':'i','ĩ':'i','ị':'i',
  'ò':'o','ó':'o','ỏ':'o','õ':'o','ọ':'o',
  'ô':'o','ồ':'o','ố':'o','ổ':'o','ỗ':'o','ộ':'o',
  'ơ':'o','ờ':'o','ớ':'o','ở':'o','ỡ':'o','ợ':'o',
  'ù':'u','ú':'u','ủ':'u','ũ':'u','ụ':'u',
  'ư':'u','ừ':'u','ứ':'u','ử':'u','ữ':'u','ự':'u',
  'ỳ':'y','ý':'y','ỷ':'y','ỹ':'y','ỵ':'y',
  'đ':'d',
};

export function unaccent(text: string): string {
  return text
    .toLowerCase()
    .split('')
    .map(c => VIET_MAP[c] ?? c)
    .join('');
}

export function normalizeText(text: string): string {
  return unaccent(text.trim().replace(/\s+/g, ' '));
}
```

---

## Excel Parser Logic

```typescript
// src/lib/excel/parse-master-excel.ts
// Inspect the actual file to confirm column positions before writing this

export interface MasterItemRaw {
  rowIndex: number;
  groupCode: string;
  groupTitle: string;
  subCode: string;
  subTitle: string;
  description: string;
}

export function parseMasterExcel(buffer: ArrayBuffer): MasterItemRaw[] {
  // 1. Read workbook with xlsx
  // 2. Find the main data sheet (first sheet or by name)
  // 3. Iterate rows, tracking currentGroupCode + currentGroupTitle
  // 4. Row classification:
  //    - isGroupRow: code is 4 digits + title exists + no sub-content
  //    - isSubItemRow: code inherits from currentGroup
  // 5. Skip header/blank rows
  // 6. Return MasterItemRaw[]
}
```

**CRITICAL:** Inspect `MLNS_KB Tinh.xls` with a script first:
```bash
node -e "
const xlsx = require('xlsx');
const wb = xlsx.readFile('./MLNS_KB_Tinh.xls');
const ws = wb.Sheets[wb.SheetNames[0]];
const rows = xlsx.utils.sheet_to_json(ws, { header: 1, defval: '' });
rows.slice(0, 30).forEach((r, i) => console.log(i, JSON.stringify(r)));
"
```
This reveals the exact column structure before writing the parser.

---

## Files to Create

| File | Action | Description |
|------|--------|-------------|
| `src/lib/utils/text-normalize.ts` | Create | Vietnamese unaccent + normalizeText() |
| `src/lib/excel/parse-master-excel.ts` | Create | Targeted Excel parser → MasterItemRaw[] |
| `src/lib/excel/normalize-master-rows.ts` | Create | MasterItemRaw[] → DB insert shape |
| `src/app/api/upload-master-file/route.ts` | Create | Multipart upload → parse → insert |
| `src/app/api/publish-master-version/route.ts` | Create | Set version as active |
| `src/app/admin/upload-master/page.tsx` | Create | Upload UI + preview table |

---

## Implementation Steps

1. **Install xlsx**
   ```bash
   npm install xlsx
   ```

2. **Inspect actual Excel file** using the node script above — note exact column indices for code, title, description

3. **Write `text-normalize.ts`** with the VIET_MAP above

4. **Write `parse-master-excel.ts`** targeting the known column structure:
   - Use `xlsx.read(buffer, { type: 'array' })`
   - `xlsx.utils.sheet_to_json(ws, { header: 1, defval: '' })` → 2D array
   - Track `currentGroupCode` + `currentGroupTitle` as rows are iterated
   - Classify group vs sub-item rows by code format and cell emptiness

5. **Write `normalize-master-rows.ts`**:
   - Input: `MasterItemRaw[]` + `versionId`
   - Build `normalized_text`: `normalizeText([subTitle, description].join(' '))`
   - Build `keywords`: extract key phrases from description (split on `;`, `,`, parens)
   - Output: array ready for Supabase insert

6. **Write upload API route** (`src/app/api/upload-master-file/route.ts`):
   - Accept multipart/form-data with file
   - Use service role client (bypasses RLS)
   - Parse file → normalize → insert version + items in transaction
   - Return `{ versionId, itemCount, errors }`

7. **Write publish API route** (`src/app/api/publish-master-version/route.ts`):
   - Deactivate all other versions
   - Activate this version + its items

8. **Build admin upload page**:
   - File input (accept `.xls,.xlsx`)
   - Upload button → POST to API
   - Preview table: group_code, sub_code, sub_title, description
   - Parse error list
   - "Publish this version" button

---

## Todo

- [ ] Install xlsx
- [ ] Inspect Excel file structure with node script
- [ ] Write text-normalize.ts
- [ ] Write parse-master-excel.ts (targeted parser)
- [ ] Write normalize-master-rows.ts
- [ ] Write upload API route (with service role client)
- [ ] Write publish API route
- [ ] Build admin upload page with preview
- [ ] Test: upload real file, verify DB records

---

## Success Criteria

- Upload `MLNS_KB Tinh.xls` → preview shows correct group/sub-item rows
- No parse errors for the known file
- After publish: `master_items` in DB has records with `is_active=true`
- `normalized_text` is unaccented + lowercased (verify in Supabase)
- `keywords` array is populated from description text

---

## Risk Assessment

| Risk | Mitigation |
|------|-----------|
| Merged cells in Excel break row parsing | Inspect file first; use `sheet_to_json` with `header: 1` (raw array) not object mode |
| Group code inheritance fails for nested rows | Track `currentGroupCode` state variable; reset only when a new group row is detected |
| File too large for memory | Demo file should be small; no optimization needed |
| Parser fails on unknown file | Provide fallback: manual JSON seed script in `scripts/seed-master-data.ts` |

---

## Next Steps

→ Phase 3: Analyze Description API + UI
