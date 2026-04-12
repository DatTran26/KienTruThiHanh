'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, ShieldCheck, Database, Info } from 'lucide-react';
import { ValidationResult } from './validation-result';
import type { OrgValidationResult } from '@/lib/matching/org-validator';

const schema = z.object({
  unit_name: z.string().min(3, 'Tên đơn vị quá ngắn hoặc không hợp lệ'),
  address:   z.string().min(5, 'Địa chỉ đăng ký không hợp lệ'),
  tax_code:  z.string().min(5, 'Mã số thuế không hợp lệ'),
});

type FormValues = z.infer<typeof schema>;

interface OrgFormProps {
  initialValues?: Partial<FormValues>;
  isVerified?: boolean;
}

export function OrgForm({ initialValues, isVerified }: OrgFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<OrgValidationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    setResult(null);
    setErrorMsg('');

    try {
      const res = await fetch('/api/validate-org', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) { setErrorMsg(data.error ?? 'Lỗi: Không thể kết nối cổng dữ liệu quốc gia.'); return; }
      setResult(data as OrgValidationResult);
    } catch {
      setErrorMsg('Lỗi Hệ Thống: Mất kết nối đường truyền.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-8 animate-fade-in-up w-full">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* Unit name */}
          <div className="space-y-1.5 md:col-span-2">
            <label htmlFor="unit_name" className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em]">
              <span>Tên đơn vị sự nghiệp <span className="text-red-400">*</span></span>
              {errors.unit_name && <span className="text-red-400 font-bold normal-case tracking-normal">{errors.unit_name.message}</span>}
            </label>
            <input
              id="unit_name"
              {...register('unit_name')}
              placeholder="Ví dụ: BỆNH VIỆN ĐA KHOA..."
              className="w-full h-11 bg-black/[0.03] border border-white/50 rounded-xl px-4 text-sm uppercase tracking-wide text-slate-900 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none placeholder:text-muted-foreground/60"
            />
          </div>

          {/* Address */}
          <div className="space-y-1.5 md:col-span-2">
             <label htmlFor="address" className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em]">
              <span>Địa chỉ trụ sở chính <span className="text-red-400">*</span></span>
              {errors.address && <span className="text-red-400 font-bold normal-case tracking-normal">{errors.address.message}</span>}
            </label>
            <input
              id="address"
              {...register('address')}
              placeholder="Số nhà, Đường, Quận/Huyện, Tỉnh/Thành phố..."
              className="w-full h-11 bg-black/[0.03] border border-white/50 rounded-xl px-4 text-sm text-slate-900 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none placeholder:text-muted-foreground/60"
            />
          </div>

          {/* Tax code */}
          <div className="space-y-1.5 md:col-span-1">
             <label htmlFor="tax_code" className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em]">
              <span>Mã số thuế <span className="text-red-400">*</span></span>
              {errors.tax_code && <span className="text-red-400 font-bold normal-case tracking-normal">{errors.tax_code.message}</span>}
            </label>
            <input
              id="tax_code"
              {...register('tax_code')}
              placeholder="Ví dụ: 0312xxxxxx"
              className="w-full h-11 bg-black/[0.03] border border-white/50 rounded-xl px-4 text-sm font-mono tracking-wider text-slate-900 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none placeholder:text-muted-foreground/60"
            />
          </div>
        </div>

        {errorMsg && (
          <div className="border-l-2 border-red-400 bg-red-500/[0.06] rounded-r-lg px-4 py-3 flex gap-3 text-sm text-red-300">
            <Info className="size-5 shrink-0 text-red-400" />
            <span className="font-bold">{errorMsg}</span>
          </div>
        )}

        <div className="pt-6 border-t border-white/50 flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-xl px-8 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-bold text-sm uppercase tracking-wider shadow-lg shadow-indigo-500/20 hover:from-indigo-400 hover:to-indigo-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2 w-full md:w-auto"
          >
            {isLoading
              ? <><Loader2 className="size-4 animate-spin" /> Hệ thống đang truy xuất...</>
              : <><Database className="size-4" /> {isVerified ? 'CẬP NHẬT & ĐỒNG BỘ LẠI' : 'GỬI YÊU CẦU ĐỊNH DANH'}</>
            }
          </button>
        </div>
      </form>

      {result && (
        <div className="border-t border-white/50 mt-6 pt-6">
           <div className="flex items-center gap-2 mb-4">
             <Database className="size-4 text-indigo-400" />
             <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em]">Kết quả thẩm định từ Tổng cục Thuế</span>
           </div>
          <ValidationResult result={result} />
        </div>
      )}
    </div>
  );
}
