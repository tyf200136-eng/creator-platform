import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import RiyalSymbol from '../../components/RiyalSymbol';
import { motion } from 'motion/react';
import {
  Plus,
  Eye,
  TrendingUp,
  Layers,
  CheckCircle2,
  ArrowLeft,
  BookOpen,
  ArrowUpRight,
  ChevronLeft
} from 'lucide-react';
import { StatusBadge } from '@/src/components/common/StatusBadge';

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

export const BrandDashboardView: React.FC = () => {
  const { 
    campaigns, 
    setBrandView, 
    navigateToCampaignDetail,
    setIsFundModalOpen 
  } = useApp();

  const [period, setPeriod] = useState<'today' | '7d' | '30d'>('7d');

  // Exact 4 campaign items specified in prompt
  const brandCampaignItems = [
    {
      id: 'camp-1',
      name: 'حملة إطلاق عطر إمبريال البري | Imperial Wild',
      category: 'عطور فاخرة',
      creatorsCount: 148,
      status: 'نشطة وبها مقاطع',
      rate: 8,
      spend: 42100,
      totalBudget: 65000,
      percent: 65,
      cover: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&auto=format&fit=crop&q=80',
      campaignObj: campaigns.find(c => c.id === 'camp-1') || campaigns[0],
    },
    {
      id: 'camp-2',
      name: 'كافيه عنوان القهوة | كولد برو الصيف وV60 الكولومبي',
      category: 'مقاهي ومشروبات',
      creatorsCount: 84,
      status: 'نشطة وبها مقاطع',
      rate: 6.5,
      spend: 18750,
      totalBudget: 25000,
      percent: 75,
      cover: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&auto=format&fit=crop&q=80',
      campaignObj: campaigns.find(c => c.id === 'camp-2') || campaigns[1] || campaigns[0],
    },
    {
      id: 'camp-3',
      name: 'تطبيق جاهز | كليبات ترند التوصيل السريع والمطاعم السحابية',
      category: 'تطبيقات وتوصيل',
      creatorsCount: 312,
      status: 'نشطة وبها مقاطع',
      rate: 10,
      spend: 89400,
      totalBudget: 120000,
      percent: 75,
      cover: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80',
      campaignObj: campaigns.find(c => c.id === 'camp-3') || campaigns[2] || campaigns[0],
    },
    {
      id: 'camp-4',
      name: 'فالكونز إي سبورتس | قص وتعديل أفضل لقطات البث المباشر',
      category: 'ألعاب ورياضات إلكترونية',
      creatorsCount: 220,
      status: 'نشطة وبها مقاطع',
      rate: 5,
      spend: 58900,
      totalBudget: 75000,
      percent: 79,
      cover: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80',
      campaignObj: campaigns.find(c => c.id === 'camp-4') || campaigns[3] || campaigns[0],
    },
  ];

  // Exact 3 podium creators specified in prompt
  const podiumCreators = [
    // #2 on the right in RTL
    {
      rank: 2,
      name: 'سارة المهيدب',
      handle: '@sara_ugc',
      clips: 8,
      views: '612K',
      earned: 4890,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=140&auto=format&fit=crop&q=80',
      ringClass: 'ring-neutral-400 border-neutral-400/80 shadow-[0_0_18px_rgba(200,200,200,0.35)]',
      pedestalHeight: 'h-[175px]',
      badgeBg: 'bg-neutral-300 text-black',
    },
    // #1 in the middle raised under spotlight in RTL
    {
      rank: 1,
      name: 'سلطان القحطاني',
      handle: '@sultan_clips',
      clips: 12,
      views: '780K',
      earned: 6240,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80',
      ringClass: 'ring-white border-white shadow-[0_0_28px_rgba(255,255,255,0.8)] scale-110',
      pedestalHeight: 'h-[220px]',
      badgeBg: 'bg-white text-black shadow-[0_0_14px_rgba(255,255,255,0.7)]',
      isHero: true,
    },
    // #3 on the left in RTL
    {
      rank: 3,
      name: 'نورة الدوسري',
      handle: '@noura_shortss',
      clips: 6,
      views: '490K',
      earned: 3920,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=140&auto=format&fit=crop&q=80',
      ringClass: 'ring-neutral-600 border-neutral-600/70 shadow-[0_0_12px_rgba(140,140,140,0.2)]',
      pedestalHeight: 'h-[145px]',
      badgeBg: 'bg-neutral-600 text-white',
    },
  ];

  // Exact 3 learning articles specified in prompt
  const articles = [
    {
      num: '01',
      title: 'كيف تضاعف مشاهدات حملتك وتجذب أفضل الكليبرز؟',
      readTime: 'قراءة 4 دقائق',
    },
    {
      num: '02',
      title: 'أفضل استراتيجية لتسعير الـ CPM لعطور ومتاجر السعودية',
      readTime: 'قراءة 3 دقائق',
    },
    {
      num: '03',
      title: 'دليل فحص الـ Bot Score وحماية ميزانيتك من الزيارات الوهمية',
      readTime: 'قراءة 5 دقائق',
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
          1. TOP GREETING & PERIOD TABS & "+ حملة جديدة" WHITE BUTTON
          "مرحبا، دخون العشب للإلكترونيات والعطور" + badge "موثق"
          "نظرة عامة على أداء حملات المشاهدات والصرف ونشاط صناع المحتوى"
          period tabs "اليوم · 7 أيام · 30 يوم" / button "+ حملة جديدة"
          ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
              مرحبا، دخون العشب للإلكترونيات والعطور
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-white/10 border border-white/20 text-[11px] font-bold text-white flex items-center gap-1">
              <span>موثق</span>
              <CheckCircle2 className="w-3 h-3 text-white" />
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#A3A3A3] mt-1">
            نظرة عامة على أداء حملات المشاهدات والصرف ونشاط صناع المحتوى
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Period Tabs: اليوم · 7 أيام · 30 يوم */}
          <div className="flex items-center gap-1 p-1 rounded-full bg-white/[0.06] border border-white/[0.1]">
            {[
              { id: 'today', label: 'اليوم' },
              { id: '7d', label: '7 أيام' },
              { id: '30d', label: '30 يوم' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id as any)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  period === p.id
                    ? 'bg-white text-black shadow-[0_0_12px_rgba(255,255,255,0.4)]'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* White Button: + حملة جديدة */}
          <button
            onClick={() => setBrandView('create-campaign')}
            className="py-2.5 px-6 rounded-full bg-white text-black font-bold text-xs shadow-[0_0_20px_rgba(255,255,255,0.4)] hover:shadow-[0_0_30px_rgba(255,255,255,0.7)] hover:bg-neutral-100 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span> حملة جديدة</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          2. STATS AS AN ASYMMETRIC BENTO:
          - "رصيد المحفظة النشط" is HERO tile (largest, giant number, glow, "+ شحن" as white pill button)
          - "المشاهدات المكتسبة" is a wide tile with decorative glowing line behind number
          - "إجمالي المصروف" and "متوسط تكلفة الـ 1,000 مشاهدة" are compact tiles
          ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
        {/* HERO TILE: رصيد المحفظة النشط (Takes 6 or 7 cols on md/lg, full height) */}
        <div className="md:col-span-6 lg:col-span-7 rounded-[30px] bg-white/[0.045] backdrop-blur-2xl border border-white/[0.14] p-7 sm:p-8 flex flex-col justify-between relative overflow-hidden group hover:border-white/[0.32] hover:shadow-[0_24px_60px_rgba(0,0,0,0.9),0_0_35px_rgba(255,255,255,0.12)] hover:-translate-y-1 transition-all duration-300">
          {/* Spotlight glow behind active wallet balance */}
          <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-80 h-80 bg-white/[0.06] rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute top-0 right-0 w-44 h-44 bg-white/[0.04] rounded-full blur-3xl pointer-events-none" />

          {/* Top Row: Title + "+ شحن" as a white pill button */}
          <div className="relative z-10 flex items-center justify-between gap-3">
            <span className="text-xs sm:text-sm font-semibold text-[#A3A3A3] tracking-wide">
              رصيد المحفظة النشط
            </span>
            <button
              onClick={() => setIsFundModalOpen(true)}
              className="py-1.5 px-4 rounded-full bg-white text-black font-bold text-xs shadow-[0_0_12px_rgba(255,255,255,0.4)] hover:shadow-[0_0_20px_rgba(255,255,255,0.7)] hover:bg-neutral-100 transition-all cursor-pointer flex items-center gap-1"
            >
              <span>+ شحن</span>
            </button>
          </div>

          {/* Giant Editorial Number */}
          <div className="relative z-10 my-6 sm:my-8 flex flex-col gap-1">
            <div className="flex items-baseline gap-2.5">
              <span className="text-4xl sm:text-5xl lg:text-6xl font-black text-white font-mono tracking-tight font-heading drop-shadow-md">
                <CountUpNumber end={28450} decimals={2} />
              </span>
              <RiyalSymbol className="w-7 h-7 sm:w-9 sm:h-9 text-white inline-block drop-shadow-sm" />
            </div>
          </div>

          {/* Subtext */}
          <div className="relative z-10 pt-4 border-t border-white/[0.08]">
            <span className="text-xs text-emerald-400 font-medium font-mono">
              يغطي ~3.5 مليون مشاهدة قادمة
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: WIDE TILE + 2 COMPACT TILES (Takes 5 or 6 cols on md/lg) */}
        <div className="md:col-span-6 lg:col-span-5 flex flex-col gap-4">
          {/* WIDE TILE: المشاهدات المكتسبة (with decorative glowing line behind number) */}
          <div className="rounded-[26px] bg-white/[0.04] backdrop-blur-xl border border-white/[0.12] p-6 flex flex-col justify-between relative overflow-hidden group hover:border-white/[0.28] hover:shadow-[0_16px_40px_rgba(0,0,0,0.85),0_0_20px_rgba(255,255,255,0.08)] hover:-translate-y-1 transition-all">
            {/* Decorative horizontal glowing line behind number */}
            <div className="absolute top-1/2 inset-x-8 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
            <div className="absolute top-1/2 right-12 w-32 h-10 bg-white/[0.05] rounded-full blur-xl pointer-events-none" />

            <div className="flex items-center justify-between relative z-10">
              <span className="text-xs font-medium text-[#A3A3A3]">المشاهدات المكتسبة</span>
              <div className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-white/70">
                <Eye className="w-4 h-4" />
              </div>
            </div>

            <div className="my-3 relative z-10">
              <span className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight font-heading">
                24.8M
              </span>
            </div>

            <span className="text-xs text-emerald-400 font-semibold font-mono relative z-10">
              +31.2% نمو المشاهدات
            </span>
          </div>

          {/* TWO COMPACT TILES SIDE BY SIDE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Compact Tile 1: إجمالي المصروف */}
            <div className="rounded-[24px] bg-white/[0.04] backdrop-blur-xl border border-white/[0.12] p-5 flex flex-col justify-between group hover:border-white/[0.25] hover:shadow-[0_14px_35px_rgba(0,0,0,0.8)] hover:-translate-y-1 transition-all">
              <span className="text-xs font-medium text-[#A3A3A3]">إجمالي المصروف</span>
              <div className="flex items-baseline gap-1.5 my-2">
                <span className="text-2xl font-black text-white font-mono tracking-tight font-heading">
                  <CountUpNumber end={114800} />
                </span>
                <RiyalSymbol className="w-3.5 h-3.5 text-white/80" />
              </div>
              <span className="text-xs text-white/60">عبر 4 حملات نشطة</span>
            </div>

            {/* Compact Tile 2: متوسط تكلفة الـ 1,000 مشاهدة */}
            <div className="rounded-[24px] bg-white/[0.04] backdrop-blur-xl border border-white/[0.12] p-5 flex flex-col justify-between group hover:border-white/[0.25] hover:shadow-[0_14px_35px_rgba(0,0,0,0.8)] hover:-translate-y-1 transition-all">
              <span className="text-xs font-medium text-[#A3A3A3]">متوسط تكلفة الـ 1,000 مشاهدة</span>
              <div className="flex items-baseline gap-1.5 my-2">
                <span className="text-2xl font-black text-white font-mono tracking-tight font-heading">
                  <CountUpNumber end={4.62} decimals={2} />
                </span>
                <RiyalSymbol className="w-3.5 h-3.5 text-white/80" />
              </div>
              <span className="text-xs text-emerald-400 font-medium">أوفر بـ 62% من الإعلانات المدفوعة</span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. SECTION "حملات المنظمة النشطة" + count "9 حملات" + link "عرض الكل وإدارة الميزانيات"
          2-column glass campaign cards (thumbnail, name, category · creators count,
          status "نشطة وبها مقاطع", CPM rate, actual spend & total budget, consumption %,
          action "إدارة الحملة"). Whole card clickable.
          ========================================================================= */}
      <section className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg sm:text-xl font-bold text-white font-heading">
              حملات المنظمة النشطة
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-white/[0.08] text-xs text-white/70 font-mono">
              9 حملات
            </span>
          </div>
          <button
            onClick={() => setBrandView('campaigns')}
            className="text-xs text-white/60 hover:text-white underline transition-colors cursor-pointer"
          >
            عرض الكل وإدارة الميزانيات
          </button>
        </div>

        {/* 2-Column Glass Campaign Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {brandCampaignItems.map((camp) => (
            <div
              key={camp.id}
              onClick={() => navigateToCampaignDetail(camp.campaignObj)}
              className="p-5 rounded-[26px] bg-white/[0.04] backdrop-blur-2xl border border-white/[0.12] hover:border-white/[0.3] hover:shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_24px_rgba(255,255,255,0.08)] hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between gap-4 group"
            >
              {/* Top row: Thumbnail + Info + Status Pill */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3.5 min-w-0">
                  <img
                    src={camp.cover}
                    alt={camp.name}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-2xl object-cover shrink-0 grayscale transition-all duration-300 group-hover:grayscale-0 group-hover:scale-105"
                  />
                  <div className="flex flex-col gap-1 min-w-0">
                    <h3 className="text-sm sm:text-base font-bold text-white font-heading truncate group-hover:text-white">
                      {camp.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-[#A3A3A3]">
                      <span>{camp.category}</span>
                      <span>·</span>
                      <span className="font-mono">{camp.creatorsCount} صانع</span>
                    </div>
                  </div>
                </div>

                {/* Status Pill: نشطة وبها مقاطع */}
                <StatusBadge tone="success" className="shrink-0">{camp.status}</StatusBadge>
              </div>

              {/* Spend, Budget, and Rate Details */}
              <div className="grid grid-cols-3 gap-2 py-3 px-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-xs">
                {/* Rate */}
                <div className="flex flex-col">
                  <span className="text-[10px] text-white/50">نموذج الدفع</span>
                  <div className="flex items-baseline gap-1 font-bold text-white font-mono mt-0.5">
                    <span>CPM {camp.rate}</span>
                    <RiyalSymbol className="w-2.5 h-2.5 text-white/80" />
                  </div>
                </div>

                {/* Actual Spend */}
                <div className="flex flex-col">
                  <span className="text-[10px] text-white/50">الصرف الفعلي</span>
                  <div className="flex items-baseline gap-1 font-bold text-white font-mono mt-0.5">
                    <span>{camp.spend.toLocaleString()}</span>
                    <RiyalSymbol className="w-2.5 h-2.5 text-white/80" />
                  </div>
                </div>

                {/* Total Budget */}
                <div className="flex flex-col">
                  <span className="text-[10px] text-white/50">الميزانية الإجمالية</span>
                  <div className="flex items-baseline gap-1 font-mono text-white/70 mt-0.5">
                    <span>{camp.totalBudget.toLocaleString()}</span>
                    <RiyalSymbol className="w-2.5 h-2.5 text-white/60" />
                  </div>
                </div>
              </div>

              {/* Consumption % as a glowing progress bar + Action Button */}
              <div className="flex items-center justify-between gap-4 pt-1">
                {/* Glowing Progress bar with consumption % */}
                <div className="flex-1 flex items-center gap-3">
                  <div className="flex-1 h-2 rounded-full bg-white/[0.08] overflow-hidden">
                    <div 
                      className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.9)]" 
                      style={{ width: `${camp.percent}%` }} 
                    />
                  </div>
                  <span className="text-xs font-bold font-mono text-white/90 shrink-0">
                    {camp.percent}%
                  </span>
                </div>

                {/* "إدارة الحملة" Action button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateToCampaignDetail(camp.campaignObj);
                  }}
                  className="px-4 py-1.5 rounded-full bg-white/[0.08] hover:bg-white text-white hover:text-black font-semibold text-xs border border-white/20 hover:border-transparent transition-all shrink-0 cursor-pointer shadow-sm hover:shadow-[0_0_16px_rgba(255,255,255,0.6)]"
                >
                  إدارة الحملة
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          4. SECTION "أفضل صناع المحتوى أداءً لبراندك" + link "عرض جميع الصناع"
          A PODIUM:
          - #1 in the middle, raised, photo in a white glowing ring under a soft spotlight
          - #2 on the right with a silver ring
          - #3 on the left with a gray ring
          Each shows: rank, photo, name, handle, clips count, views, earned amount
          ========================================================================= */}
      <section className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-white font-heading">
            أفضل صناع المحتوى أداءً لبراندك
          </h2>
          <button
            onClick={() => setBrandView('creators')}
            className="text-xs text-white/60 hover:text-white underline transition-colors cursor-pointer"
          >
            عرض جميع الصناع
          </button>
        </div>

        {/* Podium Stage Container */}
        <div className="rounded-[30px] bg-white/[0.045] backdrop-blur-2xl border border-white/[0.14] p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.2)] relative overflow-hidden">
          {/* Spotlight over center #1 winner */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-44 [background:radial-gradient(ellipse_at_top,rgba(255,255,255,0.45)_0%,rgba(255,255,255,0.12)_45%,transparent_75%)] blur-[4px] pointer-events-none" />

          {/* 3 Podium Pedestals arranged side by side in RTL:
              Right: #2 | Middle: #1 (Raised) | Left: #3 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 items-end pt-6">
            {podiumCreators.map((creator) => (
              <div
                key={creator.rank}
                className={`flex flex-col items-center text-center relative ${
                  creator.isHero ? 'order-1 md:order-2 -mt-4' : creator.rank === 2 ? 'order-2 md:order-1' : 'order-3 md:order-3'
                }`}
              >
                {/* Photo with Ring */}
                <div className="relative mb-3.5">
                  <img
                    src={creator.avatar}
                    alt={creator.name}
                    referrerPolicy="no-referrer"
                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover ring-2 border-2 ${creator.ringClass}`}
                  />
                  {/* Rank Badge */}
                  <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full font-bold font-mono text-xs ${creator.badgeBg}`}>
                    #{creator.rank}
                  </div>
                </div>

                {/* Creator Name & Handle */}
                <h3 className="text-sm sm:text-base font-bold text-white font-heading mt-1">
                  {creator.name}
                </h3>
                <span className="text-[11px] text-[#A3A3A3] font-mono mt-0.5">
                  {creator.handle}
                </span>

                {/* Metrics Card on Pedestal */}
                <div className={`w-full mt-4 rounded-2xl bg-white/[0.04] border border-white/[0.1] p-4 flex flex-col justify-between gap-3 ${
                  creator.isHero ? 'bg-white/[0.08] border-white/25 shadow-[0_0_24px_rgba(255,255,255,0.08)]' : ''
                }`}>
                  <div className="flex items-center justify-around text-xs border-b border-white/[0.06] pb-2.5">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-white/50">المقاطع</span>
                      <span className="font-bold text-white font-mono mt-0.5">{creator.clips} مقاطع</span>
                    </div>
                    <div className="w-px h-6 bg-white/[0.08]" />
                    <div className="flex flex-col">
                      <span className="text-[10px] text-white/50">المشاهدات</span>
                      <span className="font-bold text-white font-mono mt-0.5">{creator.views}</span>
                    </div>
                  </div>

                  {/* Earned Amount */}
                  <div className="flex items-center justify-between text-xs pt-0.5">
                    <span className="text-[11px] text-white/60">المستحقات</span>
                    <div className="flex items-baseline gap-1 font-bold text-white font-mono">
                      <span className="text-sm">{creator.earned.toLocaleString()}</span>
                      <RiyalSymbol className="w-3 h-3 text-white inline-block" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. SECTION "دليل نجاح الحملات" with 3 articles
          3 horizontal editorial article cards with large number (01, 02, 03),
          same title and read time, subtle arrow on hover.
          ========================================================================= */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-white/80" />
          <h2 className="text-lg font-bold text-white font-heading">
            دليل نجاح الحملات
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {articles.map((art) => (
            <div
              key={art.num}
              className="p-5 rounded-[24px] bg-white/[0.04] backdrop-blur-xl border border-white/[0.12] hover:border-white/[0.28] hover:bg-white/[0.06] hover:shadow-[0_16px_40px_rgba(0,0,0,0.85)] hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between gap-4 group"
            >
              {/* Large Number Top Row */}
              <div className="flex items-center justify-between">
                <span className="text-3xl font-black font-mono text-white/30 group-hover:text-white transition-colors">
                  {art.num}
                </span>
                <ChevronLeft className="w-4 h-4 text-white/40 group-hover:text-white group-hover:-translate-x-1 transition-all" />
              </div>

              {/* Title + Read Time */}
              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-bold text-white leading-relaxed font-heading group-hover:text-white">
                  {art.title}
                </h3>
                <span className="text-xs text-white/50 font-mono">
                  {art.readTime}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </motion.div>
  );
};

export default BrandDashboardView;
