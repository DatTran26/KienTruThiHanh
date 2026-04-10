/**
 * Extract a monetary amount from Vietnamese expense description text.
 * Handles: "100k", "100.000", "100,000", "100000 đồng", "100000 VND"
 */
export function extractAmount(text: string): number | null {
  const patterns: { regex: RegExp; multiplier: number }[] = [
    // Currency-suffixed: "100.000 đồng", "200vnđ", "50 vnd"
    { regex: /(\d{1,3}(?:[.,]\d{3})*|\d+)\s*(?:vnđ|vnd|đồng|đ)\b/gi, multiplier: 1 },
    // Shorthand: "100k", "50K"
    { regex: /(\d+(?:[.,]\d+)?)\s*k\b/gi, multiplier: 1000 },
    // Thousand-grouped number (no currency marker): "100.000" or "100,000"
    { regex: /(\d{1,3}(?:[.,]\d{3})+)(?!\s*%)/g, multiplier: 1 },
  ];

  for (const { regex, multiplier } of patterns) {
    // Reset lastIndex for global regexes
    regex.lastIndex = 0;
    const match = regex.exec(text);
    if (match) {
      // Strip thousand separators (. or ,) then parse
      const raw = match[1].replace(/[.,]/g, '');
      const num = parseFloat(raw);
      if (!isNaN(num) && num > 0) return num * multiplier;
    }
  }
  return null;
}

/**
 * Strip amount-related tokens from text before sending to similarity search,
 * so "100k" doesn't dilute the match against budget item descriptions.
 */
export function stripAmountTokens(text: string): string {
  return text
    .replace(/\d{1,3}(?:[.,]\d{3})*\s*(?:vnđ|vnd|đồng|đ)\b/gi, '')
    .replace(/\d+(?:[.,]\d+)?\s*k\b/gi, '')
    .replace(/\d{1,3}(?:[.,]\d{3})+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
