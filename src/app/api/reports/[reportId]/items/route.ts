import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const InputSchema = z.object({
  analysis_request_id: z.string().uuid().optional(),
  group_code:     z.string().optional(),
  group_title:    z.string().optional(),
  sub_code:       z.string().optional(),
  sub_title:      z.string().optional(),
  expense_content: z.string().min(1).max(1000),
  amount:         z.number().min(0),
  note:           z.string().max(500).optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ reportId: string }> },
) {
  try {
    const { reportId } = await params;
    const body = await request.json();
    const parsed = InputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Verify report belongs to user
    const { data: report } = await supabase
      .from('reports')
      .select('id, total_amount')
      .eq('id', reportId)
      .eq('user_id', user.id)
      .single();

    if (!report) return NextResponse.json({ error: 'Report not found' }, { status: 404 });

    // Count existing items for sort_order
    const { count } = await supabase
      .from('report_items')
      .select('*', { count: 'exact', head: true })
      .eq('report_id', reportId);

    const { data: item, error } = await supabase
      .from('report_items')
      .insert({
        report_id: reportId,
        analysis_request_id: parsed.data.analysis_request_id ?? null,
        group_code: parsed.data.group_code ?? null,
        group_title: parsed.data.group_title ?? null,
        sub_code: parsed.data.sub_code ?? null,
        sub_title: parsed.data.sub_title ?? null,
        expense_content: parsed.data.expense_content,
        amount: parsed.data.amount,
        note: parsed.data.note ?? null,
        sort_order: (count ?? 0) + 1,
      })
      .select('id')
      .single();

    if (error || !item) {
      return NextResponse.json({ error: 'Failed to add item' }, { status: 500 });
    }

    // Update total_amount
    await supabase
      .from('reports')
      .update({ total_amount: report.total_amount + parsed.data.amount })
      .eq('id', reportId);

    return NextResponse.json({ itemId: item.id });
  } catch (err) {
    console.error('[POST /api/reports/[id]/items]', err);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ reportId: string }> },
) {
  try {
    const { reportId } = await params;
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');

    if (!itemId) {
      return NextResponse.json({ error: 'Missing itemId' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Verify report belongs to user
    const { data: report } = await supabase
      .from('reports')
      .select('id, total_amount')
      .eq('id', reportId)
      .eq('user_id', user.id)
      .single();

    if (!report) return NextResponse.json({ error: 'Report not found' }, { status: 404 });

    // Get item amount before deleting
    const { data: item } = await supabase
      .from('report_items')
      .select('amount')
      .eq('id', itemId)
      .eq('report_id', reportId)
      .single();

    if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 });

    const { error } = await supabase
      .from('report_items')
      .delete()
      .eq('id', itemId)
      .eq('report_id', reportId);

    if (error) {
      return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
    }

    // Update total_amount
    await supabase
      .from('reports')
      .update({ total_amount: Math.max(0, report.total_amount - item.amount) })
      .eq('id', reportId);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[DELETE /api/reports/[id]/items]', err);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
