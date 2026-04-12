'use client';

import { useState, useMemo } from 'react';
import { Search, Filter, ArrowUpDown, Clock, Database, FileText, Calendar } from 'lucide-react';
import { ReportCard } from './report-card';
import { CreateReportDialog } from './create-report-dialog';
import { GlassDateRangePicker } from './glass-date-range-picker';
import { GlassAmountPicker } from './glass-amount-picker';

interface ReportListClientProps {
  reports: any[];
}

export function ReportListClient({ reports }: ReportListClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'exported'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'amount_desc' | 'amount_asc'>('newest');
  
  // Date range state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Amount range state
  const [minAmount, setMinAmount] = useState<number | null>(null);
  const [maxAmount, setMaxAmount] = useState<number | null>(null);

  const { absoluteMin, absoluteMax } = useMemo(() => {
    if (!reports || reports.length === 0) return { absoluteMin: 0, absoluteMax: 10000000 };
    let min = reports[0].total_amount || 0;
    let max = reports[0].total_amount || 0;
    for (const r of reports) {
        const amt = r.total_amount || 0;
        if (amt < min) min = amt;
        if (amt > max) max = amt;
    }
    // Prevent max dropping below min if all are same
    if (min === max) {
       min = 0;
       if (max === 0) max = 10000000;
    }
    return { absoluteMin: min, absoluteMax: max };
  }, [reports]);

  const filteredAndSortedReports = useMemo(() => {
    let result = [...(reports || [])];

    // 1. Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(r => 
        (r.report_name?.toLowerCase() || '').includes(q) ||
        (r.report_code?.toLowerCase() || '').includes(q)
      );
    }

    // 2. Status filter
    if (statusFilter !== 'all') {
      result = result.filter(r => r.status === statusFilter);
    }

    // 3. Date range filter
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      result = result.filter(r => new Date(r.created_at) >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      result = result.filter(r => new Date(r.created_at) <= end);
    }
    
    // 4. Amount condition
    if (minAmount !== null) {
      result = result.filter(r => (r.total_amount || 0) >= minAmount);
    }
    if (maxAmount !== null) {
      result = result.filter(r => (r.total_amount || 0) <= maxAmount);
    }

    // 5. Sorting
    result.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sortBy === 'amount_desc') return (b.total_amount || 0) - (a.total_amount || 0);
      if (sortBy === 'amount_asc') return (a.total_amount || 0) - (b.total_amount || 0);
      return 0;
    });

    return result;
  }, [reports, searchTerm, statusFilter, sortBy, startDate, endDate, minAmount, maxAmount]);

  if (!reports?.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-in-up">
        {/* Same empty state as before */}
        <div
          className="relative size-28 rounded-3xl flex items-center justify-center mx-auto mb-7"
          style={{
            background: 'linear-gradient(135deg, #f1f5f9 0%, #e8edf5 100%)',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 24px rgba(15,23,42,0.06)',
          }}
        >
          <Database size={44} className="text-slate-300" />
          <div className="absolute -top-1.5 -right-1.5 size-8 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm">
            <FileText size={14} className="text-violet-400" />
          </div>
        </div>

        <div className="max-w-xs mb-8">
          <h3 className="text-[1.1rem] font-bold text-slate-800 mb-2.5">Kho báo cáo của bạn đang trống</h3>
          <p className="text-[13px] text-slate-500 leading-relaxed">
            Thực hiện phân loại chi phí bằng AI, sau đó lưu kết quả vào một báo cáo để bắt đầu xây dựng hồ sơ hạch toán.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <CreateReportDialog />
          <a
            href="/analyze"
            className="px-5 py-2.5 rounded-xl text-[13px] font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            Phân loại chi phí AI →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* ── PREMIUM FILTER TOP BAR ── */}
      <div className="relative mb-8 z-10 w-full animate-slide-up" style={{ animationDelay: '100ms' }}>
        <div className="absolute inset-0 bg-gradient-to-r from-violet-100/40 via-indigo-50/40 to-blue-100/40 rounded-2xl blur-xl" />
        
        <div className="relative bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-900/5 rounded-2xl p-2.5 flex flex-col md:flex-row gap-3 items-center justify-between">
          
          {/* SEARCH BOX */}
          <div className="relative w-full md:w-64 xl:w-80 group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="size-4 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
            </div>
            <input 
              type="text" 
              placeholder="Tìm tên hoặc số hiệu báo cáo..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200/60 bg-white/50 text-[13px] font-medium text-slate-700 focus:bg-white focus:border-violet-300 focus:ring-4 focus:ring-violet-500/10 outline-none transition-all placeholder:text-slate-400 shadow-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* DATE RANGE FILTER - Fully Custom React Component */}
            <GlassDateRangePicker 
              startDate={startDate} 
              endDate={endDate} 
              onStartDateChange={setStartDate} 
              onEndDateChange={setEndDate} 
            />

            {/* AMOUNT RANGE FILTER */}
            <GlassAmountPicker 
               absoluteMin={absoluteMin}
               absoluteMax={absoluteMax}
               currentMin={minAmount}
               currentMax={maxAmount}
               onChange={(min, max) => { setMinAmount(min); setMaxAmount(max); }}
            />

            {/* STATUS FILTER */}
            <div className="relative group shrink-0">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="size-3.5 text-slate-400 group-hover:text-blue-500 transition-colors" />
              </div>
              <select 
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as any)}
                className="h-11 pl-9 pr-8 bg-white/50 hover:bg-white border border-slate-200/60 rounded-xl text-[13px] font-semibold text-slate-700 outline-none cursor-pointer appearance-none transition-all shadow-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-300 min-w-[150px]"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="draft">Bản nháp</option>
                <option value="exported">Đã xuất bản</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="size-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>

            {/* SORT MENU */}
            <div className="relative group shrink-0">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <ArrowUpDown className="size-3.5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
              </div>
              <select 
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="h-11 pl-9 pr-8 bg-white/50 hover:bg-white border border-slate-200/60 rounded-xl text-[13px] font-semibold text-slate-700 outline-none cursor-pointer appearance-none transition-all shadow-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-300 min-w-[170px]"
              >
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
                <option value="amount_desc">Giá trị giảm dần</option>
                <option value="amount_asc">Giá trị tăng dần</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="size-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>
          
        </div>
      </div>

      {/* List header info */}
      <div className="flex items-center justify-between px-1 mb-4">
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-indigo-400" />
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Hiển thị {filteredAndSortedReports.length}/{reports.length} báo cáo
          </span>
        </div>
      </div>

      {/* Grid */}
      {filteredAndSortedReports.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredAndSortedReports.map((report, idx) => (
            <div
              key={report.id}
              className="animate-slide-up"
              style={{ animationDelay: `${Math.min(idx * 30, 300)}ms` }}
            >
              <ReportCard
                id={report.id}
                report_name={report.report_name}
                report_code={report.report_code}
                total_amount={report.total_amount}
                status={report.status as 'draft' | 'exported'}
                created_at={report.created_at}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white border border-slate-200 border-dashed rounded-2xl">
          <Database className="size-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-500">Không tìm thấy báo cáo nào phù hợp với bộ lọc.</p>
          <button 
            onClick={() => { setSearchTerm(''); setStatusFilter('all'); setSortBy('newest'); setStartDate(''); setEndDate(''); setMinAmount(null); setMaxAmount(null); }}
            className="mt-4 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-4 py-2 rounded-lg"
          >
            Xóa bộ lọc
          </button>
        </div>
      )}
    </div>
  );
}
