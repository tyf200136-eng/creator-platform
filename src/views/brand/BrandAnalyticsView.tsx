import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import RiyalSymbol from '../../components/RiyalSymbol';
import PlatformIcon from '../../components/PlatformIcon';
import InteractiveAnalyticsChart, { AnalyticsPoint, ChartEvent } from '../../components/analytics/InteractiveAnalyticsChart';
import { SocialPlatform } from '../../types';
import {
  Download,
  TrendingUp,
  TrendingDown,
  Eye,
  Video,
  Layers,
  Clock,
  Calendar,
  ChevronDown,
  Building2,
  DollarSign,
  PlusCircle,
  FileSpreadsheet,
  CalendarPlus
} from 'lucide-react';

/**
 * Animated Count-up component for KPI numbers
 */
const AnimatedKpiNumber: React.FC<{
  value: number;
  decimals?: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
}> = ({ value, decimals = 0, duration = 600, suffix = '', prefix = '' }) => {
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
      {prefix}{formatted}{suffix}
    </span>
  );
};

export const BrandAnalyticsView: React.FC = () => {
  const { campaigns, showToast } = useApp();

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
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('all');
  const [isCampaignDropdownOpen, setIsCampaignDropdownOpen] = useState(false);
  const [comparePrevious, setComparePrevious] = useState(true);
  const [mode, setModeTab] = useState<'daily' | 'cumulative'>('daily');

  // 2. KPI Selector State
  // 'views' | 'spend' | 'ecpm' | 'active_clips' | 'new_posts'
  const [activeKpi, setActiveKpi] = useState<'views' | 'spend' | 'ecpm' | 'active_clips' | 'new_posts'>('views');

  // Loading simulation state
  const [isLoading, setIsLoading] = useState(false);

  const handleExport = () => {
    showToast('تم تصدير تقرير التحليلات الشامل بصيغة CSV و PDF بنجاح!');
  };

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

  // Platform weights
  const platformWeight = useMemo(() => {
    const weights: Record<SocialPlatform, number> = {
      tiktok: 0.40,
      instagram: 0.28,
      youtube: 0.18,
      snapchat: 0.10,
      x: 0.04,
    };
    return selectedPlatforms.reduce((sum, p) => sum + weights[p], 0);
  }, [selectedPlatforms]);

  // Campaign weight modifier
  const campaignWeight = useMemo(() => {
    if (selectedCampaignId === 'all') return 1.0;
    if (selectedCampaignId === 'camp-1') return 0.36; // Imperial Wild
    if (selectedCampaignId === 'camp-2') return 0.18; // Address Coffee
    if (selectedCampaignId === 'camp-3') return 0.52; // Jahez
    return 0.25;
  }, [selectedCampaignId]);

  // Compute number of days
  const totalDays = useMemo(() => {
    if (period === '7d') return 7;
    if (period === '30d') return 30;
    if (period === '90d') return 90;
    return customRangeDays;
  }, [period, customRangeDays]);

  const periodScale = useMemo(() => {
    return totalDays / 30;
  }, [totalDays]);

  // Exact prompt values for 30d baseline across all campaigns:
  // المشاهدات المعتمدة: 24,800,000 (+34.8% هذا الشهر)
  // الصرف الفعلي: 114,800 (كفاءة صرف 98%)
  // تكلفة الـ 1,000 (eCPM): 4.62 (أقل بـ 62% من الإعلانات)
  // المقاطع النشطة: 184 مقطع (تجمع مشاهدات حالياً)
  // منشورات جديدة اليوم: +14 فيديو (تدفق مستمر)
  const kpiData = useMemo(() => {
    const scale = platformWeight * campaignWeight * periodScale;

    const views = Math.round(24800000 * scale);
    const spend = Math.round(114800 * scale);
    const ecpm = +(4.62 * (0.95 + (1 - platformWeight) * 0.1)).toFixed(2);
    const activeClips = Math.max(0, Math.round(184 * scale));
    const newPosts = Math.max(0, Math.round(14 * platformWeight * campaignWeight));

    return {
      views: {
        value: views,
        change: 34.8,
        isPositive: true,
        helper: '+34.8% هذا الشهر',
        label: 'المشاهدات المعتمدة',
      },
      spend: {
        value: spend,
        change: 98,
        isPositive: true,
        helper: 'كفاءة صرف 98%',
        label: 'الصرف الفعلي',
      },
      ecpm: {
        value: ecpm,
        change: -62,
        isPositive: true, // for cost metrics, decrease is green!
        helper: 'أقل بـ 62% من الإعلانات',
        label: 'تكلفة الـ 1,000 (eCPM)',
      },
      active_clips: {
        value: activeClips,
        change: 15.2,
        isPositive: true,
        helper: 'تجمع مشاهدات حالياً',
        label: 'المقاطع النشطة',
      },
      new_posts: {
        value: newPosts,
        change: 8.4,
        isPositive: true,
        helper: 'تدفق مستمر',
        label: 'منشورات جديدة اليوم',
      },
    };
  }, [platformWeight, campaignWeight, periodScale]);

  // Dynamic Chart Points with Two Series: المشاهدات + الإنفاق التراكمي
  // Plus Event Markers!
  const chartPoints = useMemo<AnalyticsPoint[]>(() => {
    if (selectedPlatforms.length === 0) return [];

    const pts: AnalyticsPoint[] = [];
    const arabicMonths = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    const arabicDays = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];

    const now = new Date(2026, 9, 10);

    const targetViewsTotal = kpiData.views.value;
    const targetSpendTotal = kpiData.spend.value;

    const baseDailyViews = targetViewsTotal / totalDays;
    const baseDailySpend = targetSpendTotal / totalDays;

    let cumulativeViews = 0;
    let prevCumulativeViews = 0;
    let cumulativeSpend = 0;

    // Events map on specific days
    const eventsMap: Record<number, ChartEvent> = {
      // 25 days ago
      25: {
        title: 'إطلاق حملة عطر إمبريال البري',
        description: 'بدء استقبال مقاطع UGC بميزانية 65,000 <RiyalSymbol />',
        type: 'campaign',
      },
      // 14 days ago
      14: {
        title: 'شحن رصيد المحفظة +25,000 <RiyalSymbol />',
        description: 'تعزيز ميزانية حملات التوصيل السريع عبر سداد فوري',
        type: 'fund',
      },
      // 4 days ago
      4: {
        title: 'تخطي حاجز 20 مليون مشاهدة',
        description: 'تسجيل أعلى معدل انتشار عبر مقاطع تيك توك وسناب',
        type: 'milestone',
      },
    };

    for (let i = totalDays - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);

      const dayName = arabicDays[d.getDay()];
      const dayNum = d.getDate();
      const monthName = arabicMonths[d.getMonth()];
      const label = `${dayNum} ${monthName.slice(0, 3)}`;
      const fullDate = `${dayName}، ${dayNum} ${monthName} 2026`;

      const progressFraction = (totalDays - 1 - i) / Math.max(1, totalDays - 1);
      const wave = Math.sin((totalDays - i) * 0.5) * 0.3 + Math.cos((totalDays - i) * 0.25) * 0.15;
      const factor = Math.max(0.2, (0.65 + progressFraction * 0.7 + wave) * platformWeight * campaignWeight);

      let dailyViews = Math.round(baseDailyViews * factor);
      let dailySpend = Math.round(baseDailySpend * factor);

      // Value depends on active KPI
      let primaryVal = dailyViews;
      if (activeKpi === 'spend') primaryVal = dailySpend;
      if (activeKpi === 'ecpm') primaryVal = +(kpiData.ecpm.value * (0.92 + wave * 0.1)).toFixed(2);
      if (activeKpi === 'active_clips') primaryVal = Math.round((kpiData.active_clips.value / totalDays) * factor * 5);
      if (activeKpi === 'new_posts') primaryVal = Math.round((kpiData.new_posts.value / 4) * factor * 2);

      cumulativeViews += dailyViews;
      cumulativeSpend += dailySpend;

      const prevDailyVal = Math.round(primaryVal * 0.76);
      prevCumulativeViews += Math.round(dailyViews * 0.76);

      const evt = totalDays >= 28 ? eventsMap[i] : undefined;

      pts.push({
        id: `b-point-${i}`,
        label,
        fullDate,
        value: mode === 'cumulative' ? cumulativeViews : primaryVal,
        previousValue: comparePrevious ? (mode === 'cumulative' ? prevCumulativeViews : prevDailyVal) : undefined,
        secondaryValue: cumulativeSpend,
        event: evt,
      });
    }

    return pts;
  }, [totalDays, activeKpi, mode, comparePrevious, kpiData, platformWeight, campaignWeight, selectedPlatforms.length]);

  return (
    <div className="relative pb-36 px-6 pt-6 flex flex-col gap-6 max-w-[1440px] mx-auto text-right select-none">
      {/* 1. Header with Export Button (exact texts preserved) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white font-heading">تحليلات الأداء والعائد التسويقي</h1>
          <p className="text-xs text-[#A3A3A3] mt-1">
            رصد انتشار الفيديوهات، العائد على الإنفاق (ROAS)، ومتوسط تكلفة الـ CPM الفعلي
          </p>
        </div>

        {/* Kept "تصدير تقرير شامل (CSV / PDF)" button exactly */}
        <button
          onClick={handleExport}
          className="py-2.5 px-6 rounded-full bg-white text-black font-bold text-xs shadow-[0_0_18px_rgba(255,255,255,0.4)] hover:shadow-[0_0_28px_rgba(255,255,255,0.7)] hover:bg-neutral-100 transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>تصدير تقرير شامل (CSV / PDF)</span>
        </button>
      </div>

      {/* 2. STICKY GLASS FILTER BAR (Campaign dropdown + Period + Platforms + Toggles) */}
      <div className="sticky top-16 z-30 p-3 sm:p-4 rounded-[24px] bg-[#101010]/90 backdrop-blur-3xl border border-white/[0.14] shadow-[0_16px_40px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.2)] flex flex-wrap items-center justify-between gap-4">
        {/* Right side: Campaign Dropdown + Period Tabs + Custom Date */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Owner Only: Campaign Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsCampaignDropdownOpen(!isCampaignDropdownOpen)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.08] border border-white/[0.16] hover:bg-white/[0.12] text-xs font-semibold text-white transition-all cursor-pointer shadow-sm"
            >
              <Building2 className="w-3.5 h-3.5 text-white/70" />
              <span className="max-w-[150px] truncate">
                {selectedCampaignId === 'all'
                  ? 'جميع الحملات (9)'
                  : campaigns.find((c) => c.id === selectedCampaignId)?.title || 'حملة محددة'}
              </span>
              <ChevronDown className="w-3 h-3 text-white/50" />
            </button>

            {/* Campaign Selection Dropdown Popover */}
            {isCampaignDropdownOpen && (
              <div className="absolute right-0 top-11 z-50 w-72 rounded-2xl bg-[#161616]/95 border border-white/[0.18] p-2 shadow-[0_20px_50px_rgba(0,0,0,0.9)] backdrop-blur-3xl flex flex-col gap-1 text-right animate-in fade-in duration-150">
                <button
                  onClick={() => {
                    setIsLoading(true);
                    setSelectedCampaignId('all');
                    setIsCampaignDropdownOpen(false);
                    setTimeout(() => setIsLoading(false), 180);
                  }}
                  className={`w-full p-2 rounded-xl text-xs text-right transition-all flex items-center justify-between ${
                    selectedCampaignId === 'all'
                      ? 'bg-white text-black font-bold'
                      : 'text-white/80 hover:bg-white/[0.06] hover:text-white'
                  }`}
                >
                  <span>جميع الحملات النشطة</span>
                  <span className="font-mono text-[10px]">9 حملات</span>
                </button>

                {campaigns.slice(0, 4).map((camp) => (
                  <button
                    key={camp.id}
                    onClick={() => {
                      setIsLoading(true);
                      setSelectedCampaignId(camp.id);
                      setIsCampaignDropdownOpen(false);
                      setTimeout(() => setIsLoading(false), 180);
                    }}
                    className={`w-full p-2 rounded-xl text-xs text-right transition-all flex items-center justify-between ${
                      selectedCampaignId === camp.id
                        ? 'bg-white text-black font-bold'
                        : 'text-white/80 hover:bg-white/[0.06] hover:text-white'
                    }`}
                  >
                    <span className="truncate max-w-[170px]">{camp.title}</span>
                    <span className="font-mono text-[10px] text-white/50">CPM {camp.ratePer1k} <RiyalSymbol /></span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Period Segmented Tabs */}
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

            {/* Custom Picker */}
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

              {isCustomOpen && (
                <div className="absolute right-0 top-10 z-50 w-64 p-3.5 rounded-2xl bg-[#161616]/95 border border-white/[0.18] shadow-[0_20px_50px_rgba(0,0,0,0.9)] backdrop-blur-2xl flex flex-col gap-2.5 text-right">
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

      {/* 3. 5 KPI CARDS AS THE CHART SELECTOR */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* KPI 1: المشاهدات المعتمدة */}
        <div
          onClick={() => setActiveKpi('views')}
          className={`p-4 rounded-[22px] transition-all duration-300 cursor-pointer flex flex-col justify-between group ${
            activeKpi === 'views'
              ? 'bg-white/[0.08] border-2 border-white/50 shadow-[0_0_24px_rgba(255,255,255,0.22),inset_0_1px_0_rgba(255,255,255,0.4)] -translate-y-1'
              : 'bg-white/[0.04] border border-white/[0.12] hover:border-white/30 hover:bg-white/[0.06]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#A3A3A3] font-medium">المشاهدات المعتمدة</span>
            <Eye className="w-3.5 h-3.5 text-white/70" />
          </div>
          <span className="text-2xl font-black text-white font-mono mt-2 font-heading">
            <AnimatedKpiNumber value={kpiData.views.value} />
          </span>
          <div className="flex items-center gap-1 text-[10px] font-mono font-semibold text-emerald-400 mt-1">
            <TrendingUp className="w-2.5 h-2.5" />
            <span>+34.8% هذا الشهر</span>
          </div>
        </div>

        {/* KPI 2: الصرف الفعلي */}
        <div
          onClick={() => setActiveKpi('spend')}
          className={`p-4 rounded-[22px] transition-all duration-300 cursor-pointer flex flex-col justify-between group ${
            activeKpi === 'spend'
              ? 'bg-white/[0.08] border-2 border-white/50 shadow-[0_0_24px_rgba(255,255,255,0.22),inset_0_1px_0_rgba(255,255,255,0.4)] -translate-y-1'
              : 'bg-white/[0.04] border border-white/[0.12] hover:border-white/30 hover:bg-white/[0.06]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#A3A3A3] font-medium">الصرف الفعلي</span>
            <RiyalSymbol className="w-3.5 h-3.5 text-white/70" />
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-black text-white font-mono font-heading">
              <AnimatedKpiNumber value={kpiData.spend.value} />
            </span>
            <RiyalSymbol className="w-3 h-3 text-white" />
          </div>
          <span className="text-[10px] text-white/50 mt-1">كفاءة صرف 98%</span>
        </div>

        {/* KPI 3: تكلفة الـ 1,000 (eCPM) */}
        <div
          onClick={() => setActiveKpi('ecpm')}
          className={`p-4 rounded-[22px] transition-all duration-300 cursor-pointer flex flex-col justify-between group ${
            activeKpi === 'ecpm'
              ? 'bg-white/[0.08] border-2 border-white/50 shadow-[0_0_24px_rgba(255,255,255,0.22),inset_0_1px_0_rgba(255,255,255,0.4)] -translate-y-1'
              : 'bg-white/[0.04] border border-white/[0.12] hover:border-white/30 hover:bg-white/[0.06]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#A3A3A3] font-medium">تكلفة الـ 1,000 (eCPM)</span>
            <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-black text-white font-mono font-heading">
              <AnimatedKpiNumber value={kpiData.ecpm.value} decimals={2} />
            </span>
            <RiyalSymbol className="w-3 h-3 text-white" />
          </div>
          <div className="flex items-center gap-1 text-[10px] font-mono font-semibold text-emerald-400 mt-1">
            <TrendingDown className="w-2.5 h-2.5" />
            <span>أقل بـ 62% من الإعلانات</span>
          </div>
        </div>

        {/* KPI 4: المقاطع النشطة */}
        <div
          onClick={() => setActiveKpi('active_clips')}
          className={`p-4 rounded-[22px] transition-all duration-300 cursor-pointer flex flex-col justify-between group ${
            activeKpi === 'active_clips'
              ? 'bg-white/[0.08] border-2 border-white/50 shadow-[0_0_24px_rgba(255,255,255,0.22),inset_0_1px_0_rgba(255,255,255,0.4)] -translate-y-1'
              : 'bg-white/[0.04] border border-white/[0.12] hover:border-white/30 hover:bg-white/[0.06]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#A3A3A3] font-medium">المقاطع النشطة</span>
            <Video className="w-3.5 h-3.5 text-white/70" />
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-black text-white font-mono font-heading">
              <AnimatedKpiNumber value={kpiData.active_clips.value} />
            </span>
            <span className="text-xs font-normal text-white/60">مقطع</span>
          </div>
          <span className="text-[10px] text-white/50 mt-1">تجمع مشاهدات حالياً</span>
        </div>

        {/* KPI 5: منشورات جديدة اليوم */}
        <div
          onClick={() => setActiveKpi('new_posts')}
          className={`p-4 rounded-[22px] transition-all duration-300 cursor-pointer flex flex-col justify-between group ${
            activeKpi === 'new_posts'
              ? 'bg-white/[0.08] border-2 border-white/50 shadow-[0_0_24px_rgba(255,255,255,0.22),inset_0_1px_0_rgba(255,255,255,0.4)] -translate-y-1'
              : 'bg-white/[0.04] border border-white/[0.12] hover:border-white/30 hover:bg-white/[0.06]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#A3A3A3] font-medium">منشورات جديدة اليوم</span>
            <CalendarPlus className="w-3.5 h-3.5 text-amber-300" />
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-black text-white font-mono font-heading">
              <AnimatedKpiNumber value={kpiData.new_posts.value} prefix="+" />
            </span>
            <span className="text-xs font-normal text-white/60">فيديو</span>
          </div>
          <span className="text-[10px] text-emerald-400 mt-1">تدفق مستمر</span>
        </div>
      </div>

      {/* 4. INTERACTIVE CHART WITH TWO SERIES (المشاهدات + الإنفاق التراكمي) & EVENT MARKERS */}
      <div className="p-6 rounded-[26px] bg-white/[0.045] backdrop-blur-2xl border border-white/[0.14] shadow-[0_24px_60px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.2)] flex flex-col gap-6">
        {/* Chart Header Row (kept exact title and auto-refresh label) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-4 h-4 text-white" />
            <h2 className="text-base font-bold text-white font-heading">
              مخطط تدفق المشاهدات والإنفاق التراكمي
            </h2>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-white/50">
            {/* Series Legend */}
            <div className="flex items-center gap-3 font-sans text-xs">
              <div className="flex items-center gap-1.5 text-white">
                <span className="w-3 h-1 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                <span>المشاهدات المعتمدة</span>
              </div>
              <div className="flex items-center gap-1.5 text-neutral-400">
                <span className="w-3 h-1 rounded-full bg-neutral-400" />
                <span>الإنفاق التراكمي</span>
              </div>
            </div>

            {/* Kept exact auto-refresh text */}
            <span className="hidden sm:inline text-white/40">تحديث تلقائي كل 15 دقيقة</span>
          </div>
        </div>

        {/* Interactive Dual-Series SVG Chart */}
        <InteractiveAnalyticsChart
          points={chartPoints}
          primaryLabel={kpiData[activeKpi].label}
          isCurrency={activeKpi === 'spend' || activeKpi === 'ecpm'}
          valueUnit={activeKpi === 'views' ? 'مشاهدة' : activeKpi === 'active_clips' || activeKpi === 'new_posts' ? 'مقطع' : ''}
          isCumulative={mode === 'cumulative'}
          showComparison={comparePrevious}
          hasSecondarySeries={true}
          secondaryLabel="الإنفاق التراكمي"
          secondaryIsCurrency={true}
          isLoading={isLoading}
          emptyStateAction={selectAllPlatforms}
        />
      </div>
    </div>
  );
};

export default BrandAnalyticsView;
