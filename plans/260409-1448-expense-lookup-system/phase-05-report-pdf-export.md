# Phase 5: Report + PDF Export

**Day:** 5 | **Priority:** P1 | **Status:** Pending | **Effort:** ~6h

**Context:** [Brainstorm report](../reports/brainstorm-260409-1448-system-design.md) | [plan.md](./plan.md)

---

## Overview

Allow users to collect analysis results into a named report and export it as a downloadable PDF. Keep the PDF template minimal — org header, expense item table, total amount.

---

## Key Insights

- `@react-pdf/renderer` uses its own layout model (Flexbox-like, no HTML/CSS). Keep template simple: no complex nesting.
- PDF generation runs **server-side** in the API route (`renderToBuffer`) — not in the browser. Return as `application/pdf` blob.
- Users "add to report" from the analyze page (Phase 3). Store `report_items` with copied field values (not just FK) to ensure PDF is stable even if master data changes.
- Reports are `draft` until exported; exporting sets `status = 'exported'`.
- Users can have multiple draft reports. For simplicity, show only the most recent draft as "current report" — or let them name reports.

---

## Requirements

- User can add analysis results to a named report from the analyze page
- Reports page lists all user reports (draft + exported)
- Report detail page shows items in the report with subtotals
- "Export PDF" button generates and downloads PDF
- PDF content: org info header, item table, total amount, export date
- Report status changes to `exported` after PDF download

---

## Architecture

```
src/
  app/
    (protected)/
      reports/
        page.tsx                      ← reports list (server component)
        [reportId]/
          page.tsx                    ← report detail + export button
          _components/
            report-items-table.tsx
            export-button.tsx
        _components/
          report-card.tsx
          create-report-dialog.tsx
  app/api/
    reports/
      route.ts                        ← POST create report
    reports/[reportId]/
      items/route.ts                  ← POST add item
      export/route.ts                 ← GET generate + return PDF
  lib/
    pdf/
      report-pdf-template.tsx         ← @react-pdf/renderer document
      generate-report-pdf.ts          ← renderToBuffer() wrapper
```

---

## PDF Template Structure

```
┌──────────────────────────────────────────────────┐
│  PHIẾU ĐỀ NGHỊ THANH TOÁN / BỒI HOÀN            │
│  Đơn vị: VIỆN KIỂM SÁT NHÂN DÂN KHU VỰC 5...   │
│  Địa chỉ: Khu trung tâm hành chính...            │
│  MST: 6000930278            Ngày: 09/04/2026     │
├──────────────────────────────────────────────────┤
│ STT │ Mã nhóm │ Mã mục │ Nội dung chi │ Số tiền │
├──────────────────────────────────────────────────┤
│  1  │  6100   │  6113  │ Phụ cấp ...  │ 100,000 │
│  2  │  6100   │  6107  │ Phụ cấp ...  │  50,000 │
├──────────────────────────────────────────────────┤
│                           Tổng cộng: 150,000 VND │
└──────────────────────────────────────────────────┘
```

---

## PDF Template Code Sketch

```typescript
// src/lib/pdf/report-pdf-template.tsx
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10 },
  header: { marginBottom: 20 },
  title: { fontSize: 14, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  table: { display: 'flex', flexDirection: 'column', borderWidth: 1, borderColor: '#ccc' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#ccc' },
  tableHeader: { backgroundColor: '#f0f0f0', fontWeight: 'bold' },
  cell: { padding: 4, flex: 1, borderRightWidth: 1, borderColor: '#ccc' },
  total: { textAlign: 'right', marginTop: 8, fontWeight: 'bold' },
});

interface ReportPdfProps {
  report: Report;
  items: ReportItem[];
  orgProfile: OrgProfile | null;
}

export function ReportPdfDocument({ report, items, orgProfile }: ReportPdfProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>PHIẾU ĐỀ NGHỊ THANH TOÁN / BỒI HOÀN</Text>
          <Text>Đơn vị: {orgProfile?.unit_name ?? ''}</Text>
          <Text>Địa chỉ: {orgProfile?.address ?? ''}</Text>
          <Text>MST: {orgProfile?.tax_code ?? ''}    Ngày: {formatDate(new Date())}</Text>
        </View>
        {/* Table */}
        <View style={styles.table}>
          {/* header row */}
          {/* item rows */}
        </View>
        <Text style={styles.total}>
          Tổng cộng: {formatCurrency(report.total_amount)} VND
        </Text>
      </Page>
    </Document>
  );
}
```

**Note on Vietnamese fonts:** `@react-pdf/renderer` default Helvetica doesn't support Vietnamese diacritics. Must register a Unicode font (e.g., Roboto or NotoSans):
```typescript
Font.register({
  family: 'NotoSans',
  src: 'https://fonts.gstatic.com/s/notosans/v28/o-0IIpQlx3QUlC5A4PNb4g.ttf',
});
```
Or bundle the font file in `public/fonts/`.

---

## API Routes

### POST /api/reports
Create a new draft report:
```typescript
// Input: { reportName: string, orgProfileId?: string }
// Insert into reports (status: 'draft')
// Return: { reportId }
```

### POST /api/reports/[reportId]/items
Add an analysis result to a report:
```typescript
// Input: { analysisRequestId, groupCode, subCode, expenseContent, amount, note? }
// Insert into report_items
// UPDATE reports SET total_amount = SUM of items WHERE id = reportId
// Return: { itemId }
```

### GET /api/reports/[reportId]/export
Generate and return PDF:
```typescript
// Fetch report + report_items + org_profile
// Build ReportPdfDocument
// const buffer = await renderToBuffer(<ReportPdfDocument ... />)
// UPDATE reports SET status = 'exported'
// Return: Response with headers:
//   Content-Type: application/pdf
//   Content-Disposition: attachment; filename="report-{code}.pdf"
```

---

## Files to Create

| File | Action | Description |
|------|--------|-------------|
| `src/lib/pdf/report-pdf-template.tsx` | Create | @react-pdf/renderer Document component |
| `src/lib/pdf/generate-report-pdf.ts` | Create | renderToBuffer() wrapper |
| `src/app/api/reports/route.ts` | Create | POST create report |
| `src/app/api/reports/[reportId]/items/route.ts` | Create | POST add item to report |
| `src/app/api/reports/[reportId]/export/route.ts` | Create | GET generate PDF |
| `src/app/(protected)/reports/page.tsx` | Create | Reports list |
| `src/app/(protected)/reports/[reportId]/page.tsx` | Create | Report detail + export |
| `src/app/(protected)/reports/[reportId]/_components/report-items-table.tsx` | Create | |
| `src/app/(protected)/reports/[reportId]/_components/export-button.tsx` | Create | Client component, triggers download |
| `src/app/(protected)/reports/_components/report-card.tsx` | Create | |
| `src/app/(protected)/reports/_components/create-report-dialog.tsx` | Create | Dialog to name + create report |
| `public/fonts/NotoSans-Regular.ttf` | Create | Bundle Vietnamese font |

---

## Implementation Steps

1. **Install `@react-pdf/renderer`**
   ```bash
   npm install @react-pdf/renderer
   npm install -D @types/react-pdf
   ```

2. **Download NotoSans font** to `public/fonts/NotoSans-Regular.ttf` and `NotoSans-Bold.ttf`

3. **Write `report-pdf-template.tsx`**:
   - Register NotoSans font
   - Build Document/Page with header + table + total
   - Keep styles minimal (no complex nesting)

4. **Write `generate-report-pdf.ts`**:
   ```typescript
   import { renderToBuffer } from '@react-pdf/renderer';
   export async function generateReportPdf(props: ReportPdfProps): Promise<Buffer> {
     return renderToBuffer(<ReportPdfDocument {...props} />);
   }
   ```

5. **Write API routes** (create report, add item, export)

6. **Update analyze page** (Phase 3): "Add to Report" button:
   - If no draft report: open `create-report-dialog.tsx`, then add item
   - If draft report exists: directly add item, show toast confirmation

7. **Build reports list page** — server component fetching `reports` for current user

8. **Build report detail page** — server component, show items table, total, export button

9. **Build `export-button.tsx`** (client component):
   ```typescript
   // fetch /api/reports/[id]/export
   // const blob = await res.blob()
   // create object URL → trigger anchor click → download
   ```

---

## Todo

- [ ] Install @react-pdf/renderer
- [ ] Download + bundle NotoSans font files
- [ ] Write report-pdf-template.tsx (with font registration)
- [ ] Write generate-report-pdf.ts
- [ ] Write POST /api/reports route
- [ ] Write POST /api/reports/[reportId]/items route
- [ ] Write GET /api/reports/[reportId]/export route
- [ ] Update analyze page: "Add to Report" flow
- [ ] Build reports list page
- [ ] Build report detail page
- [ ] Build export-button client component
- [ ] Test: add 2 items → export → verify PDF renders Vietnamese correctly
- [ ] Test: total_amount updates correctly after adding items

---

## Success Criteria

- "Add to Report" from analyze page saves item to DB
- Reports page lists all user reports
- Report detail shows correct items + total
- Clicking Export downloads a PDF
- PDF renders Vietnamese characters correctly (NotoSans font)
- Report status changes to `exported` after download

---

## Risk Assessment

| Risk | Mitigation |
|------|-----------|
| Vietnamese text renders as squares in PDF | Must register NotoSans/Roboto font — do not skip this step |
| `renderToBuffer` unavailable in Next.js Edge runtime | Use Node.js runtime (`export const runtime = 'nodejs'` in route) |
| @react-pdf layout breaks on long text | Test with realistic Vietnamese content early; truncate long descriptions |
| Font file too large (slows cold start) | NotoSans subset TTF is ~200KB — acceptable for demo |

---

## Security

- Only report owner can export (check `user_id = auth.uid()` in export route)
- Use server Supabase client in all API routes

---

## Next Steps

→ Phase 6: Demo Polish + Deploy
