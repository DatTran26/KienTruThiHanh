import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { ArrowLeft, FileText, CheckCircle2, Clock, Receipt } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ReportItemsTable } from './_components/report-items-table';
import { ExportButton } from './_components/export-button';

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ reportId: string }>;
}) {
  const { reportId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: report } = await supabase
    .from('reports')
    .select('id, report_name, report_code, total_amount, status, created_at, organization_profile_id')
    .eq('id', reportId)
    .eq('user_id', user!.id)
    .single();

  if (!report) notFound();

  const { data: items } = await supabase
    .from('report_items')
    .select('id, sort_order, group_code, sub_code, expense_content, amount, note')
    .eq('report_id', reportId)
    .order('sort_order', { ascending: true });

  const isExported = report.status === 'exported';

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-3xl animate-fade-in">

      {/* Back */}
      <Link
        href="/reports"
        className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors hover:opacity-70"
        style={{ color: 'var(--muted-foreground)', textDecoration: 'none' }}
      >
        <ArrowLeft className="size-4" />
        Danh sách phiếu
      </Link>

      {/* Header card */}
      <div
        className="rounded-2xl p-6"
        style={{
          border: `1.5px solid ${isExported ? 'oklch(0.56 0.17 145 / 0.3)' : 'oklch(0.52 0.24 265 / 0.2)'}`,
          background: isExported
            ? 'linear-gradient(135deg, oklch(0.56 0.17 145 / 0.05) 0%, var(--card) 100%)'
            : 'linear-gradient(135deg, oklch(0.52 0.24 265 / 0.04) 0%, var(--card) 100%)',
          boxShadow: '0 2px 12px oklch(0 0 0 / 0.06)',
        }}
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-4">
            <div
              className="size-12 rounded-2xl flex items-center justify-center shrink-0"
              style={{
                background: isExported ? 'oklch(0.56 0.17 145 / 0.1)' : 'oklch(0.52 0.24 265 / 0.08)',
              }}
            >
              {isExported
                ? <CheckCircle2 className="size-6" style={{ color: 'oklch(0.56 0.17 145)' }} />
                : <FileText className="size-6" style={{ color: 'oklch(0.52 0.24 265)' }} />
              }
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl font-bold" style={{ letterSpacing: '-0.02em' }}>
                  {report.report_name}
                </h1>
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{
                    background: isExported ? 'oklch(0.56 0.17 145 / 0.1)' : 'oklch(0.52 0.24 265 / 0.08)',
                    color: isExported ? 'oklch(0.56 0.17 145)' : 'oklch(0.52 0.24 265)',
                  }}
                >
                  {isExported ? 'Đã xuất' : 'Nháp'}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                {report.report_code && (
                  <span
                    className="font-mono text-xs font-semibold px-2.5 py-0.5 rounded-lg"
                    style={{
                      background: 'oklch(0.52 0.24 265 / 0.06)',
                      color: 'oklch(0.52 0.24 265)',
                    }}
                  >
                    Số: {report.report_code}
                  </span>
                )}
                <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  <Clock className="size-3" />
                  {formatDate(report.created_at)}
                </span>
              </div>
            </div>
          </div>

          {(items?.length ?? 0) > 0 && (
            <ExportButton reportId={reportId} reportName={report.report_name} />
          )}
        </div>
      </div>

      {/* Items table */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          border: '1px solid var(--border)',
          background: 'var(--card)',
          boxShadow: '0 1px 4px oklch(0 0 0 / 0.04)',
        }}
      >
        <div
          className="px-5 py-4 flex items-center gap-3"
          style={{ borderBottom: '1px solid var(--border)', background: 'oklch(0.975 0.005 250)' }}
        >
          <Receipt className="size-4" style={{ color: 'oklch(0.52 0.24 265)' }} />
          <h2 className="text-sm font-bold">
            Các khoản mục
            <span
              className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{
                background: 'oklch(0.52 0.24 265 / 0.08)',
                color: 'oklch(0.52 0.24 265)',
              }}
            >
              {items?.length ?? 0}
            </span>
          </h2>
        </div>
        <div className="p-1">
          <ReportItemsTable items={items ?? []} />
        </div>
      </div>

      {/* Total summary */}
      <div className="flex justify-end">
        <div
          className="text-right p-5 rounded-2xl min-w-48"
          style={{
            background: 'linear-gradient(135deg, oklch(0.52 0.24 265) 0%, oklch(0.58 0.22 280) 100%)',
            boxShadow: '0 8px 24px oklch(0.52 0.24 265 / 0.3)',
          }}
        >
          <p className="text-xs font-semibold text-white/70 mb-1">Tổng cộng</p>
          <p className="text-2xl font-bold text-white" style={{ letterSpacing: '-0.03em' }}>
            {formatCurrency(report.total_amount)}₫
          </p>
        </div>
      </div>
    </div>
  );
}
