'use client';

import { useState, useRef, useEffect } from 'react';
import { Coins, X } from 'lucide-react';

interface GlassAmountPickerProps {
  absoluteMin: number;
  absoluteMax: number;
  currentMin: number | null;
  currentMax: number | null;
  onChange: (min: number | null, max: number | null) => void;
}

export function GlassAmountPicker({ absoluteMin, absoluteMax, currentMin, currentMax, onChange }: GlassAmountPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(val);
  };

  // Safe fallback if min and max are the same
  const safeMin = absoluteMin;
  const safeMax = absoluteMax > absoluteMin ? absoluteMax : absoluteMin + 1000000;
  
  const actualMin = currentMin ?? safeMin;
  const actualMax = currentMax ?? safeMax;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.min(Number(e.target.value), actualMax - 1);
    onChange(val, currentMax ?? safeMax);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(Number(e.target.value), actualMin + 1);
    onChange(currentMin ?? safeMin, val);
  };

  const minPercent = ((actualMin - safeMin) / (safeMax - safeMin)) * 100;
  const maxPercent = ((actualMax - safeMin) / (safeMax - safeMin)) * 100;

  const getPercentageSpanText = () => {
    if (currentMin === null && currentMax === null) return "Mọi mức giá";
    return `${formatCurrency(actualMin)} - ${formatCurrency(actualMax)}`;
  };

  const isActive = currentMin !== null || currentMax !== null;

  return (
    <div className="relative shrink-0" ref={containerRef}>
      {/* TRIGGER BAR */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center bg-white/60 hover:bg-white border rounded-xl px-2 h-11 shadow-sm transition-all cursor-pointer ${isOpen ? 'border-amber-300 ring-4 ring-amber-500/10' : 'border-slate-200/80'}`}
      >
        <div className="flex items-center pl-1 pr-3 border-r border-slate-200/60">
          <Coins className={`size-3.5 mr-2 transition-colors ${isOpen ? 'text-amber-500' : 'text-slate-400'}`} />
          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest whitespace-nowrap">Khoảng tiền</span>
        </div>
        <div className="flex items-center px-2 gap-1.5 min-w-[140px] justify-center">
          <div className={`text-[12px] truncate ${isActive ? 'text-amber-700 font-bold' : 'text-slate-500 font-medium'}`}>
             {getPercentageSpanText()}
          </div>
          
          {isActive && (
            <div 
                onClick={(e) => {
                    e.stopPropagation();
                    onChange(null, null);
                }}
                className="ml-auto p-1 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
                title="Xóa bộ lọc tiền"
            >
                <X className="size-3.5" />
            </div>
          )}
        </div>
      </div>

      {/* POPOVER SLIDER */}
      {isOpen && (
        <div className="absolute top-14 left-0 w-[320px] bg-white/90 backdrop-blur-3xl border border-white/60 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] ring-1 ring-slate-900/5 rounded-2xl p-5 z-50 animate-in fade-in zoom-in-95 duration-200">
          
          <div className="flex items-center justify-between mb-6">
             <div className="text-[14px] font-bold text-amber-700">Điều chỉnh ngân sách</div>
          </div>

          <div className="flex justify-between items-center mb-4 px-1">
             <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-medium uppercase mb-0.5">Từ mức</span>
                <span className="text-[13px] font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded-md">{formatCurrency(actualMin)}</span>
             </div>
             <div className="text-slate-300 px-2">-</div>
             <div className="flex flex-col items-end">
                <span className="text-[10px] text-slate-400 font-medium uppercase mb-0.5">Đến mức</span>
                <span className="text-[13px] font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded-md">{formatCurrency(actualMax)}</span>
             </div>
          </div>

          {/* DUAL RANGE SLIDER TRACK */}
          <div className="relative w-full h-6 mt-6 mb-2 flex items-center">
            {/* Background Track */}
            <div className="absolute w-full h-1.5 bg-slate-200 rounded-full"></div>
            {/* Active Track Highlight */}
            <div 
               className="absolute h-1.5 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.4)]"
               style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }}
            ></div>

            {/* Hidden native inputs for exact logic with custom CSS overrides globally or inline */}
            <input 
              type="range" 
              min={safeMin} 
              max={safeMax} 
              value={actualMin}
              onChange={handleMinChange}
              step={100000} // Curently 100k step
              className="absolute pointer-events-none w-full h-full opacity-0 z-30 cursor-pointer"
              style={{
                WebkitAppearance: 'none',
                appearance: 'none',
              }}
            />
            {/* We recreate thumbs visibly because input opacity 0 makes native thumbs hidden */}
            
            <div 
               className="absolute w-5 h-5 bg-white border-2 border-amber-500 rounded-full shadow-md z-20 transition-transform hover:scale-110 cursor-grab"
               style={{ left: `calc(${minPercent}% - 10px)` }}
            ></div>

            <input 
              type="range" 
              min={safeMin} 
              max={safeMax} 
              value={actualMax}
              onChange={handleMaxChange}
              step={100000}
              className="absolute pointer-events-none w-full h-full opacity-0 z-40 cursor-pointer"
              style={{
                WebkitAppearance: 'none',
                appearance: 'none',
              }}
            />
            <div 
               className="absolute w-5 h-5 bg-white border-2 border-orange-500 rounded-full shadow-md z-20 transition-transform hover:scale-110 cursor-grab"
               style={{ left: `calc(${maxPercent}% - 10px)` }}
            ></div>
          </div>
          
          <div className="flex justify-between text-[10px] font-medium text-slate-400 px-1 mt-1">
             <span>Min: {formatCurrency(safeMin)}</span>
             <span>Max: {formatCurrency(safeMax)}</span>
          </div>

          <style dangerouslySetInnerHTML={{__html: `
            input[type=range]::-webkit-slider-thumb {
              pointer-events: auto;
              width: 20px;
              height: 20px;
              border-radius: 50%;
              -webkit-appearance: none;
              appearance: none;
            }
          `}} />

        </div>
      )}
    </div>
  );
}
