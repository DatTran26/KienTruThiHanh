'use client';

import { ReactNode } from 'react';
import { X } from 'lucide-react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

interface SplitWorkspaceProps {
  central: ReactNode;
  panelContent: ReactNode;
  panelName?: string;
}

export function SplitWorkspace({ central, panelContent, panelName }: SplitWorkspaceProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const handleClose = () => {
    // Navigate without panel
    router.push(pathname);
  };

  const hasPanel = !!panelContent && !!panelName;

  return (
    <div className="flex h-full w-full overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] relative gap-4">
      {/* Central Analyze Workspace */}
      <div 
        className={`h-full transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] overflow-y-auto overflow-x-hidden ${hasPanel ? 'w-full lg:w-3/5 xl:w-[65%] border-r border-slate-200/60 pr-4' : 'w-full'}`}
      >
        {central}
      </div>

      {/* Dynamic Slide-in Panel */}
      <div 
        className={`h-full overflow-y-auto bg-white border border-slate-200 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] will-change-transform flex flex-col relative
          ${hasPanel ? 'w-full lg:w-2/5 xl:w-[35%] opacity-100 translate-x-0' : 'w-0 opacity-0 translate-x-12 hidden lg:flex'}`}
      >
        {hasPanel && (
          <>
            <button 
              onClick={handleClose}
              className="absolute top-4 right-4 z-50 p-2 rounded-full bg-slate-100/80 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-all shadow-sm"
              title="Đóng bảng"
            >
              <X size={18} strokeWidth={2.5} />
            </button>
            <div className="flex-1 overflow-y-auto h-full rounded-2xl relative w-full pt-10 px-0 pb-0">
               {panelContent}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
