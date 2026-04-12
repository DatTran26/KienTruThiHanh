import { Suspense } from 'react';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import AnalyzeClient from '../workspace/_components/analyze-client';
import { AnalyzeRightPanel } from './_components/analyze-right-panel';

export default async function AnalyzePage() {
  const supabase = await createClient();
  const serviceSupabase = createServiceClient();

  // Auth — get current user from cookie session
  const { data: { user } } = await supabase.auth.getUser();

  // Role check via service client (bypasses RLS — guaranteed read)
  let isAdmin = false;
  if (user?.id) {
    const { data: userRow } = await serviceSupabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();
    isAdmin = userRow?.role === 'admin';
    console.log('[AnalyzePage] userId:', user.id, '→ role:', userRow?.role, '→ isAdmin:', isAdmin);
  }

  // Recent analyses
  const { data: recentAnalyses } = await supabase
    .from('analysis_requests')
    .select('id, raw_description, confidence, extracted_amount, created_at')
    .order('created_at', { ascending: false })
    .limit(8);

  // Quick stats
  const { count: totalAnalyses } = await supabase
    .from('analysis_requests')
    .select('id', { count: 'exact', head: true });

  const { count: totalReports } = await supabase
    .from('reports')
    .select('id', { count: 'exact', head: true });

  // Latest master version — service client to bypass any RLS edge cases
  const { data: activeMaster } = await serviceSupabase
    .from('master_document_versions')
    .select('id, file_name, version_no, item_count, is_active, doc_title, doc_unit, doc_period, effective_date, ai_model, uploaded_at, parsed_at')
    .order('version_no', { ascending: false })
    .limit(1)
    .maybeSingle();

  // Fetch real items for the "Popular items" UI
  let popularItems: { sub_code: string, sub_title: string }[] = [];
  if (activeMaster?.id) {
    const { data: items } = await serviceSupabase
      .from('master_items')
      .select('sub_code, sub_title')
      .eq('version_id', activeMaster.id)
      .limit(6);
    if (items) popularItems = items;
  }

  const aiModel = process.env.AI_MODEL ?? 'gpt-4o-mini';

  return (
    <div className="flex h-full min-h-screen">

      {/* ── Main workspace (left) ── */}
      <div className="flex-1 min-w-0 overflow-y-auto">
        <Suspense fallback={<div className="p-8 text-sm text-slate-500">Đang tải Workspace...</div>}>
          <AnalyzeClient 
            isAdmin={isAdmin} 
            activeMaster={activeMaster ?? null} 
            popularItems={popularItems}
            aiModel={aiModel} 
          />
        </Suspense>
      </div>

      {/* ── Context panel (right) — desktop only ── */}
      <aside className="hidden xl:flex flex-col w-[440px] 2xl:w-[480px] shrink-0 border-l border-slate-200/80 bg-white overflow-y-auto z-10 shadow-[-10px_0_30px_rgba(0,0,0,0.01)] relative">
        <AnalyzeRightPanel
          recentAnalyses={recentAnalyses ?? []}
          totalAnalyses={totalAnalyses ?? 0}
          totalReports={totalReports ?? 0}
          popularItems={popularItems}
          aiModel={aiModel}
        />
      </aside>

    </div>
  );
}
