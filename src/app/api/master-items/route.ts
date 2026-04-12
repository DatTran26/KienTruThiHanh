import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const versionId = searchParams.get('versionId');

  if (!versionId) {
    return NextResponse.json({ error: 'Missing versionId' }, { status: 400 });
  }

  const supabase = createServiceClient();

  const { data: items, error } = await supabase
    .from('master_items')
    .select('group_code, group_title, sub_code, sub_title, description, notes')
    .eq('version_id', versionId)
    .order('id', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Format the items to match the UploadResult preview format expected by frontend
  const preview = items.map(item => ({
    groupCode: item.group_code,
    groupTitle: item.group_title,
    subCode: item.sub_code,
    subTitle: item.sub_title,
    description: item.description,
    notes: item.notes,
  }));

  // Fetch meta info
  const { data: version } = await supabase
    .from('master_document_versions')
    .select('id, version_no, doc_title, doc_unit, doc_period, effective_date, ai_model, parsed_at')
    .eq('id', versionId)
    .single();

  return NextResponse.json({
    versionId: version?.id || versionId,
    versionNo: version?.version_no || 0,
    itemCount: preview.length,
    aiModel: version?.ai_model || 'Unknown',
    meta: {
      title: version?.doc_title || 'N/A',
      unit: version?.doc_unit || 'N/A',
      period: version?.doc_period || 'N/A',
      effectiveDate: version?.effective_date || 'N/A',
      parsedByModel: version?.ai_model || 'Unknown',
      parsedAt: version?.parsed_at || new Date().toISOString(),
    },
    preview
  });
}
