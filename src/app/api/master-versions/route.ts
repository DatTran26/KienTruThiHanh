import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: versions, error } = await supabase
      .from('master_document_versions')
      .select('id, version_no, file_name, uploaded_at, is_active, item_count, uploaded_by, doc_title, doc_period')
      .order('version_no', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: versions });
  } catch (err) {
    console.error('[master-versions]', err);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
