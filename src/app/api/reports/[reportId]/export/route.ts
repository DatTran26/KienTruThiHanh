import { createClient } from '@/lib/supabase/server';
import { generateReportPdf } from '@/lib/pdf/generate-report-pdf';
import type { PdfOrgProfile } from '@/lib/pdf/report-pdf-template';

// Must run in Node.js runtime — @react-pdf/renderer requires Node APIs
export const runtime = 'nodejs';
export const maxDuration = 60;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ reportId: string }> },
) {
  try {
    const { reportId } = await params;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new Response('Unauthorized', { status: 401 });

    // Fetch report (owner check via user_id)
    const { data: report } = await supabase
      .from('reports')
      .select('id, report_name, report_code, total_amount, organization_profile_id')
      .eq('id', reportId)
      .eq('user_id', user.id)
      .single();

    if (!report) return new Response('Report not found', { status: 404 });

    // Fetch items ordered by sort_order
    const { data: items } = await supabase
      .from('report_items')
      .select('sort_order, group_code, sub_code, expense_content, amount, note')
      .eq('report_id', reportId)
      .order('sort_order', { ascending: true });

    if (!items?.length) return new Response('Report has no items', { status: 422 });

    // Fetch org profile if linked
    let orgProfile: PdfOrgProfile | null = null;
    if (report.organization_profile_id) {
      const { data: org } = await supabase
        .from('organization_profiles')
        .select('unit_name, address, tax_code')
        .eq('id', report.organization_profile_id)
        .single();
      orgProfile = org ?? null;
    }

    const exportDate = new Date().toLocaleDateString('vi-VN');

    const pdfBuffer = await generateReportPdf({
      reportName: report.report_name,
      reportCode: report.report_code,
      totalAmount: report.total_amount,
      items,
      orgProfile,
      exportDate,
    });

    // Mark report as exported
    await supabase
      .from('reports')
      .update({ status: 'exported' })
      .eq('id', reportId);

    const fileName = `phieu-thanh-toan-${report.report_code ?? reportId.slice(0, 8)}.pdf`;

    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': String(pdfBuffer.length),
      },
    });
  } catch (err) {
    console.error('[GET /api/reports/[id]/export]', err);
    return new Response('Failed to generate PDF', { status: 500 });
  }
}
