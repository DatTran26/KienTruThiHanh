'use client';

import { useState, useMemo } from 'react';
import { formatCurrency } from '@/lib/utils';
import { ChevronDown, ChevronUp, ChevronsUpDown, Search, Calendar, FileSpreadsheet, Download, Hash, Sparkles } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ReportItem {
  id: string;
  sort_order: number | null;
  group_code: string | null;
  sub_code: string | null;
  expense_content: string | null;
  amount: number;
  note: string | null;
}

type SortKey = 'group_code' | 'sub_code' | 'expense_content' | 'amount';
type SortOrder = 'asc' | 'desc';

export function ReportItemsTable({ items }: { items: ReportItem[] }) {
  const [sortKey, setSortKey] = useState<SortKey>('group_code');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [searchTerm, setSearchTerm] = useState('');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const filteredAndSortedItems = useMemo(() => {
    let result = items;

    // Fast search filter
    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (item) =>
          item.expense_content?.toLowerCase().includes(q) ||
          item.sub_code?.toLowerCase().includes(q) ||
          item.group_code?.toLowerCase().includes(q) ||
          item.note?.toLowerCase().includes(q)
      );
    }

    // Sort
    return result.sort((a, b) => {
      let valA = a[sortKey];
      let valB = b[sortKey];

      if (valA === null) valA = sortKey === 'amount' ? 0 : '';
      if (valB === null) valB = sortKey === 'amount' ? 0 : '';

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [items, sortKey, sortOrder, searchTerm]);

  const totalAmount = useMemo(() => {
    return filteredAndSortedItems.reduce((acc, item) => acc + item.amount, 0);
  }, [filteredAndSortedItems]);

  const handleExportExcel = () => {
    const worksheetData = filteredAndSortedItems.map((item, idx) => ({
      'STT': idx + 1,
      'Nhóm': item.group_code || '—',
      'Tiểu mục': item.sub_code || '—',
      'Nội dung chi phí': item.expense_content || '',
      'Ghi chú': item.note || '',
      'Số tiền (VNĐ)': item.amount,
    }));

    const ws = XLSX.utils.json_to_sheet(worksheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ChiPhi");
    XLSX.writeFile(wb, "BangKeChiPhi.xlsx");
  };

  if (!items.length) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="size-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-5 shadow-inner border border-slate-200">
          <FileSpreadsheet className="size-6 text-slate-400" />
        </div>
        <h3 className="text-base font-bold text-slate-800 mb-1.5 tracking-tight">Chưa có dữ liệu khoản mục</h3>
        <p className="text-sm text-slate-500 w-full max-w-[280px] leading-relaxed mb-5">
          Sử dụng AI để phân tích chi phí, sau đó gắn kết quả vào báo cáo này để tạo bảng kê.
        </p>
        <a
          href="/analyze"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-sm font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:from-indigo-400 hover:to-indigo-500 transition-all active:scale-95"
        >
          <Sparkles className="size-4" />
          Phân loại chi phí AI
        </a>
      </div>
    );
  }

  const SortIcon = ({ columnKey }: { columnKey: SortKey }) => {
    if (sortKey !== columnKey) return <ChevronsUpDown className="size-3 text-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity" />;
    return sortOrder === 'asc' 
      ? <ChevronUp className="size-3 text-primary" /> 
      : <ChevronDown className="size-3 text-primary" />;
  };

  return (
    <div className="space-y-4 animate-fade-in">
      
      {/* Apple Spotlight-like Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-2 glass-panel">
        
        {/* Search Field */}
        <div className="relative w-full sm:w-[320px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60 pointer-events-none" />
          <input 
            type="text" 
            placeholder="Tìm kiếm nội dung, tiểu mục..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-lg bg-black/[0.03] border border-transparent focus:bg-white focus:border-primary/30 focus:ring-4 focus:ring-primary/10 transition-all text-sm outline-none shadow-inner"
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 w-full sm:w-auto px-2 sm:px-0">
          <div className="flex flex-col text-right">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.1em]">Tổng số tiền biểu</span>
            <span className="text-sm font-semibold tracking-tight text-primary">
              {formatCurrency(totalAmount)} đ
            </span>
          </div>
          <div className="w-px h-8 bg-border" />
          <button 
            onClick={handleExportExcel}
            className="flex items-center gap-2 h-9 px-4 rounded-lg bg-gradient-to-b from-white to-slate-50 border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all active:scale-[0.98] text-sm font-medium text-slate-700"
          >
            <Download className="size-4 text-primary" />
            <span className="hidden sm:inline">Xuất Excel</span>
          </button>
        </div>
      </div>

      {/* Glass Data Grid */}
      <div className="overflow-x-auto glass-panel relative">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-white/80 border-b border-border sticky top-0 backdrop-blur-xl">
            <tr>
              <th className="px-4 py-3.5 w-14 font-semibold tracking-wide">
                <Hash className="size-3.5 opacity-50" />
              </th>
              
              <th 
                className="px-4 py-3.5 font-semibold cursor-pointer group hover:bg-slate-100/50 transition-colors"
                onClick={() => handleSort('group_code')}
              >
                <div className="flex items-center gap-1.5 tracking-wide">
                  Nhóm
                  <SortIcon columnKey="group_code" />
                </div>
              </th>
              
              <th 
                className="px-4 py-3.5 font-semibold cursor-pointer group hover:bg-slate-100/50 transition-colors"
                onClick={() => handleSort('sub_code')}
              >
                <div className="flex items-center gap-1.5 tracking-wide">
                  Tiểu mục
                  <SortIcon columnKey="sub_code" />
                </div>
              </th>
              
              <th 
                className="px-4 py-3.5 font-semibold cursor-pointer group hover:bg-slate-100/50 transition-colors"
                onClick={() => handleSort('expense_content')}
              >
                <div className="flex items-center gap-1.5 tracking-wide">
                  Nội dung chi phí
                  <SortIcon columnKey="expense_content" />
                </div>
              </th>
              
              <th 
                className="px-4 py-3.5 text-right font-semibold cursor-pointer group hover:bg-slate-100/50 transition-colors"
                onClick={() => handleSort('amount')}
              >
                 <div className="flex items-center justify-end gap-1.5 tracking-wide">
                  Số tiền (VNĐ)
                  <SortIcon columnKey="amount" />
                </div>
              </th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-black/[0.04]">
            {filteredAndSortedItems.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-muted-foreground text-sm">
                  Không tìm thấy dữ liệu khớp với "{searchTerm}"
                </td>
              </tr>
            ) : (
              filteredAndSortedItems.map((item, idx) => (
                <tr 
                  key={item.id} 
                  className="bg-transparent hover:bg-white/60 transition-colors group"
                >
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{idx + 1}</td>
                  
                  <td className="px-4 py-3">
                    <span className="font-mono text-[11px] font-semibold bg-slate-100/80 text-slate-600 px-2.5 py-1 rounded-md border border-slate-200/60 shadow-sm">
                      {item.group_code ?? '—'}
                    </span>
                  </td>
                  
                  <td className="px-4 py-3">
                    <span className="font-mono text-[11px] font-semibold bg-indigo-50/80 text-primary px-2.5 py-1 rounded-md border border-indigo-100 shadow-sm">
                      {item.sub_code ?? '—'}
                    </span>
                  </td>
                  
                  <td className="px-4 py-3 max-w-[300px]">
                    <span className="text-foreground font-medium flex items-start leading-snug">
                      {item.expense_content}
                    </span>
                    {item.note && (
                      <p className="text-muted-foreground text-xs mt-1 leading-relaxed border-l-2 border-indigo-200 pl-2">
                        {item.note}
                      </p>
                    )}
                  </td>
                  
                  <td className="px-4 py-3 text-right">
                    <span className="font-mono tracking-tight text-foreground font-semibold">
                      {formatCurrency(item.amount)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
