'use client';

import Link from 'next/link';
import { CheckCircle2, AlertCircle, XCircle, ArrowRight, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { OrgFieldResult, OrgValidationResult } from '@/lib/matching/org-validator';

interface FieldRowProps {
  label: string;
  result: OrgFieldResult;
  inputValue?: string;
}

function FieldRow({ label, result, inputValue }: FieldRowProps) {
  const { matched, isNearMatch, score, suggestion } = result;

  const state = matched ? 'match' : isNearMatch ? 'near' : 'miss';
  const icon = {
    match: <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />,
    near:  <AlertCircle  className="size-4 text-amber-400 shrink-0 mt-0.5" />,
    miss:  <XCircle      className="size-4 text-red-400    shrink-0 mt-0.5" />,
  }[state];

  const label2 = { match: 'Khớp', near: 'Gần khớp', miss: 'Không khớp' }[state];
  const pct = Math.round(score * 100);
  const barColor = { match: 'bg-emerald-400', near: 'bg-amber-400', miss: 'bg-red-400' }[state];
  const labelColor = { match: 'text-emerald-400', near: 'text-amber-400', miss: 'text-red-400' }[state];

  return (
    <div className="space-y-1.5">
      <div className="flex items-start gap-2 text-sm">
        {icon}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium text-slate-700">{label}</span>
            <span className={cn('text-xs font-medium shrink-0', labelColor)}>
              {label2} · {pct}%
            </span>
          </div>
          {/* Score bar */}
          <div className="mt-1.5 h-1 w-full rounded-full bg-black/[0.03] overflow-hidden">
            <div className={cn('h-full rounded-full transition-all duration-1000', barColor)} style={{ width: `${pct}%`, filter: 'drop-shadow(0 0 3px currentColor)' }} />
          </div>
          
          {/* Detailed mismatch feedback */}
          {!matched && suggestion && (
            <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-lg space-y-2 relative overflow-hidden backdrop-blur-sm">
               <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-400" />
               <p className="text-[10px] font-black text-red-500 uppercase tracking-widest pl-2">Phát hiện sai lệch</p>
               <div className="pl-2 space-y-1">
                 <p className="text-xs text-slate-500 flex items-start gap-2">
                   <span className="shrink-0 w-24">Bạn đã nhập:</span>
                   <span className="text-slate-800 line-through decoration-red-400/60 font-medium break-words leading-relaxed">{inputValue || '(Bỏ trống)'}</span>
                 </p>
                 <p className="text-xs text-slate-500 flex items-start gap-2">
                   <span className="shrink-0 w-24 mt-1">Chuẩn yêu cầu:</span>
                   <span className="text-emerald-700 font-bold bg-emerald-100/50 border border-emerald-200/50 px-2 py-1 rounded inline-block leading-relaxed">{suggestion}</span>
                 </p>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ValidationResult({ result, submittedValues }: { result: OrgValidationResult, submittedValues: any }) {
  const overallPct = Math.round(result.overallScore * 100);

  return (
    <div className="space-y-4 animate-fade-in-up">
      {/* Overall status banner */}
      <div className={cn(
        'rounded-xl p-4 flex items-center gap-3 border backdrop-blur-sm',
        result.isMatch
          ? 'bg-emerald-500/[0.06] border-emerald-500/15'
          : 'bg-amber-500/[0.06] border-amber-500/15'
      )}>
        {result.isMatch
          ? <CheckCircle2 className="size-6 text-emerald-400 shrink-0" />
          : <AlertCircle  className="size-6 text-amber-400 shrink-0" />}
        <div className="flex-1 min-w-0">
          <p className={cn('font-semibold text-sm', result.isMatch ? 'text-emerald-300' : 'text-amber-300')}>
            {result.isMatch ? 'Xác thực thành công' : 'Thông tin chưa khớp hoàn toàn'}
          </p>
          <p className={cn('text-xs mt-0.5', result.isMatch ? 'text-emerald-400/60' : 'text-amber-400/60')}>
            Độ khớp tổng thể: {overallPct}%
            {!result.isMatch && ' — Trình tự rà soát cho thấy có sai lệch dữ liệu'}
          </p>
        </div>
        <span className={cn(
          'text-xl font-bold shrink-0 font-mono',
          result.isMatch ? 'text-emerald-400' : 'text-amber-400'
        )}>
          {overallPct}%
        </span>
      </div>

      {/* Field breakdown */}
      <div className="space-y-3 mt-4">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em]">
          Chi tiết đối soát
        </p>
        <FieldRow label="Tên đơn vị" result={result.fields.unitName} inputValue={submittedValues.unit_name} />
        <FieldRow label="Địa chỉ"    result={result.fields.address}  inputValue={submittedValues.address} />
        <FieldRow label="Mã số thuế" result={result.fields.taxCode}  inputValue={submittedValues.tax_code} />
      </div>

      {/* CTA on success */}
      {result.isMatch && (
        <Link href="/workspace" className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-bold text-sm shadow-lg shadow-indigo-500/20 hover:from-indigo-400 hover:to-indigo-500 transition-all mt-4">
          <Search className="size-4" />
          Tra cứu chi phí ngay
          <ArrowRight className="size-4" />
        </Link>
      )}
    </div>
  );
}
