import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import RiyalSymbol from '../../components/RiyalSymbol';
import PlatformIcon from '../../components/PlatformIcon';
import StatusBadge from '../../components/common/StatusBadge';
import { Search, Download, CreditCard, CheckCircle2, Clock, ShieldAlert } from 'lucide-react';

export const BrandPayoutsView: React.FC = () => {
  const { payouts, showToast } = useApp();
  const [tab, setTab] = useState<'all' | 'pending' | 'completed' | 'blocked'>('all');
  const [search, setSearch] = useState('');

  const filtered = payouts.filter((p) => {
    if (tab !== 'all' && p.status !== tab) return false;
    if (search && !p.creatorName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="relative pb-32 px-6 pt-6 flex flex-col gap-6 max-w-[1440px] mx-auto text-right select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white font-heading">سجل المدفوعات والتحويلات</h1>
          <p className="text-xs text-muted mt-1">
            كافة مبالغ المشاهدات المصروفة لصناع المحتوى مع حالة التحويل البنكي
          </p>
        </div>

        <button
          onClick={() => showToast('تم تصدير سجل المدفوعات')}
          className="py-2.5 px-5 rounded-full bg-white/[0.08] hover:bg-white/[0.15] border border-white/20 text-white font-bold text-xs transition-all flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          <span>تصدير كشف الحساب</span>
        </button>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/[0.06] border border-white/[0.1] w-fit">
          {[
            { id: 'all', label: 'الكل' },
            { id: 'pending', label: 'تنتظر التحويل' },
            { id: 'completed', label: 'انصرفت' },
            { id: 'blocked', label: 'محظورة' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                tab === t.id
                  ? 'bg-white text-black font-bold shadow-sm'
                  : 'text-white/60 hover:text-white'
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
            placeholder="ابحث باسم الصانع..."
            className="w-full h-10 pr-9 pl-4 rounded-full bg-white/[0.05] border border-white/[0.12] text-xs text-white placeholder-white/30"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-[24px] bg-white/[0.04] backdrop-blur-2xl border border-white/[0.12] overflow-hidden shadow-2xl">
        <table className="w-full text-right text-xs">
          <thead>
            <tr className="border-b border-white/[0.08] bg-white/[0.02] text-white/50 text-[11px] font-semibold">
              <th className="py-3.5 px-4">صانع المحتوى</th>
              <th className="py-3.5 px-4">الحملة</th>
              <th className="py-3.5 px-4">طريقة الاستلام</th>
              <th className="py-3.5 px-4 text-center">المبلغ</th>
              <th className="py-3.5 px-4 text-center">التاريخ</th>
              <th className="py-3.5 px-4 text-center">الحالة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2.5">
                    <img src={p.creatorAvatar} alt="" className="w-8 h-8 rounded-full object-cover ring-1 ring-white/20" />
                    <span className="font-bold text-white">{p.creatorName}</span>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-white/80">{p.campaignTitle}</td>
                <td className="py-3.5 px-4 text-white/60 font-mono text-[11px]">{p.method}</td>
                <td className="py-3.5 px-4 text-center font-bold text-white font-mono">
                  {p.amount.toLocaleString()} <RiyalSymbol />
                </td>
                <td className="py-3.5 px-4 text-center text-white/50 font-mono">{p.date}</td>
                <td className="py-3.5 px-4 text-center">
                  {p.status === 'completed' ? (
                    <StatusBadge tone="success">انصرفت بنجاح</StatusBadge>
                  ) : (
                    <StatusBadge tone="warning">تنتظر التحويل</StatusBadge>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BrandPayoutsView;
