import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import RiyalSymbol from '../../components/RiyalSymbol';
import { Wallet, Plus, ArrowDownLeft, RotateCcw, CheckCircle2, Clock } from 'lucide-react';
import { StatusBadge } from '@/src/components/common/StatusBadge';

export const BrandBalanceView: React.FC = () => {
  const { brandProfile, setIsFundModalOpen, showToast } = useApp();
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [refundAmount, setRefundAmount] = useState('5000');

  const handleRefundSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsRefundModalOpen(false);
    showToast(`تم تقديم طلب استرجاع بمبلغ ${refundAmount} ﷼. سيتم التحويل إلى حسابك خلال 24 ساعة عمل`);
  };

  const activity = [
    { type: 'شحن رصيد', desc: 'بطاقة مدى Mada', camp: 'المحفظة الرئيسية', date: '2026-10-06', amount: '+25,000.00', status: 'مكتمل' },
    { type: 'صرف مشاهدات', desc: 'عطر إمبريال البري', camp: 'حملة إمبريال', date: '2026-10-06', amount: '-4,210.00', status: 'مكتمل' },
    { type: 'صرف مشاهدات', desc: 'كولد برو الصيف', camp: 'حملة القهوة', date: '2026-10-05', amount: '-1,875.00', status: 'مكتمل' },
    { type: 'شحن رصيد', desc: 'تحويل بنكي مباشر', camp: 'المحفظة الرئيسية', date: '2026-10-01', amount: '+50,000.00', status: 'مكتمل' },
  ];

  return (
    <div className="relative pb-32 px-6 pt-6 flex flex-col gap-6 max-w-[1440px] mx-auto text-right select-none">
      {/* Top Banner with Balance and Refund Action */}
      <div className="p-8 rounded-[28px] bg-white/[0.05] backdrop-blur-2xl border border-white/[0.14] shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col gap-1.5">
          <span className="text-xs text-muted">رصيد محفظة المنظمة المتاح</span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-black text-white font-mono tabular-nums font-heading">
              {brandProfile.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
            <RiyalSymbol className="w-6 h-6 text-white inline-block" />
          </div>
          <span className="text-xs text-emerald-400 mt-1">آمن ومودع في حساب الضمان البنكي</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsFundModalOpen(true)}
            className="py-3 px-7 rounded-full bg-white text-black font-bold text-xs shadow-[0_0_20px_rgba(255,255,255,0.4)] hover:bg-neutral-100 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span> شحن المحفظة</span>
          </button>

          <button
            onClick={() => setIsRefundModalOpen(true)}
            className="py-3 px-5 rounded-full bg-white/[0.08] hover:bg-white/[0.15] border border-white/20 text-white font-bold text-xs transition-all flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>طلب استرجاع الرصيد</span>
          </button>
        </div>
      </div>

      {/* Activity Table */}
      <div className="flex flex-col gap-3">
        <h2 className="text-base font-bold text-white font-heading">سجل العمليات المالية والمصروفات</h2>

        <div className="rounded-[24px] bg-white/[0.04] backdrop-blur-2xl border border-white/[0.12] overflow-hidden shadow-2xl">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.02] text-white/50 text-[11px] font-semibold">
                <th className="py-3.5 px-4">نوع العملية</th>
                <th className="py-3.5 px-4">التفاصيل</th>
                <th className="py-3.5 px-4">الحملة</th>
                <th className="py-3.5 px-4 text-center">التاريخ</th>
                <th className="py-3.5 px-4 text-center">المبلغ</th>
                <th className="py-3.5 px-4 text-center">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {activity.map((item, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-4 font-bold text-white">{item.type}</td>
                  <td className="py-3.5 px-4 text-white/70">{item.desc}</td>
                  <td className="py-3.5 px-4 text-white/50">{item.camp}</td>
                  <td className="py-3.5 px-4 text-center text-white/40 font-mono">{item.date}</td>
                  <td className={`py-3.5 px-4 text-center font-mono font-bold ${
                    item.amount.startsWith('+') ? 'text-emerald-400' : 'text-white'
                  }`}>
                    {item.amount} <RiyalSymbol />
                  </td>
                  <td className="py-3.5 px-4 text-center">
                 <StatusBadge tone="success">{item.status}</StatusBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Refund Modal */}
      {isRefundModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl">
          <div className="relative w-full max-w-md rounded-[28px] bg-surface border border-white/[0.18] p-7 text-right shadow-2xl">
            <h2 className="text-lg font-bold text-white font-heading">طلب استرجاع الرصيد المتبقي</h2>
            <p className="text-xs text-muted mt-1 mb-5">
              سيتم إعادة المبلغ إلى الحساب البنكي المسجل للمنظمة خلال 24 ساعة عمل
            </p>

            <form onSubmit={handleRefundSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-white/80">المبلغ المطلوب استرجاعه</label>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    max={brandProfile.balance}
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl bg-white/[0.05] border border-white/[0.14] text-xs text-white font-mono"
                    required
                  />
                  <RiyalSymbol className="absolute left-3 w-3 h-3 text-white/70" />
                </div>
              </div>

              <div className="flex items-center gap-3 mt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 px-6 rounded-full bg-white text-black font-bold text-xs shadow-md"
                >
                  تأكيد طلب الاسترجاع
                </button>
                <button
                  type="button"
                  onClick={() => setIsRefundModalOpen(false)}
                  className="px-5 py-3 rounded-full bg-white/[0.06] text-white text-xs"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandBalanceView;
