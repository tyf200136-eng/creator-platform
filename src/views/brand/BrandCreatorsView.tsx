import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import PlatformIcon from '../../components/PlatformIcon';
import RiyalSymbol from '../../components/RiyalSymbol';
import { SocialPlatform } from '../../types';
import { Search, Download, Star, ShieldCheck, MoreVertical } from 'lucide-react';

export const BrandCreatorsView: React.FC = () => {
  const { showToast } = useApp();
  const [tab, setTab] = useState<'all' | 'active' | 'blocked'>('active');
  const [platform, setPlatform] = useState<SocialPlatform | 'all'>('all');
  const [search, setSearch] = useState('');

  const creators = [
    { id: '1', name: 'سلطان القحطاني', handle: '@sultan_clips', platform: 'tiktok' as SocialPlatform, followers: '340K', views: '780K', clips: 12, rating: 4.9, earnings: 6240, status: 'active', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80' },
    { id: '2', name: 'سارة المهيدب', handle: '@sara_ugc', platform: 'snapchat' as SocialPlatform, followers: '190K', views: '612K', clips: 8, rating: 4.8, earnings: 4890, status: 'active', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80' },
    { id: '3', name: 'نورة الدوسري', handle: '@noura_shortss', platform: 'tiktok' as SocialPlatform, followers: '184K', views: '490K', clips: 6, rating: 5.0, earnings: 3920, status: 'active', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80' },
    { id: '4', name: 'فيصل بارستا', handle: '@faisal_brew', platform: 'instagram' as SocialPlatform, followers: '115K', views: '380K', clips: 5, rating: 4.7, earnings: 2660, status: 'active', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80' },
  ];

  return (
    <div className="relative pb-32 px-6 pt-6 flex flex-col gap-6 max-w-[1440px] mx-auto text-right select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white font-heading">صناع المحتوى المتعاونين</h1>
          <p className="text-xs text-muted mt-1">قاعدة بيانات صناع المحتوى الأكثر فاعلية لحملات علامتك التجارية</p>
        </div>

        <button
          onClick={() => showToast('تم تصدير قائمة الصناع')}
          className="py-2.5 px-5 rounded-full bg-white/[0.08] hover:bg-white/[0.15] border border-white/20 text-white font-bold text-xs transition-all flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          <span>تصدير القائمة</span>
        </button>
      </div>

      {/* Tabs & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/[0.06] border border-white/[0.1] w-fit">
          {[
            { id: 'all', label: 'الكل' },
            { id: 'active', label: 'نشطين حالياً' },
            { id: 'blocked', label: 'محظورين' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                tab === t.id ? 'bg-white text-black font-bold shadow-sm' : 'text-white/60 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="relative w-full max-w-xs">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بالاسم أو المعرف..."
            className="w-full h-10 pr-9 pl-4 rounded-full bg-white/[0.05] border border-white/[0.12] text-xs text-white placeholder-white/30"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
        </div>
      </div>

      {/* Creators Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {creators.map((c) => (
          <div key={c.id} className="p-5 rounded-[24px] bg-white/[0.04] backdrop-blur-2xl border border-white/[0.12] flex flex-col justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src={c.avatar} alt="" className="w-12 h-12 rounded-full object-cover ring-2 ring-white/20" />
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-white text-sm truncate">{c.name}</span>
                <span className="text-xs text-muted font-mono">{c.handle}</span>
                <div className="flex items-center gap-1 text-[11px] text-amber-300 mt-0.5">
                  <Star className="w-3 h-3 fill-amber-300" />
                  <span>{c.rating} تقييم التفاعل</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between text-xs font-mono">
              <div className="flex flex-col">
                <span className="text-[10px] text-white/50">المشاهدات</span>
                <span className="font-bold text-white">{c.views}</span>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[10px] text-white/50">المقاطع</span>
                <span className="font-bold text-white">{c.clips}</span>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[10px] text-white/50">الأرباح</span>
                <span className="font-bold text-white">{c.earnings} <RiyalSymbol /></span>
              </div>
            </div>

            <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs">
              <span className="text-white/60 capitalize flex items-center gap-1.5">
                <PlatformIcon platform={c.platform} size={12} />
                <span>{c.followers} متابع</span>
              </span>
              <button
                onClick={() => showToast(`تم إرسال دعوة خاصة إلى ${c.name}`)}
                className="text-white underline font-semibold text-[11px]"
              >
                دعوة لحملة خاصة
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BrandCreatorsView;
