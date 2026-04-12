import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const UpdateSchema = z.object({
  report_name: z.string().min(1).max(200).optional(),
  status: z.enum(['draft', 'exported']).optional(),
});

// PATCH – update report name or status
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ reportId: string }> },
) {
  try {
    const { reportId } = await params;
    const body = await request.json();
    const parsed = UpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { error } = await supabase
      .from('reports')
      .update(parsed.data)
      .eq('id', reportId)
      .eq('user_id', user.id);

    if (error) {
      return NextResponse.json({ error: 'Cập nhật thất bại' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[PATCH /api/reports/[id]]', err);
    return NextResponse.json({ error: 'Lỗi hệ thống' }, { status: 500 });
  }
}

// DELETE – delete report and all its items
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ reportId: string }> },
) {
  try {
    const { reportId } = await params;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Verify ownership
    const { data: report } = await supabase
      .from('reports')
      .select('id')
      .eq('id', reportId)
      .eq('user_id', user.id)
      .single();

    if (!report) return NextResponse.json({ error: 'Không tìm thấy phiếu' }, { status: 404 });

    // Delete items first (cascade)
    await supabase
      .from('report_items')
      .delete()
      .eq('report_id', reportId);

    // Delete report
    const { error } = await supabase
      .from('reports')
      .delete()
      .eq('id', reportId)
      .eq('user_id', user.id);

    if (error) {
      return NextResponse.json({ error: 'Xóa phiếu thất bại' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[DELETE /api/reports/[id]]', err);
    return NextResponse.json({ error: 'Lỗi hệ thống' }, { status: 500 });
  }
}
