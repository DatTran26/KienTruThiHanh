'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Mail, Lock, Eye, EyeOff, ArrowRight, BrainCircuit, ShieldCheck, FileOutput } from 'lucide-react';
import { cn } from '@/lib/utils';

const schema = z.object({
  email: z.string().email('Email không hợp lệ').refine(e => !e.endsWith('@gov.vn'), {
    message: 'Tên miền @gov.vn không có thực (Vui lòng dùng ví dụ: @vks.gov.vn)',
  }),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Mật khẩu không khớp',
  path: ['confirmPassword'],
});
type FormData = z.infer<typeof schema>;

const BENEFITS = [
  { icon: BrainCircuit, text: 'Tra cứu mã mục chi phí tự động bằng AI' },
  { icon: ShieldCheck,  text: 'Lưu trữ hồ sơ số an toàn & bảo mật' },
  { icon: FileOutput,   text: 'Xuất thanh toán theo biểu mẫu chuẩn nhà nước' },
];

/* Apple-style glass input */
const inputBase =
  'w-full h-[50px] pl-11 rounded-[14px] font-medium text-slate-800 placeholder:text-slate-400 ' +
  'bg-white/70 backdrop-blur-md border transition-all duration-200 outline-none focus:bg-white focus:ring-4 text-[15px]';

const inputCls = (hasError: boolean) =>
  cn(
    inputBase,
    hasError
      ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-500/10'
      : 'border-slate-200 focus:border-blue-400/60 focus:ring-blue-500/10',
  );

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });
      if (error) {
        if (error.message.includes('rate limit')) {
          toast.error('Gửi email quá giới hạn. Vui lòng tắt "Confirm email" trong Supabase Auth Settings hoặc thử lại sau 1 giờ.');
        } else {
          toast.error(error.message);
        }
        return;
      }
      toast.success('Đăng ký thành công! Đang chuyển hướng...');
      router.push('/workspace');
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">

      {/* Header */}
      <div className="mb-6">
        <p className="text-[12px] font-bold uppercase tracking-[0.22em] mb-2" style={{ color: 'rgba(0,122,255,0.8)' }}>
          Tạo tài khoản mới
        </p>
        <h2 className="text-[28px] font-bold text-slate-800 tracking-tight leading-tight mb-2">
          Bắt đầu sử dụng
        </h2>
      </div>

      {/* Benefits — glass chips */}
      <div className="flex flex-col gap-2 mb-6 p-4 rounded-[16px] border"
        style={{
          background: 'rgba(255,255,255,0.5)',
          borderColor: 'rgba(255,255,255,0.9)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,1)',
          backdropFilter: 'blur(12px)',
        }}
      >
        {BENEFITS.map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-center gap-3">
            <div className="size-7 rounded-lg flex items-center justify-center shrink-0 border border-blue-500/15"
              style={{ background: 'rgba(0,122,255,0.08)' }}>
              <Icon className="size-3.5 text-blue-600" strokeWidth={2} />
            </div>
            <span className="text-[14px] text-slate-600 font-medium leading-snug">{text}</span>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">

        {/* Email */}
        <div className="space-y-1.5">
          <label htmlFor="reg-email" className="block text-[12px] font-bold text-slate-500 uppercase tracking-[0.12em]">
            Email
          </label>
          <div className="relative group">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 z-10 text-slate-400 group-focus-within:text-blue-500 transition-colors pointer-events-none" />
            <input
              id="reg-email"
              type="email"
              placeholder="canbo@vks.gov.vn"
              autoComplete="email"
              className={inputCls(!!errors.email)}
              {...register('email')}
            />
          </div>
          {errors.email && (
            <p className="text-[12px] font-semibold text-red-500 ml-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label htmlFor="reg-password" className="block text-[12px] font-bold text-slate-500 uppercase tracking-[0.12em]">
            Mật khẩu
          </label>
          <div className="relative group">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 z-10 text-slate-400 group-focus-within:text-blue-500 transition-colors pointer-events-none" />
            <input
              id="reg-password"
              type={showPass ? 'text' : 'password'}
              placeholder="Tối thiểu 6 ký tự"
              autoComplete="new-password"
              className={cn(inputCls(!!errors.password), 'pr-11')}
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPass(v => !v)}
              aria-label={showPass ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              {showPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-[12px] font-semibold text-red-500 ml-1">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm password */}
        <div className="space-y-1.5">
          <label htmlFor="reg-confirm" className="block text-[12px] font-bold text-slate-500 uppercase tracking-[0.12em]">
            Xác nhận mật khẩu
          </label>
          <div className="relative group">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 z-10 text-slate-400 group-focus-within:text-blue-500 transition-colors pointer-events-none" />
            <input
              id="reg-confirm"
              type={showConfirm ? 'text' : 'password'}
              placeholder="Nhập lại mật khẩu"
              autoComplete="new-password"
              className={cn(inputCls(!!errors.confirmPassword), 'pr-11')}
              {...register('confirmPassword')}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(v => !v)}
              aria-label={showConfirm ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-[12px] font-semibold text-red-500 ml-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-[52px] mt-1 rounded-[14px] text-white font-semibold text-[16px] flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          style={{
            background: 'linear-gradient(to bottom, #2b97ff, #007aff)',
            boxShadow: '0 2px 16px rgba(0,122,255,0.38), inset 0 1px 0 rgba(255,255,255,0.28)',
          }}
        >
          {loading
            ? <><Loader2 className="size-4 animate-spin" /> Đang đăng ký...</>
            : <>Xác nhận đăng ký <ArrowRight className="size-4" /></>}
        </button>

      </form>

      <p className="text-center text-[15px] text-slate-500 mt-6">
        Đã có tài khoản?{' '}
        <Link href="/login" className="font-semibold transition-colors hover:opacity-75" style={{ color: '#007aff' }}>
          Đăng nhập ngay
        </Link>
      </p>

    </div>
  );
}
