'use client';

import Link from 'next/link';
import { CheckCircle2, AlertCircle, XCircle, ArrowRight, Search } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { OrgFieldResult, OrgValidationResult } from '@/lib/matching/org-validator';

interface FieldRowProps {
  label: string;
  result: OrgFieldResult;
}

function FieldRow({ label, result }: FieldRowProps) {
  const { matched, isNearMatch, score, suggestion } = result;

  const state = matched ? 'match' : isNearMatch ? 'near' : 'miss';
  const icon = {
    match: <CheckCircle2 className="size-4 text-green-500 shrink-0 mt-0.5" />,
    near:  <AlertCircle  className="size-4 text-amber-500 shrink-0 mt-0.5" />,
    miss:  <XCircle      className="size-4 text-red-500    shrink-0 mt-0.5" />,
  }[state];

  const label2 = { match: 'Khớp', near: 'Gần khớp', miss: 'Không khớp' }[state];
  const pct = Math.round(score * 100);
  const barColor = { match: 'bg-green-500', near: 'bg-amber-500', miss: 'bg-red-400' }[state];
  const labelColor = { match: 'text-green-600', near: 'text-amber-600', miss: 'text-red-600' }[state];

  return (
    <div className="space-y-1.5">
      <div className="flex items-start gap-2 text-sm">
        {icon}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium text-foreground">{label}</span>
            <span className={cn('text-xs font-medium shrink-0', labelColor)}>
              {label2} · {pct}%
            </span>
          </div>
          {/* Score bar */}
          <div className="mt-1 h-1 w-full rounded-full bg-muted overflow-hidden">
            <div className={cn('h-full rounded-full transition-all', barColor)} style={{ width: `${pct}%` }} />
          </div>
          {suggestion && (
            <p className="mt-1 text-xs text-muted-foreground">
              Gợi ý: <span className="font-medium text-foreground">{suggestion}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function ValidationResult({ result }: { result: OrgValidationResult }) {
  const overallPct = Math.round(result.overallScore * 100);

  return (
    <div className="space-y-4">
      {/* Overall status banner */}
      <div className={cn(
        'rounded-xl p-4 flex items-center gap-3',
        result.isMatch
          ? 'bg-green-50 border border-green-200'
          : 'bg-amber-50 border border-amber-200'
      )}>
        {result.isMatch
          ? <CheckCircle2 className="size-6 text-green-500 shrink-0" />
          : <AlertCircle  className="size-6 text-amber-500 shrink-0" />}
        <div className="flex-1 min-w-0">
          <p className={cn('font-semibold text-sm', result.isMatch ? 'text-green-800' : 'text-amber-800')}>
            {result.isMatch ? 'Xác thực thành công' : 'Thông tin chưa khớp hoàn toàn'}
          </p>
          <p className={cn('text-xs mt-0.5', result.isMatch ? 'text-green-700' : 'text-amber-700')}>
            Độ khớp tổng thể: {overallPct}%
            {!result.isMatch && ' — Kiểm tra lại các trường bên dưới'}
          </p>
        </div>
        <span className={cn(
          'text-xl font-bold shrink-0',
          result.isMatch ? 'text-green-600' : 'text-amber-600'
        )}>
          {overallPct}%
        </span>
      </div>

      {/* Field breakdown */}
      <div className="space-y-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Chi tiết từng trường
        </p>
        <FieldRow label="Tên đơn vị" result={result.fields.unitName} />
        <FieldRow label="Địa chỉ"    result={result.fields.address} />
        <FieldRow label="Mã số thuế" result={result.fields.taxCode} />
      </div>

      {/* CTA on success */}
      {result.isMatch && (
        <Link href="/analyze" className={cn(buttonVariants({ size: 'sm' }), 'gap-2 mt-1')}>
          <Search className="size-4" />
          Tra cứu chi phí ngay
          <ArrowRight className="size-4" />
        </Link>
      )}
    </div>
  );
}
