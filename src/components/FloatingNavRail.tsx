import React, { useState } from 'react';
import { useApp, CreatorScreen, BrandScreen } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import {
  Compass,
  Home,
  Layers,
  BarChart3,
  Send,
  FileEdit,
  Wallet,
  Settings,
  Users2,
  FileCheck2,
  CreditCard,
  Building2,
  Store
} from 'lucide-react';

interface NavItemDef {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  hasDot?: boolean;
}

export const FloatingNavRail: React.FC = () => {
  const {
    role,
    creatorView,
    setCreatorView,
    brandView,
    setBrandView,
    setIsRoleSelectModalOpen,
  } = useApp();

  const [isHovered, setIsHovered] = useState(false);
  const [hoveredTooltip, setHoveredTooltip] = useState<string | null>(null);

  // Group definitions for Creator
  const creatorGroups: NavItemDef[][] = [
    // Group 1: اكتشف
    [
      { id: 'home', label: 'الرئيسية', icon: Home },
      { id: 'campaigns', label: 'حملاتي', icon: Layers },
      { id: 'discover', label: 'اكتشف', icon: Compass },
    ],
    // Group 2: شغلي
    [
      { id: 'analytics', label: 'التحليلات', icon: BarChart3 },
      { id: 'submissions', label: 'أعمالي', icon: Send },
      { id: 'drafts', label: 'المسودات', icon: FileEdit, hasDot: true },
      { id: 'earnings', label: 'الأرباح', icon: Wallet },
    ],
    // Group 3: الحساب
    [
      { id: 'settings', label: 'الإعدادات', icon: Settings },
    ],
  ];

  // Group definitions for Brand Owner
  const brandGroups: NavItemDef[][] = [
    // Group 1: نظرة عامة
    [
      { id: 'dashboard', label: 'الرئيسية', icon: Home },
      { id: 'campaigns', label: 'الحملات', icon: Layers },
    ],
    // Group 2: الإدارة
    [
      { id: 'analytics', label: 'التحليلات', icon: BarChart3 },
      { id: 'payouts', label: 'المدفوعات', icon: CreditCard },
      { id: 'applications', label: 'طلبات الانضمام', icon: FileCheck2, hasDot: true },
      { id: 'creators', label: 'صناع المحتوى', icon: Users2 },
    ],
    // Group 3: البراند
    [ 
      { id: 'brand-page', label: 'ملف العلامة التجارية', icon: Store },
      { id: 'balance', label: 'الرصيد', icon: Wallet },
      { id: 'settings', label: 'الإعدادات', icon: Building2 },
    ],
  ];

  const currentGroups = role === 'creator' ? creatorGroups : brandGroups;
  const activeId = role === 'creator' 
    ? (creatorView === 'campaigns-for-you' || creatorView === 'campaign-detail' || creatorView === 'brand-profile' ? 'discover' : creatorView)
    : (brandView === 'campaign-manage' || brandView === 'create-campaign' ? 'campaigns' : brandView);

  const handleNavClick = (id: string) => {
    if (role === 'creator') {
      setCreatorView(id as CreatorScreen);
    } else {
      setBrandView(id as BrandScreen);
    }
  };

  return (
    <>
      {/* =========================================================================
          DESKTOP FLOATING VERTICAL GLASS RAIL (72px collapsed -> 220px on hover)
          ========================================================================= */}
      <nav
        aria-label="التنقل الرئيسي"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setHoveredTooltip(null);
        }}
        className={`hidden md:flex fixed right-4 top-1/2 -translate-y-1/2 z-40 flex-col items-center py-4 px-2 select-none rounded-[38px] bg-white/[0.045] backdrop-blur-3xl border border-white/[0.14] shadow-[0_24px_60px_rgba(0,0,0,0.85),0_0_28px_rgba(255,255,255,0.06),inset_0_1px_0_rgba(255,255,255,0.25)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isHovered ? 'w-[220px] px-3.5 shadow-[0_28px_70px_rgba(0,0,0,0.92),0_0_40px_rgba(255,255,255,0.12),inset_0_1px_0_rgba(255,255,255,0.3)]' : 'w-[72px]'
        }`}
      >
        {/* Subtle stage-light reflection on the rail surface */}
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/[0.12] to-transparent rounded-t-[38px] pointer-events-none" />

        {/* Top: Logo placeholder as a small dashed circle (only placeholder, no title text) */}
        <div
          onClick={() => setIsRoleSelectModalOpen(true)}
          className="flex items-center justify-center w-full cursor-pointer py-1.5 transition-all"
          title="تبديل الدور"
        >
          <div className="w-9 h-9 rounded-full border border-dashed border-white/35 bg-white/[0.03] flex items-center justify-center text-white/80 shrink-0 hover:border-white hover:text-white hover:bg-white/[0.08] transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]">
            <span className="w-2.5 h-2.5 rounded-full bg-white/80" />
          </div>
        </div>

        {/* Thin 1px divider below logo */}
        <div className={`h-[1px] bg-white/[0.12] my-2.5 transition-all duration-300 ${
          isHovered ? 'w-full' : 'w-7'
        }`} />

        {/* Navigation Groups with Thin 1px dividers between them */}
        <div className="flex flex-col gap-1 w-full flex-1 justify-center">
          {currentGroups.map((group, groupIdx) => (
            <React.Fragment key={groupIdx}>
              {groupIdx > 0 && (
                <div
                  className={`h-[1px] bg-white/[0.1] my-1.5 transition-all duration-300 self-center ${
                    isHovered ? 'w-full' : 'w-6'
                  }`}
                />
              )}

              <div className="flex flex-col gap-1 w-full">
                {group.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeId === item.id;

                  return (
                    <div
                      key={item.id}
                      className="relative w-full flex items-center justify-center"
                      onMouseEnter={() => !isHovered && setHoveredTooltip(item.id)}
                      onMouseLeave={() => setHoveredTooltip(null)}
                    >
                      <button
                        onClick={() => handleNavClick(item.id)}
                        className={`relative w-full h-11 rounded-[22px] flex items-center gap-3 transition-colors duration-200 outline-none ${
                          isHovered ? 'px-3 justify-start' : 'justify-center'
                        } ${
                          isActive
                            ? 'text-white font-bold'
                            : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
                        }`}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        {/* ACTIVE SPOTLIGHT BEAM (Spring Animated Sliding Spotlight) */}
                        {isActive && (
                          <motion.div
                            layoutId="rail-active-spotlight"
                            transition={{
                              type: 'spring',
                              stiffness: 380,
                              damping: 32,
                            }}
                            className="absolute inset-0 rounded-[22px] pointer-events-none"
                          >
                            {/* Stage-light spotlight pill background */}
                            <div className="absolute inset-0 rounded-[22px] bg-white/[0.16] border border-white/[0.35] shadow-[0_0_24px_rgba(255,255,255,0.22),inset_0_1px_0_rgba(255,255,255,0.45)]" />

                            {/* Downward stage-light spotlight beam shining down from above */}
                            <div className="absolute -top-5 inset-x-1 h-9 [background:radial-gradient(ellipse_at_top,rgba(255,255,255,0.55)_0%,rgba(255,255,255,0.18)_45%,transparent_75%)] blur-[2px] pointer-events-none" />

                            {/* Soft central stage glow */}
                            <div className="absolute inset-0 [background:radial-gradient(circle_at_center,rgba(255,255,255,0.25)_0%,transparent_70%)] pointer-events-none" />
                          </motion.div>
                        )}

                        {/* Icon Container with thin line style & glow when active */}
                        <div className="relative shrink-0 flex items-center justify-center w-7 h-7 z-10">
                          <Icon
                            strokeWidth={1.75}
                            className={`w-[19px] h-[19px] transition-all duration-200 ${
                              isActive
                                ? 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.85)] scale-105'
                                : 'text-white/60'
                            }`}
                          />

                          {/* "New" badge on Drafts / Dot on Applications: Tiny glowing white dot on the icon */}
                          {item.hasDot && (
                            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.95)] animate-pulse" />
                          )}
                        </div>

                        {/* Label (revealed smoothly on hover) */}
                        <span
                          className={`text-xs whitespace-nowrap z-10 transition-all duration-200 ${
                            isHovered
                              ? 'opacity-100 max-w-[130px] translate-x-0'
                              : 'opacity-0 max-w-0 -translate-x-2 pointer-events-none'
                          } ${isActive ? 'font-bold text-white drop-shadow-sm' : 'font-medium text-white/80'}`}
                        >
                          {item.label}
                        </span>
                      </button>

                      {/* Tooltip when rail is collapsed */}
                      {!isHovered && hoveredTooltip === item.id && (
                        <div className="absolute right-[82px] top-1/2 -translate-y-1/2 z-50 pointer-events-none">
                          <div className="px-3 py-1.5 rounded-xl bg-[#141414]/95 backdrop-blur-2xl border border-white/[0.18] shadow-[0_10px_25px_rgba(0,0,0,0.8),0_0_14px_rgba(255,255,255,0.08)] whitespace-nowrap text-xs font-semibold text-white animate-in fade-in zoom-in-95 duration-150">
                            {item.label}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </React.Fragment>
          ))}
        </div>
      </nav>

      {/* =========================================================================
          MOBILE FLOATING BOTTOM TAB BAR WITH SLIDING SPOTLIGHT
          ========================================================================= */}
      <nav
        aria-label="شريط التنقل السفلي للهواتف"
        className="md:hidden fixed bottom-4 inset-x-4 z-40 h-16 rounded-full bg-[#0A0A0A]/90 backdrop-blur-2xl border border-white/[0.16] shadow-[0_16px_40px_rgba(0,0,0,0.9)] flex items-center justify-around px-3 select-none"
      >
        {currentGroups.flat().slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = activeId === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`relative flex flex-col items-center justify-center w-12 h-12 rounded-full transition-colors ${
                isActive ? 'text-white' : 'text-white/50'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-spotlight"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  className="absolute inset-0 rounded-full bg-white/[0.14] border border-white/[0.25] shadow-[0_0_16px_rgba(255,255,255,0.2)]"
                />
              )}

              <div className="relative z-10 flex items-center justify-center">
                <Icon
                  strokeWidth={1.75}
                  className={`w-5 h-5 ${
                    isActive ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]' : ''
                  }`}
                />
                {item.hasDot && (
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.9)]" />
                )}
              </div>
            </button>
          );
        })}
      </nav>
    </>
  );
};

export default FloatingNavRail;
