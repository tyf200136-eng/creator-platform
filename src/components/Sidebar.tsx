import React from 'react';
import { useApp } from '../context/AppContext';
import RiyalSymbol from './RiyalSymbol';
import {
  Compass,
  Home,
  Layers,
  BarChart3,
  Send,
  FileEdit,
  Wallet,
  Settings,
  Plus,
  Users2,
  FileCheck2,
  CreditCard,
  Building2,
  ChevronDown
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    role,
    setRole,
    creatorView,
    setCreatorView,
    brandView,
    setBrandView,
    creatorProfile,
    brandProfile,
    setIsWithdrawModalOpen,
    setIsFundModalOpen,
  } = useApp();

  return (
    <aside className="w-[240px] shrink-0 h-screen sticky top-0 flex flex-col justify-between p-4 border-l border-white/[0.12] bg-page/90 backdrop-blur-2xl z-30 select-none">
      {/* Top: Logo & Nav sections */}
      <div className="flex flex-col gap-5 overflow-y-auto pr-1 pl-1">
        {/* Placeholder Logo Box */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl border border-dashed border-white/30 bg-white/[0.03] flex items-center justify-center text-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
              <span className="w-2.5 h-2.5 rounded-full bg-white/70" />
            </div>
          </div>
        </div>

        {/* Brand Switcher for Owner Role */}
        {role === 'brand' && (
          <div className="p-2.5 rounded-2xl bg-white/[0.05] border border-white/[0.12] flex items-center justify-between gap-2 text-right">
            <div className="flex items-center gap-2 min-w-0">
              <img
                src={brandProfile.logo}
                alt={brandProfile.name}
                referrerPolicy="no-referrer"
                className="w-7 h-7 rounded-xl object-cover ring-1 ring-white/20 shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{brandProfile.name}</p>
                <p className="text-[10px] text-white/50">المنظمة الأساسية</p>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-white/50 shrink-0" />
          </div>
        )}

        {/* Navigation Sections */}
        {role === 'creator' ? (
          /* ================= CREATOR SIDEBAR ================= */
          <nav className="flex flex-col gap-5">
            {/* اكتشف Section */}
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-white/40 px-2.5 mb-1">اكتشف</span>

              <button
                onClick={() => setCreatorView('home')}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
                  creatorView === 'home'
                    ? 'bg-white/[0.1] text-white font-semibold border border-white/[0.18] shadow-[0_0_16px_rgba(255,255,255,0.08)]'
                    : 'text-muted hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>الرئيسية</span>
              </button>

              <button
                onClick={() => setCreatorView('campaigns')}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
                  creatorView === 'campaigns'
                    ? 'bg-white/[0.1] text-white font-semibold border border-white/[0.18] shadow-[0_0_16px_rgba(255,255,255,0.08)]'
                    : 'text-muted hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>الحملات</span>
              </button>

              <button
                onClick={() => setCreatorView('discover')}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
                  creatorView === 'discover' || creatorView === 'campaigns-for-you' || creatorView === 'campaign-detail'
                    ? 'bg-white/[0.12] text-white font-semibold border border-white/[0.22] shadow-[0_0_20px_rgba(255,255,255,0.12)]'
                    : 'text-muted hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Compass className="w-4 h-4" />
                  <span>اكتشف</span>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)]" />
              </button>
            </div>

            {/* شغلي Section */}
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-white/40 px-2.5 mb-1">شغلي</span>

              <button
                onClick={() => setCreatorView('analytics')}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
                  creatorView === 'analytics'
                    ? 'bg-white/[0.1] text-white font-semibold border border-white/[0.18]'
                    : 'text-muted hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>التحليلات</span>
              </button>

              <button
                onClick={() => setCreatorView('submissions')}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
                  creatorView === 'submissions'
                    ? 'bg-white/[0.1] text-white font-semibold border border-white/[0.18]'
                    : 'text-muted hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Send className="w-4 h-4" />
                  <span>أعمالي</span>
                </div>
              </button>

              <button
                onClick={() => setCreatorView('drafts')}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
                  creatorView === 'drafts'
                    ? 'bg-white/[0.1] text-white font-semibold border border-white/[0.18]'
                    : 'text-muted hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileEdit className="w-4 h-4" />
                  <span>المسودات</span>
                </div>
                <span className="px-1.5 py-0.5 rounded-full bg-white text-black text-[10px] font-bold shadow-[0_0_8px_rgba(255,255,255,0.5)]">
                  جديد
                </span>
              </button>

              <button
                onClick={() => setCreatorView('earnings')}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
                  creatorView === 'earnings'
                    ? 'bg-white/[0.1] text-white font-semibold border border-white/[0.18]'
                    : 'text-muted hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Wallet className="w-4 h-4" />
                <span>الأرباح</span>
              </button>
            </div>

            {/* الحساب Section */}
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-white/40 px-2.5 mb-1">الحساب</span>

              <button
                onClick={() => setCreatorView('settings')}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
                  creatorView === 'settings'
                    ? 'bg-white/[0.1] text-white font-semibold border border-white/[0.18]'
                    : 'text-muted hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>الإعدادات</span>
              </button>
            </div>
          </nav>
        ) : (
          /* ================= BRAND OWNER SIDEBAR ================= */
          <nav className="flex flex-col gap-5">
            {/* نظرة عامة Section */}
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-white/40 px-2.5 mb-1">نظرة عامة</span>

              <button
                onClick={() => setBrandView('dashboard')}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
                  brandView === 'dashboard'
                    ? 'bg-white/[0.1] text-white font-semibold border border-white/[0.18] shadow-[0_0_16px_rgba(255,255,255,0.08)]'
                    : 'text-muted hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>الرئيسية</span>
              </button>

              <button
                onClick={() => setBrandView('campaigns')}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
                  brandView === 'campaigns' || brandView === 'campaign-manage'
                    ? 'bg-white/[0.1] text-white font-semibold border border-white/[0.18]'
                    : 'text-muted hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>الحملات</span>
              </button>
            </div>

            {/* الإدارة Section */}
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-white/40 px-2.5 mb-1">الإدارة</span>

              <button
                onClick={() => setBrandView('analytics')}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
                  brandView === 'analytics'
                    ? 'bg-white/[0.1] text-white font-semibold border border-white/[0.18]'
                    : 'text-muted hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>التحليلات</span>
              </button>

              <button
                onClick={() => setBrandView('payouts')}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
                  brandView === 'payouts'
                    ? 'bg-white/[0.1] text-white font-semibold border border-white/[0.18]'
                    : 'text-muted hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>المدفوعات</span>
              </button>

              <button
                onClick={() => setBrandView('applications')}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
                  brandView === 'applications'
                    ? 'bg-white/[0.1] text-white font-semibold border border-white/[0.18]'
                    : 'text-muted hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileCheck2 className="w-4 h-4" />
                  <span>طلبات الانضمام</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-amber-400" />
              </button>

              <button
                onClick={() => setBrandView('creators')}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
                  brandView === 'creators'
                    ? 'bg-white/[0.1] text-white font-semibold border border-white/[0.18]'
                    : 'text-muted hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Users2 className="w-4 h-4" />
                <span>صناع المحتوى</span>
              </button>
            </div>

            {/* البراند Section */}
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-white/40 px-2.5 mb-1">البراند</span>

              <button
                onClick={() => setBrandView('balance')}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
                  brandView === 'balance'
                    ? 'bg-white/[0.1] text-white font-semibold border border-white/[0.18]'
                    : 'text-muted hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Wallet className="w-4 h-4" />
                <span>الرصيد</span>
              </button>

              <button
                onClick={() => setBrandView('settings')}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
                  brandView === 'settings'
                    ? 'bg-white/[0.1] text-white font-semibold border border-white/[0.18]'
                    : 'text-muted hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>الإعدادات</span>
              </button>
            </div>
          </nav>
        )}
      </div>

      {/* Bottom Balance Card & Action Pill */}
      <div className="mt-4 pt-3 border-t border-white/[0.08]">
        {role === 'creator' ? (
          <div className="p-3.5 rounded-[20px] bg-white/[0.04] backdrop-blur-xl border border-white/[0.12] flex flex-col gap-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-muted">رصيدك</span>
              <span className="text-[10px] text-emerald-400">متاح الآن</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-white font-mono tabular-nums tracking-tight font-heading">
                {creatorProfile.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <RiyalSymbol className="w-3.5 h-3.5 text-white/90" />
            </div>
            <button
              onClick={() => setIsWithdrawModalOpen(true)}
              className="w-full py-2 px-3 rounded-full bg-white text-black text-xs font-bold shadow-[0_0_16px_rgba(255,255,255,0.3)] hover:shadow-[0_0_24px_rgba(255,255,255,0.6)] hover:bg-neutral-100 transition-all text-center flex items-center justify-center gap-1.5"
            >
              <span>اسحب أرباحك</span>
            </button>
          </div>
        ) : (
          <div className="p-3.5 rounded-[20px] bg-white/[0.04] backdrop-blur-xl border border-white/[0.12] flex flex-col gap-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-muted">رصيد المنظمة</span>
              <span className="text-[10px] text-emerald-400">نشط</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-white font-mono tabular-nums tracking-tight font-heading">
                {brandProfile.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <RiyalSymbol className="w-3.5 h-3.5 text-white/90" />
            </div>
            <button
              onClick={() => setIsFundModalOpen(true)}
              className="w-full py-2 px-3 rounded-full bg-white text-black text-xs font-bold shadow-[0_0_16px_rgba(255,255,255,0.3)] hover:shadow-[0_0_24px_rgba(255,255,255,0.6)] hover:bg-neutral-100 transition-all text-center flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>شحن الرصيد</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
