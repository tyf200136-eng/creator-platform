import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import CampaignCard from '../../components/CampaignCard';
import FloatingDock from '../../components/FloatingDock';
import {
  ArrowRight,
  LayoutGrid
} from 'lucide-react';

export const CampaignsForYouView: React.FC = () => {
  const { campaigns, setCreatorView, typeFilter, platformFilter, categoryFilter, searchQuery } = useApp();
  const [accessTab, setAccessTab] = useState<'all' | 'open' | 'application'>('all');
  // Filtered campaigns
  const filtered = campaigns.filter((camp) => {
    if (accessTab === 'open' && camp.requiresApplication) return false;
    if (accessTab === 'application' && !camp.requiresApplication) return false;
    if (typeFilter === 'clipping' && !camp.allowedTypes.some(t => t.toLowerCase().includes('clip') || t.includes('قص'))) return false;
    if (typeFilter === 'ugc' && !camp.allowedTypes.some(t => t.toLowerCase().includes('ugc'))) return false;
    if (platformFilter !== 'all' && !camp.platforms.includes(platformFilter)) return false;
    if (categoryFilter !== 'all' && camp.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = camp.title.toLowerCase().includes(q) || 
                    camp.brandName.toLowerCase().includes(q) || 
                    camp.category.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="relative pb-36 px-6 pt-6 flex flex-col gap-8 max-w-[1440px] mx-auto text-right select-none">
      {/* Top Header: Back Arrow + Title on right, "50 حملة" counter on left */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCreatorView('discover')}
            className="w-10 h-10 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.12] text-white flex items-center justify-center transition-all cursor-pointer"
            aria-label="الرجوع إلى اكتشف"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white font-heading">حملات لأجلك</h1>
            <p className="text-xs text-[#A3A3A3]">حملات مخصصة بناءً على أدائك وتصنيف حساباتك المربوطة</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* فلتر نوع الوصول (منقول من شاشة الحملات) */}
          <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/[0.06] border border-white/[0.1] w-fit">
            {[
              { id: 'all', label: 'الكل' },
              { id: 'open', label: 'مفتوحة للجميع' },
              { id: 'application', label: 'بطلب وموافقة' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setAccessTab(t.id as 'all' | 'open' | 'application')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  accessTab === t.id ? 'bg-white text-black shadow-sm' : 'text-white/60 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.12] text-xs font-mono font-bold text-white">
            <LayoutGrid className="w-3.5 h-3.5 text-white/70" />
            <span>50 حملة متاحة</span>
          </div>
        </div>
      </div>

      {/* 3-Column Grid of Campaign Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((camp) => (
          <CampaignCard key={camp.id} campaign={camp} />
        ))}

        {/* Generate more realistic grid cards from pool to give a dense 50-campaign feel */}
        {filtered.slice(0, 6).map((camp, idx) => (
          <CampaignCard 
            key={`duplicate-${camp.id}-${idx}`} 
            campaign={{
              ...camp,
              id: `${camp.id}-alt-${idx}`,
              title: `${camp.title} [موجة ${idx + 2}]`,
              spentBudget: Math.round(camp.spentBudget * 0.7),
            }} 
          />
        ))}
      </div>

      {/* Floating Bottom Dock */}
      <FloatingDock />
    </div>
  );
};

export default CampaignsForYouView;
