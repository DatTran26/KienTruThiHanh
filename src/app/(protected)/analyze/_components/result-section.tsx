'use client';

import { ResultCard } from './result-card';
import type { AnalysisResponse, AnalysisResult } from '@/types/analysis';

interface ResultSectionProps {
  response: AnalysisResponse;
  onAddToReport: (result: AnalysisResult) => void;
}

export function ResultSection({ response, onAddToReport }: ResultSectionProps) {
  const [best, ...alternatives] = response.results;

  return (
    <div className="space-y-6 animate-fade-in-up">

      {/* Low confidence warning - Vibrant Form */}
      {response.confidenceLevel === 'low' && (
        <div className="p-4 rounded-2xl flex items-start gap-3 bg-amber-50 border border-amber-200">
          <div className="p-2 rounded-full bg-amber-100/60 shrink-0 mt-0.5">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-amber-600">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div>
            <p className="font-bold text-sm uppercase tracking-wider text-amber-800 mb-1">
              Chú ý: Thông tin chưa rõ ràng
            </p>
            <p className="text-[13px] text-amber-700/90 font-medium">
              Nội dung chi phí cung cấp chưa đủ chi tiết để hệ thống kết luận chính xác tuyệt đối. Vui lòng kiểm tra kỹ hoặc cung cấp thêm diễn giải.
            </p>
          </div>
        </div>
      )}

      {/* Best match */}
      {best && (
        <div className="space-y-3 relative">
          <div className="flex items-center gap-2 pl-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              Kết quả đề xuất ưu tiên
            </h3>
          </div>
          <ResultCard result={best} isBest onAddToReport={onAddToReport} />
        </div>
      )}

      {/* Alternatives */}
      {alternatives.length > 0 && (
        <div className="space-y-4 mt-8 pt-8 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-slate-200 rounded-full"></div>
          <div className="flex items-center justify-between pl-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Các kết quả tham khảo khác ({alternatives.length})
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {alternatives.map((r, i) => (
              <ResultCard key={i} result={r} onAddToReport={onAddToReport} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
