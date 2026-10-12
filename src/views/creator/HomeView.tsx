import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import RiyalSymbol from '../../components/RiyalSymbol';
import { motion } from 'motion/react';
import {
  CheckCircle2,
  ArrowLeft,
  Eye,
  Layers,
  Video,
  TrendingUp,
  ChevronRight,
  ChevronLeft,
  UserCheck
} from 'lucide-react';

/**
 * Animated number count-up component for editorial numbers
 */
const CountUpNumber: React.FC<{
  end: number;
  decimals?: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}> = ({ end, decimals = 0, duration = 900, prefix = '', suffix = '' }) => {
  const [val, setVal] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setVal(ease * end);
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    const id = requestAnimationFrame(step);
    return () => cancelAnimationFrame(id);
  }, [end, duration]);

  const formatted = decimals > 0
    ? val.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    : Math.round(val).toLocaleString('en-US');

  return (
    <span className="tabular-nums font-mono">
      {prefix}{formatted}{suffix}
    </span>
  );
};

export const HomeView: React.FC = () => {
  const {
    creatorProfile,
    campaigns,
    setCreatorView,
    navigateToCampaignDetail,
    setIsConnectAccountModalOpen,
    setIsSubmitClipModalOpen,
  } = useApp();

  const campaignScrollRef = useRef<HTMLDivElement>(null);

  const scrollCampaigns = (dir: 'left' | 'right') => {
    if (campaignScrollRef.current) {
      const offset = dir === 'left' ? -380 : 380;
      campaignScrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  // Exact 3 campaign items specified in prompt
  const creatorCampaigns = [
    {
      id: 'camp-1',
      title: 'حملة إطلاق عطر إمبريال البري | Imperial Wild',
      brand: 'دخون العشب',
      rate: 8,
      rateText: '8 ﷼ / 1K',
      cover: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=1200&auto=format&fit=crop&q=80',
      campaignObj: campaigns.find(c => c.id === 'camp-1') || campaigns[0],
    },
    {
      id: 'camp-2',
      title: 'كافيه عنوان القهوة | كولد برو الصيف وV60 الكولومبي',
      brand: 'عنوان القهوة',
      rate: 6.5,
      rateText: '6.5 ﷼ / 1K',
      cover: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&auto=format&fit=crop&q=80',
      campaignObj: campaigns.find(c => c.id === 'camp-2') || campaigns[1] || campaigns[0],
    },
    {
      id: 'camp-3',
      title: 'تطبيق جاهز | كليبات ترند التوصيل السريع والمطاعم السحابية',
      brand: 'Jahez جاهز',
      rate: 10,
      rateText: '10 ﷼ / 1K',
      cover: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&auto=format&fit=crop&q=80',
      campaignObj: campaigns.find(c => c.id === 'camp-3') || campaigns[2] || campaigns[0],
    },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="relative pb-36 px-6 pt-6 flex flex-col gap-8 max-w-[1440px] mx-auto text-right select-none"
    >
      {/* =========================================================================
          1. HEADER ROW (Content kept exactly)
          "أهلاً نورة" / "تابع أداء مقاطعك وأرباح مشاهدات اليوم بكل شفافية" / button "استكشف حملات جديدة"
          ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
            أهلاً نورة
          </h1>
          <p className="text-xs sm:text-sm text-[#A3A3A3] mt-1">
            تابع أداء مقاطعك وأرباح مشاهدات اليوم بكل شفافية
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCreatorView('discover')}
            className="py-2.5 px-6 rounded-full bg-white text-black font-bold text-xs shadow-[0_0_20px_rgba(255,255,255,0.4)] hover:shadow-[0_0_30px_rgba(255,255,255,0.7)] hover:bg-neutral-100 transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>استكشف حملات جديدة</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* =========================================================================
          2. SETUP CARD: SLIM HORIZONTAL PROGRESS STEPPER STRIP UNDER HEADER
          "كمّل إعداد حسابك لزيادة قبول المقاطع", counter "مكتمل 3 من 4"
          4 connected steps on one glowing line:
          - "إنشاء الحساب والملف" (done)
          - "ربط حساباتك الاجتماعية" (done)
          - "الانضمام لأول حملة" (done)
          - "إرسال أول مقطع فيديو" (not done, link "ابدأ الآن")
          ========================================================================= */}
      <div className="p-5 sm:p-6 rounded-[26px] bg-white/[0.045] backdrop-blur-2xl border border-white/[0.14] shadow-[0_20px_50px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.22)] relative overflow-hidden group hover:border-white/[0.25] transition-all">
        {/* Subtle top stage light beam */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

        {/* Stepper Header */}
        <div className="flex items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white">
              <UserCheck className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-sm font-bold text-white font-heading tracking-tight">
              كمّل إعداد حسابك لزيادة قبول المقاطع
            </h2>
          </div>
          <span className="px-3 py-1 rounded-full bg-white/[0.08] border border-white/[0.12] text-xs font-mono font-bold text-white/80">
            مكتمل 3 من 4
          </span>
        </div>

        {/* Connected Stepper Line */}
        <div className="relative w-full">
          {/* Background Connecting Glowing Track */}
          <div className="absolute top-[18px] inset-x-6 sm:inset-x-12 h-[2px] bg-white/[0.12]" />
          {/* Active 3/4 Glow Line (In RTL, spans 75% from right to left) */}
          <div className="absolute top-[18px] right-6 sm:right-12 w-3/4 h-[2px] bg-gradient-to-l from-white via-white to-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" />

          {/* Stepper Steps (4 items) */}
          <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Step 1: Done */}
            <div className="flex flex-col items-center text-center gap-2">
              <div className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center shadow-[0_0_14px_rgba(255,255,255,0.7)] ring-4 ring-[#0A0A0A]">
                <CheckCircle2 className="w-4 h-4 text-black stroke-[2.5]" />
              </div>
              <span className="text-xs text-white font-semibold">
                إنشاء الحساب والملف
              </span>
            </div>

            {/* Step 2: Done */}
            <div 
              onClick={() => setIsConnectAccountModalOpen(true)}
              className="flex flex-col items-center text-center gap-2 cursor-pointer group/step"
            >
              <div className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center shadow-[0_0_14px_rgba(255,255,255,0.7)] ring-4 ring-[#0A0A0A] group-hover/step:scale-110 transition-transform">
                <CheckCircle2 className="w-4 h-4 text-black stroke-[2.5]" />
              </div>
              <span className="text-xs text-white font-semibold group-hover/step:underline">
                ربط حساباتك الاجتماعية
              </span>
            </div>

            {/* Step 3: Done */}
            <div 
              onClick={() => setCreatorView('discover')}
              className="flex flex-col items-center text-center gap-2 cursor-pointer group/step"
            >
              <div className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center shadow-[0_0_14px_rgba(255,255,255,0.7)] ring-4 ring-[#0A0A0A] group-hover/step:scale-110 transition-transform">
                <CheckCircle2 className="w-4 h-4 text-black stroke-[2.5]" />
              </div>
              <span className="text-xs text-white font-semibold group-hover/step:underline">
                الانضمام لأول حملة
              </span>
            </div>

            {/* Step 4: Current step pulsing softly with "ابدأ الآن" */}
            <div 
              onClick={() => setIsSubmitClipModalOpen(true)}
              className="flex flex-col items-center text-center gap-2 cursor-pointer group/step"
            >
              <div className="relative w-9 h-9 rounded-full bg-white/[0.1] border-2 border-white flex items-center justify-center ring-4 ring-[#0A0A0A] shadow-[0_0_18px_rgba(255,255,255,0.4)] group-hover/step:scale-110 transition-transform">
                <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse shadow-[0_0_8px_rgba(255,255,255,1)]" />
                <span className="absolute -inset-1 rounded-full border border-white/50 animate-ping opacity-40 pointer-events-none" />
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xs text-white font-bold">
                  إرسال أول مقطع فيديو
                </span>
                <span className="text-[11px] font-bold text-white underline mt-0.5 group-hover/step:text-white/80">
                  ابدأ الآن
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. STATS AS AN ASYMMETRIC BENTO:
          - "إجمالي الأرباح المكتسبة" is the HERO tile (~2x2) with giant number,
            soft spotlight glow behind it, and the green growth line "+14.2% مقارنة بالأسبوع الماضي"
          - The other three stats are smaller stacked tiles beside it with the same texts
          ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
        {/* HERO TILE: إجمالي الأرباح المكتسبة (Takes 6 or 7 cols on md/lg, full height) */}
        <div className="md:col-span-6 lg:col-span-7 rounded-[30px] bg-white/[0.045] backdrop-blur-2xl border border-white/[0.14] p-7 sm:p-8 flex flex-col justify-between relative overflow-hidden group hover:border-white/[0.32] hover:shadow-[0_24px_60px_rgba(0,0,0,0.9),0_0_35px_rgba(255,255,255,0.12)] hover:-translate-y-1 transition-all duration-300">
          {/* Soft White Spotlight Glow behind hero number */}
          <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-80 h-80 bg-white/[0.06] rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute top-0 right-0 w-44 h-44 bg-white/[0.04] rounded-full blur-3xl pointer-events-none" />

          {/* Top Label */}
          <div className="relative z-10 flex items-center justify-between">
            <span className="text-xs sm:text-sm font-semibold text-[#A3A3A3] tracking-wide">
              إجمالي الأرباح المكتسبة
            </span>
            <div className="w-10 h-10 rounded-full bg-white/[0.08] border border-white/[0.14] flex items-center justify-center text-white shadow-sm">
              <RiyalSymbol className="w-4 h-4 text-white" />
            </div>
          </div>

          {/* Giant Editorial Number */}
          <div className="relative z-10 my-6 sm:my-8 flex flex-col gap-1">
            <div className="flex items-baseline gap-2.5">
              <span className="text-4xl sm:text-5xl lg:text-6xl font-black text-white font-mono tracking-tight font-heading drop-shadow-md">
                <CountUpNumber end={10190.5} decimals={1} />
              </span>
              <RiyalSymbol className="w-7 h-7 sm:w-9 sm:h-9 text-white inline-block drop-shadow-sm" />
            </div>
          </div>

          {/* Green Growth Line */}
          <div className="relative z-10 pt-4 border-t border-white/[0.08] flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold font-mono">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+14.2% مقارنة بالأسبوع الماضي</span>
            </div>
          </div>
        </div>

        {/* STACK OF 3 SMALLER BENTO TILES (Takes 5 or 6 cols on md/lg) */}
        <div className="md:col-span-6 lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-4">
          {/* Stat 2: إجمالي المشاهدات */}
          <div className="rounded-[24px] bg-white/[0.04] backdrop-blur-xl border border-white/[0.12] p-5 sm:p-6 flex flex-col justify-between group hover:border-white/[0.25] hover:shadow-[0_16px_40px_rgba(0,0,0,0.85),0_0_20px_rgba(255,255,255,0.08)] hover:-translate-y-1 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#A3A3A3]">إجمالي المشاهدات</span>
              <div className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-white/70">
                <Eye className="w-4 h-4" />
              </div>
            </div>
            <div className="my-2">
              <span className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight font-heading">
                3.4M
              </span>
            </div>
            <span className="text-xs text-white/60">مشاهدات حقيقية معتمدة</span>
          </div>

          {/* Stat 3: الحملات النشطة */}
          <div className="rounded-[24px] bg-white/[0.04] backdrop-blur-xl border border-white/[0.12] p-5 sm:p-6 flex flex-col justify-between group hover:border-white/[0.25] hover:shadow-[0_16px_40px_rgba(0,0,0,0.85),0_0_20px_rgba(255,255,255,0.08)] hover:-translate-y-1 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#A3A3A3]">الحملات النشطة</span>
              <div className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-white/70">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="my-2">
              <span className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight font-heading">
                <CountUpNumber end={6} />
              </span>
            </div>
            <span className="text-xs text-white/60">تشارك فيها حالياً</span>
          </div>

          {/* Stat 4: المقاطع المرسلة */}
          <div className="rounded-[24px] bg-white/[0.04] backdrop-blur-xl border border-white/[0.12] p-5 sm:p-6 flex flex-col justify-between group hover:border-white/[0.25] hover:shadow-[0_16px_40px_rgba(0,0,0,0.85),0_0_20px_rgba(255,255,255,0.08)] hover:-translate-y-1 transition-all sm:col-span-2 md:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#A3A3A3]">المقاطع المرسلة</span>
              <div className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-white/70">
                <Video className="w-4 h-4" />
              </div>
            </div>
            <div className="my-2">
              <span className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight font-heading">
                <CountUpNumber end={42} />
              </span>
            </div>
            <span className="text-xs text-emerald-400 font-medium">نسبة القبول 94%</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          4. SECTION "حملاتي الحالية" + link "عرض الكل"
          Larger cards with the thumbnail as a full-bleed grayscale cover on top (blooms to color on hover),
          title + brand + rate below, "حالتك: مشارك نشط" as a small status pill,
          and "إرسال مقطع" as a white pill button. Horizontal row with arrows.
          ========================================================================= */}
      <section className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg sm:text-xl font-bold text-white font-heading">
              حملاتي الحالية
            </h2>
            <button
              onClick={() => setCreatorView('campaigns')}
              className="text-xs text-white/60 hover:text-white underline transition-colors"
            >
              عرض الكل
            </button>
          </div>

          {/* Arrow navigation buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => scrollCampaigns('right')}
              className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/[0.12] flex items-center justify-center text-white/80 hover:text-white hover:bg-white/[0.14] transition-all"
              aria-label="السابق"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollCampaigns('left')}
              className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/[0.12] flex items-center justify-center text-white/80 hover:text-white hover:bg-white/[0.14] transition-all"
              aria-label="التالي"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Horizontal Row of Larger Campaign Cards */}
        <div
          ref={campaignScrollRef}
          className="flex items-stretch gap-5 overflow-x-auto pb-4 pt-1 scrollbar-none"
        >
          {creatorCampaigns.map((item) => (
            <div
              key={item.id}
              onClick={() => navigateToCampaignDetail(item.campaignObj)}
              className="w-[310px] sm:w-[350px] shrink-0 rounded-[26px] bg-neutral-950 border border-white/[0.14] overflow-hidden group cursor-pointer hover:border-white/[0.38] hover:shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_28px_rgba(255,255,255,0.12)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Full-bleed grayscale cover on top (blooms to color + zooms on hover) */}
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-neutral-900">
                <img
                  src={item.cover}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover grayscale transition-all duration-500 ease-out group-hover:grayscale-0 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

                {/* Status Pill Top-Right: "حالتك: مشارك نشط" */}
                <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[11px] font-semibold text-emerald-400 flex items-center gap-1.5 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>حالتك: مشارك نشط</span>
                </div>
              </div>

              {/* Title + Brand + Rate below */}
              <div className="p-5 flex flex-col gap-3 flex-1 justify-between text-right">
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-[#A3A3A3]">
                    {item.brand}
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-white font-heading leading-snug line-clamp-2 group-hover:text-white">
                    {item.title}
                  </h3>
                </div>

                {/* Rate + Action Button Row */}
                <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between gap-3">
                  {/* Rate Pill */}
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-white">
                    <span className="text-sm">{item.rate}</span>
                    <RiyalSymbol className="w-3 h-3 text-white inline-block" />
                    <span className="text-[11px] font-normal text-white/60 font-sans">/ 1K</span>
                  </div>

                  {/* "إرسال مقطع" as a white pill button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsSubmitClipModalOpen(true);
                    }}
                    className="py-1.5 px-4 rounded-full bg-white text-black font-bold text-xs shadow-[0_0_12px_rgba(255,255,255,0.4)] hover:shadow-[0_0_20px_rgba(255,255,255,0.7)] hover:bg-neutral-100 transition-all flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <span>إرسال مقطع</span>
                    <span className="text-xs">←</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </motion.div>
  );
};

export default HomeView;
