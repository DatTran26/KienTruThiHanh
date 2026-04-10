'use client';

import { useState, useRef } from 'react';
import { Upload, CheckCircle2, AlertCircle, Loader2, CloudUpload, FileSpreadsheet, SaveAll, Info, Database } from 'lucide-react';
import { toast } from 'sonner';

interface PreviewRow {
  group_code: string;
  group_title: string;
  sub_code: string;
  sub_title: string;
  description: string | null;
}

interface ParseError {
  row: number;
  reason: string;
}

interface UploadResult {
  versionId: string;
  itemCount: number;
  parseErrors: ParseError[];
  preview: PreviewRow[];
}

type Status = 'idle' | 'uploading' | 'preview' | 'publishing' | 'done';

export default function UploadMasterPage() {
  const [status, setStatus] = useState<Status>('idle');
  const [result, setResult] = useState<UploadResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<string>('');
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleUpload() {
    const file = fileRef.current?.files?.[0];
    if (!file) { toast.error('Lỗi: Chưa chọn tập tin'); return; }

    setStatus('uploading');
    const form = new FormData();
    form.append('file', file);

    try {
      const res = await fetch('/api/upload-master-file', { method: 'POST', body: form });
      const data = await res.json();

      if (!res.ok) { toast.error(data.error ?? 'Lỗi hệ thống trong quá trình trích xuất'); setStatus('idle'); return; }

      setResult(data as UploadResult);
      setStatus('preview');
      toast.success(`Trích xuất thành công: ${data.itemCount} bản ghi`);
    } catch {
      toast.error('Lỗi kết nối đường truyền');
      setStatus('idle');
    }
  }

  async function handlePublish() {
    if (!result) return;
    setStatus('publishing');

    try {
      const res = await fetch('/api/publish-master-version', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ versionId: result.versionId }),
      });
      const data = await res.json();

      if (!res.ok) { toast.error(data.error ?? 'Lỗi triển khai dữ liệu'); setStatus('preview'); return; }

      setStatus('done');
      toast.success(`Cập nhật thành công: ${data.activatedItems} bản ghi đã được đưa vào sử dụng`);
    } catch {
      toast.error('Lỗi kết nối đường truyền');
      setStatus('preview');
    }
  }

  function handleReset() {
    setStatus('idle');
    setResult(null);
    setSelectedFile('');
    if (fileRef.current) fileRef.current.value = '';
  }

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-[1200px] mx-auto animate-fade-in-up h-full flex flex-col">

      {/* Header */}
      <header className="mb-2 pb-4 border-b border-border shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Hệ thống Quản trị</span>
          <span className="px-2 py-0.5 bg-red-50 text-red-700 text-[10px] rounded font-bold border border-red-100">QUYỀN TỐI CAO</span>
        </div>
        
        <div className="flex items-start justify-between gap-4 flex-wrap mt-1">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary">
              Cập nhật Danh mục Kho bạc
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Nhập khẩu tệp Excel để đồng bộ hóa bản phân loại ngân sách và biểu phí Nhà nước mới nhất.
            </p>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="structured-panel p-0 flex flex-col overflow-hidden relative flex-1 bg-white shadow-sm ring-1 ring-slate-200">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
           <span className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
             <Database size={18} className="text-slate-500" />
             Khai báo dữ liệu Excel
           </span>
           <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
             Định dạng: .XLS, .XLSX
           </span>
        </div>

        <div className="p-6 md:p-8 space-y-8 overflow-y-auto flex-1 z-10 relative bg-slate-50/30">

          {/* Upload zone */}
          {(status === 'idle' || status === 'uploading') && (
            <div className="animate-fade-in-up space-y-6 max-w-2xl mx-auto">
              
              <label
                htmlFor="admin-file-upload"
                className={`flex flex-col items-center justify-center w-full h-48 rounded-xl cursor-pointer transition-all duration-300 group bg-white border-2 border-dashed ${selectedFile ? 'border-primary bg-blue-50/50' : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'}`}
              >
                <div className="flex flex-col items-center gap-4 relative z-10">
                  <div className={`size-14 rounded-full flex items-center justify-center transition-all ${selectedFile ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-500'}`}>
                    <FileSpreadsheet className="size-6" />
                  </div>
                  {selectedFile ? (
                    <div className="text-center">
                      <p className="font-bold text-sm text-primary">
                        {selectedFile}
                      </p>
                      <p className="text-xs mt-1 text-slate-500">
                        Tệp dữ liệu đã sẵn sàng để xử lý
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="font-bold text-sm text-slate-700">
                        Kéo thả hoặc nhấp để chọn tệp
                      </p>
                      <p className="text-xs mt-1 text-slate-500">
                        Chỉ chấp nhận các tập tin .xls và .xlsx tuân thủ cấu trúc chuẩn
                      </p>
                    </div>
                  )}
                </div>
                <input
                  id="admin-file-upload"
                  ref={fileRef}
                  type="file"
                  accept=".xls,.xlsx"
                  className="hidden"
                  onChange={e => setSelectedFile(e.target.files?.[0]?.name ?? '')}
                />
              </label>

              <div className="flex justify-end pt-4 border-t border-slate-200">
                <button
                  onClick={handleUpload}
                  disabled={status === 'uploading' || !selectedFile}
                  className="rounded-md px-8 py-2.5 bg-primary text-white font-bold text-sm uppercase tracking-wide hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
                >
                  {status === 'uploading' ? (
                    <><Loader2 className="size-4 animate-spin" /> Đang trích xuất dữ liệu...</>
                  ) : (
                    <><Upload className="size-4" /> Bắt đầu kiểm tra</>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Preview + publish */}
          {(status === 'preview' || status === 'publishing' || status === 'done') && result && (
            <div className="space-y-6 animate-fade-in-up">
              
              {/* Status banner */}
              <div className={`p-5 rounded-lg flex items-center justify-between gap-4 flex-wrap border ${status === 'done' ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
                <div className="flex items-start gap-3">
                  {status === 'done' ? (
                    <CheckCircle2 className="size-6 shrink-0 text-green-600 mt-0.5" />
                  ) : (
                    <Info className="size-6 shrink-0 text-blue-600 mt-0.5" />
                  )}
                  <div>
                    <h3 className={`font-bold text-base ${status === 'done' ? 'text-green-800' : 'text-blue-800'}`}>
                      {status === 'done' ? 'Triển khai dữ liệu thành công' : 'Chờ phê duyệt ban hành'}
                    </h3>
                    <p className={`text-sm mt-0.5 ${status === 'done' ? 'text-green-700' : 'text-blue-700'}`}>
                      Số lượng mục hợp lệ: <strong>{result.itemCount}</strong> • Lỗi cấu trúc: <strong>{result.parseErrors.length}</strong>
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4 items-center">
                  {status !== 'done' && (
                    <button
                      onClick={handlePublish}
                      disabled={status === 'publishing'}
                      className="rounded-md px-6 py-2 bg-blue-600 text-white font-bold text-sm tracking-wide shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {status === 'publishing' ? <Loader2 className="size-4 animate-spin" /> : <SaveAll className="size-4" />}
                      Phê duyệt & Ban hành
                    </button>
                  )}
                  <button onClick={handleReset} className="font-semibold text-sm text-slate-500 hover:text-slate-800 transition-colors">
                    Hủy thao tác
                  </button>
                </div>
              </div>

              {/* Parse errors */}
              {result.parseErrors.length > 0 && (
                <div className="border border-red-200 bg-red-50 rounded-lg p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="size-5 shrink-0 text-red-600" />
                    <span className="font-bold text-sm text-red-800">DỮ LIỆU LỖI ({result.parseErrors.length})</span>
                  </div>
                  <ul className="space-y-2 bg-white border border-red-100 p-4 rounded-md text-sm text-slate-700 overflow-y-auto max-h-40">
                    {result.parseErrors.map((e, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="font-bold text-red-600 shrink-0 w-16">DÒNG {e.row}</span>
                        <span>{e.reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Preview table */}
              <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
                <div className="px-5 py-3 border-b border-slate-200 bg-slate-50">
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-600">
                    Chi tiết bản ghi — Hiển thị {result.preview.length}/{result.itemCount}
                  </span>
                </div>
                <div className="overflow-x-auto max-h-[50vh]">
                  <table className="w-full text-left text-sm text-slate-800">
                    <thead className="sticky top-0 bg-white border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <tr>
                         <th className="px-5 py-3">Nhóm Mục</th>
                         <th className="px-5 py-3">Tiểu Mục</th>
                         <th className="px-5 py-3">Nội Dung</th>
                         <th className="px-5 py-3 border-l border-slate-100">Ghi Chú Hành Chính</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {result.preview.map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                          <td className="px-5 py-3 whitespace-nowrap">
                            <span className="font-mono text-xs font-bold bg-slate-100 border border-slate-300 text-slate-700 px-2.5 py-1 rounded">
                              {row.group_code}
                            </span>
                          </td>
                          <td className="px-5 py-3 whitespace-nowrap">
                             <span className="font-mono text-xs font-bold bg-blue-50 border border-blue-200 text-blue-700 px-2.5 py-1 rounded">
                               {row.sub_code}
                             </span>
                          </td>
                          <td className="px-5 py-3 min-w-[300px]">
                            <div className="font-medium text-slate-900">{row.sub_title}</div>
                          </td>
                          <td className="px-5 py-3 text-slate-500 border-l border-slate-100 min-w-[200px]">
                            {row.description || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
