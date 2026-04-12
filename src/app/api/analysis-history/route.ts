import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

// Force this route to be dynamic — never cache
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // Try user-scoped client first, fall back to service client if auth fails
    let supabase;
    try {
      supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Auth cookie not readable — use service client as fallback
        console.warn('[analysis-history] User auth failed, using service client');
        supabase = createServiceClient();
      }
    } catch {
      console.warn('[analysis-history] createClient failed, using service client');
      supabase = createServiceClient();
    }

    const [
      { data: recentAnalyses, error },
      { count: totalAnalyses },
      { count: totalReports },
    ] = await Promise.all([
      supabase
        .from('analysis_requests')
        .select('id, raw_description, confidence, extracted_amount, created_at')
        .order('created_at', { ascending: false })
        .limit(8),
      supabase
        .from('analysis_requests')
        .select('id', { count: 'exact', head: true }),
      supabase
        .from('reports')
        .select('id', { count: 'exact', head: true }),
    ]);

    if (error) {
      console.error('[analysis-history] DB error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({
      recentAnalyses: recentAnalyses ?? [],
      totalAnalyses: totalAnalyses ?? 0,
      totalReports: totalReports ?? 0,
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
      }
    });
  } catch (err) {
    console.error('[analysis-history]', err);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
