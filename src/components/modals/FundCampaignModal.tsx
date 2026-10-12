import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import RiyalSymbol from '../RiyalSymbol';
import UnifiedBudgetInput from '../common/UnifiedBudgetInput';
import {
  X,
  CheckCircle2,
  CreditCard,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export const FundCampaignModal: React.FC = () => {
  const {
    isFundModalOpen,
    setIsFundModalOpen,
    fundBrandBalance,
  } = useApp();

  const [amount, setAmount] = useState<number>(10000);
  const [method, setMethod] = useState<'applepay' | 'mada' | 'card' | 'balance'>('applepay');
  const [step, setStep] = useState<'fund' | 'success'>('fund');

  if (!isFundModalOpen) return null;

  const quickAdd = (val: number) => {
    setAmount(prev => prev + val);
  };

  const handleFund = (e: React.FormEvent) => {
    e.preventDefault();
    let methodName = 'Apple Pay';
    if (method === 'mada') methodName = 'مدى Mada';
    else if (method === 'card') methodName = 'بطاقة فيزا/ماستركارد';
    else if (method === 'balance') methodName = 'رصيد الحساب المسبق';

    fundBrandBalance(amount, methodName);
    setStep('success');
  };

  const handleClose = () => {
    setIsFundModalOpen(false);
    setStep('fund');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-[28px] bg-[#121212] border border-white/[0.18] p-7 text-right shadow-[0_24px_70px_rgba(0,0,0,0.9),0_0_40px_rgba(255,255,255,0.08)]">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-6 left-6 w-9 h-9 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.12] text-white flex items-center justify-center transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {step === 'fund' ? (
          <form onSubmit={handleFund} className="flex flex-col gap-5">
            <div>
              <span className="text-xs font-semibold text-white/50">شحن الرصيد والميزانية</span>
              <h2 className="text-xl font-bold text-white font-heading mt-0.5">
                تغذية محفظة الحملات
              </h2>
              <p className="text-xs text-[#A3A3A3]">
                يتم الصرف فقط عند تحقيق مشاهدات حقيقية مؤكدة من صناع المحتوى
              </p>
            </div>

            {/* Unified Budget Component */}
            <UnifiedBudgetInput
              value={amount}
              onChange={setAmount}
              min={1000}
              max={100000}
              step={1000}
              label="المبلغ المحدد للشحن"
              chips={[500, 1000, 5000]}
              campaignType="video"
            />

            {/* Fee notice line */}
            <div className="flex items-center justify-between text-xs px-1 text-[#A3A3A3]">
              <span>رسوم المعالجة التقنية (0%)</span>
              <span className="text-emerald-400 font-medium">مجاناً عند الشحن المباشر</span>
            </div>

            {/* Payment Method Selector */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-white/80">طريقة الدفع</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'applepay', label: 'Apple Pay' },
                  { id: 'mada', label: 'مدى Mada' },
                  { id: 'card', label: 'بطاقة ائتمان' },
                  { id: 'balance', label: 'تحويل بنكي' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMethod(m.id as any)}
                    className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all ${
                      method === m.id
                        ? 'bg-white text-black border-white shadow-[0_0_12px_rgba(255,255,255,0.4)]'
                        : 'bg-white/[0.04] text-white/70 border-white/[0.1] hover:bg-white/[0.08]'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* CTA */}
            <button
              type="submit"
              className="mt-2 w-full py-3.5 px-6 rounded-full bg-white text-black font-bold text-sm shadow-[0_0_24px_rgba(255,255,255,0.4)] hover:shadow-[0_0_32px_rgba(255,255,255,0.7)] hover:bg-neutral-100 transition-all flex items-center justify-center gap-2"
            >
              <span>دفع وشحن {amount.toLocaleString()} <RiyalSymbol /></span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <div className="flex flex-col items-center text-center gap-4 py-4">
            <div className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.8)]">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="flex flex-col gap-1.5">
              <h2 className="text-xl font-bold text-white font-heading">
                حملتك نشطة وبدت تستقبل مقاطع!
              </h2>
              <p className="text-xs text-[#A3A3A3] max-w-sm">
                تم شحن محفظة الحملة بنجاح بمبلغ {amount.toLocaleString()} <RiyalSymbol />. سيصل إشعار فوري لصناع المحتوى المهتمين بمجال براندك.
              </p>
            </div>

            <button
              onClick={handleClose}
              className="mt-3 w-full py-3 px-6 rounded-full bg-white text-black font-bold text-sm shadow-[0_0_20px_rgba(255,255,255,0.4)] hover:bg-neutral-100 transition-all"
            >
              الانتقال لإدارة الحملة
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FundCampaignModal;
