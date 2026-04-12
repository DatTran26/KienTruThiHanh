'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Clock, TrendingUp, CheckCircle, Zap,
  BookOpen, ShieldCheck, Cpu, BarChart3,
  Activity, Wifi, Hash, RefreshCw
} from 'lucide-react';
import Link from 'next/link';

interface Analysis {
  id: string;
  raw_description: string;
  confidence: number | null;
  extracted_amount: number | null;
  created_at: string;
}

interface Props {
  /** Initial data from SSR (passed as fallback for first paint) */
  initialRecentAnalyses?: Analysis[];
  initialTotalAnalyses?: number;
  initialTotalReports?: number;
  popularItems?: { sub_code: string, sub_title: string }[];
  aiModel?: string;
  /** Increment this to trigger a refresh (e.g. after a new analysis) */
  refreshTrigger?: number;
}

const STATUS_COLORS = [
  'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
  'bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100',
  'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
  'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
  'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100',
  'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
];

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'vừa xong';
  if (mins < 60) return `${mins} phút trước`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} giờ trước`;
  return `${Math.floor(hrs / 24)} ngày trước`;
}

export function AnalyzeRightPanel({ 
  initialRecentAnalyses = [],
  initialTotalAnalyses = 0,
  initialTotalReports = 0,
  popularItems = [],
  aiModel = 'gpt-4o-mini',
  refreshTrigger = 0,
}: Props) {
  const [recentAnalyses, setRecentAnalyses] = useState<Analysis[]>(initialRecentAnalyses);
  const [totalAnalyses, setTotalAnalyses] = useState(initialTotalAnalyses);
  const [totalReports, setTotalReports] = useState(initialTotalReports);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchHistory = useCallback(async () => {
    console.log('[AnalyzeRightPanel] fetchHistory called');
    setIsRefreshing(true);
    try {
      // Add cache-busting timestamp to avoid browser/Next.js caching
      const res = await fetch(`/api/analysis-history?t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (res.ok) {
        const data = await res.json();
        console.log('[AnalyzeRightPanel] Got', data.recentAnalyses?.length, 'analyses');
        setRecentAnalyses(data.recentAnalyses ?? []);
        setTotalAnalyses(data.totalAnalyses ?? 0);
        setTotalReports(data.totalReports ?? 0);
      } else {
        console.error('[AnalyzeRightPanel] API returned', res.status);
      }
    } catch (err) {
      console.error('[AnalyzeRightPanel] Failed to fetch history:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Sync state when server-provided props change (e.g. from router.refresh())
  useEffect(() => {
    if (initialRecentAnalyses.length > 0) {
      console.log('[AnalyzeRightPanel] Server data updated, syncing', initialRecentAnalyses.length, 'items');
      setRecentAnalyses(initialRecentAnalyses);
    }
  }, [initialRecentAnalyses]);

  useEffect(() => {
    setTotalAnalyses(initialTotalAnalyses);
  }, [initialTotalAnalyses]);

  useEffect(() => {
    setTotalReports(initialTotalReports);
  }, [initialTotalReports]);

  // Also do a client-side fetch when trigger changes (belt + suspenders)
  useEffect(() => {
    if (refreshTrigger > 0) {
      console.log('[AnalyzeRightPanel] refreshTrigger =', refreshTrigger, '— client-side fetch in 800ms');
      const timer = setTimeout(() => {
        fetchHistory();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [refreshTrigger, fetchHistory]);

  const STATUSES = [
    { icon: Zap,          label: <><span className="text-amber-600 drop-shadow-sm">{aiModel}</span><span className="opacity-70"> · AI Engine</span></>, badge: 'Online',  cls: 'bg-emerald-50 text-emerald-600 border-emerald-100', dot: 'bg-emerald-500' },
    { icon: Cpu,          label: 'TABMIS · Database',      badge: 'Live',    cls: 'bg-emerald-50 text-emerald-600 border-emerald-100', dot: 'bg-emerald-500' },
    { icon: Wifi,         label: 'API Gateway',            badge: 'Stable',  cls: 'bg-blue-50 text-blue-600 border-blue-100',          dot: 'bg-blue-500' },
    { icon: ShieldCheck,  label: 'TLS 1.3 · Mã hóa',     badge: 'Secured', cls: 'bg-slate-50 text-slate-600 border-slate-200',        dot: null },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50/30">

      {/* ── Panel header ── */}
      <div className="relative px-7 pt-8 pb-6 border-b border-slate-200/80 shrink-0 overflow-hidden bg-white z-10 shadow-sm">
        {/* Soft background glow */}
        <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-indigo-600/5 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[150px] h-[150px] bg-violet-600/5 rounded-full blur-[40px] translate-y-1/3 -translate-x-1/2 pointer-events-none" />
        
        <div className="relative z-10">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-500 mb-2 drop-shadow-sm flex items-center gap-1.5">
            <Activity className="size-3" />
            Bảng Điều Khiển
          </p>
          <h2 className="text-[22px] font-black text-slate-900 leading-tight">Thông tin hệ thống</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth">

        {/* ── Stats row ── */}
        <div className="grid grid-cols-2 gap-4">
          <div className="relative bg-white p-5 rounded-[24px] border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-900/5 overflow-hidden group hover:shadow-[0_15px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-[20px] translate-x-1/3 -translate-y-1/3 transition-all group-hover:scale-150 duration-700" />
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="size-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shadow-sm">
                <BarChart3 size={20} className="text-emerald-600" />
              </div>
              <span className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.2em] px-2.5 py-1 rounded-[8px] bg-white border border-emerald-200 shadow-sm z-10">
                Live
              </span>
            </div>
            <div className="relative z-10">
              <p className="text-[32px] font-black text-slate-900 leading-none mb-1.5 tracking-tight">{totalAnalyses.toLocaleString()}</p>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Lần tra cứu</p>
            </div>
          </div>

          <div className="relative bg-white p-5 rounded-[24px] border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-900/5 overflow-hidden group hover:shadow-[0_15px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/10 rounded-full blur-[20px] translate-x-1/3 -translate-y-1/3 transition-all group-hover:scale-150 duration-700" />
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="size-11 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center shadow-sm">
                <TrendingUp size={20} className="text-violet-600" />
              </div>
              <span className="text-[9px] font-black text-violet-600 uppercase tracking-[0.2em] px-2.5 py-1 rounded-[8px] bg-white border border-violet-200 shadow-sm z-10">
                Total
              </span>
            </div>
            <div className="relative z-10">
              <p className="text-[32px] font-black text-slate-900 leading-none mb-1.5 tracking-tight">{totalReports.toLocaleString()}</p>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Báo cáo</p>
            </div>
          </div>
        </div>

        {/* ── Recent analyses ── */}
        <div>
          <div className="flex items-center gap-2 mb-5 px-1">
            <div className="size-7 rounded-[8px] bg-indigo-50 border border-indigo-100 flex items-center justify-center shadow-sm">
              <Clock className="size-3.5 text-indigo-600 font-black" />
            </div>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-700">Lịch sử tra cứu gần đây</p>
            {isRefreshing && (
              <RefreshCw className="size-3 text-indigo-400 animate-spin ml-auto" />
            )}
          </div>

          {recentAnalyses.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-900/5 text-center">
              <div className="size-14 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                <Clock size={24} className="text-slate-300" />
              </div>
              <p className="text-[14px] font-bold text-slate-800 mb-1">Chưa có lịch sử</p>
              <p className="text-[12px] text-slate-500 font-medium">Kết quả đối chiếu sẽ sớm hiển thị ở đây</p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-900/5 divide-y divide-slate-100 p-2">
              {recentAnalyses.map((item) => {
                const pct = item.confidence ? Math.round(item.confidence * 100) : null;
                const isHigh = pct != null && pct >= 85;
                return (
                  <Link key={item.id} href={`/analyze?reqId=${item.id}`} className="block p-4 hover:bg-slate-50 rounded-2xl transition-colors cursor-pointer group">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <p className="text-[13px] font-semibold text-slate-800 line-clamp-2 leading-relaxed flex-1 group-hover:text-indigo-700 transition-colors">
                        &quot;{item.raw_description}&quot;
                      </p>
                      {pct != null && (
                        <span className={`text-[10px] font-black px-2 py-1 rounded-[8px] shrink-0 border shadow-sm ${
                          isHigh
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {pct}%
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                      <span>{formatRelativeTime(item.created_at)}</span>
                      {item.extracted_amount && (
                        <>
                          <span className="opacity-40">•</span>
                          <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded-[6px] border border-slate-200 shadow-inner">
                            {new Intl.NumberFormat('vi-VN').format(item.extracted_amount)} đ
                          </span>
                        </>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Common expense codes ── */}
        <div>
          <div className="flex items-center gap-2 mb-5 px-1">
            <div className="size-7 rounded-[8px] bg-slate-100 border border-slate-200 flex items-center justify-center shadow-sm">
              <BookOpen className="size-3.5 text-slate-500 font-black" />
            </div>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-700">Mã tiểu mục nổi bật</p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {popularItems.length > 0 ? popularItems.map((item, idx) => (
               <span
                 key={item.sub_code}
                 className={`inline-flex items-center shadow-sm px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-transform hover:-translate-y-0.5 cursor-default group ${STATUS_COLORS[idx % STATUS_COLORS.length]}`}
               >
                 <Hash className="size-3 mr-1 opacity-50 group-hover:text-current transition-colors" />
                 <span className="font-mono font-black text-[12px]">{item.sub_code}</span>
                 <span className="opacity-30 mx-2">|</span>
                 <span className="truncate max-w-[200px]">{item.sub_title}</span>
               </span>
            )) : (
              <span className="text-[12px] font-medium text-slate-400 italic bg-slate-50 px-4 py-2 rounded-xl border border-slate-200/80">Chưa có dữ liệu danh mục</span>
            )}
          </div>
        </div>

        {/* ── System status ── */}
        <div className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-900/5 opacity-90 transition-opacity hover:opacity-100">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2.5">
            <div className="size-7 rounded-[8px] bg-emerald-50 border border-emerald-100 flex items-center justify-center shadow-sm">
              <Activity className="size-3.5 text-emerald-600 font-black" />
            </div>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-700">Trạng thái hạ tầng</p>
          </div>
          <div className="divide-y divide-slate-100/60 p-2">
            {STATUSES.map(({ icon: Icon, label, badge, cls, dot }) => (
              <div key={badge} className="px-4 py-3 flex items-center justify-between group hover:bg-slate-50 rounded-2xl transition-colors">
                <div className="flex items-center gap-3.5 text-[13px] font-bold text-slate-700">
                  <div className="size-9 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="size-4.5 text-slate-500 group-hover:text-indigo-600 transition-colors" />
                  </div>
                  {label}
                </div>
                <span className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-[8px] shadow-sm border ${cls}`}>
                  {dot && <span className={`size-1.5 rounded-full ${dot} animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]`} />}
                  {badge}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── Footer ── */}
      <div className="px-7 py-4 border-t border-slate-200/80 bg-white shrink-0 flex items-center justify-between z-10 shadow-[0_-5px_20px_rgba(0,0,0,0.02)]">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          VKS · v2.0
        </p>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] bg-emerald-50 border border-emerald-100">
          <span className="size-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse" />
          <p className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.1em]">Online</p>
        </div>
      </div>

    </div>
  );
}
