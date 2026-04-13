import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải từ 6 ký tự'),
  role: z.enum(['admin', 'user']),
});

export async function POST(req: Request) {
  try {
    // 1. Authenticate the caller
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Không có quyền truy cập.' }, { status: 401 });
    }

    // 2. Verify admin role
    const serviceRoleClient = createServiceClient();
    const { data: callerRow } = await serviceRoleClient
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!callerRow || (callerRow as any).role !== 'admin') {
      return NextResponse.json({ error: 'Chỉ Admin mới có quyền thực hiện thao tác này.' }, { status: 403 });
    }

    // 3. Parse request
    const body = await req.json();
    const validatedData = schema.safeParse(body);
    if (!validatedData.success) {
      return NextResponse.json({ error: validatedData.error.errors[0].message }, { status: 400 });
    }

    const { email, password, role } = validatedData.data;

    // 4. Create user using Admin API (Bypasses email confirmation)
    const { data: newUserAuth, error: createError } = await serviceRoleClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 400 });
    }

    const newUserId = newUserAuth.user.id;

    // 5. Explicitly insert/update the assigned role in the `users` table
    const { error: insertError } = await serviceRoleClient
      .from('users')
      .upsert({ id: newUserId, role, email } as any, { onConflict: 'id' });

    if (insertError) {
      // Rollback is complex, but at least report error
      return NextResponse.json({ error: 'Tạo Auth thành công nhưng lỗi gán Role: ' + insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: `Tạo tài khoản ${email} thành công!` });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server Error' }, { status: 500 });
  }
}
