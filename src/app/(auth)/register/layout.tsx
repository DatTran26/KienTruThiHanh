import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function RegisterLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  
  // Fetch system settings
  const { data: settings } = await supabase
    .from('system_settings')
    .select('allow_registration')
    .eq('id', 1)
    .single();

  if (settings && (settings as any).allow_registration === false) {
    return (
      <div className="w-full text-center">
        <h2 className="text-[28px] font-bold text-slate-800 tracking-tight leading-tight mb-4">
          Đăng ký tạm đóng
        </h2>
        <p className="text-[15px] text-slate-500 mb-8 leading-relaxed">
          Quản trị viên hệ thống đã vô hiệu hóa chức năng tạo tài khoản mới. Vui lòng liên hệ BQT để được cấp tài khoản.
        </p>
        <Link 
          href="/login"
          className="inline-flex h-[50px] items-center justify-center rounded-[14px] bg-slate-900 px-8 text-sm font-semibold text-white transition-all hover:bg-slate-800"
        >
          Quay lại Đăng nhập
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
