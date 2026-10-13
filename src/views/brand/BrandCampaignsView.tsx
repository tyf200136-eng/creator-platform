import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import RiyalSymbol from '../../components/RiyalSymbol';
import PlatformIcon from '../../components/PlatformIcon';
import StatusBadge from '../../components/common/StatusBadge';
import { CampaignStatus, Campaign } from '../../types';
import { Plus, MoreVertical, Layers, CheckCircle2, Pause, RotateCcw, AlertTriangle, Play } from 'lucide-react';

export const BrandCampaignsView: React.FC = () => {
  const { campaigns, setBrandView, navigateToCampaignDetail, showToast, setIsFundModalOpen, toggleCampaignPause } = useApp();
  const [activeTab, setActiveTab] = useState<CampaignStatus | 'all'>('all');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const filteredCampaigns = campaigns.filter((c) => {
    if (activeTab !== 'all' && c.status !== activeTab) return false;
    return true;
  });

  const handleAction = (camp: Campaign, action: string) => {
    setActiveMenuId(null);

    if (action === 'تعديل الشروط') {
      // يفتح صفحة إدارة الحملة على تبويب "نظرة عامة"
      navigateToCampaignDetail(camp);
      return;
    }

    if (action === 'زيادة الميزانية') {
      setIsFundModalOpen(true);
      return;
    }

    if (action === 'إيقاف مؤقت') {
      const willPause = camp.status !== 'paused';
      toggleCampaignPause(camp.id);
      showToast(willPause ? `تم إيقاف "${camp.title}" مؤقتاً` : `تم استئناف "${camp.title}"`);
      return;
    }

    // طلب استرجاع المتبقي: يبقى كما هو حالياً
    showToast(`تم تنفيذ: ${action} على "${camp.title}"`);
  };

  return (
    <div className="relative pb-32 px-6 pt-6 flex flex-col gap-6 max-w-[1440px] mx-auto text-right select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white font-heading">حملات المنظمة</h1>
          <p className="text-xs text-[#A3A3A3] mt-1">
            إدارة ميزانيات الحملات، تتبع الفيديوهات المستلمة، وتعديل شروط النشر
          </p>
        </div>

        <button
          onClick={() => setBrandView('create-campaign')}
          className="py-2.5 px-6 rounded-full bg-white text-black font-bold text-xs shadow-[0_0_20px_rgba(255,255,255,0.4)] hover:bg-neutral-100 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>إطلاق حملة جديدة</span>
        </button>
      </div>

      {/* Tabs: نشطة / مجدولة / مسودات / موقفة / منتهية */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'الكل' },
          { id: 'live', label: 'نشطة' },
          { id: 'scheduled', label: 'مجدولة' },
          { id: 'draft', label: 'مسودات' },
          { id: 'paused', label: 'موقفة مؤقتاً' },
          { id: 'ended', label: 'منتهية' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
              activeTab === tab.id
                ? 'bg-white text-black border-white font-bold shadow-[0_0_10px_rgba(255,255,255,0.4)]'
                : 'bg-white/[0.03] border-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCampaigns.map((camp) => {
          const percent = Math.min(100, Math.round((camp.spentBudget / camp.totalBudget) * 100));
          return (
            <div
              key={camp.id}
              onClick={() => navigateToCampaignDetail(camp)}
              className="p-5 rounded-[26px] bg-white/[0.04] backdrop-blur-2xl border border-white/[0.12] hover:border-white/[0.24] hover:shadow-[0_16px_40px_rgba(0,0,0,0.8),0_0_20px_rgba(255,255,255,0.08)] transition-all cursor-pointer flex flex-col justify-between gap-4 group relative"
            >
              {/* Cover thumbnail */}
              <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden bg-neutral-900 relative">
                <img
                  src={camp.coverImage}
                  alt={camp.title}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                />
                <div className="absolute top-2.5 right-2.5">
                  {camp.status === 'paused' ? (
                    <StatusBadge tone="danger" className="bg-black/60!">موقوفة مؤقتاً</StatusBadge>
                  ) : camp.status === 'draft' ? (
                    <StatusBadge tone="neutral" className="bg-black/60!">مسودة</StatusBadge>
                  ) : (
                    <StatusBadge tone="success" className="bg-black/60!">نشطة</StatusBadge>
                  )}
                </div>

                {/* ⋯ Menu Trigger */}
                <div className="absolute top-2.5 left-2.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuId(activeMenuId === camp.id ? null : camp.id);
                    }}
                    className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {/* Dropdown Menu (تعديل، زيادة الميزانية، إيقاف مؤقت، إنهاء، طلب استرجاع) */}
                  {activeMenuId === camp.id && (
                    <div 
                      onClick={(e) => e.stopPropagation()}
                      className="absolute left-0 top-10 w-44 rounded-2xl bg-[#141414] border border-white/[0.18] p-1.5 shadow-2xl z-50 text-right backdrop-blur-3xl animate-in fade-in"
                    >
                      <button
                        onClick={() => handleAction(camp, 'تعديل الشروط')}
                        className="w-full text-right px-2.5 py-2 text-xs text-white/80 hover:bg-white/[0.08] hover:text-white rounded-xl"
                      >
                        إدارة الحملة
                      </button>
                      <button
                        onClick={() => handleAction(camp, 'زيادة الميزانية')}
                        className="w-full text-right px-2.5 py-2 text-xs text-white/80 hover:bg-white/[0.08] hover:text-white rounded-xl"
                      >
                        + زيادة الميزانية
                      </button>
                      <button
                        onClick={() => handleAction(camp, 'إيقاف مؤقت')}
                        className="w-full text-right px-2.5 py-2 text-xs text-amber-300 hover:bg-amber-500/10 rounded-xl"
                      >
                        {camp.status === 'paused' ? 'استئناف الحملة' : 'إيقاف مؤقت'}
                      </button>
                      <button
                        onClick={() => handleAction(camp, 'طلب استرجاع الرصيد المتبقي')}
                        className="w-full text-right px-2.5 py-2 text-xs text-rose-300 hover:bg-rose-500/10 rounded-xl"
                      >
                        طلب استرجاع المتبقي
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Title & Stats */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs text-[#A3A3A3]">
                  <span>{camp.category}</span>
                  <div className="flex items-center gap-1 text-white font-mono font-bold">
                    <span>{camp.ratePer1k}</span>
                    <RiyalSymbol className="w-2.5 h-2.5 text-white inline-block" />
                    <span className="text-[10px] text-white/60">/ 1K</span>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-white group-hover:text-white truncate">
                  {camp.title}
                </h3>

                {/* Budget Progress */}
                <div className="flex flex-col gap-1.5 mt-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-white font-bold">{camp.spentBudget.toLocaleString()} <RiyalSymbol /></span>
                    <span className="text-white/50">{camp.totalBudget.toLocaleString()} <RiyalSymbol /></span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.7)]" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              </div>

              {/* Bottom Row */}
              <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs">
                <span className="text-white/60">{camp.participantsCount} صانع محتوى</span>
                <span className="text-white font-semibold underline group-hover:text-white">إدارة المقاطع والتدقيق ←</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BrandCampaignsView;
