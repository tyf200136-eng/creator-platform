import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import CampaignCard from '../../components/CampaignCard';
import { Campaign, MyParticipation } from '../../types';
import { Compass } from 'lucide-react';

type Tab = 'all' | 'active' | 'pending' | 'ended';

// أي حالة مشاركة تنتمي لأي تبويب
const matchesTab = (tab: Tab, p: MyParticipation) => {
  if (tab === 'all') return true;
  if (tab === 'active') return p.status === 'joined';
  if (tab === 'pending') return p.status === 'pending_approval' || p.status === 'rejected';
  return p.status === 'ended';
};

export const CampaignsListView: React.FC = () => {
  const { campaigns, searchQuery, setCreatorView , myParticipations} = useApp();
  const [activeTab, setActiveTab] = useState<Tab>('all');

  // الحملات اللي انضم لها الصانع أو قدّم عليها فقط
  const myCampaigns = myParticipations
    .map((p) => ({ participation: p, campaign: campaigns.find((c) => c.id === p.campaignId) }))
    .filter((x): x is { participation: MyParticipation; campaign: Campaign } => Boolean(x.campaign));

  const filtered = myCampaigns.filter(({ campaign, participation }) => {
    if (!matchesTab(activeTab, participation)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = campaign.title.toLowerCase().includes(q) || campaign.brandName.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const tabs: { id: Tab; label: string }[] = [
    { id: 'all', label: 'الكل' },
    { id: 'active', label: 'نشطة' },
    { id: 'pending', label: 'بانتظار القبول' },
    { id: 'ended', label: 'منتهية' },
  ];

  return (
    <div className="relative pb-36 px-6 pt-6 flex flex-col gap-8 max-w-[1440px] mx-auto text-right select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white font-heading">حملاتي</h1>
          <p className="text-xs text-[#A3A3A3] mt-1">الحملات اللي انضممت لها أو قدّمت عليها</p>
        </div>

        {/* Tab filters */}
        <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/[0.06] border border-white/[0.1] w-fit">
          {tabs.map((t) => {
            const count = myCampaigns.filter((x) => matchesTab(t.id, x.participation)).length;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  activeTab === t.id ? 'bg-white text-black shadow-sm' : 'text-white/60 hover:text-white'
                }`}
              >
                {t.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Campaign Cards */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(({ campaign, participation }) => (
            <CampaignCard key={campaign.id} campaign={campaign} participation={participation} />
          ))}
        </div>
      ) : (
        /* Empty state */
        <div className="glass-panel rounded-[24px] py-16 flex flex-col items-center gap-4 text-center">
          <p className="text-sm text-white/70">ما فيه حملات هنا حالياً</p>
          <button
            onClick={() => setCreatorView('discover')}
            className="white-glow-button px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-2"
          >
            <Compass className="w-4 h-4" />
            <span>اكتشف حملات جديدة</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default CampaignsListView;