import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const { versionId } = await request.json() as { versionId: string };

    if (!versionId) {
      return NextResponse.json({ error: 'versionId required' }, { status: 400 });
    }

    const supabase = await createServiceClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify version exists
    const { data: version } = await supabase
      .from('master_document_versions')
      .select('id')
      .eq('id', versionId)
      .single();

    if (!version) {
      return NextResponse.json({ error: 'Version not found' }, { status: 404 });
    }

    // Deactivate all other versions and their items
    await supabase
      .from('master_document_versions')
      .update({ is_active: false })
      .neq('id', versionId);

    await supabase
      .from('master_items')
      .update({ is_active: false })
      .neq('version_id', versionId);

    // Activate this version and its items
    await supabase
      .from('master_document_versions')
      .update({ is_active: true })
      .eq('id', versionId);

    await supabase
      .from('master_items')
      .update({ is_active: true })
      .eq('version_id', versionId);

    // Fetch item count for the response
    const { count } = await supabase
      .from('master_items')
      .select('*', { count: 'exact', head: true })
      .eq('version_id', versionId)
      .eq('is_active', true);

    return NextResponse.json({ success: true, activatedItems: count ?? 0 });
  } catch (err) {
    console.error('[publish-master-version]', err);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
