import { normalizeText, extractKeywords } from '@/lib/utils/text-normalize';
import type { MasterItemRaw } from './parse-master-excel';
import type { Database } from '@/types/database';

type MasterItemInsert = Database['public']['Tables']['master_items']['Insert'];

/**
 * Convert raw parsed Excel rows into DB insert shapes.
 *
 * normalized_text = unaccented + lowercased concatenation of subTitle + description
 * keywords       = key phrases extracted from description (for extra match surface)
 */
export function normalizeMasterRows(
  items: MasterItemRaw[],
  versionId: string,
): MasterItemInsert[] {
  return items.map(item => {
    const textForSearch = [item.subTitle, item.description]
      .filter(Boolean)
      .join(' ');

    return {
      version_id: versionId,
      group_code: item.groupCode,
      group_title: item.groupTitle,
      sub_code: item.subCode,
      sub_title: item.subTitle,
      description: item.description || null,
      normalized_text: normalizeText(textForSearch),
      keywords: extractKeywords(item.description),
      is_active: false, // activated only when version is published
    };
  });
}
