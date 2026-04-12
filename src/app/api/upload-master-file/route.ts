import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { aiParseExcel } from '@/lib/excel/ai-parse-excel';
import { normalizeText, extractKeywords } from '@/lib/utils/text-normalize';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !['xls', 'xlsx'].includes(ext)) {
      return NextResponse.json(
        { error: 'Only .xls and .xlsx files are supported' },
        { status: 400 },
      );
    }

    // ── Auth check via cookie session ──
    const authClient = await createClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ── Parse file via AI ──
    const buffer = await file.arrayBuffer();
    const result = await aiParseExcel(buffer, file.name);

    if (result.items.length === 0) {
      return NextResponse.json(
        {
          error: 'No valid budget items found in file',
          parseErrors: result.parseErrors,
          meta: result.meta,
        },
        { status: 422 },
      );
    }

    // ── DB writes via service client (bypasses RLS) ──
    const supabase = createServiceClient();

    // Auto-increment version_no
    const { count: existingCount } = await supabase
      .from('master_document_versions')
      .select('*', { count: 'exact', head: true });

    const versionNo = (existingCount ?? 0) + 1;

    // Create version record with AI-extracted metadata (initially inactive)
    const { data: version, error: versionError } = await supabase
      .from('master_document_versions')
      .insert({
        file_name:      file.name,
        file_type:      'excel',
        version_no:     versionNo,
        uploaded_by:    user.id,
        storage_path:   null,
        checksum:       null,
        is_active:      false,
        item_count:     result.items.length,
        parse_errors:   result.parseErrors.length > 0 ? result.parseErrors : null,
        // AI-extracted metadata
        doc_title:      result.meta.title     || null,
        doc_unit:       result.meta.unit      || null,
        doc_period:     result.meta.period    || null,
        effective_date: result.meta.effectiveDate || null,
        ai_model:       result.meta.parsedByModel,
        parsed_at:      result.meta.parsedAt,
      })
      .select('id, version_no')
      .single();

    if (versionError || !version) {
      console.error('[upload] versionError:', versionError);
      return NextResponse.json({ error: 'Failed to create version record' }, { status: 500 });
    }

    // Bulk-insert budget items (batched to avoid payload limit)
    const insertRows = result.items.map(item => {
      const textForSearch = [item.subTitle, item.description].filter(Boolean).join(' ');
      return {
        version_id:      version.id,
        group_code:      item.groupCode,
        group_title:     item.groupTitle,
        sub_code:        item.subCode,
        sub_title:       item.subTitle,
        description:     item.description || null,
        notes:           item.notes       || null,
        source_row:      item.rowIndex,
        normalized_text: normalizeText(textForSearch),
        keywords:        extractKeywords(item.description),
        is_active:       false,
      };
    });

    const BATCH = 500;
    for (let i = 0; i < insertRows.length; i += BATCH) {
      const { error: insertError } = await supabase
        .from('master_items')
        .insert(insertRows.slice(i, i + BATCH));

      if (insertError) {
        console.error('[upload] insertError:', insertError);
        // Rollback version record on item insert failure
        await supabase.from('master_document_versions').delete().eq('id', version.id);
        return NextResponse.json({ error: 'Failed to insert budget items' }, { status: 500 });
      }
    }

    // ── Response: full structured result ──
    return NextResponse.json({
      versionId:   version.id,
      versionNo:   version.version_no,
      itemCount:   result.items.length,
      rawRowCount: result.rawRowCount,
      parseErrors: result.parseErrors,
      aiModel:     result.meta.parsedByModel,
      meta:        result.meta,
      preview:     result.items.map(r => ({
        groupCode:  r.groupCode,
        groupTitle: r.groupTitle,
        subCode:    r.subCode,
        subTitle:   r.subTitle,
        notes:      r.notes,
        description: r.description,
      })),
    });

  } catch (err) {
    console.error('[upload-master-file]', err);
    const message = err instanceof Error ? err.message : 'Unexpected error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
