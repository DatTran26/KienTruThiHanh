export default function AnalyzeLoading() {
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
