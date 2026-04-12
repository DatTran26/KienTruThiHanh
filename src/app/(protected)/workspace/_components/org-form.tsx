'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<OrgValidationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [submittedValues, setSubmittedValues] = useState<FormValues | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    setResult(null);
    setErrorMsg('');
    setSubmittedValues(values);

    try {
      const res = await fetch('/api/validate-org', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) { setErrorMsg(data.error ?? 'Lỗi: Không thể kết nối cổng dữ liệu quốc gia.'); return; }
      setResult(data as OrgValidationResult);
      router.refresh();
    } catch {
      setErrorMsg('Lỗi Hệ Thống: Mất kết nối đường truyền.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-10 animate-fade-in-up w-full">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Unit name */}
          <div className="space-y-2 md:col-span-2 group/field">
            <label htmlFor="unit_name" className="flex justify-between text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">
              <span>Tên đơn vị sự nghiệp <span className="text-red-500">*</span></span>
              {errors.unit_name && <span className="text-red-500 font-bold normal-case tracking-normal animate-shake">{errors.unit_name.message}</span>}
            </label>
            <div className="relative">
              <input
                id="unit_name"
                {...register('unit_name')}
                placeholder="Ví dụ: BỆNH VIỆN ĐA KHOA..."
                className="w-full h-12 bg-slate-50 border border-slate-200 rounded-[1.25rem] px-5 text-sm uppercase font-black tracking-tight text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none placeholder:text-slate-400/60 placeholder:font-bold"
              />
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none opacity-0 group-focus-within/field:opacity-100 transition-opacity">
                <Database className="size-4 text-indigo-400" />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2 md:col-span-2 group/field">
             <label htmlFor="address" className="flex justify-between text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">
              <span>Địa chỉ trụ sở chính <span className="text-red-500">*</span></span>
              {errors.address && <span className="text-red-500 font-bold normal-case tracking-normal animate-shake">{errors.address.message}</span>}
            </label>
            <div className="relative">
              <input
                id="address"
                {...register('address')}
                placeholder="Số nhà, Đường, Quận/Huyện, Tỉnh/Thành phố..."
                className="w-full h-12 bg-slate-50 border border-slate-200 rounded-[1.25rem] px-5 text-sm font-bold text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none placeholder:text-slate-400/60"
              />
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none opacity-0 group-focus-within/field:opacity-100 transition-opacity">
                <ShieldCheck className="size-4 text-indigo-400" />
              </div>
            </div>
          </div>

          {/* Tax code */}
          <div className="space-y-2 md:col-span-1 group/field">
             <label htmlFor="tax_code" className="flex justify-between text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">
              <span>Mã số thuế <span className="text-red-500">*</span></span>
              {errors.tax_code && <span className="text-red-500 font-bold normal-case tracking-normal animate-shake">{errors.tax_code.message}</span>}
            </label>
            <input
              id="tax_code"
              {...register('tax_code')}
              placeholder="0312xxxxxx"
              className="w-full h-12 bg-slate-50 border border-slate-200 rounded-[1.25rem] px-5 text-lg font-black tracking-[0.2em] text-indigo-600 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none placeholder:text-slate-400/60 placeholder:tracking-normal placeholder:font-bold"
            />
          </div>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border border-red-100 rounded-2xl px-5 py-4 flex gap-4 text-sm text-red-900 animate-fade-in shadow-sm">
            <div className="size-6 rounded-full bg-red-100 flex items-center justify-center shrink-0">
               <Info className="size-4 text-red-600" />
            </div>
            <span className="font-black leading-relaxed">{errorMsg}</span>
          </div>
        )}

        <div className="pt-8 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-2xl px-10 py-4 bg-slate-900 text-white font-black text-sm uppercase tracking-[0.15em] shadow-[0_10px_30px_rgba(0,0,0,0.1)] hover:bg-indigo-600 hover:shadow-[0_10px_30px_rgba(79,70,229,0.3)] transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 w-full md:w-auto overflow-hidden relative group/submit"
          >
            {isLoading ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                <span className="relative z-10">Đang truy xuất CSDL...</span>
              </>
            ) : (
              <>
                <Database className="size-5 group-hover/submit:rotate-12 transition-transform" />
                <span className="relative z-10">{isVerified ? 'CẬP NHẬT & ĐỒNG BỘ LẠI' : 'GỬI YÊU CẦU ĐỊNH DANH'}</span>
              </>
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-blue-500 opacity-0 group-hover/submit:opacity-100 transition-opacity" />
          </button>
        </div>
      </form>

      {result && submittedValues && (
        <div className="mt-12 pt-10 border-t border-slate-100 animate-fade-in">
           <div className="flex items-center gap-3 mb-6">
             <div className="size-8 rounded-xl bg-indigo-50 flex items-center justify-center shadow-sm">
                <Database className="size-4 text-indigo-500" />
             </div>
             <span className="text-[11px] font-black text-indigo-900 uppercase tracking-[0.2em]">Kết quả thẩm định từ Tổng cục Thuế</span>
           </div>
          <div className="bg-slate-50/50 rounded-[2rem] p-6 border border-slate-100/80">
            <ValidationResult result={result} submittedValues={submittedValues} />
          </div>
        </div>
      )}
    </div>
  );
}
