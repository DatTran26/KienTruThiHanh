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
import { Loader2, Mail, Lock, Shield, ArrowRight, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const schema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Mật khẩu không khớp',
  path: ['confirmPassword'],
});
type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

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
        toast.error(error.message);
        return;
      }
      toast.success('Đăng ký thành công! Đang chuyển hướng...');
      router.push('/dashboard');
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-6 bg-blue-50 text-blue-700 border border-blue-200">
          <Shield className="size-3.5" />
          Truy cập dữ liệu mở
        </div>
        <h1 className="text-3xl font-extrabold mb-2 text-slate-900 tracking-tight">
          Tạo tài khoản
        </h1>
        <p className="text-slate-500 text-sm font-medium">
          Đăng ký hệ thống để bắt đầu tra cứu biểu phí bằng AI.
        </p>
      </div>

      {/* Benefits */}
      <div className="flex flex-col gap-2 p-4 rounded-xl mb-6 bg-slate-50 border border-slate-200 shadow-sm">
        {[
          'Tra cứu mã mục chi phí tự động',
          'Xuất thanh toán theo biểu mẫu chuẩn',
          'Lưu trữ hồ sơ số an toàn & bảo mật',
        ].map(benefit => (
          <div key={benefit} className="flex items-center gap-2.5">
            <CheckCircle2 className="size-4 shrink-0 text-primary" />
            <span className="text-sm font-semibold text-slate-700">{benefit}</span>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="reg-email" className="text-sm font-bold text-slate-700">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <Input
              id="reg-email"
              type="email"
              placeholder="canbo@hcm.gov.vn"
              className={cn(
                "pl-10 h-11 bg-slate-50 border-slate-300 focus:bg-white focus:ring-1 focus:ring-primary focus:border-primary shadow-sm",
                errors.email && "border-red-500 focus:border-red-500 focus:ring-red-500"
              )}
              {...register('email')}
            />
          </div>
          {errors.email && <p className="text-xs font-bold text-red-600 mt-1">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <Label htmlFor="reg-password" className="text-sm font-bold text-slate-700">Mật khẩu</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <Input
              id="reg-password"
              type="password"
              placeholder="Tối thiểu 6 ký tự"
              className={cn(
                "pl-10 h-11 bg-slate-50 border-slate-300 focus:bg-white focus:ring-1 focus:ring-primary focus:border-primary shadow-sm",
                errors.password && "border-red-500 focus:border-red-500 focus:ring-red-500"
              )}
              {...register('password')}
            />
          </div>
          {errors.password && <p className="text-xs font-bold text-red-600 mt-1">{errors.password.message}</p>}
        </div>

        {/* Confirm password */}
        <div className="space-y-1.5">
          <Label htmlFor="reg-confirm-password" className="text-sm font-bold text-slate-700">Xác nhận mật khẩu</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <Input
              id="reg-confirm-password"
              type="password"
              placeholder="Nhập lại mật khẩu"
              className={cn(
                "pl-10 h-11 bg-slate-50 border-slate-300 focus:bg-white focus:ring-1 focus:ring-primary focus:border-primary shadow-sm",
                errors.confirmPassword && "border-red-500 focus:border-red-500 focus:ring-red-500"
              )}
              {...register('confirmPassword')}
            />
          </div>
          {errors.confirmPassword && <p className="text-xs font-bold text-red-600 mt-1">{errors.confirmPassword.message}</p>}
        </div>

        {/* Submit */}
        <Button
          type="submit"
          className="w-full h-11 font-bold text-base gap-2 mt-4 bg-primary hover:bg-primary/90 text-white shadow-md transition-all active:scale-[0.98]"
          disabled={loading}
        >
          {loading ? (
            <><Loader2 className="size-5 animate-spin" /> Đang đăng ký...</>
          ) : (
            <>Xác nhận đăng ký <ArrowRight className="size-4" /></>
          )}
        </Button>

        <p className="text-center text-sm font-medium text-slate-500 pt-2">
          Đã có tài khoản?{' '}
          <Link href="/login" className="font-bold text-primary hover:text-blue-800 hover:underline transition-all">
            Đăng nhập ngay
          </Link>
        </p>
      </form>
    </div>
  );
}
