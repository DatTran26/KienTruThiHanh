'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Mail, Lock, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const schema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

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
        toast.error(error.message === 'Invalid login credentials'
          ? 'Email hoặc mật khẩu không đúng'
          : error.message
        );
        return;
      }
      router.push('/dashboard');
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-6 bg-green-50 text-green-700 border border-green-200 shadow-sm shadow-green-100">
          <div className="size-2 rounded-full bg-green-500 animate-pulse" />
          Hệ thống đang hoạt động
        </div>
        <h1 className="text-3xl font-extrabold mb-2 text-slate-900 tracking-tight">
          Đăng nhập
        </h1>
        <p className="text-slate-500 text-sm font-medium">
          Chào mừng trở lại! Vui lòng đăng nhập để truy cập dữ liệu.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="login-email" className="text-sm font-bold text-slate-700">
            Email Đăng nhập
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <Input
              id="login-email"
              type="email"
              placeholder="canbo@hcm.gov.vn"
              className={cn(
                "pl-10 h-11 bg-slate-50 border-slate-300 focus:bg-white focus:ring-1 focus:ring-primary focus:border-primary shadow-sm",
                errors.email && "border-red-500 focus:border-red-500 focus:ring-red-500"
              )}
              {...register('email')}
            />
          </div>
          {errors.email && (
            <p className="text-xs font-bold text-red-600 mt-1">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <Label htmlFor="login-password" className="text-sm font-bold text-slate-700">
            Mật khẩu
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <Input
              id="login-password"
              type="password"
              placeholder="••••••••"
              className={cn(
                "pl-10 h-11 bg-slate-50 border-slate-300 focus:bg-white focus:ring-1 focus:ring-primary focus:border-primary shadow-sm",
                errors.password && "border-red-500 focus:border-red-500 focus:ring-red-500"
              )}
              {...register('password')}
            />
          </div>
          {errors.password && (
            <p className="text-xs font-bold text-red-600 mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <Button
          type="submit"
          className="w-full h-11 font-bold text-base gap-2 mt-4 bg-primary hover:bg-primary/90 text-white shadow-md transition-all active:scale-[0.98]"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="size-5 animate-spin" />
              Đang xác thực...
            </>
          ) : (
            <>
              Đăng nhập bằng Mật khẩu
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>

        {/* Divider */}
        <div className="relative flex items-center gap-4 py-4">
          <div className="flex-1 h-px bg-slate-200" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            chưa có tài khoản
          </p>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        {/* Register link */}
        <Link
          href="/register"
          className="flex items-center justify-center w-full h-11 rounded-md font-bold text-sm transition-all duration-200 border border-slate-200 bg-white text-slate-700 hover:text-primary hover:border-primary hover:bg-slate-50 shadow-sm"
        >
          Đăng ký tài khoản mới
        </Link>
      </form>
    </div>
  );
}
