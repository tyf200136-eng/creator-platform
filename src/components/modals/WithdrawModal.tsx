import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import RiyalSymbol from '../RiyalSymbol';
import { X, CheckCircle2, Building, Smartphone, CreditCard, ArrowRight } from 'lucide-react';

export const WithdrawModal: React.FC = () => {
  const {
    isWithdrawModalOpen,
    setIsWithdrawModalOpen,
    creatorProfile,
    withdrawFunds,
  } = useApp();

  const [amount, setAmount] = useState<string>('500');
  const [method, setMethod] = useState<'iban' | 'stcpay' | 'applepay'>('iban');
  const [iban, setIban] = useState('SA03 8000 0000 6080 1016 7519');
  const [phone, setPhone] = useState('0501234567');
  const [step, setStep] = useState<'form' | 'success'>('form');

  if (!isWithdrawModalOpen) return null;

  const numAmount = parseFloat(amount) || 0;
  const maxBalance = creatorProfile.balance;

  const handleMax = () => {
    setAmount(maxBalance.toString());
  };

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    if (numAmount <= 0 || numAmount > maxBalance) return;

    let methodName = '';
    if (method === 'iban') methodName = `آيبان (${iban.slice(-4)})`;
    else if (method === 'stcpay') methodName = `STC Pay (${phone})`;
    else methodName = 'Apple Pay';

    withdrawFunds(numAmount, methodName);
    setStep('success');
  };

  const handleClose = () => {
    setIsWithdrawModalOpen(false);
    setStep('form');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-[28px] bg-[#121212] border border-white/[0.18] p-7 text-right shadow-[0_24px_70px_rgba(0,0,0,0.9),0_0_40px_rgba(255,255,255,0.08)]">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-6 left-6 w-9 h-9 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.12] text-white flex items-center justify-center transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {step === 'form' ? (
          <form onSubmit={handleWithdraw} className="flex flex-col gap-5">
            <div>
              <h2 className="text-xl font-bold text-white font-heading">سحب الأرباح المتاحة</h2>
              <div className="flex items-center gap-1.5 text-xs text-[#A3A3A3] mt-1">
                <span>الرصيد المتاح للسحب:</span>
                <span className="font-bold text-white font-mono">{maxBalance.toLocaleString()}</span>
                <RiyalSymbol className="w-3 h-3 text-white inline-block" />
              </div>
            </div>

            {/* Amount input + Max button */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-white/80">المبلغ المراد سحبه</label>
              <div className="relative flex items-center">
                <input
                  type="number"
                  min="50"
                  max={maxBalance}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full h-12 pr-4 pl-24 rounded-xl bg-white/[0.05] border border-white/[0.14] text-base font-bold text-white font-mono placeholder-white/30 focus:outline-none focus:border-white/40 focus:bg-white/[0.08] transition-all"
                  required
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <RiyalSymbol className="w-3.5 h-3.5 text-white/80" />
                  <button
                    type="button"
                    onClick={handleMax}
                    className="px-2 py-1 rounded-md bg-white/[0.1] hover:bg-white/[0.2] border border-white/[0.16] text-[10px] font-bold text-white transition-colors"
                  >
                    الكل
                  </button>
                </div>
              </div>
            </div>

            {/* Methods Selection */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-white/80">طريقة التحويل</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setMethod('iban')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-center transition-all ${
                    method === 'iban'
                      ? 'bg-white text-black border-white shadow-[0_0_12px_rgba(255,255,255,0.4)]'
                      : 'bg-white/[0.04] text-white/70 border-white/[0.1] hover:bg-white/[0.08]'
                  }`}
                >
                  <Building className="w-4 h-4" />
                  <span className="text-xs font-bold">آيبان سعودي</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('stcpay')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-center transition-all ${
                    method === 'stcpay'
                      ? 'bg-white text-black border-white shadow-[0_0_12px_rgba(255,255,255,0.4)]'
                      : 'bg-white/[0.04] text-white/70 border-white/[0.1] hover:bg-white/[0.08]'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span className="text-xs font-bold">STC Pay</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('applepay')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-center transition-all ${
                    method === 'applepay'
                      ? 'bg-white text-black border-white shadow-[0_0_12px_rgba(255,255,255,0.4)]'
                      : 'bg-white/[0.04] text-white/70 border-white/[0.1] hover:bg-white/[0.08]'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span className="text-xs font-bold">Apple Pay</span>
                </button>
              </div>
            </div>

            {/* Method Details Input */}
            {method === 'iban' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-white/80">رقم الآيبان (IBAN)</label>
                <input
                  type="text"
                  value={iban}
                  onChange={(e) => setIban(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-white/[0.05] border border-white/[0.14] text-xs text-white font-mono"
                  dir="ltr"
                  required
                />
              </div>
            )}

            {method === 'stcpay' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-white/80">رقم جوال المحفظة</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-white/[0.05] border border-white/[0.14] text-xs text-white font-mono"
                  dir="ltr"
                  required
                />
              </div>
            )}

            <button
              type="submit"
              disabled={numAmount <= 0 || numAmount > maxBalance}
              className="mt-2 w-full py-3 px-6 rounded-full bg-white text-black font-bold text-sm shadow-[0_0_20px_rgba(255,255,255,0.35)] hover:shadow-[0_0_28px_rgba(255,255,255,0.65)] hover:bg-neutral-100 disabled:opacity-40 transition-all text-center flex items-center justify-center gap-2"
            >
              <span>تأكيد سحب {numAmount ? numAmount.toLocaleString() : 0} <RiyalSymbol /></span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <div className="flex flex-col items-center text-center gap-4 py-3">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_24px_rgba(16,185,129,0.3)]">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-bold text-white font-heading">تمت معالجة طلب السحب!</h2>
              <p className="text-xs text-[#A3A3A3]">
                تم تحويل مبلغ {numAmount.toLocaleString()} <RiyalSymbol /> إلى حسابك. ستصلك رسالة تأكيد بنكية خلال دقائق.
              </p>
            </div>

            <button
              onClick={handleClose}
              className="mt-3 w-full py-3 px-6 rounded-full bg-white text-black font-bold text-sm shadow-[0_0_20px_rgba(255,255,255,0.35)] hover:bg-neutral-100 transition-all"
            >
              إغلاق
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WithdrawModal;
