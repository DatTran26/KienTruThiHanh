import { Suspense } from 'react';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import AnalyzeClient from '../workspace/_components/analyze-client';

function AnalyzeSkeleton() {
  return (
    <div className="flex-1 min-h-screen w-full animate-pulse bg-[#f1f5f9]">
      {/* ── Page Header Skeleton ── */}
      <div className="px-6 py-8 flex flex-col justify-end bg-white border-b border-slate-200/80 h-[160px]">
        <div className="flex items-center gap-2.5 mb-3.5">
          <div className="h-6 w-24 bg-slate-200 rounded-lg"></div>
          <div className="h-6 w-16 bg-amber-100 rounded-lg"></div>
        </div>
        <div className="h-9 w-64 sm:w-96 bg-slate-200 rounded-xl mb-3"></div>
        <div className="h-4 w-48 sm:w-64 bg-slate-200/60 rounded-md"></div>
      </div>

      {/* ── Main workspace Skeleton ── */}
      <div className="px-6 py-6 lg:px-8">
        {/* Input card skeleton */}
        <div className="rounded-3xl bg-white border border-slate-200/80 shadow-sm flex flex-col mb-6 overflow-hidden">
           <div className="h-16 w-full bg-slate-50 border-b border-slate-100"></div>
           <div className="p-5 flex-1 min-h-[160px]">
             <div className="h-24 w-full bg-slate-100 rounded-2xl mb-4"></div>
             <div className="flex justify-end"><div className="h-10 w-28 bg-indigo-100 rounded-xl"></div></div>
           </div>
        </div>
        
        {/* Steps skeleton */}
        <div className="mt-8 space-y-4">
          <div className="h-3 w-32 bg-slate-200 rounded mb-2"></div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1,2,3].map(i => (
              <div key={i} className="h-[140px] bg-white rounded-3xl border border-slate-200/80 p-5 flex flex-col justify-between">
                 <div className="size-12 rounded-2xl bg-slate-100"></div>
                 <div>
                   <div className="h-4 w-24 bg-slate-200 rounded mb-2"></div>
                   <div className="h-3 w-full bg-slate-100 rounded"></div>
                 </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

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
    isAdmin = (userRow as any)?.role === 'admin';
    console.log('[AnalyzePage] userId:', user.id, '→ role:', (userRow as any)?.role, '→ isAdmin:', isAdmin);
  }

  // Recent analyses (initial SSR data)
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

  const aiModel = process.env.AI_DISPLAY_NAME ?? process.env.AI_MODEL ?? 'gpt-4o-mini';

  // Pass initial SSR data as serializable props instead of a pre-rendered ReactNode
  const rightPanelData = {
    initialRecentAnalyses: recentAnalyses ?? [],
    initialTotalAnalyses: totalAnalyses ?? 0,
    initialTotalReports: totalReports ?? 0,
    popularItems,
    aiModel,
  };

  return (
    <div className="flex h-full min-h-[100dvh]">
      {/* ── Main workspace (left) ── */}
      <div className="flex-1 min-w-0 overflow-y-auto">
        <Suspense fallback={<AnalyzeSkeleton />}>
          <AnalyzeClient 
            isAdmin={isAdmin} 
            activeMaster={activeMaster ?? null} 
            popularItems={popularItems}
            aiModel={aiModel} 
            rightPanelData={rightPanelData}
          />
        </Suspense>
      </div>
    </div>
  );
}
