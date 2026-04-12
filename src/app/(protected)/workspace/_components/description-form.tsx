'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Sparkles, AlertCircle, Zap } from 'lucide-react';

const schema = z.object({
  description: z.string().min(3, 'Vui lòng nhập thông tin chi tiết hơn.').max(5000, 'Vượt quá giới hạn 5000 ký tự.'),
});

type FormValues = z.infer<typeof schema>;

interface DescriptionFormProps {
  onSubmit: (description: string) => void;
  isLoading: boolean;
}

const EXAMPLES = [
  'Chi phí hướng dẫn nhân sự 100k',
  'Phụ cấp tháng 3/2026',
  'Công tác phí dự án Hà Nội',
];

export function DescriptionForm({ onSubmit, isLoading }: DescriptionFormProps) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const descValue = watch('description') ?? '';
  const charCount = descValue.length;

  return (
    <form onSubmit={handleSubmit(v => onSubmit(v.description))} className="flex flex-col gap-4">

      {/* Textarea */}
      <div className="relative group">
        <textarea
          {...register('description')}
          placeholder="Mô tả hoá đơn, chi phí phát sinh, hoặc nghiệp vụ kế toán cần tra cứu..."
          className="w-full min-h-[130px] bg-white border border-slate-200 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] px-4 py-4 rounded-2xl text-[14px] leading-relaxed text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all resize-none"
          disabled={isLoading}
        />
        {/* char counter */}
        <span className="absolute bottom-3 right-3 text-[10px] font-mono text-slate-400 font-medium select-none">
          {charCount}/5000
        </span>
        {errors.description && (
          <div className="absolute top-3 right-3 flex items-center gap-1 text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-md shadow-sm">
            <AlertCircle className="size-3" />
            <span className="text-[11px] font-bold">{errors.description.message}</span>
          </div>
        )}
      </div>

      {/* Bottom row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mr-1">Gợi ý:</span>
          {EXAMPLES.map(ex => (
            <button
              key={ex}
              type="button"
              onClick={() => setValue('description', ex)}
              className="px-3 py-1.5 bg-white border border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.02)] text-[11px] font-semibold text-slate-600 rounded-lg hover:border-indigo-300 hover:text-indigo-700 hover:bg-indigo-50/50 transition-all active:scale-95"
            >
              {ex}
            </button>
          ))}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2.5 px-7 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-black text-[12px] uppercase tracking-widest rounded-xl transition-all disabled:opacity-50 shrink-0 active:scale-[0.97] shadow-[0_4px_15px_-3px_rgba(99,102,241,0.4)] hover:shadow-[0_8px_25px_-5px_rgba(99,102,241,0.5)]"
        >
          {isLoading ? (
            <>
              <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Đang phân loại...
            </>
          ) : (
            <>
              <Sparkles className="size-4" strokeWidth={2.5} />
              AI Phân Tích
            </>
          )}
        </button>
      </div>
    </form>
  );
}
