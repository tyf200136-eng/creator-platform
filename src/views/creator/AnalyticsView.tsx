import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import RiyalSymbol from '../../components/RiyalSymbol';
import PlatformIcon from '../../components/PlatformIcon';
import InteractiveAnalyticsChart, { AnalyticsPoint } from '../../components/analytics/InteractiveAnalyticsChart';
import { SocialPlatform } from '../../types';
import {
  Eye,
  Video,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Calendar,
  Heart,
  MessageSquare,
  Share2,
  SlidersHorizontal,
  Layers,
  ChevronDown,
  RotateCcw
} from 'lucide-react';

/**
 * Animated Count-up component for KPI numbers
 */
const AnimatedKpiNumber: React.FC<{
  value: number;
  decimals?: number;
  duration?: number;
  suffix?: string;
}> = ({ value, decimals = 0, duration = 600, suffix = '' }) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startVal = displayValue;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(startVal + (value - startVal) * ease);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    const animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [value, duration]);

  const formatted = decimals > 0
    ? displayValue.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    : Math.round(displayValue).toLocaleString('en-US');

  return (
    <span className="tabular-nums font-mono">
      {formatted}{suffix}
    </span>
  );
};

export const AnalyticsView: React.FC = () => {
  // 1. Filter States
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | 'custom'>('30d');
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const [customRangeDays, setCustomRangeDays] = useState(14);
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>([
    'tiktok',
    'instagram',
    'youtube',
    'snapchat',
    'x',
  ]);
  const [comparePrevious, setComparePrevious] = useState(true);
  const [mode, setModeTab] = useState<'daily' | 'cumulative'>('daily');

  // 2. Active KPI Selector State
  // 'views' | 'earnings' | 'clips' | 'approved'
  const [activeKpi, setActiveKpi] = useState<'views' | 'earnings' | 'clips' | 'approved'>('views');

  // 3. Secondary Engagement Toggle inside chart header
  const [engagementSubMetric, setEngagementSubMetric] = useState<'all' | 'likes' | 'comments' | 'shares'>('all');

  // Loading simulation state for filter changes
  const [isLoading, setIsLoading] = useState(false);

  // Platform multi-select toggle
  const togglePlatform = (p: SocialPlatform) => {
    setIsLoading(true);
    setSelectedPlatforms((prev) =>
      prev.includes(p) ? prev.filter((item) => item !== p) : [...prev, p]
    );
    setTimeout(() => setIsLoading(false), 180);
  };

  const selectAllPlatforms = () => {
    setIsLoading(true);
    setSelectedPlatforms(['tiktok', 'instagram', 'youtube', 'snapchat', 'x']);
    setTimeout(() => setIsLoading(false), 180);
  };

  const handlePeriodChange = (newPeriod: '7d' | '30d' | '90d' | 'custom') => {
    setIsLoading(true);
    setPeriod(newPeriod);
    setTimeout(() => setIsLoading(false), 180);
  };

  // Platform weights for realistic filtering
  const platformWeight = useMemo(() => {
    const weights: Record<SocialPlatform, number> = {
      tiktok: 0.42,
      instagram: 0.28,
      youtube: 0.16,
      snapchat: 0.10,
      x: 0.04,
    };
    return selectedPlatforms.reduce((sum, p) => sum + weights[p], 0);
  }, [selectedPlatforms]);

  // Compute number of days based on period
  const totalDays = useMemo(() => {
    if (period === '7d') return 7;
    if (period === '30d') return 30;
    if (period === '90d') return 90;
    return customRangeDays;
  }, [period, customRangeDays]);

  // Multiplier based on period length relative to 30d baseline
  const periodScale = useMemo(() => {
    return totalDays / 30;
  }, [totalDays]);

  // KPI Base values (matching prompt exactly when 30d and all platforms)
  // Base 30d:
  // المشاهدات: 3,420,000 | صافي الأرباح: 10,190.50 | المقاطع المنشورة: 42 | المقاطع المقبولة: 39
  const kpiData = useMemo(() => {
    const scale = platformWeight * periodScale;
    const views = Math.round(3420000 * scale);
    const earnings = +(10190.5 * scale).toFixed(2);
    const clips = Math.max(0, Math.round(42 * scale));
    const approved = Math.max(0, Math.round(39 * scale));

    return {
      views: {
        value: views,
        change: 24.5,
        helper: '+24.5% هذا الشهر',
        label: 'المشاهدات المعتمدة',
      },
      earnings: {
        value: earnings,
        change: 18.0,
        helper: '+18.0% نمو الأرباح',
        label: 'صافي الأرباح',
      },
      clips: {
        value: clips,
        change: 12.0,
        helper: 'عبر 6 حملات مختلفة',
        label: 'المقاطع المنشورة',
      },
      approved: {
        value: approved,
        change: 92.8,
        helper: 'نسبة قبول 92.8%',
        label: 'المقاطع المقبولة',
      },
    };
  }, [platformWeight, periodScale]);

  // Generate date points for chart based on selected period
  const chartPoints = useMemo<AnalyticsPoint[]>(() => {
    if (selectedPlatforms.length === 0) return [];

    const pts: AnalyticsPoint[] = [];
    const arabicMonths = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    const arabicDays = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];

    const now = new Date(2026, 9, 10); // 10 October 2026

    // Target total sum for the active metric over the period
    let targetTotal = kpiData[activeKpi].value;
    if (engagementSubMetric === 'likes') targetTotal = Math.round(targetTotal * 0.08);
    if (engagementSubMetric === 'comments') targetTotal = Math.round(targetTotal * 0.012);
    if (engagementSubMetric === 'shares') targetTotal = Math.round(targetTotal * 0.007);

    const baseDailyAvg = targetTotal / totalDays;

    let cumulativeSum = 0;
    let prevCumulativeSum = 0;

    // Generate from past (i = totalDays - 1 down to 0) so index 0 = oldest, index totalDays - 1 = today
    for (let i = totalDays - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);

      const dayName = arabicDays[d.getDay()];
      const dayNum = d.getDate();
      const monthName = arabicMonths[d.getMonth()];
      const label = `${dayNum} ${monthName.slice(0, 3)}`;
      const fullDate = `${dayName}، ${dayNum} ${monthName} 2026`;

      // Pseudo-random curve with upward trend towards today
      const progressFraction = (totalDays - 1 - i) / Math.max(1, totalDays - 1);
      const wave = Math.sin((totalDays - i) * 0.6) * 0.28 + Math.cos((totalDays - i) * 0.3) * 0.15;
      const factor = Math.max(0.2, (0.7 + progressFraction * 0.6 + wave) * platformWeight);

      let dailyVal = Math.round(baseDailyAvg * factor);
      if (activeKpi === 'earnings') {
        dailyVal = +(baseDailyAvg * factor).toFixed(2);
      }
      if (activeKpi === 'clips' || activeKpi === 'approved') {
        dailyVal = Math.max(0, Math.round(baseDailyAvg * factor));
      }

      cumulativeSum += dailyVal;
      const prevDailyVal = Math.round(dailyVal * 0.82);
      prevCumulativeSum += prevDailyVal;

      pts.push({
        id: `point-${i}`,
        label,
        fullDate,
        value: mode === 'cumulative' ? (activeKpi === 'earnings' ? +cumulativeSum.toFixed(2) : Math.round(cumulativeSum)) : dailyVal,
        previousValue: comparePrevious ? (mode === 'cumulative' ? Math.round(prevCumulativeSum) : prevDailyVal) : undefined,
      });
    }

    return pts;
  }, [totalDays, activeKpi, engagementSubMetric, mode, comparePrevious, kpiData, platformWeight, selectedPlatforms.length]);

  return (
    <div className="relative pb-36 px-6 pt-6 flex flex-col gap-6 max-w-[1440px] mx-auto text-right select-none">
      {/* 1. Header (kept exact title and subtitle) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white font-heading">تحليلات الأداء والنمو</h1>
          <p className="text-xs text-muted mt-1">
            رصد نمو المشاهدات ومعدلات التفاعل والأرباح المكتسبة لجميع مقاطعك
          </p>
        </div>

        {/* Quick Date Indicator */}
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-white/[0.06] border border-white/[0.1] text-xs font-mono text-white/70 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-white/60" />
            <span>نطاق العرض: {totalDays} يوماً</span>
          </span>
        </div>
      </div>

      {/* 2. STICKY GLASS FILTER BAR */}
      <div className="sticky top-16 z-30 p-3 sm:p-4 rounded-[24px] bg-surface/90 backdrop-blur-3xl border border-white/[0.14] shadow-[0_16px_40px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.2)] flex flex-wrap items-center justify-between gap-4">
        {/* Right side: Period Tabs + Custom Date Picker */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 p-1 rounded-full bg-white/[0.05] border border-white/[0.08]">
            {[
              { id: '7d', label: '7 أيام' },
              { id: '30d', label: '30 يوم' },
              { id: '90d', label: '3 أشهر' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => handlePeriodChange(p.id as any)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  period === p.id
                    ? 'bg-white text-black font-bold shadow-[0_0_12px_rgba(255,255,255,0.4)]'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}

            {/* "مخصص" Date Picker Trigger */}
            <div className="relative">
              <button
                onClick={() => setIsCustomOpen(!isCustomOpen)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1 cursor-pointer ${
                  period === 'custom'
                    ? 'bg-white text-black font-bold shadow-[0_0_12px_rgba(255,255,255,0.4)]'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <span>مخصص</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {/* Custom Date Range Popover */}
              {isCustomOpen && (
                <div className="absolute right-0 top-10 z-50 w-64 p-3.5 rounded-2xl bg-surface-2/95 border border-white/[0.18] shadow-[0_20px_50px_rgba(0,0,0,0.9)] backdrop-blur-2xl flex flex-col gap-2.5 text-right">
                  <span className="text-xs font-bold text-white">تحديد نطاق الأيام</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[14, 21, 45, 60, 120, 180].map((days) => (
                      <button
                        key={days}
                        onClick={() => {
                          setCustomRangeDays(days);
                          handlePeriodChange('custom');
                          setIsCustomOpen(false);
                        }}
                        className={`py-1.5 px-2 rounded-xl text-xs font-mono font-medium transition-all ${
                          customRangeDays === days && period === 'custom'
                            ? 'bg-white text-black font-bold'
                            : 'bg-white/[0.04] text-white/70 hover:bg-white/[0.1] hover:text-white'
                        }`}
                      >
                        {days} يوم
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Platform Multi-select Chips */}
          <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/[0.04] border border-white/[0.08] overflow-x-auto">
            <span className="text-[10px] text-white/50 px-2 font-medium">المنصات:</span>
            {(
              [
                { id: 'tiktok', label: 'تيك توك' },
                { id: 'instagram', label: 'إنستقرام' },
                { id: 'youtube', label: 'يوتيوب' },
                { id: 'snapchat', label: 'سناب' },
                { id: 'x', label: 'إكس' },
              ] as const
            ).map((plt) => {
              const active = selectedPlatforms.includes(plt.id);
              return (
                <button
                  key={plt.id}
                  onClick={() => togglePlatform(plt.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
                    active
                      ? 'bg-white/20 text-white border border-white/30 shadow-[0_0_8px_rgba(255,255,255,0.15)] font-bold'
                      : 'text-white/40 hover:text-white/70 hover:bg-white/[0.05]'
                  }`}
                >
                  <PlatformIcon platform={plt.id} size={11} />
                  <span>{plt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Left side: Toggles "مقارنة بالفترة السابقة" & "يومي / تراكمي" */}
        <div className="flex items-center gap-3">
          {/* Comparison Toggle */}
          <button
            onClick={() => setComparePrevious(!comparePrevious)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all cursor-pointer border ${
              comparePrevious
                ? 'bg-white/[0.14] text-white border-white/30 shadow-sm font-semibold'
                : 'text-white/50 border-white/[0.08] hover:text-white hover:border-white/20'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${comparePrevious ? 'bg-white shadow-[0_0_6px_rgba(255,255,255,1)]' : 'bg-white/30'}`} />
            <span>مقارنة بالفترة السابقة</span>
          </button>

          {/* Mode Toggle: يومي / تراكمي */}
          <div className="flex items-center gap-1 p-1 rounded-full bg-white/[0.05] border border-white/[0.08]">
            <button
              onClick={() => setModeTab('daily')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                mode === 'daily'
                  ? 'bg-white text-black font-bold shadow-[0_0_10px_rgba(255,255,255,0.4)]'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              يومي
            </button>
            <button
              onClick={() => setModeTab('cumulative')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                mode === 'cumulative'
                  ? 'bg-white text-black font-bold shadow-[0_0_10px_rgba(255,255,255,0.4)]'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              تراكمي
            </button>
          </div>
        </div>
      </div>

      {/* 3. KPI CARDS AS THE CHART SELECTOR (Clicking switches the chart) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: المشاهدات المعتمدة */}
        <div
          onClick={() => {
            setActiveKpi('views');
            setEngagementSubMetric('all');
          }}
          className={`p-5 rounded-[22px] transition-all duration-300 cursor-pointer flex flex-col justify-between group ${
            activeKpi === 'views' && engagementSubMetric === 'all'
              ? 'bg-white/[0.08] border-2 border-white/50 shadow-[0_0_24px_rgba(255,255,255,0.22),inset_0_1px_0_rgba(255,255,255,0.4)] -translate-y-1'
              : 'bg-white/[0.04] border border-white/[0.12] hover:border-white/30 hover:bg-white/[0.06]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted font-medium">المشاهدات المعتمدة</span>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeKpi === 'views' ? 'bg-white text-black' : 'bg-white/[0.08] text-white/70'}`}>
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-white font-mono tabular-nums font-heading">
              <AnimatedKpiNumber value={kpiData.views.value} />
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-mono font-semibold text-emerald-400 mt-1">
            <TrendingUp className="w-3 h-3" />
            <span>+24.5% هذا الشهر</span>
          </div>
        </div>

        {/* KPI 2: صافي الأرباح */}
        <div
          onClick={() => {
            setActiveKpi('earnings');
            setEngagementSubMetric('all');
          }}
          className={`p-5 rounded-[22px] transition-all duration-300 cursor-pointer flex flex-col justify-between group ${
            activeKpi === 'earnings'
              ? 'bg-white/[0.08] border-2 border-white/50 shadow-[0_0_24px_rgba(255,255,255,0.22),inset_0_1px_0_rgba(255,255,255,0.4)] -translate-y-1'
              : 'bg-white/[0.04] border border-white/[0.12] hover:border-white/30 hover:bg-white/[0.06]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted font-medium">صافي الأرباح</span>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeKpi === 'earnings' ? 'bg-white text-black' : 'bg-white/[0.08] text-white/70'}`}>
              <RiyalSymbol className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1 mt-3">
            <span className="text-2xl sm:text-3xl font-black text-white font-mono tabular-nums font-heading">
              <AnimatedKpiNumber value={kpiData.earnings.value} decimals={2} />
            </span>
            <RiyalSymbol className="w-3.5 h-3.5 text-white/90" />
          </div>
          <div className="flex items-center gap-1 text-[11px] font-mono font-semibold text-emerald-400 mt-1">
            <TrendingUp className="w-3 h-3" />
            <span>+18.0% نمو الأرباح</span>
          </div>
        </div>

        {/* KPI 3: المقاطع المنشورة */}
        <div
          onClick={() => {
            setActiveKpi('clips');
            setEngagementSubMetric('all');
          }}
          className={`p-5 rounded-[22px] transition-all duration-300 cursor-pointer flex flex-col justify-between group ${
            activeKpi === 'clips'
              ? 'bg-white/[0.08] border-2 border-white/50 shadow-[0_0_24px_rgba(255,255,255,0.22),inset_0_1px_0_rgba(255,255,255,0.4)] -translate-y-1'
              : 'bg-white/[0.04] border border-white/[0.12] hover:border-white/30 hover:bg-white/[0.06]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted font-medium">المقاطع المنشورة</span>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeKpi === 'clips' ? 'bg-white text-black' : 'bg-white/[0.08] text-white/70'}`}>
              <Video className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 mt-3">
            <span className="text-2xl sm:text-3xl font-black text-white font-mono tabular-nums font-heading">
              <AnimatedKpiNumber value={kpiData.clips.value} />
            </span>
            <span className="text-sm font-normal text-white/70">مقطع</span>
          </div>
          <span className="text-[11px] text-white/60 mt-1">عبر 6 حملات مختلفة</span>
        </div>

        {/* KPI 4: المقاطع المقبولة */}
        <div
          onClick={() => {
            setActiveKpi('approved');
            setEngagementSubMetric('all');
          }}
          className={`p-5 rounded-[22px] transition-all duration-300 cursor-pointer flex flex-col justify-between group ${
            activeKpi === 'approved'
              ? 'bg-white/[0.08] border-2 border-white/50 shadow-[0_0_24px_rgba(255,255,255,0.22),inset_0_1px_0_rgba(255,255,255,0.4)] -translate-y-1'
              : 'bg-white/[0.04] border border-white/[0.12] hover:border-white/30 hover:bg-white/[0.06]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted font-medium">المقاطع المقبولة</span>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeKpi === 'approved' ? 'bg-white text-black' : 'bg-white/[0.08] text-emerald-400'}`}>
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 mt-3">
            <span className="text-2xl sm:text-3xl font-black text-white font-mono tabular-nums font-heading">
              <AnimatedKpiNumber value={kpiData.approved.value} />
            </span>
            <span className="text-sm font-normal text-white/70">مقطع</span>
          </div>
          <span className="text-[11px] text-emerald-400 mt-1">نسبة قبول 92.8%</span>
        </div>
      </div>

      {/* 4. INTERACTIVE CHART PANEL WITH SECONDARY ENGAGEMENT TOGGLE IN HEADER */}
      <div className="p-6 rounded-[26px] bg-white/[0.045] backdrop-blur-2xl border border-white/[0.14] shadow-[0_24px_60px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.2)] flex flex-col gap-6">
        {/* Chart Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-white font-heading">
              مخطط {kpiData[activeKpi].label} ({mode === 'daily' ? 'اليومي' : 'التراكمي'})
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-white/[0.08] text-[11px] font-mono text-white/70">
              {chartPoints.length} نقطة رصد
            </span>
          </div>

          {/* Small Secondary Toggle inside chart header: الإعجابات / التعليقات / المشاركات */}
          <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/[0.04] border border-white/[0.08]">
            <span className="text-[10px] text-white/40 px-1 font-medium">تفاعل إضافي:</span>
            {[
              { id: 'all', label: 'المقياس الرئيسي' },
              { id: 'likes', label: 'الإعجابات' },
              { id: 'comments', label: 'التعليقات' },
              { id: 'shares', label: 'المشاركات' },
            ].map((sub) => (
              <button
                key={sub.id}
                onClick={() => setEngagementSubMetric(sub.id as any)}
                className={`px-2.5 py-1 rounded-full text-xs transition-all cursor-pointer ${
                  engagementSubMetric === sub.id
                    ? 'bg-white text-black font-bold shadow-sm'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {sub.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Interactive SVG Chart */}
        <InteractiveAnalyticsChart
          points={chartPoints}
          primaryLabel={
            engagementSubMetric === 'likes'
              ? 'الإعجابات'
              : engagementSubMetric === 'comments'
              ? 'التعليقات'
              : engagementSubMetric === 'shares'
              ? 'المشاركات'
              : kpiData[activeKpi].label
          }
          isCurrency={activeKpi === 'earnings' && engagementSubMetric === 'all'}
          valueUnit={
            activeKpi === 'views'
              ? 'مشاهدة'
              : activeKpi === 'clips' || activeKpi === 'approved'
              ? 'مقطع'
              : ''
          }
          isCumulative={mode === 'cumulative'}
          showComparison={comparePrevious}
          isLoading={isLoading}
          emptyStateAction={selectAllPlatforms}
        />
      </div>
    </div>
  );
};

export default AnalyticsView;
