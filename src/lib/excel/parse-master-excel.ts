import * as xlsx from 'xlsx';

export interface MasterItemRaw {
  rowIndex: number;
  groupCode: string;
  groupTitle: string;
  subCode: string;
  subTitle: string;
  description: string;
}

export interface ParseResult {
  items: MasterItemRaw[];
  errors: { row: number; reason: string }[];
}

/**
 * Detect if a row cell value looks like a budget group/sub-item code.
 * MLNS codes are typically 4-digit numbers (e.g. 6100, 6113).
 */
function isBudgetCode(value: unknown): boolean {
  if (value === null || value === undefined || value === '') return false;
  const str = String(value).trim();
  return /^\d{4}$/.test(str);
}

/**
 * Determine if a row is a group-level row vs a sub-item row.
 * Heuristic: group rows usually have a code but the "sub title" column is empty
 * or the code is a round number (ending in 00).
 */
function isGroupRow(code: string, subTitle: string): boolean {
  return code.endsWith('00') || !subTitle.trim();
}

/**
 * Parse an MLNS budget Excel file into structured raw items.
 *
 * Expected sheet structure (inspect actual file to confirm):
 *   Col 0 (A): code       — 4-digit budget code
 *   Col 1 (B): title      — group title OR sub-item title
 *   Col 2 (C): description — notes/examples for sub-items
 *
 * The parser handles:
 *  - Group rows that define `groupCode` / `groupTitle`
 *  - Sub-item rows that inherit the current group
 *  - Merged cells (appear as empty in subsequent rows — skipped)
 *  - Header / blank rows (skipped)
 */
export function parseMasterExcel(buffer: ArrayBuffer): ParseResult {
  const workbook = xlsx.read(buffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  // Raw 2D array — merged cells show as empty in child rows
  const rows = xlsx.utils.sheet_to_json<unknown[]>(worksheet, {
    header: 1,
    defval: '',
  });

  const items: MasterItemRaw[] = [];
  const errors: { row: number; reason: string }[] = [];

  let currentGroupCode = '';
  let currentGroupTitle = '';

  // Try to auto-detect column positions by scanning first 20 rows for a code-like value
  const codeCol = detectCodeColumn(rows);

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!Array.isArray(row)) continue;

    const rawCode = String(row[codeCol] ?? '').trim();
    const rawTitle = String(row[codeCol + 1] ?? '').trim();
    const rawDesc = String(row[codeCol + 2] ?? '').trim();

    if (!isBudgetCode(rawCode)) continue; // skip header/blank rows

    if (isGroupRow(rawCode, rawTitle)) {
      // Group row — update current group context
      if (!rawTitle) {
        errors.push({ row: i + 1, reason: `Group code ${rawCode} has no title` });
        continue;
      }
      currentGroupCode = rawCode;
      currentGroupTitle = rawTitle;
    } else {
      // Sub-item row
      if (!currentGroupCode) {
        errors.push({ row: i + 1, reason: `Sub-item ${rawCode} has no preceding group row` });
        continue;
      }
      if (!rawTitle) {
        errors.push({ row: i + 1, reason: `Sub-item ${rawCode} has no title` });
        continue;
      }
      items.push({
        rowIndex: i + 1,
        groupCode: currentGroupCode,
        groupTitle: currentGroupTitle,
        subCode: rawCode,
        subTitle: rawTitle,
        description: rawDesc,
      });
    }
  }

  return { items, errors };
}

/**
 * Scan first 30 rows to find which column contains 4-digit budget codes.
 * Falls back to column 0 if none detected.
 */
function detectCodeColumn(rows: unknown[][]): number {
  for (let col = 0; col < 5; col++) {
    let hits = 0;
    for (let row = 0; row < Math.min(30, rows.length); row++) {
      const r = rows[row];
      if (Array.isArray(r) && isBudgetCode(r[col])) hits++;
    }
    if (hits >= 3) return col;
  }
  return 0;
}
