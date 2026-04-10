import Link from 'next/link';
import { FileText, CheckCircle2, Clock, ArrowRight } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface ReportCardProps {
  id: string;
  report_name: string;
  report_code: string | null;
  total_amount: number;
  status: 'draft' | 'exported';
  created_at: string;
}

export function ReportCard({ id, report_name, report_code, total_amount, status, created_at }: ReportCardProps) {
  const isExported = status === 'exported';

  return (
    <Link href={`/reports/${id}`} className="block h-full outline-none">
      <div
        className={cn(
          "group flex flex-col justify-between h-full p-5 rounded-lg transition-all duration-200 cursor-pointer border bg-white",
          isExported 
            ? "border-green-200 hover:border-green-300 shadow-sm hover:shadow-md" 
            : "border-slate-200 hover:border-primary/50 shadow-sm hover:shadow-md"
        )}
      >
        <div className="flex items-start gap-4 mb-4">
          {/* Icon */}
          <div
            className={cn(
              "size-10 rounded-md flex items-center justify-center shrink-0",
              isExported ? "bg-green-50 text-green-600" : "bg-blue-50 text-blue-600"
            )}
          >
            {isExported
              ? <CheckCircle2 className="size-5" />
              : <FileText className="size-5" />
            }
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-800 text-sm line-clamp-2 mb-1.5 group-hover:text-primary transition-colors">
              {report_name}
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              {report_code && (
                <span
                  className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200"
                >
                  {report_code}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-end justify-between pt-4 border-t border-slate-100">
           <div>
              <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 mb-1">
                <Clock className="size-3" />
                {formatDate(created_at)}
              </span>
              <span className="font-bold text-base text-primary block leading-none">
                {formatCurrency(total_amount)}
              </span>
           </div>

           <div className="flex flex-col items-end gap-2">
             <span
                className={cn(
                  "text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wider",
                  isExported 
                    ? "bg-green-100 text-green-800" 
                    : "bg-slate-100 text-slate-600"
                )}
              >
                {isExported ? 'Đã duyệt xuất' : 'Bản nháp'}
              </span>
              <ArrowRight
                className="size-4 shrink-0 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200 text-primary"
              />
           </div>
        </div>
      </div>
    </Link>
  );
}
