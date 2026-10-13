import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import PlatformIcon from '../../components/PlatformIcon';
import StatusBadge from '../../components/common/StatusBadge';
import { Search, Check, X, ShieldCheck } from 'lucide-react';

export const BrandApplicationsView: React.FC = () => {
  const { applications, approveApplication, rejectApplication } = useApp();
  const [tab, setTab] = useState<'pending' | 'approved' | 'rejected' | 'all'>('all');
  const [search, setSearch] = useState('');

  const filtered = applications.filter((app) => {
    if (tab !== 'all' && app.status !== tab) return false;
    if (search && !app.creatorName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="relative pb-32 px-6 pt-6 flex flex-col gap-6 max-w-[1440px] mx-auto text-right select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white font-heading">طلبات الانضمام للحملات</h1>
          <p className="text-xs text-muted mt-1">
            مراجعة طلبات صناع المحتوى المتقدمين للحملات المشروطة بموافقة مسبقة
          </p>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/[0.06] border border-white/[0.1] w-fit">
          {[
            { id: 'all', label: 'الكل' },
            { id: 'pending', label: 'تنتظر قرارك' },
            { id: 'approved', label: 'مقبولة' },
            { id: 'rejected', label: 'مرفوضة' },
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
            placeholder="بحث بالصانع..."
            className="w-full h-10 pr-9 pl-4 rounded-full bg-white/[0.05] border border-white/[0.12] text-xs text-white placeholder-white/30"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
        </div>
      </div>

      {/* Applications Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((app) => (
          <div key={app.id} className="p-5 rounded-[24px] bg-white/[0.04] backdrop-blur-2xl border border-white/[0.12] flex flex-col justify-between gap-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img src={app.creatorAvatar} alt="" className="w-12 h-12 rounded-full object-cover ring-2 ring-white/20" />
                <div className="flex flex-col">
                  <span className="font-bold text-white text-sm">{app.creatorName}</span>
                  <span className="text-xs text-muted font-mono">{app.creatorHandle}</span>
                  <span className="text-[10px] text-white/50">{app.pastViews} سابقة</span>
                </div>
              </div>

              {app.status === 'approved' ? (
                <StatusBadge tone="success">مقبول</StatusBadge>
              ) : app.status === 'rejected' ? (
                <StatusBadge tone="danger">مرفوض</StatusBadge>
              ) : (
                <StatusBadge tone="warning" pulse>قيد المراجعة</StatusBadge>
              )}
            </div>

            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs flex flex-col gap-1.5">
              <span className="font-bold text-white/80">الحملة المستهدفة: {app.campaignTitle}</span>
              <p className="text-white/70 leading-relaxed"><span className="text-white/40">الدافع: </span>{app.motivation}</p>
            </div>

            {app.status === 'pending' && (
              <div className="flex items-center gap-2 pt-2 border-t border-white/[0.06]">
                <button
                  onClick={() => approveApplication(app.id)}
                  className="flex-1 py-2 rounded-full bg-white text-black font-bold text-xs shadow-sm"
                >
                  اقبل الطلب
                </button>
                <button
                  onClick={() => rejectApplication(app.id)}
                  className="flex-1 py-2 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 font-semibold text-xs"
                >
                  ارفض
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BrandApplicationsView;
