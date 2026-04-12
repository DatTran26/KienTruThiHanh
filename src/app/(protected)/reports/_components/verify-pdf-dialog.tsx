'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Loader2, FileCheck, X, UploadCloud, AlertCircle, CheckCircle2, SplitSquareHorizontal, Database } from 'lucide-react';
import { toast } from 'sonner';

type VerifyResult = {
  success: boolean;
  isAllMatch: boolean;
  details: {
    unit_name: { isMatch: boolean; expected: string; extracted: string };
    address: { isMatch: boolean; expected: string; extracted: string };
    tax_code: { isMatch: boolean; expected: string; extracted: string };
  };
};

export function VerifyPdfDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => setMounted(true), []);

  // Cleanup object URL
  useEffect(() => {
    return () => {
      if (fileUrl) URL.revokeObjectURL(fileUrl);
    };
  }, [fileUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setResult(null); // clear old result
      if (fileUrl) URL.revokeObjectURL(fileUrl);
      setFileUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleVerify = async () => {
    if (!file) {
      toast.warning('Vui lòng chọn file PDF để tải lên.');
      return;
    }
    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/verify-pdf', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      
      if (!res.ok) {
        toast.error(data.error ?? 'Lỗi kiểm tra dữ liệu PDF.');
      } else {
        setResult(data);
        if (data.isAllMatch) {
          toast.success('Hợp lệ! Tất cả thông tin đều khớp với Hồ sơ.');
        } else {
          toast.warning('Phát hiện thông tin sai lệch so với Hồ sơ.');
        }
      }
    } catch {
      toast.error('Lỗi kết nối với máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncProfile = async () => {
    if (!result) return;
    setSyncing(true);
    try {
      const payload = {
        unit_name: result.details.unit_name.extracted,
        address: result.details.address.extracted,
        tax_code: result.details.tax_code.extracted,
      };
      const res = await fetch('/api/validate-org', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast.success('Đã lấy thông tin từ PDF làm Hồ sơ gốc thành công!');
        setResult(prev => {
           if (!prev) return prev;
           return {
             ...prev,
             isAllMatch: true,
             details: {
               unit_name: { ...prev.details.unit_name, isMatch: true, expected: payload.unit_name },
               address: { ...prev.details.address, isMatch: true, expected: payload.address },
               tax_code: { ...prev.details.tax_code, isMatch: true, expected: payload.tax_code },
             }
           };
        });
      } else {
        toast.error('Lỗi khi cập nhật hồ sơ từ PDF.');
      }
    } catch {
       toast.error('Lỗi kết nối với máy chủ.');
    } finally {
      setSyncing(false);
    }
  };

  const resetState = () => {
    setOpen(false);
    setFile(null);
    setResult(null);
    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
      setFileUrl(null);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-100 transition-all shadow-sm active:scale-95"
      >
        <FileCheck className="size-4 text-emerald-600" strokeWidth={2.5} />
        Đối chiếu cấu hình tổ chức
      </button>

      {open && mounted && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] w-full max-w-6xl shadow-[0_20px_60px_rgb(0,0,0,0.15)] ring-1 ring-slate-900/10 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col h-[85vh]">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                  <SplitSquareHorizontal className="size-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-[15px]">Đối chiếu Báo cáo PDF</h3>
                  <p className="text-[12px] text-slate-500 font-medium">Kiểm tra thông tin PDF trực tiếp với Hồ sơ của bạn</p>
                </div>
              </div>
              <button
                onClick={resetState}
                className="size-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Split Content Area */}
            <div className="flex flex-1 overflow-hidden bg-slate-50/50">
              {/* Left Column: Action & Results */}
              <div className="w-1/2 p-6 overflow-y-auto custom-scrollbar flex flex-col border-r border-slate-100 bg-white">
                {/* File input */}
                <div className="mb-6">
                  <input
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                  />
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors ${file ? 'border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50' : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'}`}
                  >
                    <div className="size-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center mx-auto mb-3 shadow-sm">
                      <UploadCloud className={`size-6 ${file ? 'text-emerald-500' : 'text-slate-400'}`} />
                    </div>
                    <p className="text-sm font-bold text-slate-700 mb-1">
                      {file ? file.name : 'Tải lên Báo cáo (PDF)'}
                    </p>
                    <p className="text-[12px] text-slate-500">
                      {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Nhấn để chọn file từ máy tính'}
                    </p>
                  </div>
                </div>

                {/* Results */}
                {result && result.details && (() => {
                  const hasExtractedValidInfo = 
                    (result.details.unit_name.extracted && result.details.unit_name.extracted !== 'Không tìm thấy') ||
                    (result.details.address.extracted && result.details.address.extracted !== 'Không tìm thấy') ||
                    (result.details.tax_code.extracted && result.details.tax_code.extracted !== 'Không tìm thấy');

                  return (
                  <div className="mb-6 space-y-4 animate-fade-in-up flex-1 pb-10">
                    <div className={`flex items-center gap-2 p-3 rounded-xl border ${result.isAllMatch ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>
                      {result.isAllMatch ? <CheckCircle2 className="size-5 text-emerald-600 shrink-0" /> : <AlertCircle className="size-5 text-amber-600 shrink-0" />}
                      <span className="font-bold text-[13px] leading-tight">
                        {result.isAllMatch ? 'Thông tin trên PDF hoàn toàn khớp với Hồ sơ Tổ chức.' : 'Có sai sót trong thông tin cần được sửa chữa!'}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {[
                        { key: 'unit_name', label: 'Tên đơn vị', detail: result.details.unit_name },
                        { key: 'address', label: 'Địa chỉ trụ sở', detail: result.details.address },
                        { key: 'tax_code', label: 'Mã số thuế', detail: result.details.tax_code },
                      ].map(({ key, label, detail }) => (
                        <div key={key} className={`p-4 rounded-xl border relative overflow-hidden ${detail.isMatch ? 'border-slate-200 bg-white' : 'border-red-200 bg-red-50/50'}`}>
                          {!detail.isMatch && (
                            <div className="absolute top-0 right-0 px-2 py-1 bg-red-100 text-[10px] font-black text-red-600 uppercase tracking-wider rounded-bl-lg">
                              Không khớp
                            </div>
                          )}
                          <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">{label}</h4>
                          
                          <div className="grid grid-cols-2 gap-4 text-[13px]">
                            <div>
                              <p className="text-[10px] text-slate-500 mb-0.5">Hồ sơ quy định (Gốc)</p>
                              <p className="font-semibold text-slate-800">{detail.expected || <span className="opacity-50 italic">Không có</span>}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-500 mb-0.5">Tìm thấy trên PDF</p>
                              <p className={`font-semibold ${detail.isMatch ? 'text-emerald-600' : 'text-red-600'}`}>{detail.extracted}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {(!result.isAllMatch && hasExtractedValidInfo) && (
                      <div className="mt-8 p-6 rounded-[1.5rem] bg-gradient-to-br from-indigo-50 via-white to-blue-50/30 border border-indigo-100/60 flex flex-col items-center text-center gap-4 animate-fade-in shadow-[0_10px_40px_-15px_rgba(79,70,229,0.15)] relative overflow-hidden group">
                        <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                        
                        <div className="size-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 shadow-md shadow-indigo-500/20 flex items-center justify-center shrink-0 border border-indigo-400/30 relative z-10">
                          <Database className="size-5 text-white" />
                        </div>
                        
                        <div className="relative z-10 space-y-1.5">
                          <h4 className="text-[14px] font-black text-indigo-950 tracking-tight">Sử dụng thông tin trích xuất làm chuẩn?</h4>
                          <p className="text-[12px] text-indigo-900/60 font-medium px-2 leading-relaxed">Phát hiện dữ liệu trên PDF khác với CSDL gốc. Bạn có muốn cập nhật Hồ sơ Tổ chức bằng thông tin mới lấy từ PDF này không?</p>
                        </div>
                        
                        <button
                          onClick={handleSyncProfile}
                          disabled={syncing}
                          className="mt-2 h-11 px-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[13px] font-bold shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50 disabled:scale-100 active:scale-95 flex items-center gap-2 relative z-10"
                        >
                          {syncing ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
                          Cập nhật Hồ sơ gốc
                        </button>
                      </div>
                    )}
                  </div>
                  );
                })()}
              </div>

              {/* Right Column: PDF Preview */}
              <div className="w-1/2 relative bg-slate-100/50">
                {fileUrl ? (
                  <iframe 
                    src={fileUrl} 
                    className="w-full h-full border-none"
                    title="PDF Preview"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-4">
                    <FileCheck className="size-16 opacity-20" />
                    <p className="font-bold text-sm tracking-tight">Bản xem trước PDF sẽ hiển thị ở đây</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-100 bg-white flex items-center justify-end gap-3 shrink-0 rounded-b-[2rem]">
              <button
                onClick={resetState}
                className="h-10 px-6 rounded-xl font-bold text-[13px] text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Đóng
              </button>
              {!result && (
                <button
                  onClick={handleVerify}
                  disabled={!file || loading}
                  className="flex items-center gap-2 h-10 px-6 rounded-xl font-bold text-[13px] text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="size-4 animate-spin" /> : <FileCheck className="size-4" />}
                  Bắt đầu phân tích PDF
                </button>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
