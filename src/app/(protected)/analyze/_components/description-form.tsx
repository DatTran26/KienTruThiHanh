'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  description: z.string().min(3, 'Lỗi: Vui lòng nhập thông tin chi tiết hơn.').max(500),
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
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  return (
    <div className="w-full relative bg-black/[0.04] backdrop-blur-2xl border border-white p-2 sm:p-3 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] ring-1 ring-slate-900/5">
      
      <form onSubmit={handleSubmit(v => onSubmit(v.description))} className="flex flex-col gap-2">
        
        <div className="relative group">
          <textarea
            {...register('description')}
            placeholder="Mô tả hoá đơn, chi phí phát sinh, hoặc nghiệp vụ kế toán..."
            className="w-full min-h-[140px] bg-white border-none p-5 pb-16 rounded-[1.5rem] text-base leading-relaxed text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 transition-all resize-none outline-none shadow-inner"
            disabled={isLoading}
          />
          {errors.description && (
            <div className="absolute top-4 right-4 flex items-center gap-1.5 text-red-600 bg-red-50/90 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-red-100 shadow-sm">
               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                 <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
               </svg>
               <span className="text-xs font-bold">{errors.description.message}</span>
            </div>
          )}

          {/* Prompt quick actions & Submit button floated inside bottom of textarea */}
          <div className="absolute bottom-3 left-3 right-3 flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
            
            <div className="flex flex-wrap gap-2 pl-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none flex items-center mr-1">GỢI Ý:</span>
              {EXAMPLES.map(ex => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => setValue('description', ex)}
                  className="px-3 py-1.5 bg-slate-100 text-[11px] font-medium text-slate-600 rounded-lg hover:bg-white hover:text-primary hover:shadow-sm hover:ring-1 hover:ring-primary/20 transition-all text-left flex items-center gap-1.5 group/btn"
                >
                  <span className="opacity-0 w-0 overflow-hidden group-hover/btn:opacity-100 group-hover/btn:w-auto transition-all">✨</span>
                  {ex}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 bg-slate-900 text-foreground font-bold text-sm rounded-xl shadow-md hover:bg-primary focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-50 shrink-0 flex items-center justify-center gap-2 group/submit"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-1 h-4 w-4 text-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  ĐANG PHÂN TÍCH...
                </>
              ) : (
                <>
                  BẮT ĐẦU
                  <div className="bg-black/[0.04] p-1 rounded-md ml-1 group-hover/submit:bg-black/[0.04] transition-colors">
                     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                       <path d="M5 12h14"></path>
                       <path d="M12 5l7 7-7 7"></path>
                     </svg>
                  </div>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
