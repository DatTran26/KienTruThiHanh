'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const schema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
});
type FormData = z.infer<typeof schema>;

/* Clean SaaS input */
const inputBase =
  'w-full h-[52px] pl-11 rounded-xl font-medium text-slate-800 placeholder:text-slate-300 ' +
  'bg-white border transition-all duration-150 outline-none text-[15px]';

const inputCls = (hasError: boolean) =>
  cn(
    inputBase,
    hasError
      ? 'border-red-300 focus:border-red-400 focus:ring-3 focus:ring-red-500/10'
      : 'border-slate-200 focus:border-blue-500 focus:ring-3 focus:ring-blue-500/12',
  );

/* Institutional navy primary button */
const primaryButtonStyle = {
  background: 'linear-gradient(to bottom, #2563eb, #1d4ed8)',
  boxShadow: '0 1px 6px rgba(37,99,235,0.35), 0 1px 2px rgba(37,99,235,0.2)',
};

/* Clean ghost button (secondary) */
const ghostButtonStyle = {
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
};

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      if (error) {
        toast.error(
          error.message === 'Invalid login credentials'
            ? 'Email hoặc mật khẩu không đúng'
            : error.message,
        );
        return;
      }
      router.push('/workspace');
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">

      {/* Header */}
      <div className="mb-7">
        <p className="text-[12px] font-bold uppercase tracking-[0.22em] mb-2 text-blue-600">
          Đăng nhập hệ thống
        </p>
        <h2 className="text-[26px] font-bold text-slate-900 tracking-tight leading-tight mb-2">
          Chào mừng trở lại
        </h2>
        <p className="text-[14.5px] text-slate-500 font-medium leading-relaxed">
          Nhập thông tin xác thực để tiếp tục truy cập dữ liệu hệ thống.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

        {/* Email */}
        <div className="space-y-1.5">
          <label htmlFor="login-email" className="block text-[12px] font-bold text-slate-500 uppercase tracking-[0.12em]">
            Email đăng nhập
          </label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 z-10 text-slate-400 group-focus-within:text-blue-500 transition-colors pointer-events-none" />
            <input
              id="login-email"
              type="email"
              placeholder="canbo@hcm.gov.vn"
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
          <label htmlFor="login-password" className="block text-[12px] font-bold text-slate-500 uppercase tracking-[0.12em]">
            Mật khẩu
          </label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 z-10 text-slate-400 group-focus-within:text-blue-500 transition-colors pointer-events-none" />
            <input
              id="login-password"
              type={showPass ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="current-password"
              className={cn(inputCls(!!errors.password), 'pr-12')}
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPass(v => !v)}
              aria-label={showPass ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              {showPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-[12px] font-semibold text-red-500 ml-1">{errors.password.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-[52px] mt-2 rounded-xl text-white font-semibold text-[15px] flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          style={primaryButtonStyle}
        >
          {loading
            ? <><Loader2 className="size-4 animate-spin" /> Đang xác thực...</>
            : <>Đăng nhập hệ thống <ArrowRight className="size-4" /></>}
        </button>

      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 my-7">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent to-slate-200" />
        <span className="text-[12px] font-bold text-slate-400 uppercase tracking-[0.15em] whitespace-nowrap">Chưa có tài khoản</span>
        <div className="flex-1 h-px bg-gradient-to-l from-transparent to-slate-200" />
      </div>

      {/* Register link — ghost glass button */}
      <Link
        href="/register"
        className="flex items-center justify-center w-full h-[52px] rounded-[14px] font-semibold text-[16px] text-slate-700 hover:text-slate-900 transition-all active:scale-[0.98]"
        style={ghostButtonStyle}
      >
        Tạo yêu cầu cấp quyền truy cập
      </Link>

    </div>
  );
}
