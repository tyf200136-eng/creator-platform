import React from 'react';
import { useApp } from '../../context/AppContext';
import RiyalSymbol from '../../components/RiyalSymbol';
import { Wallet, ArrowDownLeft, CheckCircle2, Clock, ShieldCheck, CreditCard } from 'lucide-react';

export const EarningsView: React.FC = () => {
  const { creatorProfile, setIsWithdrawModalOpen, payouts } = useApp();

  return (
    <div className="relative pb-32 px-6 pt-6 flex flex-col gap-6 max-w-[1440px] mx-auto text-right select-none">
      {/* Header with Big Balance & Withdraw Action */}
      <div className="p-8 rounded-[28px] bg-white/[0.05] backdrop-blur-2xl border border-white/[0.14] shadow-[0_20px_60px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.2)] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col gap-2">
          <span className="text-xs text-[#A3A3A3]">الرصيد المتاح للسحب الفوري</span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-black text-white font-mono tabular-nums tracking-tight font-heading">
              {creatorProfile.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <RiyalSymbol className="w-6 h-6 text-white inline-block" />
          </div>
          <p className="text-xs text-emerald-400 mt-1">
            جاهز للتحويل الفوري إلى حسابك البنكي أو STC Pay
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsWithdrawModalOpen(true)}
            className="py-3.5 px-8 rounded-full bg-white text-black font-bold text-sm shadow-[0_0_24px_rgba(255,255,255,0.45)] hover:shadow-[0_0_36px_rgba(255,255,255,0.8)] hover:bg-neutral-100 transition-all flex items-center gap-2"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>اسحب أرباحك الآن</span>
          </button>
        </div>
      </div>

      {/* 4 Cards: اليوم / الأسبوع / الشهر / الإجمالي */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-[22px] bg-white/[0.04] border border-white/[0.12] flex flex-col justify-between">
          <span className="text-xs text-[#A3A3A3]">أرباح اليوم</span>
          <div className="flex items-baseline gap-1 mt-3">
            <span className="text-2xl font-black text-white font-mono tabular-nums font-heading">240.80</span>
            <RiyalSymbol className="w-3.5 h-3.5 text-white/90" />
          </div>
          <span className="text-[11px] text-white/50 mt-1">من 3 مقاطع نشطة</span>
        </div>

        <div className="p-5 rounded-[22px] bg-white/[0.04] border border-white/[0.12] flex flex-col justify-between">
          <span className="text-xs text-[#A3A3A3]">أرباح هذا الأسبوع</span>
          <div className="flex items-baseline gap-1 mt-3">
            <span className="text-2xl font-black text-white font-mono tabular-nums font-heading">1,480.00</span>
            <RiyalSymbol className="w-3.5 h-3.5 text-white/90" />
          </div>
          <span className="text-[11px] text-emerald-400 mt-1">+12.4% عن الأسبوع الماضي</span>
        </div>

        <div className="p-5 rounded-[22px] bg-white/[0.04] border border-white/[0.12] flex flex-col justify-between">
          <span className="text-xs text-[#A3A3A3]">أرباح هذا الشهر</span>
          <div className="flex items-baseline gap-1 mt-3">
            <span className="text-2xl font-black text-white font-mono tabular-nums font-heading">4,950.50</span>
            <RiyalSymbol className="w-3.5 h-3.5 text-white/90" />
          </div>
          <span className="text-[11px] text-emerald-400 mt-1">أعلى شهر حتى الآن</span>
        </div>

        <div className="p-5 rounded-[22px] bg-white/[0.04] border border-white/[0.12] flex flex-col justify-between">
          <span className="text-xs text-[#A3A3A3]">إجمالي ما تم سحبه</span>
          <div className="flex items-baseline gap-1 mt-3">
            <span className="text-2xl font-black text-white font-mono tabular-nums font-heading">
              {creatorProfile.totalWithdrawn.toLocaleString()}
            </span>
            <RiyalSymbol className="w-3.5 h-3.5 text-white/90" />
          </div>
          <span className="text-[11px] text-white/50 mt-1">عبر 8 عمليات تحويل</span>
        </div>
      </div>

      {/* Vertical Timeline: تتجمع → في الطريق → وصلت with totals */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Timeline Column (7 cols) */}
        <div className="lg:col-span-7 rounded-[26px] bg-white/[0.04] backdrop-blur-2xl border border-white/[0.12] p-6 flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
            <h2 className="text-base font-bold text-white font-heading">دورة الأرباح والتحويل</h2>
            <span className="text-xs text-white/50">تحديث لحظي</span>
          </div>

          <div className="relative flex flex-col gap-6 pl-4 pr-2">
            {/* Stage 1: تتجمع */}
            <div className="relative flex items-start gap-4">
              <div className="w-9 h-9 rounded-full bg-white/[0.08] border border-white/[0.2] flex items-center justify-center text-white shrink-0 mt-0.5">
                <Clock className="w-4 h-4" />
              </div>
              <div className="flex flex-col flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white font-heading">1. تتجمع (قيد الاحتساب)</span>
                  <div className="flex items-baseline gap-1 text-sm font-bold text-white font-mono">
                    <span>{creatorProfile.pendingBalance.toLocaleString()}</span>
                    <RiyalSymbol className="w-3 h-3 text-white inline-block" />
                  </div>
                </div>
                <p className="text-xs text-[#A3A3A3] mt-1 leading-relaxed">
                  مشاهدات مقاطعك في آخر 24 ساعة تخضع لفلترة الروبوتات والتحقق الآلي قبل نقلها للرصيد المتاح.
                </p>
              </div>
            </div>

            {/* Connecting line */}
            <div className="mr-4 w-0.5 h-6 bg-white/20" />

            {/* Stage 2: في الطريق */}
            <div className="relative flex items-start gap-4">
              <div className="w-9 h-9 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-300 shrink-0 mt-0.5">
                <Wallet className="w-4 h-4" />
              </div>
              <div className="flex flex-col flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white font-heading">2. في الطريق (قيد التحويل)</span>
                  <div className="flex items-baseline gap-1 text-sm font-bold text-white font-mono">
                    <span>968.55</span>
                    <RiyalSymbol className="w-3 h-3 text-white inline-block" />
                  </div>
                </div>
                <p className="text-xs text-[#A3A3A3] mt-1 leading-relaxed">
                  طلبات السحب المرسلة إلى البنك المركزي السعودي (سريع / مدى) وتستغرق عادة بضع دقائق.
                </p>
              </div>
            </div>

            {/* Connecting line */}
            <div className="mr-4 w-0.5 h-6 bg-white/20" />

            {/* Stage 3: وصلت */}
            <div className="relative flex items-start gap-4">
              <div className="w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="flex flex-col flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white font-heading">3. وصلت (تم الإيداع)</span>
                  <div className="flex items-baseline gap-1 text-sm font-bold text-white font-mono">
                    <span>{creatorProfile.totalWithdrawn.toLocaleString()}</span>
                    <RiyalSymbol className="w-3 h-3 text-white inline-block" />
                  </div>
                </div>
                <p className="text-xs text-[#A3A3A3] mt-1 leading-relaxed">
                  مبالغ تم إيداعها بنجاح في حسابك البنكي أو محفظة STC Pay مع إشعارات تسليم مؤكدة.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Transactions History Table (5 cols) */}
        <div className="lg:col-span-5 rounded-[26px] bg-white/[0.04] backdrop-blur-2xl border border-white/[0.12] p-6 flex flex-col gap-4">
          <h2 className="text-base font-bold text-white font-heading border-b border-white/[0.08] pb-3">
            سجل التحويلات الأخيرة
          </h2>

          <div className="flex flex-col gap-3">
            {payouts.map((tx) => (
              <div
                key={tx.id}
                className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/[0.08] flex items-center justify-center text-white">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white">{tx.method}</span>
                    <span className="text-[10px] text-white/50">{tx.date}</span>
                  </div>
                </div>

                <div className="flex flex-col text-left">
                  <div className="flex items-baseline gap-1 text-xs font-bold text-white font-mono">
                    <span>{tx.amount.toLocaleString()}</span>
                    <RiyalSymbol className="w-2.5 h-2.5 inline-block text-white" />
                  </div>
                  <span
                    className={`text-[10px] ${
                      tx.status === 'pending' ? 'text-amber-300' : tx.status === 'blocked' ? 'text-red-400' : 'text-emerald-400'
                    }`}
                  >
                    {tx.status === 'pending' ? 'قيد المعالجة' : tx.status === 'blocked' ? 'مرفوض' : 'مكتمل'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EarningsView;