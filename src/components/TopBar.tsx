import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import RiyalSymbol from './RiyalSymbol';
import {
  Search,
  Bell,
  ChevronDown,
  UserCheck,
  Briefcase,
  LogOut,
  ShieldCheck,
  Check,
  Wallet,
  ArrowDownLeft,
  Plus,
  Compass
} from 'lucide-react';

interface TopBarProps {
  title?: string;
}

export const TopBar: React.FC<TopBarProps> = ({ title }) => {
  const {
    role,
    setRole,
    creatorView,
    brandView,
    creatorProfile,
    brandProfile,
    searchQuery,
    setSearchQuery,
    setIsLoginModalOpen,
    setIsRoleSelectModalOpen,
    setIsCreatorOnboardingOpen,
    setIsBrandOnboardingOpen,
    setIsWithdrawModalOpen,
    setIsFundModalOpen,
    showToast,
  } = useApp();

  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);

  const avatarMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);
  const walletRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(e.target as Node)) {
        setIsAvatarMenuOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (walletRef.current && !walletRef.current.contains(e.target as Node)) {
        setIsWalletOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute dynamic page title
  const getPageTitle = () => {
    if (title) return title;
    if (role === 'creator') {
      switch (creatorView) {
        case 'discover': return 'اكتشف الحملات';
        case 'campaigns-for-you': return 'حملات لأجلك';
        case 'home': return 'الرئيسية';
        case 'campaigns': return 'حملاتي';
        case 'campaign-detail': return 'تفاصيل الحملة';
        case 'submissions': return 'المقاطع المرسلة';
        case 'drafts': return 'مسودات المقاطع';
        case 'analytics': return 'تحليلات الأداء';
        case 'earnings': return 'سجل الأرباح';
        case 'settings': return 'إعدادات الحساب';
        default: return 'اكتشف';
      }
    } else {
      switch (brandView) {
        case 'dashboard': return 'لوحة التحكم';
        case 'campaigns': return 'حملات المنظمة';
        case 'campaign-manage': return 'إدارة الحملة والطلبات';
        case 'create-campaign': return 'إنشاء حملة جديدة';
        case 'analytics': return 'تحليلات العائد والمشاهدات';
        case 'payouts': return 'سجل المدفوعات';
        case 'applications': return 'طلبات الانضمام';
        case 'creators': return 'صناع المحتوى';
        case 'balance': return 'الرصيد والمعاملات';
        case 'settings': return 'إعدادات المنظمة';
        default: return 'لوحة المنظمة';
      }
    }
  };

  const handleRoleSwitch = (newRole: 'creator' | 'brand') => {
    setRole(newRole);
    setIsAvatarMenuOpen(false);
    showToast(newRole === 'creator' ? 'تم التبديل إلى حساب صانع المحتوى' : 'تم التبديل إلى حساب صاحب الحملة (البراند)');
  };

  const balanceNumber = role === 'creator' ? creatorProfile.balance : brandProfile.balance;

  return (
    <header className="sticky top-0 z-20 h-16 w-full border-b border-white/[0.08] bg-[#0A0A0A]/85 backdrop-blur-2xl px-6 flex items-center justify-between">
      {/* Right: Page Title */}
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold tracking-tight text-white font-heading">
          {getPageTitle()}
        </h1>
        {role === 'creator' && (
          <span className="hidden md:inline-flex px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.1] text-[11px] text-white/60">
            صانع محتوى
          </span>
        )}
        {role === 'brand' && (
          <span className="hidden md:inline-flex px-2 py-0.5 rounded-full bg-white/10 border border-white/20 text-[11px] font-semibold text-white">
            براند معتمد
          </span>
        )}
      </div>

      {/* Middle: Glass Search Pill */}
      <div className="hidden sm:flex items-center w-full max-w-md mx-6">
        <div className="relative w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن براند، منتج، أو تصنيف..."
            className="w-full h-10 pr-10 pl-12 rounded-full bg-white/[0.05] border border-white/[0.12] text-xs text-white placeholder-white/40 focus:outline-none focus:border-white/30 focus:bg-white/[0.08] focus:shadow-[0_0_20px_rgba(255,255,255,0.06)] transition-all"
          />
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded-md bg-white/[0.08] border border-white/[0.12] text-[10px] text-white/50 font-mono">
            ⌘K
          </div>
        </div>
      </div>

      {/* Left: Floating Wallet Pill + Notifications + Avatar Menu */}
      <div className="flex items-center gap-3 shrink-0">
        {/* =========================================================================
            FLOATING GLASS "WALLET" PILL IN TOP BAR
            ========================================================================= */}
        <div className="relative" ref={walletRef}>
          <button
            onClick={() => setIsWalletOpen(!isWalletOpen)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.14] hover:bg-white/[0.1] hover:border-white/25 transition-all cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]"
            title="المحفظة والرصيد"
          >
            <div className="w-5 h-5 rounded-full bg-white/[0.08] flex items-center justify-center text-white shrink-0">
              <Wallet className="w-3 h-3 text-white/80" />
            </div>

            <div className="flex items-baseline gap-1 text-xs font-bold text-white font-mono tabular-nums">
              <span>{balanceNumber.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <RiyalSymbol className="w-3 h-3 text-white/90 inline-block" />
            </div>

            <ChevronDown className={`w-3 h-3 text-white/50 transition-transform duration-200 ${isWalletOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Wallet Popover Card */}
          {isWalletOpen && (
            <div className="absolute left-0 top-12 w-72 rounded-[24px] bg-[#121212]/95 border border-white/[0.16] p-4 shadow-[0_24px_60px_rgba(0,0,0,0.95),0_0_24px_rgba(255,255,255,0.08)] z-50 text-right backdrop-blur-3xl animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-1.5">
                  <Wallet className="w-4 h-4 text-white" />
                  <span className="text-xs font-bold text-white font-heading">
                    {role === 'creator' ? 'محفظة الأرباح' : 'رصيد المنظمة'}
                  </span>
                </div>
                <span className="text-[10px] text-emerald-400 font-semibold">متاح للسحب</span>
              </div>

              {/* Main Balance */}
              <div className="py-3 flex flex-col gap-1">
                <span className="text-[11px] text-[#A3A3A3]">الرصيد المتاح الحالي</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-white font-mono tabular-nums font-heading">
                    {balanceNumber.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <RiyalSymbol className="w-4 h-4 text-white" />
                </div>
              </div>

              {/* Breakdown Details */}
              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] flex flex-col gap-2 text-xs mb-3">
                {role === 'creator' ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-white/60">قيد الاحتساب (في الطريق):</span>
                      <div className="flex items-baseline gap-0.5 font-mono text-white/90">
                        <span>{creatorProfile.pendingBalance.toLocaleString()}</span>
                        <RiyalSymbol className="w-2.5 h-2.5 text-white/60" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-white/60">إجمالي ما تم سحبه:</span>
                      <div className="flex items-baseline gap-0.5 font-mono text-white/90">
                        <span>{creatorProfile.totalWithdrawn.toLocaleString()}</span>
                        <RiyalSymbol className="w-2.5 h-2.5 text-white/60" />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-white/60">إجمالي المنصرف:</span>
                      <div className="flex items-baseline gap-0.5 font-mono text-white/90">
                        <span>{brandProfile.totalSpend.toLocaleString()}</span>
                        <RiyalSymbol className="w-2.5 h-2.5 text-white/60" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-white/60">الحملات النشطة:</span>
                      <span className="font-mono text-white/90">{brandProfile.activeCampaignsCount} حملات</span>
                    </div>
                  </>
                )}
              </div>

              {/* Action Button: اسحب أرباحك for creator, or شحن الرصيد for brand */}
              {role === 'creator' ? (
                <button
                  onClick={() => {
                    setIsWalletOpen(false);
                    setIsWithdrawModalOpen(true);
                  }}
                  className="w-full py-2.5 px-4 rounded-full bg-white text-black text-xs font-bold shadow-[0_0_16px_rgba(255,255,255,0.4)] hover:shadow-[0_0_24px_rgba(255,255,255,0.7)] hover:bg-neutral-100 transition-all flex items-center justify-center gap-1.5"
                >
                  <ArrowDownLeft className="w-3.5 h-3.5" />
                  <span>اسحب أرباحك</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsWalletOpen(false);
                    setIsFundModalOpen(true);
                  }}
                  className="w-full py-2.5 px-4 rounded-full bg-white text-black text-xs font-bold shadow-[0_0_16px_rgba(255,255,255,0.4)] hover:shadow-[0_0_24px_rgba(255,255,255,0.7)] hover:bg-neutral-100 transition-all flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ شحن الرصيد</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Notification Bell */}
        <div className="relative" ref={notifMenuRef}>
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="w-9 h-9 rounded-full bg-white/[0.05] border border-white/[0.12] flex items-center justify-center text-white/80 hover:text-white hover:bg-white/[0.1] hover:border-white/20 transition-all relative"
            title="الإشعارات"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
          </button>

          {/* Notifications Dropdown */}
          {isNotificationsOpen && (
            <div className="absolute left-0 top-11 w-80 rounded-[20px] bg-[#121212] border border-white/[0.14] p-3 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 text-right backdrop-blur-3xl animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.08] px-1">
                <span className="text-xs font-bold text-white">الإشعارات</span>
                <span className="text-[10px] text-white/50 cursor-pointer hover:text-white">تحديد الكل كمقروء</span>
              </div>
              <div className="flex flex-col gap-2 mt-2 max-h-72 overflow-y-auto">
                <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-colors cursor-pointer">
                  <div className="flex items-start justify-between gap-1">
                    <span className="text-xs font-semibold text-white">تم اعتماد مقطعك!</span>
                    <span className="text-[10px] text-white/40">قبل 10 د</span>
                  </div>
                  <p className="text-[11px] text-[#A3A3A3] mt-0.5">
                    حققت 84,200 مشاهدة في حملة عطر إمبريال البري وتمت إضافة 673.60 <RiyalSymbol /> إلى رصيدك.
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-colors cursor-pointer">
                  <div className="flex items-start justify-between gap-1">
                    <span className="text-xs font-semibold text-white">ملاحظة على المسودة</span>
                    <span className="text-[10px] text-white/40">قبل ساعتين</span>
                  </div>
                  <p className="text-[11px] text-[#A3A3A3] mt-0.5">
                    براند جاهز طلب تعديل بسيط على شاشة الختام قبل نشر المقطع.
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-colors cursor-pointer">
                  <div className="flex items-start justify-between gap-1">
                    <span className="text-xs font-semibold text-white">حملة جديدة تطابق اهتمامك</span>
                    <span className="text-[10px] text-white/40">أمس</span>
                  </div>
                  <p className="text-[11px] text-[#A3A3A3] mt-0.5">
                    أطلقت ريف العطور حملة ريف 33 بمعدل 7 <RiyalSymbol /> لكل 1000 مشاهدة.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Avatar Pill with Role Switcher */}
        <div className="relative" ref={avatarMenuRef}>
          <button
            onClick={() => setIsAvatarMenuOpen(!isAvatarMenuOpen)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.14] hover:bg-white/[0.1] hover:border-white/25 transition-all cursor-pointer"
          >
            <img
              src={role === 'creator' ? creatorProfile.avatar : brandProfile.logo}
              alt={role === 'creator' ? creatorProfile.name : brandProfile.name}
              referrerPolicy="no-referrer"
              className="w-6 h-6 rounded-full object-cover ring-1 ring-white/20"
            />
            <span className="text-xs font-bold text-white max-w-[90px] truncate">
              {role === 'creator' ? creatorProfile.name.split(' ')[0] : brandProfile.name.split(' ')[0]}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-white/60" />
          </button>

          {/* Avatar Menu Dropdown */}
          {isAvatarMenuOpen && (
            <div className="absolute left-0 top-12 w-64 rounded-[22px] bg-[#121212] border border-white/[0.15] p-2.5 shadow-[0_24px_60px_rgba(0,0,0,0.9),0_0_24px_rgba(255,255,255,0.06)] z-50 text-right backdrop-blur-3xl animate-in fade-in duration-150">
              {/* Profile summary header */}
              <div className="p-2 border-b border-white/[0.08] flex items-center gap-3">
                <img
                  src={role === 'creator' ? creatorProfile.avatar : brandProfile.logo}
                  alt="avatar"
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-full object-cover ring-1 ring-white/20"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">
                    {role === 'creator' ? creatorProfile.name : brandProfile.name}
                  </p>
                  <p className="text-[11px] text-[#A3A3A3] truncate">
                    {role === 'creator' ? creatorProfile.handle : brandProfile.website}
                  </p>
                </div>
              </div>

              {/* Role Switcher Section (CRITICAL FEATURE) */}
              <div className="mt-2 p-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                <p className="text-[10px] font-semibold text-white/50 px-2 py-1">تبديل الحساب والدور</p>
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => handleRoleSwitch('creator')}
                    className={`flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                      role === 'creator'
                        ? 'bg-white text-black font-bold shadow-[0_0_12px_rgba(255,255,255,0.4)]'
                        : 'text-white/80 hover:bg-white/[0.06] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>صانع المحتوى</span>
                    </div>
                    {role === 'creator' && <Check className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => handleRoleSwitch('brand')}
                    className={`flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                      role === 'brand'
                        ? 'bg-white text-black font-bold shadow-[0_0_12px_rgba(255,255,255,0.4)]'
                        : 'text-white/80 hover:bg-white/[0.06] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-3.5 h-3.5" />
                      <span>صاحب الحملة (البراند)</span>
                    </div>
                    {role === 'brand' && <Check className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Quick Onboarding & Switcher Link */}
              <div className="mt-2 pt-1 border-t border-white/[0.08] flex flex-col gap-1">
                <button
                  onClick={() => {
                    setIsAvatarMenuOpen(false);
                    setIsRoleSelectModalOpen(true);
                  }}
                  className="flex items-center gap-2 w-full px-2.5 py-2 rounded-lg text-xs text-white/80 hover:bg-white/[0.06] hover:text-white transition-colors"
                >
                  <Compass className="w-3.5 h-3.5 text-white/60" />
                  <span>شاشة "وش تبي تسوي؟"</span>
                </button>

                <button
                  onClick={() => {
                    setIsAvatarMenuOpen(false);
                    if (role === 'creator') {
                      setIsCreatorOnboardingOpen(true);
                    } else {
                      setIsBrandOnboardingOpen(true);
                    }
                  }}
                  className="flex items-center gap-2 w-full px-2.5 py-2 rounded-lg text-xs text-white/80 hover:bg-white/[0.06] hover:text-white transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-white/60" />
                  <span>إعادة خطوات التهيئة ({role === 'creator' ? 'صانع' : 'براند'})</span>
                </button>

                <button
                  onClick={() => {
                    setIsAvatarMenuOpen(false);
                    setIsLoginModalOpen(true);
                  }}
                  className="flex items-center gap-2 w-full px-2.5 py-2 rounded-lg text-xs text-rose-300 hover:bg-rose-500/10 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>تسجيل الدخول / تبديل الجوال</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
