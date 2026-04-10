import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { validateOrgFields } from '@/lib/matching/org-validator';

const InputSchema = z.object({
  unit_name: z.string().min(3).max(300),
  address:   z.string().min(5).max(500),
  tax_code:  z.string().min(5).max(20),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = InputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
    }
    const { unit_name, address, tax_code } = parsed.data;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const result = await validateOrgFields(supabase, unit_name, address, tax_code);

    // Upsert org profile with latest validation status
    const validationStatus = result.fields.unitName.matched && result.fields.address.matched && result.fields.taxCode.matched
      ? 'matched'
      : result.isMatch
        ? 'near_match'
        : 'no_match';

    await supabase
      .from('organization_profiles')
      .upsert(
        {
          user_id: user.id,
          unit_name,
          address,
          tax_code,
          validation_status: validationStatus,
          validation_result: result as unknown as import('@/types/database').Json,
        },
        { onConflict: 'user_id' },
      );

    return NextResponse.json(result);
  } catch (err) {
    console.error('[validate-org]', err);
    if (err instanceof Error && err.message === 'no_reference_data') {
      return NextResponse.json(
        { error: 'Chưa có dữ liệu tổ chức tham chiếu. Vui lòng liên hệ admin.' },
        { status: 422 },
      );
    }
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
