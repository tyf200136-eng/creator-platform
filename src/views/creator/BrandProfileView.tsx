import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import CampaignCard from '../../components/CampaignCard';
import BrandCommunity from '../../components/community/BrandCommunity';
import PlatformIcon from '../../components/PlatformIcon';
import { useCommunity } from '../../context/CommunityContext';
import { useNotifications } from '../../context/NotificationsContext';
import MessageBrandButton from '../../components/chat/MessageBrandButton';
import { ArrowRight, CheckCircle2, Globe, Layers, Users } from 'lucide-react';

type ProfileTab = 'community' | 'campaigns';
type CampaignFilter = 'active' | 'ended';

interface BrandProfileViewProps {
  brandName?: string; // للمعاينة من جهة البراند
  preview?: boolean;  // وضع المعاينة: بدون زر رجوع ولا أزرار انضمام
}

// بروفايل البراند كما يشوفه صانع المحتوى
export const BrandProfileView: React.FC<BrandProfileViewProps> = ({ brandName, preview = false }) => {
  const { campaigns, selectedBrandName: selectedFromApp, setCreatorView, myParticipations } = useApp();
  const { getBrandPage } = useCommunity();
  const selectedBrandName = brandName ?? selectedFromApp;
  const [tab, setTab] = useState<ProfileTab>('campaigns');
  const [filter, setFilter] = useState<CampaignFilter>('active');
  const { pendingTab, setPendingTab } = useNotifications();

  // جاي من إشعار إعلان أو رد ← افتح المجتمع
  useEffect(() => {
    if (pendingTab?.startsWith('community') && !preview) {
      setTab('community');
      if (pendingTab === 'community') setPendingTab(null); // 'community-qa' يكمّله المجتمع
    }
  }, [pendingTab]);

  const brandCampaigns = campaigns.filter((c) => c.brandName === selectedBrandName);
  const first = brandCampaigns[0];

  if (!selectedBrandName || !first) {
    return (
      <div className="px-6 pt-10 text-center text-sm text-white/60">
        ما لقينا صفحة هذي العلامة التجارية
      </div>
    );
  }

  // بيانات الصفحة (يعدّلها البراند من "ملف العلامة التجارية")، وإذا ما فيه ناخذ من أول حملة
  const page = getBrandPage(selectedBrandName);
  const cover = page?.cover || first.coverImage;
  const bio = page?.bio || `${selectedBrandName} على المنصة. تصفح حملاتهم وانضم للي تناسبك.`;
  const industry = page?.industry || first.category;

  const activeCampaigns = brandCampaigns.filter((c) => c.status !== 'ended' && c.status !== 'draft');
  const endedCampaigns = brandCampaigns.filter((c) => c.status === 'ended');
  const shown = filter === 'active' ? activeCampaigns : endedCampaigns;
  const totalParticipants = brandCampaigns.reduce((sum, c) => sum + c.participantsCount, 0);

  const pill = (active: boolean) =>
    `px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
      active ? 'bg-white text-black shadow-sm' : 'text-white/60 hover:text-white'
    }`;

  return (
    <div className="relative pb-36 px-6 pt-6 flex flex-col gap-8 max-w-[1440px] mx-auto text-right">
      {/* رجوع */}
      {!preview && (
        <button
          type="button"
          onClick={() => setCreatorView('discover')}
          className="flex items-center gap-2 text-xs text-white/60 hover:text-white transition-colors w-fit"
        >
          <ArrowRight className="w-4 h-4" />
          <span>الرجوع إلى اكتشف</span>
        </button>
      )}

      {/* الغلاف + الهوية */}
      <section className="relative rounded-[28px] overflow-hidden border border-white/[0.12] bg-neutral-900">
        <div className="group relative h-[220px] sm:h-[280px] w-full">
          <img
            src={cover}
            alt=""
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-black/40 to-transparent pointer-events-none" />
        </div>

        <div className="relative -mt-16 px-6 sm:px-8 pb-7 flex flex-col sm:flex-row sm:items-end justify-between gap-5">
          <div className="flex items-end gap-4 min-w-0">
            <img
              src={first.brandAvatar}
              alt={selectedBrandName}
              referrerPolicy="no-referrer"
              className="w-24 h-24 rounded-[22px] object-cover ring-4 ring-[#0A0A0A] shadow-[0_0_30px_rgba(255,255,255,0.12)] shrink-0"
            />
            <div className="flex flex-col gap-1.5 min-w-0 pb-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading truncate">
                  {selectedBrandName}
                </h1>
                {first.isVerified && <CheckCircle2 className="w-5 h-5 text-white fill-white/20 shrink-0" />}
              </div>
              <span className="text-xs text-white/60">{industry}</span>
            </div>
          </div>

          {/* أرقام سريعة */}
          <div className="flex flex-wrap items-center gap-2">
            {!preview && <MessageBrandButton brandName={selectedBrandName} />}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.12] text-xs text-white">
              <Layers className="w-3.5 h-3.5 text-white/60" />
              <span className="font-mono font-bold">{activeCampaigns.length}</span>
              <span className="text-white/60">حملة نشطة</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.12] text-xs text-white">
              <Users className="w-3.5 h-3.5 text-white/60" />
              <span className="font-mono font-bold">{totalParticipants}</span>
              <span className="text-white/60">صانع محتوى تعاون معهم</span>
            </div>
            {page?.website && (
              <a
                href={page.website}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.12] text-xs text-white transition-colors"
              >
                <Globe className="w-3.5 h-3.5 text-white/60" />
                <span>الموقع</span>
              </a>
            )}
            {page?.socials?.map((s) => (
              <a
                key={s.platform}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                title={s.platform}
                className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.12] text-white/80 flex items-center justify-center transition-colors"
              >
                <PlatformIcon platform={s.platform} size={13} />
              </a>
            ))}
          </div>
        </div>

        <p className="px-6 sm:px-8 pb-7 -mt-2 max-w-3xl text-sm text-white/75 leading-relaxed">{bio}</p>
      </section>

      {/* التبويبات */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/[0.06] border border-white/[0.1] w-fit">
          <button type="button" onClick={() => setTab('community')} className={pill(tab === 'community')}>
            المجتمع
          </button>
          <button type="button" onClick={() => setTab('campaigns')} className={pill(tab === 'campaigns')}>
            الحملات ({brandCampaigns.length})
          </button>
        </div>

        {tab === 'campaigns' && (
          <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/[0.06] border border-white/[0.1] w-fit">
            <button type="button" onClick={() => setFilter('active')} className={pill(filter === 'active')}>
              النشطة ({activeCampaigns.length})
            </button>
            <button type="button" onClick={() => setFilter('ended')} className={pill(filter === 'ended')}>
              المنتهية ({endedCampaigns.length})
            </button>
          </div>
        )}
      </div>

      {/* المحتوى */}
      {tab === 'community' ? (
        <BrandCommunity brandName={selectedBrandName} brandAvatar={first.brandAvatar} />
      ) : shown.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shown.map((camp) => (
            <CampaignCard
              key={camp.id}
              campaign={camp}
              participation={myParticipations.find((p) => p.campaignId === camp.id)}
              showJoinAction={!preview}
            />
          ))}
        </div>
      ) : (
        <div className="glass-panel rounded-[24px] py-16 text-center text-sm text-white/60">
          {filter === 'active' ? 'ما فيه حملات نشطة حالياً' : 'ما فيه حملات منتهية'}
        </div>
      )}
    </div>
  );
};

export default BrandProfileView;