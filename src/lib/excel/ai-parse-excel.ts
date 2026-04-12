/**
 * ai-parse-excel.ts
 *
 * HYBRID PARSING LOGIC v3:
 * ─────────────────────────────────────────────────────────────
 * Excel Structure (MLNS Budget):
 *   Col A = Group code (4-digit ending in 00/50, e.g. 6800, 6850, 6900)
 *   Col B = Sub-code (single 4-digit like 6905, or range like 6801-6849)
 *   Col C = Title / description text
 *   Col D = Notes / references
 *
 * Hierarchy rules:
 *   1. GROUP ROW: Col A has a code (e.g. 6800) → sets currentGroup
 *      - Title comes from Col C on the SAME row (not from Col B!)
 *      - Col B often has a sub-code range that is NOT the title
 *   2. SUB-CODE ROW: Col A empty, Col B has a code → new sub-item
 *      - Title comes from Col C
 *   3. DETAIL ROW: Both Col A and Col B empty, Col C has text
 *      - These are bullet-point descriptions belonging to the
 *        nearest sub-code above, appended to its `description`
 *
 * The AI is only used for metadata extraction (first 100 rows).
 * Budget items are parsed via deterministic regex + hierarchy rules.
 * ─────────────────────────────────────────────────────────────
 */

import * as xlsx from 'xlsx';
import OpenAI from 'openai';

// ────────────────────────────────────────────────────────────
// Output types
// ────────────────────────────────────────────────────────────

export interface DocumentMeta {
  title: string;
  unit: string;
  period: string | null;
  effectiveDate: string | null;
  sheetName: string;
  parsedByModel: string;
  parsedAt: string;
}

export interface BudgetItem {
  rowIndex: number;
  groupCode: string;
  groupTitle: string;
  subCode: string;
  subTitle: string;
  notes: string | null;
  description: string;
}

export interface AiParseResult {
  meta: DocumentMeta;
  items: BudgetItem[];
  parseErrors: string[];
  rawRowCount: number;
}

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────

/** Test if a string is a 4-digit MLNS code */
const is4Digit = (s: string) => /^\d{4}$/.test(s);

/** Test if a string is a code range like "6801-6849" */
const isCodeRange = (s: string) => /^\d{4}-\d{4}$/.test(s);

/** Test if a string is any kind of budget code (single or range) */
const isBudgetCode = (s: string) => is4Digit(s) || isCodeRange(s);

/** Test if a 4-digit code represents a group header (ends in 00 or 50) */
const isGroupCode = (code: string) => is4Digit(code) && /(?:00|50)$/.test(code);

/** Clean a text cell: trim and normalize whitespace */
const clean = (s: string) => s.replace(/\s+/g, ' ').trim();

// ────────────────────────────────────────────────────────────
// Main function
// ────────────────────────────────────────────────────────────

export async function aiParseExcel(buffer: ArrayBuffer, fileName: string): Promise<AiParseResult> {
  const model = process.env.AI_MODEL ?? 'gpt-4o-mini';
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const workbook = xlsx.read(buffer, { type: 'array', cellDates: true });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  const rawRows = xlsx.utils.sheet_to_json<unknown[]>(worksheet, { header: 1, defval: '', raw: false });
  const rawRowCount = rawRows.length;

  const validRows = rawRows.map(r => (r as unknown[]).map(c => String(c ?? '').trim()));

  // ── 1. AI Metadata Parsing (Only sample first 100 rows to ensure blazing fast response) ──
  const previewText = validRows.slice(0, 100)
    .filter(row => !row.every(c => c === ''))
    .map((row, i) => `ROW${i + 1}\t${row.join('\t')}`)
    .join('\n');

  const systemPrompt = `Bạn là chuyên gia phân tích tài liệu Mục Lục Ngân sách Nhà nước Việt Nam (MLNS).
Nhiệm vụ: phân tích 100 dòng đầu của file Excel và trả về JSON metadata. KHÔNG trích xuất danh sách tiểu mục.

Định dạng JSON output YÊU CẦU:
{
  "title": "Tên bảng/tài liệu (ví dụ: BẢNG CHI TIẾT MLNS)",
  "unit": "Tên Đơn vị/Cơ quan ban hành nếu có",
  "period": "Giai đoạn (ví dụ: Năm 2024, Quý 1...)",
  "effectiveDate": "Ngày hiệu lực hoặc ngày văn bản"
}`;

  const userPrompt = `File: ${fileName}\nSheet: ${sheetName}\n\nNội dung văn bản (phân cách bằng TAB):\n\`\`\`\n${previewText}\n\`\`\`\nTrích xuất JSON.`;

  let metaParsed: Partial<DocumentMeta> = {};
  let parseErrors: string[] = [];

  try {
    const completion = await client.chat.completions.create({
      model,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? '{}';
    metaParsed = JSON.parse(raw);
  } catch (err) {
    parseErrors.push(`Lỗi AI đọc metadata: ${err instanceof Error ? err.message : 'Unknown'}`);
  }

  const meta: DocumentMeta = {
    title:         metaParsed.title        ?? '',
    unit:          metaParsed.unit         ?? '',
    period:        metaParsed.period       ?? null,
    effectiveDate: metaParsed.effectiveDate ?? null,
    sheetName,
    parsedByModel: model,
    parsedAt:      new Date().toISOString(),
  };

  // ── 2. High-speed Programmatic Item Parsing (v3: hierarchy-aware) ──
  const items: BudgetItem[] = [];
  let currentGroupCode = '';
  let currentGroupTitle = '';
  let lastItemIndex = -1; // index into items[] of the last sub-code item

  for (let i = 0; i < validRows.length; i++) {
    const cells = validRows[i];
    if (cells.every(c => c === '')) continue;

    // Normalize cells: Col A, B, C, D (minimum 4 columns)
    const colA = clean(cells[0] ?? '');
    const colB = clean(cells[1] ?? '');
    const colC = clean(cells[2] ?? '');
    const colD = clean(cells[3] ?? '');

    // ─── CASE 1: Group header row (Col A has a 4-digit code) ───
    if (is4Digit(colA)) {
      const code = colA;

      // Extract title: look at Col C first, then fall back
      // Col B in group rows often has a sub-range like "6801-6849" — skip it for title
      let title = '';
      let notes = '';

      // Col C is the primary title source
      if (colC && !isBudgetCode(colC)) {
        title = colC;
      }
      // Col B could be a title if it's NOT a budget code
      if (!title && colB && !isBudgetCode(colB)) {
        title = colB;
      }

      // Gather notes from remaining columns
      const noteParts: string[] = [];
      if (colD) noteParts.push(colD);
      for (let j = 4; j < cells.length; j++) {
        const v = clean(cells[j] ?? '');
        if (v && !isBudgetCode(v)) noteParts.push(v);
      }
      notes = noteParts.join(' | ');

      // Update group context if this is a group-level code
      if (isGroupCode(code)) {
        currentGroupCode = code;
        currentGroupTitle = title;
      }

      // Also extract sub-code from Col B if it exists (range or single)
      const subCode = isBudgetCode(colB) ? colB : code;

      items.push({
        rowIndex: i + 1,
        groupCode: currentGroupCode || code,
        groupTitle: currentGroupTitle || title,
        subCode: subCode,
        subTitle: title,
        description: '', // Initialize empty, children will append here
        notes: notes || null,
      });
      lastItemIndex = items.length - 1;
      continue;
    }

    // ─── CASE 2: Sub-code row (Col A empty, Col B has a code) ───
    if (!colA && isBudgetCode(colB)) {
      const subCode = colB;

      let title = '';
      let notes = '';

      if (colC && !isBudgetCode(colC)) {
        title = colC;
      }

      const noteParts: string[] = [];
      if (colD) noteParts.push(colD);
      for (let j = 4; j < cells.length; j++) {
        const v = clean(cells[j] ?? '');
        if (v && !isBudgetCode(v)) noteParts.push(v);
      }
      notes = noteParts.join(' | ');

      items.push({
        rowIndex: i + 1,
        groupCode: currentGroupCode || subCode,
        groupTitle: currentGroupTitle || title,
        subCode,
        subTitle: title,
        description: '', // Initialize empty, children will append here
        notes: notes || null,
      });
      lastItemIndex = items.length - 1;
      continue;
    }

    // ─── CASE 3: Detail/bullet row (no code in A or B, text in C) ───
    if (!colA && !isBudgetCode(colB)) {
      // Gather all text from this row
      const textParts: string[] = [];
      for (let j = 0; j < cells.length; j++) {
        const v = clean(cells[j] ?? '');
        if (v) textParts.push(v);
      }
      const detailText = textParts.join(' | ');

      if (detailText && lastItemIndex >= 0) {
        // Append detail to the most recent sub-code item's description
        const item = items[lastItemIndex];
        if (item.description) {
          item.description += '\n' + detailText;
        } else {
          item.description = detailText;
        }
      }
      // Don't update lastItemIndex — details keep attaching to the same sub-code
    }
  }

  if (items.length === 0) {
    parseErrors.push('Không tìm thấy bất kỳ dòng nào chứa mã MLNS hợp lệ (4 số). Vui lòng kiểm tra lại định dạng file.');
  }

  return {
    meta,
    items,
    parseErrors,
    rawRowCount,
  };
}
