import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const InputSchema = z.object({
  report_name:        z.string().min(1).max(200),
  organization_profile_id: z.string().uuid().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = InputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data, error } = await supabase
      .from('reports')
      .insert({
        user_id: user.id,
        report_name: parsed.data.report_name,
        organization_profile_id: parsed.data.organization_profile_id ?? null,
        report_code: null,
        exported_file_path: null,
        status: 'draft',
        total_amount: 0,
      })
      .select('id')
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Failed to create report' }, { status: 500 });
    }

    return NextResponse.json({ reportId: data.id });
  } catch (err) {
    console.error('[POST /api/reports]', err);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
