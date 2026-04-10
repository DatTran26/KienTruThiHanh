import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { parseMasterExcel } from '@/lib/excel/parse-master-excel';
import { normalizeMasterRows } from '@/lib/excel/normalize-master-rows';

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

    const buffer = await file.arrayBuffer();
    const { items, errors } = parseMasterExcel(buffer);

    if (items.length === 0) {
      return NextResponse.json(
        { error: 'No valid rows found in file', parseErrors: errors },
        { status: 422 },
      );
    }

    const supabase = await createServiceClient();

    // Verify caller is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create version record (not active yet — activated on publish)
    const { data: version, error: versionError } = await supabase
      .from('master_document_versions')
      .insert({
        file_name: file.name,
        file_type: ext,
        version_no: 1, // will be overwritten below
        uploaded_by: user.id,
        storage_path: null,
        checksum: null,
        is_active: false,
        item_count: items.length,
        parse_errors: errors.length > 0 ? errors : null,
      })
      .select('id, version_no')
      .single();

    if (versionError || !version) {
      return NextResponse.json({ error: 'Failed to create version record' }, { status: 500 });
    }

    // Auto-increment version_no based on existing count
    const { count } = await supabase
      .from('master_document_versions')
      .select('*', { count: 'exact', head: true });

    await supabase
      .from('master_document_versions')
      .update({ version_no: count ?? 1 })
      .eq('id', version.id);

    // Bulk-insert parsed items (batch to avoid payload limits)
    const insertRows = normalizeMasterRows(items, version.id);
    const BATCH = 500;
    for (let i = 0; i < insertRows.length; i += BATCH) {
      const { error: insertError } = await supabase
        .from('master_items')
        .insert(insertRows.slice(i, i + BATCH));

      if (insertError) {
        // Clean up version on failure
        await supabase.from('master_document_versions').delete().eq('id', version.id);
        return NextResponse.json({ error: 'Failed to insert items' }, { status: 500 });
      }
    }

    return NextResponse.json({
      versionId: version.id,
      itemCount: items.length,
      parseErrors: errors,
      preview: insertRows.slice(0, 20).map(r => ({
        group_code: r.group_code,
        group_title: r.group_title,
        sub_code: r.sub_code,
        sub_title: r.sub_title,
        description: r.description,
      })),
    });
  } catch (err) {
    console.error('[upload-master-file]', err);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
