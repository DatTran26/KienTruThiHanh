import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = createServiceClient();

    // Get active version
    const { data: version } = await supabase
      .from('master_document_versions')
      .select('id, version_no')
      .eq('is_active', true)
      .single();

    if (!version) {
      return NextResponse.json({ error: 'No active master version found' }, { status: 404 });
    }

    // Fetch items
    const { data: items, error } = await supabase
      .from('master_items')
      .select('group_code, group_title, sub_code, sub_title, notes')
      .eq('version_id', version.id)
      .order('id', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Format the items to expected tree structure data
    const preview = items.map(item => ({
      groupCode: item.group_code,
      groupTitle: item.group_title,
      subCode: item.sub_code,
      subTitle: item.sub_title,
      notes: item.notes,
    }));

    return NextResponse.json({ preview, versionNo: version.version_no });
  } catch (err) {
    console.error('[active-master-data]', err);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
