/** Map of Vietnamese diacritical characters to their ASCII equivalents */
const VIET_MAP: Record<string, string> = {
  à: 'a', á: 'a', ả: 'a', ã: 'a', ạ: 'a',
  ă: 'a', ằ: 'a', ắ: 'a', ẳ: 'a', ẵ: 'a', ặ: 'a',
  â: 'a', ầ: 'a', ấ: 'a', ẩ: 'a', ẫ: 'a', ậ: 'a',
  è: 'e', é: 'e', ẻ: 'e', ẽ: 'e', ẹ: 'e',
  ê: 'e', ề: 'e', ế: 'e', ể: 'e', ễ: 'e', ệ: 'e',
  ì: 'i', í: 'i', ỉ: 'i', ĩ: 'i', ị: 'i',
  ò: 'o', ó: 'o', ỏ: 'o', õ: 'o', ọ: 'o',
  ô: 'o', ồ: 'o', ố: 'o', ổ: 'o', ỗ: 'o', ộ: 'o',
  ơ: 'o', ờ: 'o', ớ: 'o', ở: 'o', ỡ: 'o', ợ: 'o',
  ù: 'u', ú: 'u', ủ: 'u', ũ: 'u', ụ: 'u',
  ư: 'u', ừ: 'u', ứ: 'u', ử: 'u', ữ: 'u', ự: 'u',
  ỳ: 'y', ý: 'y', ỷ: 'y', ỹ: 'y', ỵ: 'y',
  đ: 'd',
};

/** Remove Vietnamese diacritics and lowercase */
export function unaccent(text: string): string {
  return text
    .toLowerCase()
    .split('')
    .map(c => VIET_MAP[c] ?? c)
    .join('');
}

/** Unaccent + collapse whitespace + trim */
export function normalizeText(text: string): string {
  return unaccent(text.trim().replace(/\s+/g, ' '));
}

/**
 * Extract searchable keyword phrases from a description string.
 * Splits on semicolons, commas, parentheses, and "bao gồm"/"như" separators.
 */
export function extractKeywords(text: string): string[] {
  if (!text) return [];
  const raw = text
    .split(/[;,()\/]|bao gồm|như là|như:|gồm:|ví dụ:/i)
    .map(s => s.trim())
    .filter(s => s.length > 2 && s.length < 80);
  return [...new Set(raw.map(normalizeText))].filter(Boolean);
}
