'use client';

import { useState, useEffect, useRef, startTransition } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { DescriptionForm } from './description-form';
import { ResultSection } from './result-section';
import type { AnalysisResponse, AnalysisResult, ExpenseGroup } from '@/types/analysis';
import { Sparkles, FileText, X, Save, AlertCircle, Cpu, ShieldCheck, PencilLine, Plus, BrainCircuit, Zap, CheckCircle2, ChevronRight, Database, CheckCircle, Target, Activity, LayoutDashboard } from 'lucide-react';

import { AdminMasterPanel } from '@/app/(protected)/analyze/_components/admin-master-panel';
import { AnalyzeRightPanel } from '@/app/(protected)/analyze/_components/analyze-right-panel';

const QUICK_TIPS = [
  'Càng mô tả chi tiết (tên hoạt động, địa điểm, đối tượng), AI phân loại càng chính xác.',
  'Nên bao gồm số tiền khi có. VD: "Chi phí xăng xe công tác 200.000 đồng".',
  'Có thể nhập nhiều dòng dữ liệu: tên khoản chi + mô tả hoạt động chi tiết.'
];

type PageState = 'idle' | 'loading' | 'results' | 'error' | 'supplement' | 'supplement-loading';

interface Props {
  isAdmin?: boolean;
  activeMaster: any; // Type it slightly looser to avoid big refactors
  popularItems?: { sub_code: string, sub_title: string }[];
  aiModel?: string;
  rightPanelData?: {
    initialRecentAnalyses: any[];
    initialTotalAnalyses: number;
    initialTotalReports: number;
    popularItems: { sub_code: string, sub_title: string }[];
    aiModel: string;
  };
}

export default function AnalyzeClient({ 
  isAdmin = false, 
  activeMaster = null, 
  popularItems = [], 
  aiModel = 'gpt-4o-mini',
  rightPanelData,
}: Props) {
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showMobilePanel, setShowMobilePanel] = useState(false);
  const [state, setState]                   = useState<PageState>('idle');
  const [response, setResponse]             = useState<AnalysisResponse | null>(null);
  const [errorMsg, setErrorMsg]             = useState('');
  const [pendingItems, setPendingItems]     = useState<AnalysisResult[]>([]);
  const [reportName, setReportName]         = useState('');
  const [addingToReport, setAddingToReport] = useState(false);
  const [formKey, setFormKey]               = useState(0);
  const [supplementKey, setSupplementKey]   = useState(0);
  const [showTips, setShowTips]             = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const router = useRouter();
  const searchParams = useSearchParams();
  const reqId = searchParams.get('reqId');
  const reportIdParam = searchParams.get('reportId');
  const currentReqRef = useRef<string | null>(null);

  const [targetReportName, setTargetReportName] = useState<string | null>(null);
  
  const [saveMode, setSaveMode] = useState<'new' | 'existing'>('new');
  const [recentReports, setRecentReports] = useState<{id: string, report_name: string}[]>([]);
  const [selectedExistingReport, setSelectedExistingReport] = useState<string>('');
  
  const [savedTargetInfo, setSavedTargetInfo] = useState<{ id: string, name: string } | null>(null);

  useEffect(() => {
    if (pendingItems.length > 0 && !reportIdParam) {
      const fetchRecentReports = async () => {
        const supabase = createClient();
        const { data } = await supabase
          .from('reports')
          .select('id, report_name')
          .order('created_at', { ascending: false })
          .limit(10);
        if (data && data.length > 0) {
          setRecentReports(data);
          setSelectedExistingReport(data[0].id);
        }
      };
      fetchRecentReports();
    }
  }, [pendingItems.length, reportIdParam]);

  useEffect(() => {
    if (reportIdParam) {
      const fetchReport = async () => {
         const supabase = createClient();
         const { data } = await supabase.from('reports').select('report_name').eq('id', reportIdParam).single();
         if (data) setTargetReportName(data.report_name);
      };
      fetchReport();
    }
  }, [reportIdParam]);

  useEffect(() => {
    if (reqId) {
      sessionStorage.setItem('last_analyze_req', reqId);
      if (currentReqRef.current !== reqId) {
        loadHistoryItem(reqId);
        setShowMobilePanel(false);
      }
    } else {
      const savedReq = sessionStorage.getItem('last_analyze_req');
      if (savedReq) {
        router.replace(`/analyze?reqId=${savedReq}`, { scroll: false });
      }
    }
  }, [reqId, router]);

  async function loadHistoryItem(id: string) {
    currentReqRef.current = id;
    setState('loading');
    setResponse(null);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('analysis_requests')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error || !data) {
        setErrorMsg('Không tìm thấy lịch sử tra cứu.');
        setState('error');
        return;
      }

      const rawJson = data.top_result_json as any;
      const amount = data.extracted_amount;
      const confidence = data.confidence || 0;

      // Detect format: new ExpenseGroup[] has 'bestItem', old AnalysisResult[] has 'groupCode'
      let expenseGroups: ExpenseGroup[];
      let results: AnalysisResult[];

      if (Array.isArray(rawJson) && rawJson.length > 0 && rawJson[0].bestItem) {
        // New format: ExpenseGroup[]
        expenseGroups = rawJson as ExpenseGroup[];
        results = [expenseGroups[0].bestItem, ...expenseGroups[0].alternatives];
      } else if (Array.isArray(rawJson) && rawJson.length > 0) {
        // Old format: AnalysisResult[]
        results = rawJson as AnalysisResult[];
        expenseGroups = [{
          originalDesc: data.raw_description,
          amount: amount,
          bestItem: results[0],
          alternatives: results.slice(1),
        }];
      } else {
        setErrorMsg('Dữ liệu lịch sử không hợp lệ.');
        setState('error');
        return;
      }
      
      const restoredResponse: AnalysisResponse = {
        requestId: data.id,
        amount: amount,
        results,
        expenseGroups,
        confidenceLevel: confidence >= 0.85 ? 'high' : confidence >= 0.6 ? 'medium' : 'low'
      };

      setResponse(restoredResponse);
      setState('results');
    } catch {
      setErrorMsg('Lỗi đường truyền khi tải lịch sử.');
      setState('error');
    }
  }

  async function handleAnalyze(description: string) {
    if (reqId) router.replace('/analyze', { scroll: false });
    setState('loading');
    setResponse(null);
    try {
      const res  = await fetch('/api/analyze-description', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ description }),
      });
      const data = await res.json();
      if (!res.ok) { setErrorMsg(data.error ?? 'Kết nối máy chủ AI thất bại'); setState('error'); return; }
      setResponse(data as AnalysisResponse);
      setState('results');
      currentReqRef.current = data.requestId;
      sessionStorage.setItem('last_analyze_req', data.requestId);
      startTransition(() => {
        router.replace(`/analyze?reqId=${data.requestId}`, { scroll: false });
        router.refresh();
      });
      // Trigger right panel refresh AFTER router.refresh() settles
      // router.refresh() re-renders the server component tree which may reset client state,
      // so we delay the trigger to ensure it fires after the reconciliation
      setTimeout(() => {
        setRefreshTrigger(prev => prev + 1);
      }, 1500);
    } catch {
      setErrorMsg('Mất kết nối máy chủ');
      setState('error');
    }
  }

  async function handleSupplementAnalyze(description: string) {
    setState('supplement-loading');
    try {
      const res  = await fetch('/api/analyze-description', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ description }),
      });
      const data = await res.json() as AnalysisResponse;
      if (!res.ok) { setState('supplement'); return; }
      setResponse(prev => {
        if (!prev) return data;
        return {
          ...prev,
          expenseGroups: [...(prev.expenseGroups ?? []), ...(data.expenseGroups ?? [])],
          results: [...(prev.results ?? []), ...(data.results ?? [])],
        };
      });
      setSupplementKey(k => k + 1);
      setState('results');
      startTransition(() => {
        router.refresh();
      });
    } catch {
      setState('supplement');
    }
  }



  function handleAddToReport(result: AnalysisResult | AnalysisResult[]) {
    if (Array.isArray(result)) {
      setPendingItems(result);
    } else {
      setPendingItems([result]);
    }
    setReportName('');
  }

  async function handleConfirmAdd() {
    if (pendingItems.length === 0) return;
    setAddingToReport(true);
    try {
      let currentReportId = '';

      if (reportIdParam) {
        currentReportId = reportIdParam;
      } else if (saveMode === 'existing') {
        currentReportId = selectedExistingReport;
        if (!currentReportId) {
          toast.error("Vui lòng chọn báo cáo đích");
          setAddingToReport(false);
          return;
        }
      } else {
        if (!reportName.trim()) { setAddingToReport(false); return; }
        const reportRes  = await fetch('/api/reports', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ report_name: reportName.trim() }),
        });
        const reportData = await reportRes.json();
        if (!reportRes.ok) { toast.error(reportData.error ?? 'Lỗi tạo báo cáo'); setAddingToReport(false); return; }
        currentReportId = reportData.reportId;
      }

      // Parallel insert of all items
      const insertPromises = pendingItems.map(item => 
        fetch(`/api/reports/${currentReportId}/items`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({
            group_code:      item.groupCode,
            group_title:     item.groupTitle,
            sub_code:        item.subCode,
            sub_title:       item.subTitle,
            expense_content: (item.description || item.subTitle || item.groupTitle || item.subCode || 'Chi phí').slice(0, 5000),
            amount:          item.amount ?? 0,
          }),
        })
      );
      
      const resArray = await Promise.all(insertPromises);
      const failed = resArray.some(res => !res.ok);
      if (failed) { toast.error('Lỗi lưu trữ một số dòng dữ liệu'); return; }

      setPendingItems([]);
      setSavedTargetInfo({
        id: currentReportId,
        name: saveMode === 'new' ? reportName.trim() : (recentReports.find(r => r.id === currentReportId)?.report_name || targetReportName || 'Phiếu hiện tại')
      });
      router.replace('/analyze', { scroll: false });

      toast.success(
        <span className="text-sm font-medium">
          Đã lưu vào báo cáo.{' '}
          <Link href={`/reports/${currentReportId}`} className="text-blue-600 font-bold hover:underline ml-1">
            Xem Báo cáo →
          </Link>
        </span>,
      );
    } catch {
      toast.error('Mất kết nối đường truyền');
    } finally {
      setAddingToReport(false);
    }
  }

  return (
    <div className="flex min-h-[100dvh] w-full relative">
      {/* Main content area */}
      <div className="flex-1 min-w-0 overflow-y-auto pb-20 lg:pb-8 animate-fade-in-up">

      {/* ── Page Header — Liquid Glass Light ── */}
      <div className="relative px-6 py-8 flex flex-col justify-end bg-white border-b border-slate-200/80 overflow-hidden shadow-sm">
        {/* Soft blur blobs in background */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet-500/5 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3 pointer-events-none" />
        
        {/* Subtle dot grid for tech feel */}
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-50 pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-5 w-full">
          <div>
            <div className="flex items-center gap-2.5 mb-3.5">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] bg-indigo-50 border border-indigo-100/80 text-[9px] font-black uppercase tracking-[0.2em] text-indigo-700 shadow-[inset_0_1px_2px_rgba(255,255,255,0.5)]">
                <BrainCircuit className="size-3" />
                Phân loại AI
              </span>
              <span className="text-slate-200">/</span>
              <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.15em] text-amber-600 px-2.5 py-1 rounded-[8px] border border-amber-200 bg-amber-50 shadow-sm shrink-0">
                <span className="relative flex size-1.5">
                  <span className="absolute inset-0 rounded-full bg-emerald-400 opacity-70 animate-ping" />
                  <span className="relative size-1.5 rounded-full bg-emerald-500" />
                </span>
                {aiModel}
              </span>
              {/* MOBILE DASHBOARD TOGGLE */}
              <button 
                onClick={() => setShowMobilePanel(true)}
                className="xl:hidden ml-auto flex shrink-0 items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-slate-900 border border-slate-800 text-[9px] font-black uppercase tracking-[0.1em] text-white shadow-md active:scale-95 transition-all"
              >
                <LayoutDashboard className="size-3 text-indigo-400" />
                Bảng điều khiển
              </button>
            </div>
            
            <h1 className="text-[1.7rem] font-black text-slate-900 tracking-tight leading-none mb-2">
              Định danh <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 drop-shadow-sm">Chi phí Ngân sách</span>
            </h1>
            <p className="text-slate-500 text-[13px] font-medium leading-relaxed">
              Tra cứu mã tiểu mục TABMIS tự động bằng trí tuệ nhân tạo
            </p>
          </div>
          
          <div className="hidden sm:flex items-center gap-4 bg-white/70 backdrop-blur-xl border border-slate-200 p-2.5 pl-5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-900/5">
            <div className="flex flex-col items-end justify-center pr-3 border-r border-slate-200 gap-1.5 h-10">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 tracking-wide">
                <Database className="size-3.5 text-emerald-500/80" strokeWidth={2.5} />
                TABMIS · Đồng bộ
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 tracking-wide">
                <ShieldCheck className="size-3.5 text-slate-400" strokeWidth={2.5} />
                Mã hóa đầu cuối
              </div>
            </div>
            <div className="size-11 rounded-xl bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 flex items-center justify-center shadow-[inset_0_2px_4px_rgba(255,255,255,0.5),0_2px_8px_rgba(99,102,241,0.1)]">
              <BrainCircuit className="size-5 text-indigo-600" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Main workspace ── */}
      <div className="px-6 py-6 lg:px-8" style={{ background: '#f1f5f9' }}>

        {/* Input card — Light Liquid Glass */}
        {/* Input card & Tips Container — Light Liquid Glass */}
        {state !== 'results' && state !== 'supplement' && state !== 'supplement-loading' && (
          <div className="flex flex-col xl:flex-row items-stretch gap-6 mb-6">
            <div className="rounded-3xl overflow-hidden bg-white border-2 border-amber-700/40 shadow-[0_8px_30px_rgba(180,83,9,0.08)] ring-1 ring-amber-900/5 backdrop-blur-xl flex-1 max-w-full transition-all">
              {/* Card header */}
              <div className="flex items-center gap-3 px-6 py-4 border-b border-amber-100/50 bg-amber-50/20">
                <div className={`size-10 rounded-xl flex items-center justify-center shadow-sm ${reportIdParam ? 'bg-emerald-50 border border-emerald-100' : 'bg-amber-50 border border-amber-200/60'}`}>
                  {reportIdParam ? (
                    <Database className="size-5 text-emerald-600" strokeWidth={2.5} />
                  ) : (
                    <Sparkles className="size-5 text-amber-600" strokeWidth={2.5} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[14px] font-bold text-slate-900 leading-tight">Nhập mô tả chi phí</p>
                    {reportIdParam && (
                      <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest bg-emerald-100 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="size-3" />
                        Gắn trực tiếp
                      </span>
                    )}
                  </div>
                  <div className="mt-1">
                    {reportIdParam ? (
                      <div className="relative mt-0.5 group inline-flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-900/95 shadow-[0_8px_30px_-4px_rgba(15,23,42,0.2)] ring-1 ring-slate-800 overflow-hidden isolate max-w-full">
                        {/* Shimmer sweep effect */}
                        <div className="absolute inset-0 -translate-x-[150%] bg-gradient-to-r from-transparent via-blue-400/20 to-transparent group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out z-0" />
                        
                        <div className="relative z-10 flex items-center justify-center size-5 rounded-lg bg-blue-500/20 border border-blue-400/20 ring-1 ring-inset ring-transparent shrink-0">
                          <Target className="size-3 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
                        </div>
                        <span className="relative z-10 text-yellow-400/90 font-bold text-[10px] uppercase tracking-[0.15em] shrink-0">
                          Phiếu đích:
                        </span>
                        <span className="relative z-10 text-white font-bold text-[12.5px] truncate drop-shadow-sm pr-1">
                          {targetReportName || "Đang tải dữ liệu..."}
                        </span>
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                        Hệ thống sẽ đối chiếu và đề xuất mã tiểu mục phù hợp
                      </p>
                    )}
                  </div>
                </div>

                <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
                  <button
                    onClick={() => setShowTips(!showTips)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors border shadow-sm ${
                      showTips ? 'bg-amber-50 text-amber-700 border-amber-300 shadow-inner' : 'bg-white text-slate-600 hover:bg-amber-50/50 border-slate-200'
                    }`}
                    title="Hiện mẹo tương tác AI"
                  >
                    <CheckCircle size={12} strokeWidth={2.5} className={showTips ? 'text-amber-600' : 'text-slate-400'} />
                    <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">Mẹo sử dụng</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider sm:hidden">Mẹo</span>
                  </button>

                  {/* Mobile Right panel trigger */}
                  <button
                    onClick={() => setShowMobilePanel(true)}
                    className="xl:hidden flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors border border-indigo-100 shadow-sm"
                    title="Bảng điều khiển"
                  >
                    <Activity size={12} strokeWidth={2.5} />
                    <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">Bảng điều khiển</span>
                  </button>

                  {/* Admin trigger */}
                  {isAdmin && (
                    <button
                      onClick={() => setShowAdminPanel(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors border border-rose-100 shadow-sm"
                      title="Cập nhật Kho dữ liệu chuẩn"
                    >
                      <PencilLine size={12} strokeWidth={2.5} />
                      <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">Kho dữ liệu</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="p-5">
                <DescriptionForm key={formKey} onSubmit={handleAnalyze} isLoading={state === 'loading'} />
              </div>

              {/* System status bar */}
              <div className="flex items-center gap-5 px-6 py-3 border-t border-slate-100 bg-slate-50/80">
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600">
                  <span className="size-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)] animate-pulse" />
                  TABMIS · Đồng bộ
                </span>
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                  <ShieldCheck className="size-3 text-slate-400" strokeWidth={2.5} />
                  Mã hóa đầu cuối
                </span>
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-amber-600 ml-auto">
                  <Zap className="size-3 text-amber-500" strokeWidth={2.5} />
                  {aiModel}
                </span>
              </div>
            </div>

            {/* Quick tips panel (Toggled) */}
            {showTips && (
              <div className="w-full xl:w-[380px] shrink-0 animate-fade-in-left">
                <div className="flex items-center gap-2 mb-4 px-1">
                  <div className="size-7 rounded-[8px] bg-blue-50 border border-blue-100 flex items-center justify-center shadow-sm">
                    <CheckCircle className="size-3.5 text-blue-600 font-black" />
                  </div>
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-700">Mẹo tương tác AI</p>
                </div>
                <div className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-900/5 p-2 h-auto block">
                  {QUICK_TIPS.map((tip, i) => (
                    <div key={i} className="flex gap-4 px-5 py-4 hover:bg-slate-50 transition-colors rounded-2xl group">
                      <div className="size-7 rounded-[10px] bg-blue-50 text-blue-600 font-black text-[12px] flex items-center justify-center shrink-0 shadow-sm border border-blue-100 group-hover:scale-110 transition-transform">
                        {i + 1}
                      </div>
                      <p className="text-[13px] text-slate-600 leading-relaxed font-medium">
                        {tip}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Results area ── */}

        {/* Loading */}
        {state === 'loading' && (
          <div className="rounded-3xl overflow-hidden mb-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white border border-slate-200/80">
            <div className="p-12 flex flex-col items-center justify-center">
              <div className="relative size-16 mb-6 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border border-indigo-100" />
                <div className="absolute inset-0 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                <div className="absolute inset-1 rounded-full border border-indigo-50" />
                <Sparkles className="size-6 text-indigo-600" />
              </div>
              <p className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-800 mb-4">
                Đang phân tích dữ liệu...
              </p>
              <div className="w-56 h-1 rounded-full overflow-hidden bg-slate-100">
                <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-400 to-indigo-500 animate-shimmer" />
              </div>
              <p className="text-[10px] text-slate-500 mt-3 font-medium">AI đang đối chiếu cơ sở dữ liệu TABMIS...</p>
            </div>
          </div>
        )}

        {/* Error */}
        {state === 'error' && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 flex items-start gap-3 animate-scale-in mb-6 shadow-sm">
            <div className="size-9 rounded-xl bg-white border border-rose-100 flex items-center justify-center shrink-0 shadow-sm">
              <AlertCircle className="size-4 text-rose-500" />
            </div>
            <div>
              <p className="font-black text-[13px] text-rose-900 mb-0.5 uppercase tracking-wide">Xảy ra lỗi xử lý</p>
              <p className="text-[12px] font-medium text-rose-700/80">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Results + Supplement */}
        {(state === 'results' || state === 'supplement' || state === 'supplement-loading') && response && (
          <div className="animate-fade-in-up">
            {/* Top Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl mb-6 bg-white border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-900/5">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shadow-sm">
                  <CheckCircle2 className="size-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-[14px] font-bold text-slate-900">Chi tiết phân tích</p>
                  <p className="text-[11px] font-medium text-slate-500 mt-0.5">Vui lòng kiểm tra và xác nhận các kết quả AI đề xuất bên dưới</p>
                </div>
              </div>
              <div className="flex w-full sm:w-auto items-center gap-2">
                <button
                  onClick={() => { 
                    setFormKey(prev => prev + 1); 
                    setState('idle');
                    setErrorMsg('');
                    setResponse(null);
                    setSavedTargetInfo(null);
                    currentReqRef.current = null;
                    sessionStorage.removeItem('last_analyze_req');
                    
                    // Clear URL to signify a completely new request
                    if (reqId) router.replace('/analyze', { scroll: false });
                  }}
                  className="flex-1 sm:flex-none px-4 py-2.5 bg-amber-50 text-amber-600 hover:bg-amber-100 hover:text-amber-700 font-bold text-[11px] uppercase tracking-wider rounded-xl transition-all border border-amber-200 shadow-sm flex items-center justify-center gap-2 active:scale-95"
                >
                  <Plus className="size-3.5" />
                  Tạo mới
                </button>
                <button
                  onClick={() => { setSupplementKey(k => k + 1); setState('supplement'); }}
                  className={`flex-1 sm:flex-none px-4 py-2.5 font-bold text-[11px] uppercase tracking-wider rounded-xl transition-all border shadow-sm flex items-center justify-center gap-2 active:scale-95 ${(state === 'supplement' || state === 'supplement-loading') ? 'bg-indigo-600 border-indigo-700 text-white shadow-[0_4px_15px_-3px_rgba(99,102,241,0.4)]' : 'bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50'}`}
                >
                  <PencilLine className="size-3.5" />
                  Bổ sung mô tả
                </button>
              </div>
            </div>

            {(state === 'supplement' || state === 'supplement-loading') && (
              <div className="mb-6 rounded-3xl overflow-hidden bg-white border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-900/5">
                <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shadow-sm">
                      <PencilLine className="size-4 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-slate-900">Bổ sung mô tả thêm</p>
                      <p className="text-[11px] text-slate-500 font-medium">Kết quả mới sẽ được gộp vào bảng bên dưới</p>
                    </div>
                  </div>
                  <button onClick={() => setState('results')} className="size-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                    <X className="size-4" />
                  </button>
                </div>
                <div className="p-5">
                  <DescriptionForm key={supplementKey} onSubmit={handleSupplementAnalyze} isLoading={state === 'supplement-loading'} />
                </div>
              </div>
            )}

            <ResultSection response={response} onAddToReport={handleAddToReport} savedTargetInfo={savedTargetInfo} />
          </div>
        )}


        {/* ── Idle state guide ── */}
        {state === 'idle' && (
          <div className="mt-6 animate-fade-in-up space-y-6">
            {/* How it works — horizontal steps */}
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 ml-1">Quy trình tra cứu</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { step: '01', title: 'Nhập mô tả', desc: 'Gõ hoặc dán nội dung hoá đơn, nghiệp vụ kế toán cần tra cứu', icon: <PencilLine className="size-5 text-indigo-600" />, iconBg: 'bg-indigo-50 border-indigo-100', customBorder: 'border-slate-200/80 hover:border-amber-200/50' },
                  { step: '02', title: 'VKS phân tích', desc: <><span className="font-bold text-amber-500">{aiModel}</span> đối chiếu với cơ sở dữ liệu chuẩn TABMIS và đề xuất tiểu mục</>, icon: <Zap className="size-5 text-amber-500 fill-amber-500/20" strokeWidth={2.5} />, iconBg: 'bg-gradient-to-br from-amber-50 to-orange-50/50 border-amber-200/60 shadow-[0_0_15px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/10', customBorder: 'border-amber-200/60 shadow-[0_4px_20px_rgba(245,158,11,0.08)] ring-1 ring-amber-500/10' },
                  { step: '03', title: 'Lưu báo cáo', desc: 'Xác nhận kết quả và ghi nhận vào phiếu hạch toán kế toán', icon: <CheckCircle2 className="size-5 text-emerald-600" />, iconBg: 'bg-emerald-50 border-emerald-100', customBorder: 'border-slate-200/80 hover:border-amber-200/50' },
                ].map(({ step, title, desc, icon, iconBg, customBorder }) => (
                  <div key={step} className={`relative bg-white rounded-3xl p-5 border ${customBorder} hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.06)] transition-all duration-300 group hover:-translate-y-1 overflow-hidden cursor-default`}>
                    <div className="absolute top-0 right-0 p-4 opacity-[0.02] group-hover:scale-110 group-hover:opacity-[0.05] transition-all origin-center pointer-events-none">
                       <span className="font-mono text-8xl font-black text-slate-900 group-hover:text-amber-500 transition-colors">{step}</span>
                    </div>
                    <div className="flex flex-col gap-3 relative z-10">
                      <div className="flex items-center justify-between">
                         <div className={`size-12 rounded-2xl ${iconBg} border flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                           {icon}
                         </div>
                         <span className="text-[10px] font-black tracking-[0.2em] text-slate-300 group-hover:text-amber-400/70 transition-colors uppercase me-1">Bước {step}</span>
                      </div>
                      <div className="mt-2">
                        <h3 className="text-[15px] font-bold text-slate-800 group-hover:text-amber-600 transition-colors">{title}</h3>
                        <p className="text-[12px] text-slate-500 leading-relaxed mt-1 font-medium">{desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sample expense types */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)]">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="size-7 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100/80">
                  <Database className="size-4 text-indigo-600" />
                </div>
                <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-600">
                  Ví dụ các loại chi phí thường gặp
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {popularItems.length > 0 ? popularItems.map(({ sub_code, sub_title }) => (
                  <div key={sub_code} className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 hover:bg-white hover:border-indigo-100 hover:shadow-[0_4px_15px_-4px_rgba(99,102,241,0.15)] transition-all duration-300 group cursor-default">
                    <span className="font-mono text-[11.5px] font-black text-indigo-700 bg-indigo-100 border border-indigo-200/50 px-2.5 py-1 rounded-[10px] shrink-0 transition-all group-hover:border-indigo-300">
                      {sub_code}
                    </span>
                    <span className="text-[12px] font-medium text-slate-600 line-clamp-2 leading-relaxed group-hover:text-slate-900 transition-colors">{sub_title}</span>
                  </div>
                )) : (
                  <div className="col-span-1 sm:col-span-2 text-[12px] font-medium text-slate-500 italic text-center py-6 bg-slate-50/50 rounded-2xl border border-slate-100 border-dashed">
                    Vui lòng tải lên Kho dữ liệu chuẩn để hiện gợi ý thực tế.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>


      {/* ── Save-to-report modal ── */}
      {pendingItems.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md" onClick={() => setPendingItems([])} />
          
          <div className="relative rounded-[28px] w-full max-w-[520px] bg-white overflow-hidden animate-scale-in shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] ring-1 ring-slate-900/10">
            {/* Modal header */}
            <div className="px-7 py-5 bg-gradient-to-br from-slate-900 to-indigo-950 border-b border-white/10 flex items-center justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute top-0 left-0 w-40 h-40 bg-violet-500/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2" />
              <div className="flex items-center gap-3.5 relative z-10">
                <div className="size-11 rounded-[14px] bg-white/10 border border-white/10 flex items-center justify-center shadow-inner backdrop-blur-md">
                  <FileText className="size-5 !text-white" />
                </div>
                <div>
                  <h3 className="text-[17px] font-black !text-white tracking-tight drop-shadow-sm">
                    {reportIdParam ? 'Thêm vào Báo cáo' : 'Lưu vào Báo cáo mới'}
                  </h3>
                  <p className="text-[12px] !text-indigo-100 font-medium mt-0.5">{pendingItems.length} khoản chi phí hợp lệ</p>
                </div>
              </div>
              <button 
                onClick={() => setPendingItems([])}
                className="size-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors relative z-10"
              >
                <X className="size-4.5" />
              </button>
            </div>

            <div className="px-7 py-6">
              {/* Items preview */}
              <div className="mb-6 p-1 rounded-[20px] bg-slate-50/80 border border-slate-200/60 shadow-inner">
                <div className="p-4 max-h-[220px] overflow-y-auto min-[300px]:scrollbar-thin rounded-[16px] bg-white border border-slate-100 shadow-sm">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3.5">Thông tin {pendingItems.length} khoản chi phí</p>
                  <div className="flex flex-col gap-3.5">
                     {pendingItems.map((item, idx) => (
                       <div key={idx} className="flex justify-between items-start gap-4 pb-3.5 border-b border-slate-100 last:border-0 last:pb-0">
                         <div className="flex items-start gap-3 min-w-0">
                           <span className="font-mono font-black text-indigo-700 bg-indigo-50 border border-indigo-100/80 px-2 py-0.5 rounded-[6px] text-[11px] shrink-0 mt-0.5">{item.subCode}</span>
                           <span className="text-[13px] text-slate-700 font-semibold line-clamp-2 leading-relaxed">{item.subTitle}</span>
                         </div>
                         {item.amount != null && item.amount > 0 && (
                           <span className="text-[13px] font-black text-slate-800 shrink-0 whitespace-nowrap mt-0.5">
                             {new Intl.NumberFormat('vi-VN').format(item.amount)} VNĐ
                           </span>
                         )}
                       </div>
                     ))}
                  </div>
                </div>
                
                {/* Total amount bar */}
                <div className="flex justify-between items-center px-5 py-3 mt-1">
                  <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">Thành tiền:</span>
                  <span className="text-[18px] font-black text-amber-500 tracking-tight drop-shadow-sm">
                    {new Intl.NumberFormat('vi-VN').format(pendingItems.reduce((acc, curr) => acc + (curr.amount || 0), 0))} <span className="text-[14px] text-amber-600/80">đ</span>
                  </span>
                </div>
              </div>

            {/* Form */}
            <div className="space-y-4">
              {reportIdParam ? (
                <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl mx-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Database className="size-4 text-indigo-500" />
                    <p className="text-[12px] font-bold text-indigo-900">Phiếu đích</p>
                  </div>
                  <p className="text-[13px] text-indigo-700 font-semibold line-clamp-1">
                    {targetReportName || "Đang tải tên phiếu..."}
                  </p>
                  <p className="text-[11px] text-indigo-500 font-medium mt-1">Các khoản chi phí sẽ được nối thẳng vào phiếu này.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Option switch */}
                  <div className="flex p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/60 shadow-inner">
                    <button
                      onClick={() => setSaveMode('new')}
                      className={`flex-1 py-2 text-[12px] font-extrabold rounded-xl transition-all duration-300 ${saveMode === 'new' ? 'bg-white text-indigo-700 shadow-[0_2px_8px_rgb(0,0,0,0.06)] border border-slate-200/80' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      Báo cáo mới
                    </button>
                    <button
                      onClick={() => setSaveMode('existing')}
                      className={`flex-1 py-2 text-[12px] font-extrabold rounded-xl transition-all duration-300 ${saveMode === 'existing' ? 'bg-white text-indigo-700 shadow-[0_2px_8px_rgb(0,0,0,0.06)] border border-slate-200/80' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      Báo cáo đã có
                    </button>
                  </div>

                  {saveMode === 'new' ? (
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
                        Tên phiếu / Mã báo cáo <span className="text-rose-500">*</span>
                      </label>
                      <input
                        value={reportName}
                        onChange={e => setReportName(e.target.value)}
                        placeholder="VD: Báo cáo công tác Hà Nội Q1/2026..."
                        onKeyDown={e => e.key === 'Enter' && handleConfirmAdd()}
                        autoFocus
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-[13px] text-slate-800 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
                        Chọn báo cáo đích <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={selectedExistingReport}
                        onChange={e => setSelectedExistingReport(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] appearance-none cursor-pointer"
                        style={{ backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%2364748b\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")', backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                      >
                        {recentReports.length > 0 ? (
                          recentReports.map(rp => (
                            <option key={rp.id} value={rp.id}>
                              {rp.report_name}
                            </option>
                          ))
                        ) : (
                          <option value="" disabled>Không có báo cáo nào gần đây</option>
                        )}
                      </select>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setPendingItems([])}
                  className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 hover:text-slate-800 hover:bg-slate-50 hover:border-slate-300 rounded-xl font-bold transition-all text-[12px] shadow-sm active:scale-95"
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfirmAdd}
                  disabled={addingToReport || (!reportIdParam && saveMode === 'new' && !reportName.trim()) || (!reportIdParam && saveMode === 'existing' && !selectedExistingReport)}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-black py-2.5 px-4 rounded-xl text-[12px] uppercase tracking-widest transition-all disabled:opacity-50 flex justify-center items-center gap-2 active:scale-[0.98] shadow-[0_4px_15px_-3px_rgba(99,102,241,0.4)]"
                >
                  {addingToReport
                    ? <><span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Đang lưu...</>
                    : <><FileText className="size-4" strokeWidth={2.5} /> {(reportIdParam || saveMode === 'existing') ? "Lưu vào phiếu" : "Tạo phiếu mới"}</>
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}
      </div>{/* End main content area */}

      {/* ── Admin Master Panel Modal ── */}
      {showAdminPanel && isAdmin && (
        <AdminMasterPanel
          activeMaster={activeMaster}
          onClose={() => setShowAdminPanel(false)}
        />
      )}

      {/* ── Mobile Right Panel Dialog ── */}
      {showMobilePanel && (
        <div className="fixed inset-0 z-50 flex justify-end xl:hidden">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md" onClick={() => setShowMobilePanel(false)} />
          <div className="relative w-full max-w-[360px] sm:max-w-md bg-white overflow-y-auto animate-fade-in-left shadow-2xl z-10 flex flex-col h-full">
            <button
              onClick={() => setShowMobilePanel(false)}
              className="absolute top-6 right-6 size-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors z-20"
            >
              <X className="size-4" />
            </button>
            <div className="flex-1 overflow-y-auto pb-16">
              <AnalyzeRightPanel
                {...(rightPanelData ?? {})}
                refreshTrigger={refreshTrigger}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Desktop Right Panel ── */}
      <aside className="hidden xl:flex flex-col w-[440px] 2xl:w-[480px] shrink-0 border-l border-slate-200/80 bg-white overflow-y-auto z-10 shadow-[-10px_0_30px_rgba(0,0,0,0.01)] relative animate-fade-in-up">
        <AnalyzeRightPanel
          {...(rightPanelData ?? {})}
          refreshTrigger={refreshTrigger}
        />
      </aside>
    </div>
  );
}
