'use client';

import { useState, useMemo, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';
import {
  ChevronDown, ChevronUp, ChevronsUpDown, Search, ChevronRight, Database, Hash, Sparkles,
  Plus, Trash2, Loader2, X, History, PenLine, Save, ArrowRight, Layers3
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface ReportItem {
  id: string;
  sort_order: number | null;
  group_code: string | null;
  sub_code: string | null;
  expense_content: string | null;
  amount: number;
  note: string | null;
}

interface AnalysisEntry {
  id: string;
  raw_description: string;
  confidence: number | null;
  extracted_amount: number | null;
  created_at: string;
  selected_item_id?: string | null;
}

type SortKey = 'group_code' | 'sub_code' | 'expense_content' | 'amount';
type SortOrder = 'asc' | 'desc';
type InputTab = 'manual' | 'history';

export function ReportItemsManager({
  items: initialItems,
  reportId,
  analyses,
}: {
  items: ReportItem[];
  reportId: string;
  analyses: AnalysisEntry[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [sortKey, setSortKey] = useState<SortKey>('group_code');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [inputTab, setInputTab] = useState<InputTab>('manual');
  
  const [showGroupDetails, setShowGroupDetails] = useState(false);
  const [showMasterData, setShowMasterData] = useState(false);

  const { data: activeMasterRes, isLoading: loadingMaster } = useSWR(
    showMasterData ? '/api/active-master-data' : null, 
    fetcher
  );
  const masterData = activeMasterRes?.preview || [];

  // Manual form
  const [form, setForm] = useState({
    group_code: '', sub_code: '', expense_content: '', amount: '', note: '',
  });

  const [masterSearchTerm, setMasterSearchTerm] = useState('');

  const filteredMasterData = useMemo(() => {
    if (!masterSearchTerm) return masterData;
    const q = masterSearchTerm.toLowerCase();
    return masterData.filter((item: any) => 
      (item.groupCode?.toLowerCase() || '').includes(q) ||
      (item.subCode?.toLowerCase() || '').includes(q) ||
      (item.groupTitle?.toLowerCase() || '').includes(q) ||
      (item.subTitle?.toLowerCase() || '').includes(q)
    );
  }, [masterData, masterSearchTerm]);

  const groupedMasterData = useMemo(() => {
    const map = new Map<string, any[]>();
    for (const item of filteredMasterData) {
      const gCode = item.groupCode || 'Chưa nhóm';
      if (!map.has(gCode)) map.set(gCode, []);
      map.get(gCode)!.push(item);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filteredMasterData]);

  const handleFillFromMaster = (item: any) => {
    setForm(prev => ({
      ...prev,
      group_code: item.groupCode || '',
      sub_code: item.subCode || '',
      expense_content: item.subTitle || item.groupTitle || '',
    }));
    setInputTab('manual');
    toast.success(`Đã tự động điền mã ${item.subCode || item.groupCode}`);
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortOrder('asc'); }
  };

  const filteredAndSortedItems = useMemo(() => {
    let result = items;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(item =>
        item.expense_content?.toLowerCase().includes(q) ||
        item.sub_code?.toLowerCase().includes(q) ||
        item.group_code?.toLowerCase().includes(q) ||
        item.note?.toLowerCase().includes(q)
      );
    }
    // Re-apply sorting on the filtered result
    const sorted = [...result].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      const strA = (aVal || '').toString().toLowerCase();
      const strB = (bVal || '').toString().toLowerCase();
      return sortOrder === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
    });

    return sorted;
  }, [items, searchTerm, sortKey, sortOrder]);

  const groupedItems = useMemo(() => {
    const map = new Map<string, { group_code: string, amount: number, items: ReportItem[] }>();
    for (const item of filteredAndSortedItems) {
      const gCode = item.group_code || 'Chưa gán mã nhóm';
      if (!map.has(gCode)) {
        map.set(gCode, { group_code: gCode, amount: 0, items: [] });
      }
      const g = map.get(gCode)!;
      g.amount += item.amount;
      g.items.push(item);
    }
    return Array.from(map.values());
  }, [filteredAndSortedItems]);

  const totalAmount = useMemo(() => items.reduce((s, i) => s + i.amount, 0), [items]);

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredAndSortedItems.map((item, idx) => ({
      'STT': idx + 1, 'Nhóm': item.group_code || '—', 'Tiểu mục': item.sub_code || '—',
      'Nội dung chi phí': item.expense_content || '', 'Ghi chú': item.note || '', 'Số tiền (VNĐ)': item.amount,
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ChiPhi");
    XLSX.writeFile(wb, "BangKeChiPhi.xlsx");
  };

  async function handleAddManual() {
    if (!form.expense_content.trim() || !form.amount) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/reports/${reportId}/items`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          group_code: form.group_code || undefined, sub_code: form.sub_code || undefined,
          expense_content: form.expense_content, amount: Number(form.amount), note: form.note || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      setItems(prev => [...prev, {
        id: data.itemId, sort_order: prev.length + 1, group_code: form.group_code || null,
        sub_code: form.sub_code || null, expense_content: form.expense_content, amount: Number(form.amount), note: form.note || null,
      }]);
      setForm({ group_code: '', sub_code: '', expense_content: '', amount: '', note: '' });
      toast.success('Đã thêm khoản mục');
      router.refresh();
    } catch { toast.error('Lỗi kết nối'); }
    finally { setLoading(false); }
  }

  async function handleAddFromHistory(a: AnalysisEntry) {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports/${reportId}/items`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysis_request_id: a.id, expense_content: a.raw_description, amount: a.extracted_amount ?? 0 }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      setItems(prev => [...prev, {
        id: data.itemId, sort_order: prev.length + 1, group_code: null, sub_code: null,
        expense_content: a.raw_description, amount: a.extracted_amount ?? 0, note: null,
      }]);
      toast.success('Đã gắn từ lịch sử AI');
      router.refresh();
    } catch { toast.error('Lỗi kết nối'); }
    finally { setLoading(false); }
  }

  async function handleDelete(itemId: string) {
    setDeletingId(itemId);
    try {
      const res = await fetch(`/api/reports/${reportId}/items?itemId=${itemId}`, { method: 'DELETE' });
      if (!res.ok) { toast.error('Xóa thất bại'); return; }
      setItems(prev => prev.filter(i => i.id !== itemId));
      toast.success('Đã xóa khoản mục');
      router.refresh();
    } catch { toast.error('Lỗi kết nối'); }
    finally { setDeletingId(null); }
  }

  const SortIcon = ({ columnKey }: { columnKey: SortKey }) => {
    if (sortKey !== columnKey) return <ChevronsUpDown className="size-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />;
    return sortOrder === 'asc' ? <ChevronUp className="size-3 text-indigo-600" /> : <ChevronDown className="size-3 text-indigo-600" />;
  };

  return (
    <div className="flex flex-col lg:flex-row gap-0 h-[80vh] min-h-[600px]">

      {/* ════════════════════════════════════════════
          LEFT COLUMN — Data Table
         ════════════════════════════════════════════ */}
      <div className="flex-1 min-w-0 flex flex-col border-r-0 lg:border-r border-slate-200">

        {/* Toolbar */}
        <div className="px-5 py-4 border-b border-slate-200/70 bg-white/60 backdrop-blur-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0 z-20">
          <div className="relative w-full sm:w-[280px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none drop-shadow-sm" strokeWidth={2.5} />
            <input
              type="text" placeholder="Tìm kiếm khoản mục..." value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-50/50 border border-slate-200/80 text-sm outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 text-slate-700 placeholder:text-slate-400 transition-all font-medium drop-shadow-sm"
            />
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowGroupDetails(p => !p)} 
              className={`flex items-center justify-center gap-2 h-10 px-4 rounded-xl text-[12px] font-black uppercase tracking-wider transition-all duration-300 border ${
                showGroupDetails 
                  ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white border-transparent shadow-[0_4px_20px_rgba(79,70,229,0.3)] hover:shadow-[0_6px_25px_rgba(79,70,229,0.4)] hover:-translate-y-0.5' 
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 shadow-sm hover:shadow-md'
              }`}
            >
              <div className={`flex items-center justify-center size-5 rounded-md ${showGroupDetails ? 'bg-white/20' : 'bg-slate-100'} transition-colors`}>
                {showGroupDetails ? <ChevronUp className="size-3.5" strokeWidth={3} /> : <ChevronDown className="size-3.5" strokeWidth={3} />}
              </div>
              {showGroupDetails ? 'Ẩn chi tiết nhóm' : 'Hiển thị chi tiết từng nhóm'}
            </button>

            <button 
              onClick={() => setShowMasterData(p => !p)} 
              className={`flex items-center justify-center gap-2.5 h-10 px-4 rounded-xl text-[12px] font-black uppercase tracking-wider transition-all duration-300 border ${
                showMasterData 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-transparent shadow-[0_4px_20px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_25px_rgba(16,185,129,0.4)] hover:-translate-y-0.5' 
                  : 'bg-gradient-to-br from-white to-emerald-50/30 border-emerald-200/60 text-emerald-700 hover:border-emerald-300 shadow-sm hover:shadow-md'
              }`}
            >
              <Database className="size-4 drop-shadow-sm" strokeWidth={2.5} />
              Tra cứu Kho dữ liệu
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto overflow-x-auto relative">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <div className="size-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4 border border-slate-200">
                <Layers3 className="size-5 text-slate-400" />
              </div>
              <h3 className="text-sm font-bold text-slate-700 mb-1">Chưa có khoản mục</h3>
              <p className="text-xs text-slate-400 max-w-[220px]">Sử dụng bảng nhập bên phải để thêm khoản mục mới</p>
            </div>
          ) : (
            <table className="w-full text-sm text-left border-collapse">
              <thead className="text-[10px] text-slate-500 font-black uppercase tracking-[0.15em] bg-slate-50/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-4 py-3.5 w-12 text-center"><Hash className="size-3.5 opacity-50 mx-auto" /></th>
                  <th className="px-4 py-3.5 cursor-pointer group hover:bg-slate-100/60 transition-colors" onClick={() => handleSort('group_code')}>
                    <div className="flex items-center gap-1.5">NHÓM MỤC <SortIcon columnKey="group_code" /></div>
                  </th>
                  <th className="px-4 py-3.5 cursor-pointer group hover:bg-slate-100/60 transition-colors" onClick={() => handleSort('sub_code')}>
                    <div className="flex items-center gap-1.5">TIỂU MỤC <SortIcon columnKey="sub_code" /></div>
                  </th>
                  <th className="px-4 py-3.5 cursor-pointer group hover:bg-slate-100/60 transition-colors" onClick={() => handleSort('expense_content')}>
                    <div className="flex items-center gap-1.5">NỘI DUNG CHI PHÍ <SortIcon columnKey="expense_content" /></div>
                  </th>
                  <th className="px-4 py-3.5 text-right cursor-pointer group hover:bg-slate-100/60 transition-colors" onClick={() => handleSort('amount')}>
                    <div className="flex items-center justify-end gap-1.5">SỐ TIỀN <SortIcon columnKey="amount" /></div>
                  </th>
                  <th className="px-3 py-3.5 w-12 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/60">
                {groupedItems.length === 0 ? (
                  <tr><td colSpan={6} className="py-10 text-center font-medium text-slate-400 text-sm">Không tìm thấy &quot;{searchTerm}&quot;</td></tr>
                ) : groupedItems.map(group => (
                  <Fragment key={group.group_code}>
                    {/* Header Row for Group */}
                    <tr className="bg-gradient-to-r from-slate-50/50 via-white to-slate-50/50 hover:from-white hover:to-indigo-50/20 transition-all cursor-pointer group/header border-b border-slate-200/60" onClick={() => setShowGroupDetails(p => !p)}>
                      <td className="px-4 py-4 w-12 text-center">
                        <div className={`mx-auto size-7 rounded-lg flex items-center justify-center transition-all duration-300 border ${showGroupDetails ? 'bg-indigo-500 border-indigo-600 text-white shadow-md shadow-indigo-500/30' : 'bg-white border-slate-200 text-slate-400 shadow-sm group-hover/header:border-indigo-300 group-hover/header:text-indigo-500'}`}>
                          <ChevronRight className={`size-4 stroke-[3px] transition-transform duration-300 ${showGroupDetails ? 'rotate-90' : ''}`} />
                        </div>
                      </td>
                      <td colSpan={3} className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`px-2.5 py-1 rounded-md border shadow-sm font-mono text-[13px] font-black tracking-widest ${group.group_code === 'Chưa gán mã nhóm' ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-slate-800 border-slate-900 text-white'}`}>
                            {group.group_code === 'Chưa gán mã nhóm' ? '⚠️ UNTAGGED' : `NHÓM: ${group.group_code}`}
                          </div>
                          <span className="text-[11px] font-bold text-slate-500 px-3 py-1 rounded-full bg-white border border-slate-200/80 shadow-sm flex items-center gap-1.5">
                            <Layers3 className="size-3" strokeWidth={2.5}/> {group.items.length} KHOẢN MỤC
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="font-mono text-[16px] font-black text-indigo-600 bg-indigo-50/50 px-3 py-1.5 rounded-lg border border-indigo-100/50 tabular-nums">
                          {formatCurrency(group.amount)} <span className="text-[10px] text-indigo-400">VND</span>
                        </span>
                      </td>
                      <td></td>
                    </tr>
                    
                    {/* Detail Rows */}
                    {showGroupDetails && group.items.map((item, idx) => (
                      <tr key={item.id} className="bg-white hover:bg-slate-50/80 transition-colors group/row border-b border-dashed border-slate-100">
                        <td className="px-4 py-3.5 font-mono text-[11px] font-bold text-slate-300 pl-8 text-right">
                          {String(idx + 1).padStart(2, '0')}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-200 inline-block"></span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="font-mono text-[11px] font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-md border border-slate-200 shadow-[inset_0_1px_0_white]">
                            {item.sub_code ?? '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 max-w-[280px]">
                          <span className="text-slate-700 text-[13px] font-semibold leading-relaxed block mb-0.5">{item.expense_content}</span>
                          {item.note && <div className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-100"><PenLine className="size-3" /> {item.note}</div>}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <span className="font-mono text-[14px] font-bold text-slate-600 tabular-nums">{formatCurrency(item.amount)}</span>
                        </td>
                        <td className="px-3 py-3.5 text-center">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} disabled={deletingId === item.id}
                            className="size-8 mx-auto rounded-lg flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 hover:shadow-sm transition-all opacity-0 group-hover/row:opacity-100 disabled:opacity-50"
                          >
                            {deletingId === item.id ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ════════════════════════════════════════════
          RIGHT COLUMN — Input Panel
         ════════════════════════════════════════════ */}
      <div className="w-full lg:w-[360px] xl:w-[400px] shrink-0 flex flex-col bg-slate-50/70">

        {/* Tab switcher */}
        <div className="px-4 py-2.5 border-b border-slate-200 bg-white shrink-0 flex gap-1">
          <button
            onClick={() => setInputTab('manual')}
            className={`flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg text-[11px] font-bold transition-all ${
              inputTab === 'manual'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <PenLine className="size-3.5" />
            Nhập tay
          </button>
          <button
            onClick={() => setInputTab('history')}
            className={`flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg text-[11px] font-bold transition-all ${
              inputTab === 'history'
                ? 'bg-violet-50 text-violet-700 border border-violet-200 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <History className="size-3.5" />
            Lịch sử AI
          </button>
        </div>

        {/* Panel content — scrollable */}
        <div className="flex-1 overflow-y-auto p-4">

          {/* ── Manual Entry Tab ── */}
          {inputTab === 'manual' && (
            <div className="space-y-4 animate-fade-in pb-4">
              <div className="flex items-center gap-2.5 mb-2 px-1">
                <div className="size-8 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
                  <PenLine className="size-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Nhập khoản mục mới</h3>
                  <p className="text-[10px] text-slate-500 font-medium">Bổ sung chi phí thủ công</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_12px_rgb(0,0,0,0.02)] p-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-700 uppercase tracking-widest pl-1">Nhóm mục</label>
                    <input
                      value={form.group_code} onChange={e => setForm(p => ({ ...p, group_code: e.target.value }))}
                      placeholder="VD: 6100"
                      className="w-full h-10 px-3.5 text-sm font-semibold rounded-xl bg-slate-50 border border-slate-200 outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all font-mono placeholder:font-sans placeholder:font-normal placeholder:text-slate-400"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-700 uppercase tracking-widest pl-1">Tiểu mục</label>
                    <input
                      value={form.sub_code} onChange={e => setForm(p => ({ ...p, sub_code: e.target.value }))}
                      placeholder="VD: 6112"
                      className="w-full h-10 px-3.5 text-sm font-semibold rounded-xl bg-slate-50 border border-slate-200 outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all font-mono placeholder:font-sans placeholder:font-normal placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-700 uppercase tracking-widest pl-1 flex items-center gap-1">
                    Nội dung chi phí <span className="text-red-500 text-[12px] leading-none">*</span>
                  </label>
                  <textarea
                    value={form.expense_content} onChange={e => setForm(p => ({ ...p, expense_content: e.target.value }))}
                    placeholder="Nhập mô tả diễn giải chi tiết cho khoản chi này..."
                    rows={3}
                    className="w-full px-3.5 py-3 text-sm rounded-xl bg-slate-50 border border-slate-200 outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all resize-none font-medium leading-relaxed placeholder:font-normal placeholder:text-slate-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-700 uppercase tracking-widest pl-1 flex items-center gap-1">
                      Số tiền (VNĐ) <span className="text-red-500 text-[12px] leading-none">*</span>
                    </label>
                    <input
                      type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                      placeholder="0"
                      className="w-full h-10 px-3.5 text-sm font-mono font-bold text-slate-800 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:font-sans placeholder:font-normal placeholder:text-slate-400"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-700 uppercase tracking-widest pl-1">Ghi chú</label>
                    <input
                      value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))}
                      placeholder="Tuỳ chọn"
                      className="w-full h-10 px-3.5 text-sm font-medium rounded-xl bg-slate-50 border border-slate-200 outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:font-normal placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 mt-2">
                  <button
                    onClick={() => setForm({ group_code: '', sub_code: '', expense_content: '', amount: '', note: '' })}
                    className="px-4 py-2 rounded-xl text-[11px] font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-all active:scale-95"
                  >
                    Làm mới
                  </button>
                  <button
                    onClick={handleAddManual}
                    disabled={loading || !form.expense_content.trim() || !form.amount}
                    className="inline-flex items-center justify-center gap-2 h-9 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-[11px] font-black shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all active:scale-95 hover:shadow-emerald-500/40 hover:-translate-y-0.5"
                  >
                    {loading ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
                    LƯU KHOẢN MỤC
                  </button>
                </div>
              </div>

              {/* Quick tip */}
              <div className="mx-1 mt-6 p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/50 shadow-sm">
                <div className="flex gap-3">
                  <div className="shrink-0 size-8 rounded-full bg-white border border-amber-100 flex items-center justify-center shadow-sm">
                    <span className="text-base leading-none">💡</span>
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-amber-800 uppercase tracking-widest mb-1.5">Mẹo nhập liệu</p>
                    <p className="text-[12px] text-amber-700/80 leading-relaxed font-medium">
                      Nếu không nhớ chính xác mã nhóm hoặc tiểu mục, hãy chuyển sang tab <strong className="text-amber-900 border-b border-amber-900/20">Lịch sử AI</strong> để chọn khoản mục từ kết quả mà AI đã phân loại tự động.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── AI History Tab ── */}
          {inputTab === 'history' && (
            <div className="space-y-3 animate-fade-in">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="size-7 rounded-lg bg-violet-100 border border-violet-200 flex items-center justify-center">
                    <Sparkles className="size-3.5 text-violet-600" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-700">Lịch sử phân tích AI</h3>
                </div>
                <a href="/analyze" className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                  Phân tích mới <ArrowRight className="size-3" />
                </a>
              </div>

              {analyses.length === 0 ? (
                <div className="text-center py-8">
                  <div className="size-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3 border border-slate-200">
                    <History className="size-5 text-slate-400" />
                  </div>
                  <p className="text-xs text-slate-500 font-medium mb-3">Chưa có lịch sử phân tích</p>
                  <a href="/analyze" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold hover:bg-indigo-100 transition-colors">
                    <Sparkles className="size-3.5" /> Phân loại AI
                  </a>
                </div>
              ) : (
                <div className="space-y-2">
                  {analyses.map(a => (
                    <div key={a.id} className="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-200 hover:border-violet-300 hover:shadow-sm transition-all group">
                      <div className="size-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-violet-100 group-hover:border-violet-200 transition-colors">
                        <Hash className="size-3 text-slate-400 group-hover:text-violet-600 transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-medium text-slate-700 line-clamp-2 leading-snug group-hover:text-violet-700 transition-colors">
                          {a.raw_description}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-slate-400 font-mono">{a.extracted_amount ? formatCurrency(a.extracted_amount) + '₫' : '—'}</span>
                          {a.confidence != null && (
                            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
                              a.confidence >= 0.8 ? 'bg-emerald-50 text-emerald-600' :
                              a.confidence >= 0.5 ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                            }`}>
                              {Math.round(a.confidence * 100)}%
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddFromHistory(a)} disabled={loading}
                        className="inline-flex items-center gap-1 h-7 px-2.5 rounded-lg bg-gradient-to-r from-violet-500 to-indigo-600 text-white text-[10px] font-bold shadow-sm hover:from-violet-400 hover:to-indigo-500 disabled:opacity-50 transition-all active:scale-95 shrink-0"
                      >
                        {loading ? <Loader2 className="size-3 animate-spin" /> : <Plus className="size-3" />}
                        Gắn
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ════════════════════════════════════════════
          RIGHT COLUMN 2 — Master Data Lookup
         ════════════════════════════════════════════ */}
      {showMasterData && (
        <div className="w-full lg:w-[280px] xl:w-[320px] shrink-0 flex flex-col bg-slate-50/50 border-l border-slate-200 animate-in fade-in slide-in-from-right-4 duration-200 shadow-xl lg:shadow-none z-20 absolute lg:relative right-0 h-full">
          <div className="px-4 py-3.5 border-b border-slate-200 bg-white shrink-0 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shadow-sm">
                <Database className="size-3.5 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-800 leading-tight">Tra cứu kho dữ liệu</h3>
                <p className="text-[9px] text-slate-500 font-medium">Bấm vào thẻ để tự điền form</p>
              </div>
            </div>
            <button onClick={() => setShowMasterData(false)} className="size-7 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 flex items-center justify-center transition-colors">
              <X className="size-4" />
            </button>
          </div>
          
          <div className="px-3 py-2.5 bg-white border-b border-slate-200 shrink-0 shadow-sm z-10">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
              <input
                type="text" placeholder="Tìm mã hoặc nội dung..."
                value={masterSearchTerm} onChange={e => setMasterSearchTerm(e.target.value)}
                className="w-full h-8 pl-8 pr-3 rounded-md bg-slate-50 border border-slate-200 text-xs outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/10 text-slate-700 placeholder:text-slate-400 transition-all font-medium"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {loadingMaster ? (
              <div className="flex flex-col items-center justify-center h-40 text-slate-400 gap-2">
                <Loader2 className="size-5 animate-spin" />
                <span className="text-xs">Đang tải dữ liệu...</span>
              </div>
            ) : groupedMasterData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 opacity-60">
                <Database className="size-8 text-slate-300 mb-2" />
                <div className="text-center text-xs text-slate-500">Chưa có dữ liệu nào khớp với tìm kiếm.</div>
              </div>
            ) : (
              groupedMasterData.map(([groupCode, items]) => (
                <div key={groupCode} className="space-y-3">
                  <div className="sticky top-0 bg-slate-100/95 backdrop-blur-xl z-20 py-2 flex items-center gap-2 -mx-2 px-3 rounded-lg shadow-sm border border-white/50">
                    <Database className="size-3 text-indigo-500" />
                    <span className="text-[10px] font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-slate-600 drop-shadow-sm">
                      NHÓM {groupCode}
                    </span>
                    <div className="h-[1px] bg-gradient-to-r from-indigo-200 to-transparent flex-1"></div>
                  </div>
                  {items.map((item: any, i: number) => (
                    <div 
                      key={i} 
                      onClick={() => handleFillFromMaster(item)}
                      className="relative bg-white/80 backdrop-blur-sm border border-white rounded-xl p-3 shadow-sm hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-500/10 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer overflow-hidden group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 to-emerald-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      <div className="relative flex items-start justify-between mb-2">
                        <span className="font-mono text-[10px] font-bold text-white bg-gradient-to-r from-indigo-500 to-indigo-600 px-2 py-0.5 rounded shadow-sm shadow-indigo-500/20">
                          {item.groupCode}
                        </span>
                        {item.subCode && (
                          <span className="font-mono text-[10px] font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 px-2 py-0.5 rounded shadow-sm shadow-emerald-500/20 group-hover:from-emerald-400 group-hover:to-teal-400 transition-colors">
                            {item.subCode}
                          </span>
                        )}
                      </div>
                      
                      <div className="relative text-[11px] font-bold text-slate-700 mb-1 leading-snug group-hover:text-emerald-800 transition-colors">
                        {item.subTitle || item.groupTitle}
                      </div>
                      {item.notes && <div className="relative text-[10px] font-medium text-slate-400 leading-snug line-clamp-2">{item.notes}</div>}
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      )}

    </div>
  );
}
