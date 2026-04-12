'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FileText, CheckCircle2, Clock, ArrowRight, MoreHorizontal, Pencil, Trash2, Loader2, X, Check } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ReportCardProps {
  id: string;
  report_name: string;
  report_code: string | null;
  total_amount: number;
  status: 'draft' | 'exported';
  created_at: string;
}

export function ReportCard({ id, report_name, report_code, total_amount, status, created_at }: ReportCardProps) {
  const router = useRouter();
  const isExported = status === 'exported';
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(report_name);
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleRename() {
    if (!editName.trim() || editName === report_name) { setIsEditing(false); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/reports/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report_name: editName.trim() }),
      });
      if (!res.ok) { toast.error('Đổi tên thất bại'); return; }
      toast.success('Đã đổi tên phiếu');
      router.refresh();
    } catch { toast.error('Lỗi kết nối'); }
    finally { setLoading(false); setIsEditing(false); }
  }

  async function handleDelete() {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/reports/${id}`, { method: 'DELETE' });
      if (!res.ok) { toast.error('Xóa phiếu thất bại'); setIsDeleting(false); return; }
      toast.success('Đã xóa phiếu báo cáo');
      router.refresh();
    } catch { toast.error('Lỗi kết nối'); setIsDeleting(false); }
  }

  // Delete confirmation state
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="relative h-full">
      <div
        className={cn(
          "group flex flex-col justify-between h-full p-5 rounded-2xl transition-all duration-300 bg-white border shadow-[0_4px_20px_rgb(0,0,0,0.04)] ring-1 ring-slate-900/5 hover:shadow-[0_12px_36px_rgb(0,0,0,0.08)]",
          isDeleting && "opacity-50 pointer-events-none scale-95",
          isExported
            ? "border-emerald-200 hover:border-emerald-300"
            : "border-slate-200 hover:border-indigo-200"
        )}
      >
        {/* Top row */}
        <div className="flex items-start gap-3 mb-4">
          {/* Icon */}
          <div
            className={cn(
              "size-11 rounded-xl flex items-center justify-center shrink-0 border shadow-sm",
              isExported
                ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                : "bg-indigo-50 text-indigo-600 border-indigo-100"
            )}
          >
            {isExported
              ? <CheckCircle2 className="size-5" />
              : <FileText className="size-5" />
            }
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="flex items-center gap-1.5">
                <input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="flex-1 h-8 px-2 text-sm font-semibold text-slate-800 border border-indigo-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
                  autoFocus
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleRename();
                    if (e.key === 'Escape') { setIsEditing(false); setEditName(report_name); }
                  }}
                />
                <button onClick={handleRename} disabled={loading} className="size-7 rounded-md bg-indigo-100 text-indigo-600 flex items-center justify-center hover:bg-indigo-200 transition-colors">
                  {loading ? <Loader2 className="size-3 animate-spin" /> : <Check className="size-3.5" />}
                </button>
                <button onClick={() => { setIsEditing(false); setEditName(report_name); }} className="size-7 rounded-md bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition-colors">
                  <X className="size-3.5" />
                </button>
              </div>
            ) : (
              <Link href={`/reports/${id}`} className="block">
                <h3 className="font-bold text-slate-800 text-[14px] line-clamp-2 mb-1.5 hover:text-indigo-600 transition-colors leading-snug cursor-pointer">
                  {report_name}
                </h3>
              </Link>
            )}
            <div className="flex items-center gap-2 flex-wrap">
              {report_code && (
                <span className="text-[9px] font-bold font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
                  {report_code}
                </span>
              )}
            </div>
          </div>

          {/* Actions menu button */}
          <div className="relative">
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowMenu(!showMenu); setConfirmDelete(false); }}
              className={cn(
                "size-8 rounded-lg flex items-center justify-center shrink-0 border transition-all",
                showMenu
                  ? "bg-slate-100 border-slate-200 text-slate-600"
                  : "bg-transparent border-transparent text-slate-300 opacity-0 group-hover:opacity-100 hover:bg-slate-100 hover:border-slate-200 hover:text-slate-600"
              )}
            >
              <MoreHorizontal className="size-4" />
            </button>

            {/* Dropdown menu */}
            {showMenu && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => { setShowMenu(false); setConfirmDelete(false); }} />
                <div className="absolute right-0 top-9 z-40 w-48 bg-white rounded-xl border border-slate-200 shadow-[0_12px_36px_rgb(0,0,0,0.12)] py-1.5 animate-scale-in">
                  <button
                    onClick={() => { setShowMenu(false); setIsEditing(true); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Pencil className="size-4 text-slate-400" />
                    Đổi tên phiếu
                  </button>
                  <Link
                    href={`/reports/${id}`}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    onClick={() => setShowMenu(false)}
                  >
                    <ArrowRight className="size-4 text-slate-400" />
                    Xem chi tiết
                  </Link>
                  <div className="my-1 border-t border-slate-100" />
                  {!confirmDelete ? (
                    <button
                      onClick={() => setConfirmDelete(true)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="size-4" />
                      Xóa phiếu
                    </button>
                  ) : (
                    <div className="px-3 py-2">
                      <p className="text-[11px] text-red-600 font-semibold mb-2">Xác nhận xóa phiếu này?</p>
                      <div className="flex gap-2">
                        <button
                          onClick={handleDelete}
                          disabled={isDeleting}
                          className="flex-1 h-8 rounded-lg bg-red-500 text-white text-[11px] font-bold hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                        >
                          {isDeleting ? <Loader2 className="size-3 animate-spin" /> : <Trash2 className="size-3" />}
                          Xóa
                        </button>
                        <button
                          onClick={() => setConfirmDelete(false)}
                          className="flex-1 h-8 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-bold hover:bg-slate-200 transition-colors"
                        >
                          Hủy
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <Link href={`/reports/${id}`} className="block">
          <div className="flex items-end justify-between pt-4 border-t border-slate-100">
            <div>
              <span className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400 mb-1">
                <Clock className="size-3" />
                {formatDate(created_at)}
              </span>
              <span className="font-bold text-base text-slate-800 block leading-none font-mono">
                {formatCurrency(total_amount)} <span className="text-[10px] text-slate-400 font-sans font-medium">VNĐ</span>
              </span>
            </div>

            <div className="flex flex-col items-end gap-2">
              <span
                className={cn(
                  "text-[9px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-[0.1em] border",
                  isExported
                    ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                    : "bg-amber-50 text-amber-600 border-amber-200"
                )}
              >
                {isExported ? 'Đã duyệt xuất' : 'Bản nháp'}
              </span>
              <ArrowRight
                className="size-4 shrink-0 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200 text-indigo-500"
              />
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
