'use client';

import { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface GlassDateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (val: string) => void;
  onEndDateChange: (val: string) => void;
}

const MONTH_NAMES = [
  "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", 
  "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
];
const DAY_NAMES = ["CN", "Hai", "Ba", "Tư", "Năm", "Sáu", "Bảy"];

export function GlassDateRangePicker({ startDate, endDate, onStartDateChange, onEndDateChange }: GlassDateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const [focusTab, setFocusTab] = useState<'start' | 'end'>('start');
  
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatDateLabel = (dateStr: string) => {
    if (!dateStr) return "---";
    const d = new Date(dateStr);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  };

  const getDaysInMonth = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
    return days;
  };

  const currentYear = viewDate.getFullYear();
  const currentMonthIndex = viewDate.getMonth();
  const days = getDaysInMonth(currentYear, currentMonthIndex);

  const prevMonth = () => setViewDate(new Date(currentYear, currentMonthIndex - 1, 1));
  const nextMonth = () => setViewDate(new Date(currentYear, currentMonthIndex + 1, 1));

  const toDateString = (d: Date) => {
    return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')}`;
  };

  const startObj = startDate ? new Date(startDate) : null;
  const endObj = endDate ? new Date(endDate) : null;
  const startStr = startObj ? toDateString(startObj) : null;
  const endStr = endObj ? toDateString(endObj) : null;

  const handleDayClick = (d: Date) => {
    const clickedStr = toDateString(d);
    
    if (focusTab === 'start') {
      onStartDateChange(clickedStr);
      // Auto switch to end if end is not set, or if start > end
      if (!endDate || new Date(clickedStr) > new Date(endDate)) {
        setFocusTab('end');
        if (endDate && new Date(clickedStr) > new Date(endDate)) {
            onEndDateChange('');
        }
      }
    } else {
      // selecting end
      if (startDate && new Date(clickedStr) < new Date(startDate)) {
        // If they click a date before start date while in 'end' tab, auto fix it
        onStartDateChange(clickedStr);
        onEndDateChange('');
        setFocusTab('end');
      } else {
        onEndDateChange(clickedStr);
        setIsOpen(false); // Done
      }
    }
  };

  const isSelected = (d: Date) => {
    const str = toDateString(d);
    return str === startStr || str === endStr;
  };

  const isInRange = (d: Date) => {
    if (!startObj || !endObj) return false;
    const time = d.getTime();
    return time > startObj.getTime() && time < endObj.getTime();
  };

  const isToday = (d: Date) => {
    return toDateString(d) === toDateString(new Date());
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* TRIGGER BAR */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center bg-white/60 hover:bg-white border rounded-xl px-2 h-11 shadow-sm transition-all shrink-0 cursor-pointer ${isOpen ? 'border-pink-300 ring-4 ring-pink-500/10' : 'border-slate-200/80'}`}
      >
        <div className="flex items-center pl-1 pr-3 border-r border-slate-200/60">
          <CalendarIcon className={`size-3.5 mr-2 transition-colors ${isOpen ? 'text-pink-500' : 'text-slate-400'}`} />
          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest whitespace-nowrap">Thời gian</span>
        </div>
        <div className="flex items-center px-1.5 gap-0.5">
          {/* START */}
          <div 
            onClick={(e) => { e.stopPropagation(); setIsOpen(true); setFocusTab('start'); }}
            className={`flex items-center justify-center h-8 px-2 rounded-lg transition-colors ${focusTab === 'start' && isOpen ? 'bg-indigo-50 ring-1 ring-indigo-200' : 'hover:bg-slate-100/80'} ${startDate ? 'text-indigo-700 font-bold' : 'text-slate-400 font-medium'} text-[13px]`}
          >
            <span className="text-[11px] text-slate-400 mr-1.5 font-medium">Từ:</span>
            {formatDateLabel(startDate)}
          </div>
          
          <div className="w-[1px] h-3 bg-slate-300 mx-1"></div>
          
          {/* END */}
          <div 
            onClick={(e) => { e.stopPropagation(); setIsOpen(true); setFocusTab('end'); }}
            className={`flex items-center justify-center h-8 px-2 rounded-lg transition-colors ${focusTab === 'end' && isOpen ? 'bg-indigo-50 ring-1 ring-indigo-200' : 'hover:bg-slate-100/80'} ${endDate ? 'text-indigo-700 font-bold' : 'text-slate-400 font-medium'} text-[13px]`}
          >
            <span className="text-[11px] text-slate-400 mr-1.5 font-medium">Đến:</span>
            {formatDateLabel(endDate)}
          </div>
          
          {(startDate || endDate) && (
            <div 
                onClick={(e) => {
                    e.stopPropagation();
                    onStartDateChange('');
                    onEndDateChange('');
                }}
                className="ml-1 p-1 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
                title="Xóa bộ lọc thời gian"
            >
                <X className="size-3.5" />
            </div>
          )}
        </div>
      </div>

      {/* POPOVER CALENDAR */}
      {isOpen && (
        <div className="absolute top-14 left-0 w-[300px] bg-white/90 backdrop-blur-3xl border border-white/60 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] ring-1 ring-slate-900/5 rounded-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-500 transition-colors">
              <ChevronLeft className="size-4" />
            </button>
            <div className="text-[14px] font-bold text-slate-800">
              {MONTH_NAMES[currentMonthIndex]} <span className="font-medium text-slate-500">{currentYear}</span>
            </div>
            <button onClick={nextMonth} className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-500 transition-colors">
              <ChevronRight className="size-4" />
            </button>
          </div>

          {/* Days Header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAY_NAMES.map(day => (
              <div key={day} className="text-[10px] font-bold text-slate-400 text-center uppercase">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-y-1 gap-x-0">
            {days.map((day, idx) => {
              if (!day) return <div key={`empty-${idx}`} />;
              
              const isSel = isSelected(day);
              const isRng = isInRange(day);
              const isTod = isToday(day);
              
              const isStartEdge = startStr === toDateString(day);
              const isEndEdge = endStr === toDateString(day);

              return (
                <div key={idx} className={`relative flex items-center justify-center h-10 ${isRng ? 'bg-indigo-50/50' : ''}`}>
                   {/* Connection backgrounds for range */}
                   {isSel && startDate && endDate && startDate !== endDate && (
                       <div className={`absolute inset-y-0 w-1/2 bg-indigo-50/50 ${isStartEdge ? 'right-0' : 'left-0'}`}></div>
                   )}
                   
                  <button
                    onClick={() => handleDayClick(day)}
                    className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-[13px] transition-all
                      ${isSel ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30 ring-2 ring-white scale-110' : 
                        isRng ? 'text-indigo-800 font-semibold' : 
                        'text-slate-600 hover:bg-slate-100 font-medium'}
                      ${isTod && !isSel ? 'ring-1 ring-indigo-300 text-indigo-600 font-bold bg-indigo-50' : ''}
                    `}
                  >
                    {day.getDate()}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center px-1">
             <div className="text-[11px] font-medium text-slate-400">
                Hiệu chỉnh: <span className="text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.5 rounded">{focusTab === 'start' ? 'Từ ngày' : 'Đến ngày'}</span>
             </div>
             <button 
                onClick={() => setIsOpen(false)}
                className="text-[12px] font-bold text-slate-600 hover:text-slate-900 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
             >
                Hoàn tất
             </button>
          </div>
        </div>
      )}
    </div>
  );
}
