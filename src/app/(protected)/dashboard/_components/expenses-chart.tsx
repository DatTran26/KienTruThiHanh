'use client';

import { useState, useMemo } from 'react';
import {
  AreaChart, Area,
  BarChart, Bar,
  LineChart, Line,
  ComposedChart,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  RadialBarChart, RadialBar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, Legend,
  PieChart, Pie
} from 'recharts';
import { TrendingUp, BarChart3, Activity, Zap, PieChart as PieChartIcon, ToggleLeft, ToggleRight, Target, Disc, AlignLeft } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface ChartData {
  name: string;
  amount: number;
}

interface ExpensesChartProps {
  data: ChartData[];
  totalExpectedAmount: number;
}

/* ────── Demo data generator ────── */
function generateDemoData(): ChartData[] {
  const months = ['Thg 1','Thg 2','Thg 3','Thg 4','Thg 5','Thg 6','Thg 7','Thg 8','Thg 9','Thg 10','Thg 11','Thg 12'];
  return months.map(name => ({
    name,
    amount: Math.round((800000 + Math.random() * 9200000) / 1000) * 1000,
  }));
}

/* ────── Custom Tooltip ────── */
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 px-4 py-3 rounded-2xl shadow-2xl shadow-slate-900/20">
      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mb-1.5">{payload[0].payload.name}</p>
      <p className="text-[16px] font-black text-white tabular-nums tracking-tight">
        {formatCurrency(payload[0].value as number)}
        <span className="text-[10px] text-slate-400 font-bold ml-1.5">VNĐ</span>
      </p>
    </div>
  );
}

/* ────── Pie Chart Tooltip ────── */
function PieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 px-4 py-3 rounded-2xl shadow-2xl">
      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mb-1">{payload[0].name}</p>
      <p className="text-[15px] font-black text-white tabular-nums">
        {formatCurrency(payload[0].value)}
        <span className="text-[10px] text-slate-400 font-bold ml-1.5">VNĐ</span>
      </p>
    </div>
  );
}

/* ────── Chart Type Options ────── */
type ChartType = 'area' | 'bar' | 'hbar' | 'line' | 'composed' | 'pie' | 'radar' | 'radial';

const CHART_TYPES: { key: ChartType; label: string; icon: any }[] = [
  { key: 'area',     label: 'Đường cong',  icon: TrendingUp },
  { key: 'bar',      label: 'Cột đứng',    icon: BarChart3 },
  { key: 'hbar',     label: 'Cột ngang',   icon: AlignLeft },
  { key: 'line',     label: 'Đường thẳng', icon: Activity },
  { key: 'composed', label: 'Kết hợp',     icon: Zap },
  { key: 'pie',      label: 'Tròn',        icon: PieChartIcon },
  { key: 'radar',    label: 'Đa hướng',    icon: Target },
  { key: 'radial',   label: 'Cung tròn',   icon: Disc },
];

/* ────── Color palette ────── */
const PALETTE = [
  '#6366f1', '#8b5cf6', '#a78bfa', '#c084fc',
  '#06b6d4', '#14b8a6', '#10b981', '#22c55e',
  '#f59e0b', '#f97316', '#ef4444', '#ec4899',
];

export function ExpensesChart({ data: realData, totalExpectedAmount }: ExpensesChartProps) {
  const [hoverData, setHoverData] = useState<ChartData | null>(null);
  const [chartType, setChartType] = useState<ChartType>('area');
  const [useDemoData, setUseDemoData] = useState(false);

  const demoData = useMemo(() => generateDemoData(), []);
  const baseData = useDemoData ? demoData : realData;
  const data = useMemo(() => baseData.map((d, i) => ({ ...d, fill: PALETTE[i % PALETTE.length] })), [baseData]);
  const totalAmount = useDemoData
    ? demoData.reduce((s, d) => s + d.amount, 0)
    : totalExpectedAmount;

  const displayValue = hoverData ? formatCurrency(hoverData.amount) : formatCurrency(totalAmount);
  const displayLabel = hoverData ? hoverData.name : 'Tổng chi';

  const maxValue = Math.max(...data.map(d => d.amount), 0);

  /* ── Shared axis config ── */
  const xAxisConfig = {
    dataKey: 'name',
    axisLine: false,
    tickLine: false,
    tick: { fill: '#475569', fontSize: 11, fontWeight: 700, dy: 10 } as any,
    height: 32,
  };
  const yAxisConfig = {
    axisLine: false,
    tickLine: false,
    tick: { fill: '#64748b', fontSize: 10, fontWeight: 700 } as any,
    tickFormatter: (v: number) => v >= 1_000_000_000 ? `${(v/1_000_000_000).toFixed(1)}B` : v >= 1_000_000 ? `${(v/1_000_000).toFixed(1)}M` : v >= 1_000 ? `${(v/1_000).toFixed(0)}K` : `${v}`,
    width: 60,
  };

  /* ── Empty state ── */
  const EmptyState = () => (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
      <div className="size-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center">
        <BarChart3 className="size-6 text-slate-300" />
      </div>
      <p className="text-[13px] font-bold text-slate-400">Chưa có dữ liệu chi phí</p>
      <p className="text-[11px] text-slate-300">Bật "Data ảo" để xem demo biểu đồ</p>
    </div>
  );

  return (
    <div className="w-full h-full flex flex-col">

      {/* ── Header ── */}
      <div className="px-5 pt-5 pb-4 flex items-start justify-between shrink-0">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-red-500 mb-2">
            Biến động chi phí theo tháng
          </p>
          <div className="flex items-baseline gap-3">
            <span className="text-[36px] font-black tracking-tight leading-none tabular-nums bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent drop-shadow-sm">
              {displayValue}
            </span>
            <span className="text-[13px] font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-md border border-amber-200 shadow-sm">VND</span>
          </div>
          <div className="flex items-center gap-2.5 mt-2">
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all ${
              hoverData 
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                : 'bg-emerald-50 border-emerald-200 text-emerald-700'
            }`}>
              {hoverData ? (
                <>
                  <span className="size-1.5 rounded-full bg-indigo-500 animate-pulse" />
                  {hoverData.name}
                </>
              ) : (
                <>
                  <TrendingUp className="size-3" />
                  Tổng chi
                </>
              )}
            </div>
            {!hoverData && (
              <span className="text-[10px] font-bold text-slate-400">
                {data.length > 0 ? `${data[0].name} — ${data[data.length - 1].name}` : ''}
              </span>
            )}
          </div>
        </div>

        {/* Demo data toggle */}
        <button
          onClick={() => setUseDemoData(prev => !prev)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95 ${
            useDemoData 
              ? 'bg-violet-50 border-violet-200 text-violet-600 shadow-sm' 
              : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600'
          }`}
        >
          {useDemoData 
            ? <ToggleRight className="size-3.5" strokeWidth={2.5} /> 
            : <ToggleLeft className="size-3.5" strokeWidth={2.5} />
          }
          Data ảo
        </button>
      </div>

      {/* ── Chart type selector ── */}
      <div className="px-5 pb-3 flex items-center gap-1 overflow-x-auto shrink-0">
        {CHART_TYPES.map(ct => {
          const active = chartType === ct.key;
          return (
            <button
              key={ct.key}
              onClick={() => setChartType(ct.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap active:scale-95 ${
                active
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 border border-transparent hover:border-slate-200'
              }`}
            >
              <ct.icon className="size-3" strokeWidth={2.5} />
              {ct.label}
            </button>
          );
        })}
      </div>

      {/* ── Chart body ── */}
      <div className="flex-1 min-h-[200px] min-w-0 w-full relative px-1 pb-2">
        {data.length === 0 ? <EmptyState /> : (
          <>
            {/* ── AREA ── */}
            {chartType === 'area' && (
              <ResponsiveContainer width="100%" height="100%" minHeight={200} minWidth={0}>
                <AreaChart data={data} margin={{ top: 8, right: 30, left: -4, bottom: 0 }}
                  onMouseMove={(e) => e.activePayload?.length && setHoverData(e.activePayload[0].payload)}
                  onMouseLeave={() => setHoverData(null)}
                >
                  <defs>
                    <linearGradient id="areaFill2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.2} />
                      <stop offset="50%" stopColor="#8b5cf6" stopOpacity={0.08} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0.01} />
                    </linearGradient>
                    <linearGradient id="areaStroke2" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#a78bfa" />
                      <stop offset="40%" stopColor="#6366f1" />
                      <stop offset="70%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#a78bfa" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis {...xAxisConfig} />
                  <YAxis {...yAxisConfig} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e2e8f0', strokeDasharray: '4 4' }} />
                  <Area type="monotone" dataKey="amount" stroke="url(#areaStroke2)" strokeWidth={2.5}
                    fillOpacity={1} fill="url(#areaFill2)" animationDuration={1200}
                    activeDot={{ r: 5, fill: '#6366f1', stroke: '#fff', strokeWidth: 2.5,
                      style: { filter: 'drop-shadow(0 2px 6px rgba(99,102,241,0.5))' } }} />
                </AreaChart>
              </ResponsiveContainer>
            )}

            {/* ── BAR ── */}
            {chartType === 'bar' && (
              <ResponsiveContainer width="100%" height="100%" minHeight={200} minWidth={0}>
                <BarChart data={data} margin={{ top: 8, right: 30, left: -4, bottom: 0 }}
                  onMouseMove={(e) => e.activePayload?.length && setHoverData(e.activePayload[0].payload)}
                  onMouseLeave={() => setHoverData(null)}
                >
                  <defs>
                    {data.map((_, i) => (
                      <linearGradient key={i} id={`barGrad${i}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={PALETTE[i % PALETTE.length]} stopOpacity={0.95} />
                        <stop offset="100%" stopColor={PALETTE[i % PALETTE.length]} stopOpacity={0.6} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis {...xAxisConfig} />
                  <YAxis {...yAxisConfig} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="amount" radius={[8, 8, 0, 0]} animationDuration={1000} maxBarSize={40}>
                    {data.map((_, i) => (
                      <Cell key={i} fill={`url(#barGrad${i})`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}

            {/* ── H-BAR ── */}
            {chartType === 'hbar' && (
              <ResponsiveContainer width="100%" height="100%" minHeight={350} minWidth={0}>
                <BarChart data={data} layout="vertical" margin={{ top: 8, right: 30, left: 0, bottom: 0 }}
                  onMouseMove={(e) => e.activePayload?.length && setHoverData(e.activePayload[0].payload)}
                  onMouseLeave={() => setHoverData(null)}
                >
                  <defs>
                    {data.map((_, i) => (
                      <linearGradient key={i} id={`hbarGrad${i}`} x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor={PALETTE[i % PALETTE.length]} stopOpacity={0.6} />
                        <stop offset="100%" stopColor={PALETTE[i % PALETTE.length]} stopOpacity={0.95} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" {...yAxisConfig} />
                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 11, fontWeight: 700 }} width={45} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="amount" radius={[0, 8, 8, 0]} animationDuration={1000} maxBarSize={20}>
                    {data.map((_, i) => (
                      <Cell key={i} fill={`url(#hbarGrad${i})`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}

            {/* ── LINE ── */}
            {chartType === 'line' && (
              <ResponsiveContainer width="100%" height="100%" minHeight={200} minWidth={0}>
                <LineChart data={data} margin={{ top: 8, right: 30, left: -4, bottom: 0 }}
                  onMouseMove={(e) => e.activePayload?.length && setHoverData(e.activePayload[0].payload)}
                  onMouseLeave={() => setHoverData(null)}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis {...xAxisConfig} />
                  <YAxis {...yAxisConfig} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e2e8f0', strokeDasharray: '4 4' }} />
                  <Line type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={3}
                    dot={{ r: 4, fill: '#6366f1', stroke: '#ffffff', strokeWidth: 2 }}
                    activeDot={{ r: 7, fill: '#6366f1', stroke: '#ffffff', strokeWidth: 3,
                      style: { filter: 'drop-shadow(0 3px 8px rgba(99,102,241,0.5))' } }}
                    animationDuration={1200} />
                </LineChart>
              </ResponsiveContainer>
            )}

            {/* ── COMPOSED (Bar + Line) ── */}
            {chartType === 'composed' && (
              <ResponsiveContainer width="100%" height="100%" minHeight={200} minWidth={0}>
                <ComposedChart data={data} margin={{ top: 8, right: 30, left: -4, bottom: 0 }}
                  onMouseMove={(e) => e.activePayload?.length && setHoverData(e.activePayload[0].payload)}
                  onMouseLeave={() => setHoverData(null)}
                >
                  <defs>
                    <linearGradient id="compBarFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#c4b5fd" stopOpacity={0.7} />
                      <stop offset="100%" stopColor="#c4b5fd" stopOpacity={0.2} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis {...xAxisConfig} />
                  <YAxis {...yAxisConfig} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="amount" fill="url(#compBarFill)" radius={[6,6,0,0]} maxBarSize={36} animationDuration={800} />
                  <Line type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={2.5}
                    dot={{ r: 3.5, fill: '#6366f1', stroke: '#ffffff', strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: '#6366f1', stroke: '#ffffff', strokeWidth: 2.5,
                      style: { filter: 'drop-shadow(0 2px 8px rgba(99,102,241,0.5))' } }}
                    animationDuration={1200} />
                </ComposedChart>
              </ResponsiveContainer>
            )}

            {/* ── PIE ── */}
            {chartType === 'pie' && (
              <ResponsiveContainer width="100%" height="100%" minHeight={280} minWidth={0}>
                <PieChart>
                  <Pie data={data} dataKey="amount" nameKey="name" cx="50%" cy="50%"
                    innerRadius="60%" outerRadius="95%" paddingAngle={3}
                    cornerRadius={6} animationDuration={1200}
                    stroke="none"
                    onMouseEnter={(_, i) => setHoverData(data[i])}
                    onMouseLeave={() => setHoverData(null)}
                  >
                    {data.map((_, i) => (
                      <Cell key={i} fill={PALETTE[i % PALETTE.length]} fillOpacity={0.85} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    height={48}
                    iconType="circle"
                    iconSize={12}
                    formatter={(value: string) => (
                      <span className="text-[12px] font-semibold text-slate-500 px-1">{value}</span>
                    )}
                    wrapperStyle={{ paddingTop: '16px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}

            {/* ── RADAR ── */}
            {chartType === 'radar' && (
              <ResponsiveContainer width="100%" height="100%" minHeight={200} minWidth={0}>
                <RadarChart data={data} cx="50%" cy="50%" outerRadius="75%" 
                  onMouseMove={(e) => e.activePayload?.length && setHoverData(e.activePayload[0].payload)}
                  onMouseLeave={() => setHoverData(null)}
                >
                  <defs>
                    <linearGradient id="colorRadar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.5}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <PolarGrid stroke="#cbd5e1" strokeDasharray="3 3"/>
                  <PolarAngleAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={false} />
                  <Radar 
                    name="Chi phí" 
                    dataKey="amount" 
                    stroke="#8b5cf6" 
                    strokeWidth={2.5} 
                    fill="url(#colorRadar)" 
                    fillOpacity={1} 
                    dot={{ r: 3.5, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2 }} 
                    activeDot={{ 
                      r: 6, fill: '#fff', stroke: '#8b5cf6', strokeWidth: 2.5, 
                      style: { filter: 'drop-shadow(0 2px 8px rgba(139,92,246,0.6))' } 
                    }} 
                    animationDuration={1200} 
                  />
                </RadarChart>
              </ResponsiveContainer>
            )}

            {/* ── RADIAL BAR ── */}
            {chartType === 'radial' && (
              <ResponsiveContainer width="100%" height="100%" minHeight={280} minWidth={0}>
                <RadialBarChart cx="50%" cy="50%" innerRadius="25%" outerRadius="90%" barSize={12} data={data}
                  onMouseMove={(e: any) => e?.activePayload?.length && setHoverData(e.activePayload[0].payload)}
                  onMouseLeave={() => setHoverData(null)}
                >
                  <RadialBar
                    dataKey="amount"
                    background={{ fill: '#e2e8f0' }}
                    cornerRadius={15}
                    animationDuration={1500}
                  >
                    {data.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                  </RadialBar>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    height={48}
                    content={(props) => {
                      const pl = data.map(d => ({ value: d.name, color: d.fill, type: 'circle' as const }));
                      return (
                        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 pt-4">
                          {pl.map((entry, idx) => (
                            <div key={`item-${idx}`} className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                              <span className="text-[12px] font-semibold text-slate-500">{entry.value}</span>
                            </div>
                          ))}
                        </div>
                      );
                    }}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
            )}
          </>
        )}
      </div>
    </div>
  );
}
