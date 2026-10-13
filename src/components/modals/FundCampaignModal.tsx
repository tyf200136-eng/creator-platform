import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import RiyalSymbol from '../RiyalSymbol';
import UnifiedBudgetInput from '../common/UnifiedBudgetInput';
import FieldError, { fieldBorder } from '../common/FieldError';
import { AcceptedPayments, PaymentBrandIcon } from '../common/PaymentBrandIcon';
import {
  onlyDigits,
  detectCardBrand,
  formatCardNumber,
  formatExpiry,
  cardNumberError,
  cardHolderError,
  expiryError,
  cvvError,
} from '../../utils/validators';
import { X, CheckCircle2, CreditCard, ArrowRight, ArrowLeft, ShieldCheck, Lock, Loader2, XCircle, RotateCcw } from 'lucide-react';

/** أقل مبلغ للشحن (نفس الحد الأدنى لميزانية الحملة) */
const MIN_FUND = 1000;
const MAX_FUND = 100000;
/** طول رمز التحقق من البنك */
const OTP_LENGTH = 4;
const MAX_OTP_ATTEMPTS = 3;

/**
 * وضع تجريبي (بدون بوابة دفع حقيقية):
 * - البطاقة 4000 0000 0000 0002 تنرفض من البنك (عشان نجرب شاشة الفشل)
 * - رمز التحقق 0000 غلط، وأي رمز ثاني من 4 أرقام صحيح
 */
const DEMO_DECLINED_CARD = '4000000000000002';
const DEMO_WRONG_OTP = '0000';

type Step = 'amount' | 'card' | 'verify' | 'processing' | 'success' | 'failed';
type Method = 'applepay' | 'card';

const BRAND_NAME: Record<string, string> = {
  mada: 'مدى',
  visa: 'فيزا',
  mastercard: 'ماستركارد',
  amex: 'أمريكان إكسبريس',
};

export const FundCampaignModal: React.FC = () => {
  const { isFundModalOpen, setIsFundModalOpen, fundBrandBalance } = useApp();

  const [step, setStep] = useState<Step>('amount');
  const [amount, setAmount] = useState<number>(MIN_FUND);
  const [method, setMethod] = useState<Method>('applepay');

  // بيانات البطاقة
  const [cardNumber, setCardNumber] = useState('');
  const [holder, setHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  // التحقق من البنك
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [otpError, setOtpError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [showErrors, setShowErrors] = useState(false);
  const [failReason, setFailReason] = useState('');
  const [reference, setReference] = useState('');

  const brand = detectCardBrand(cardNumber);
  const last4 = onlyDigits(cardNumber).slice(-4);
  const paidWith = method === 'applepay' ? 'Apple Pay' : `${BRAND_NAME[brand] ?? 'بطاقة'} •••• ${last4}`;

  // لما تنفتح خطوة التحقق، المؤشر يروح لأول خانة
  useEffect(() => {
    if (step === 'verify') otpRefs.current[0]?.focus();
  }, [step]);

  if (!isFundModalOpen) return null;

  // ------------------------------------------------------------------ أخطاء
  const amountError =
    !amount || amount < MIN_FUND
      ? `أقل مبلغ للشحن ${MIN_FUND.toLocaleString('en-US')} ريال`
      : amount > MAX_FUND
      ? `أعلى مبلغ للشحن في العملية الواحدة ${MAX_FUND.toLocaleString('en-US')} ريال`
      : undefined;

  const cardErrors = {
    number: cardNumberError(cardNumber),
    holder: cardHolderError(holder),
    expiry: expiryError(expiry),
    cvv: cvvError(cvv, brand),
  };
  const err = (k: keyof typeof cardErrors) => (showErrors ? cardErrors[k] : undefined);

  // ------------------------------------------------------------------ أفعال
  const resetAll = () => {
    setStep('amount');
    setAmount(MIN_FUND);
    setMethod('applepay');
    setCardNumber('');
    setHolder('');
    setExpiry('');
    setCvv('');
    setOtp(Array(OTP_LENGTH).fill(''));
    setOtpError('');
    setAttempts(0);
    setShowErrors(false);
    setFailReason('');
  };

  const handleClose = () => {
    if (step === 'processing') return; // ما نقفل والدفع شغّال
    setIsFundModalOpen(false);
    resetAll();
  };

  /** نحاكي رد بوابة الدفع */
  const processPayment = () => {
    setStep('processing');
    setTimeout(() => {
      if (method === 'card' && onlyDigits(cardNumber) === DEMO_DECLINED_CARD) {
        setFailReason('رفض البنك العملية. تأكد من الرصيد أو تواصل مع البنك، أو جرّب بطاقة ثانية.');
        setStep('failed');
        return;
      }
      setReference(`TX-${Date.now().toString().slice(-8)}`);
      fundBrandBalance(amount, paidWith);
      setStep('success');
    }, 1400);
  };

  const submitAmount = (e: React.FormEvent) => {
    e.preventDefault();
    if (amountError) {
      setShowErrors(true);
      return;
    }
    setShowErrors(false);
    if (method === 'applepay') processPayment();
    else setStep('card');
  };

  const submitCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.values(cardErrors).some(Boolean)) {
      setShowErrors(true);
      requestAnimationFrame(() =>
        document.querySelector('[data-field-error]')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      );
      return;
    }
    setShowErrors(false);
    setOtp(Array(OTP_LENGTH).fill(''));
    setOtpError('');
    setAttempts(0);
    setStep('verify');
  };

  const onOtpChange = (i: number, raw: string) => {
    const v = onlyDigits(raw).slice(-1);
    const next = [...otp];
    next[i] = v;
    setOtp(next);
    if (otpError) setOtpError('');
    if (v && i < OTP_LENGTH - 1) otpRefs.current[i + 1]?.focus();
  };

  const onOtpKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
  };

  const onOtpPaste = (e: React.ClipboardEvent) => {
    const d = onlyDigits(e.clipboardData.getData('text')).slice(0, OTP_LENGTH);
    if (!d) return;
    e.preventDefault();
    const next = Array(OTP_LENGTH).fill('').map((_, i) => d[i] ?? '');
    setOtp(next);
    otpRefs.current[Math.min(d.length, OTP_LENGTH - 1)]?.focus();
  };

  const submitOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < OTP_LENGTH) {
      setOtpError(`اكتب الرمز كامل (${OTP_LENGTH} أرقام)`);
      return;
    }
    if (code === DEMO_WRONG_OTP) {
      const used = attempts + 1;
      setAttempts(used);
      if (used >= MAX_OTP_ATTEMPTS) {
        setFailReason('تجاوزت عدد المحاولات المسموحة لرمز التحقق، فتم إلغاء العملية ولم يُخصم أي مبلغ.');
        setStep('failed');
        return;
      }
      setOtp(Array(OTP_LENGTH).fill(''));
      setOtpError(`الرمز غير صحيح. باقي لك ${MAX_OTP_ATTEMPTS - used} ${MAX_OTP_ATTEMPTS - used === 1 ? 'محاولة' : 'محاولات'}`);
      otpRefs.current[0]?.focus();
      return;
    }
    processPayment();
  };

  // ------------------------------------------------------------------ أجزاء مشتركة
  const inputBase = 'w-full h-11 px-4 rounded-xl bg-white/[0.05] border text-sm text-white';
  const primaryBtn =
    'w-full py-3.5 px-6 rounded-full bg-white text-black font-bold text-sm shadow-[0_0_24px_rgba(255,255,255,0.4)] hover:bg-neutral-100 transition-all flex items-center justify-center gap-2 cursor-pointer';
  const secondaryBtn =
    'w-full py-3 px-6 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.12] text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer';

  const AmountSummary = () => (
    <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs">
      <span className="text-white/60">المبلغ المطلوب دفعه</span>
      <span className="font-mono font-bold text-white text-sm flex items-center gap-1">
        {amount.toLocaleString('en-US')} <RiyalSymbol />
      </span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-[28px] bg-[#121212] border border-white/[0.18] p-7 text-right shadow-[0_24px_70px_rgba(0,0,0,0.9),0_0_40px_rgba(255,255,255,0.08)]">
        {step !== 'processing' && (
          <button
            onClick={handleClose}
            aria-label="إغلاق"
            className="absolute top-6 left-6 w-9 h-9 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.12] text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* ============================== 1) المبلغ وطريقة الدفع */}
        {step === 'amount' && (
          <form onSubmit={submitAmount} className="flex flex-col gap-5" noValidate>
            <div>
              <span className="text-xs font-semibold text-white/50">شحن الرصيد</span>
              <h2 className="text-xl font-bold text-white font-heading mt-0.5">شحن محفظة الحملات</h2>
              <p className="text-xs text-[#A3A3A3]">يتم الصرف فقط عند تحقيق مشاهدات حقيقية مؤكدة من صناع المحتوى</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <UnifiedBudgetInput
                value={amount}
                onChange={setAmount}
                min={MIN_FUND}
                max={MAX_FUND}
                step={1000}
                label={`المبلغ المحدد للشحن (الحد الأدنى ${MIN_FUND.toLocaleString('en-US')} ﷼)`}
                chips={[1000, 5000, 10000]}
                campaignType="video"
              />
              <FieldError message={showErrors ? amountError : undefined} />
            </div>

            <div className="flex items-center justify-between text-xs px-1 text-[#A3A3A3]">
              <span>رسوم المعالجة</span>
              <span className="text-emerald-400 font-medium">مجاناً</span>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-white/80">طريقة الدفع</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'applepay' as const, label: 'Apple Pay', icon: <PaymentBrandIcon brand="applepay" size={30} /> },
                  { id: 'card' as const, label: 'بطاقة ائتمانية', icon: <CreditCard className="w-4 h-4" /> },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMethod(m.id)}
                    aria-pressed={method === m.id}
                    className={`h-12 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      method === m.id
                        ? 'bg-white text-black border-white shadow-[0_0_12px_rgba(255,255,255,0.4)]'
                        : 'bg-white/[0.04] text-white/70 border-white/[0.1] hover:bg-white/[0.08]'
                    }`}
                  >
                    {m.icon}
                    {m.id === 'card' && <span>{m.label}</span>}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-1.5 mt-1">
                <span className="text-[11px] text-white/45">طرق الدفع المقبولة</span>
                <AcceptedPayments />
              </div>
            </div>

            <button type="submit" className={`mt-1 ${primaryBtn}`}>
              {method === 'applepay' ? (
                <>
                  <span>ادفع {amount.toLocaleString('en-US')}</span> <RiyalSymbol /> <span>عبر</span>
                  <PaymentBrandIcon brand="applepay" size={30} />
                </>
              ) : (
                <>
                  <span>متابعة لإدخال بيانات البطاقة</span>
                  <ArrowLeft className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* ============================== 2) بيانات البطاقة */}
        {step === 'card' && (
          <form onSubmit={submitCard} className="flex flex-col gap-4" noValidate>
            <div>
              <span className="text-xs font-semibold text-white/50">الدفع بالبطاقة</span>
              <h2 className="text-xl font-bold text-white font-heading mt-0.5">بيانات البطاقة</h2>
            </div>

            <AmountSummary />

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-white/80">رقم البطاقة</label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="cc-number"
                  dir="ltr"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  placeholder="0000 0000 0000 0000"
                  className={`${inputBase} ${fieldBorder(err('number'))} font-mono tracking-wider text-left pl-16`}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/80">
                  {brand !== 'unknown' ? (
                    <PaymentBrandIcon brand={brand} size={24} />
                  ) : (
                    <CreditCard className="w-4 h-4 text-white/40" />
                  )}
                </span>
              </div>
              <FieldError message={err('number')} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-white/80">اسم حامل البطاقة</label>
              <input
                type="text"
                autoComplete="cc-name"
                dir="ltr"
                value={holder}
                onChange={(e) => setHolder(e.target.value)}
                placeholder="NAME ON CARD"
                className={`${inputBase} ${fieldBorder(err('holder'))} text-left uppercase`}
              />
              <FieldError message={err('holder')} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-white/80">تاريخ الانتهاء</label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="cc-exp"
                  dir="ltr"
                  value={expiry}
                  onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                  placeholder="MM/YY"
                  className={`${inputBase} ${fieldBorder(err('expiry'))} font-mono text-left`}
                />
                <FieldError message={err('expiry')} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-white/80">رمز الأمان (CVV)</label>
                <input
                  type="password"
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  dir="ltr"
                  value={cvv}
                  onChange={(e) => setCvv(onlyDigits(e.target.value).slice(0, brand === 'amex' ? 4 : 3))}
                  placeholder={brand === 'amex' ? '••••' : '•••'}
                  className={`${inputBase} ${fieldBorder(err('cvv'))} font-mono text-left`}
                />
                <FieldError message={err('cvv')} />
              </div>
            </div>

            <p className="flex items-center gap-1.5 text-[11px] text-white/45">
              <Lock className="w-3 h-3" />
              بيانات البطاقة مشفّرة وما تنحفظ عندنا
            </p>

            <button type="submit" className={primaryBtn}>
              <span>ادفع {amount.toLocaleString('en-US')}</span> <RiyalSymbol />
            </button>
            <button type="button" onClick={() => { setShowErrors(false); setStep('amount'); }} className={secondaryBtn}>
              <ArrowRight className="w-4 h-4" />
              رجوع
            </button>
          </form>
        )}

        {/* ============================== 3) التحقق من البنك */}
        {step === 'verify' && (
          <form onSubmit={submitOtp} className="flex flex-col gap-5 items-center text-center" noValidate>
            <div className="w-14 h-14 rounded-2xl bg-white/[0.08] border border-white/[0.15] flex items-center justify-center">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-bold text-white font-heading">تحقق من البنك</h2>
              <p className="text-xs text-[#A3A3A3] max-w-xs">
                أرسل البنك رمز تحقق إلى الجوال المسجل على البطاقة {paidWith}
              </p>
            </div>

            <AmountSummary />

            <div className="flex flex-col gap-2 items-center w-full">
              <div className="flex gap-2 justify-center" dir="ltr" onPaste={onOtpPaste}>
                {otp.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      otpRefs.current[i] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    autoComplete={i === 0 ? 'one-time-code' : 'off'}
                    maxLength={1}
                    value={d}
                    onChange={(e) => onOtpChange(i, e.target.value)}
                    onKeyDown={(e) => onOtpKeyDown(i, e)}
                    aria-label={`الرقم ${i + 1}`}
                    className={`w-12 h-14 text-center rounded-xl bg-white/[0.05] border ${fieldBorder(otpError)} text-xl font-bold font-mono text-white`}
                  />
                ))}
              </div>
              <FieldError message={otpError} />
            </div>

            <button type="submit" className={primaryBtn}>
              تأكيد الدفع
            </button>
            <button type="button" onClick={() => setStep('card')} className={secondaryBtn}>
              <ArrowRight className="w-4 h-4" />
              تعديل بيانات البطاقة
            </button>
          </form>
        )}

        {/* ============================== 4) جاري الدفع */}
        {step === 'processing' && (
          <div className="flex flex-col items-center text-center gap-4 py-10" role="status" aria-live="polite">
            <Loader2 className="w-10 h-10 text-white animate-spin" />
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-bold text-white font-heading">جاري تأكيد الدفع...</h2>
              <p className="text-xs text-[#A3A3A3]">لا تقفل الصفحة</p>
            </div>
          </div>
        )}

        {/* ============================== 5) تم الدفع */}
        {step === 'success' && (
          <div className="flex flex-col items-center text-center gap-4 py-4">
            <div className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.8)]">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div className="flex flex-col gap-1.5">
              <h2 className="text-xl font-bold text-white font-heading">تم الدفع بنجاح</h2>
              <p className="text-xs text-[#A3A3A3] max-w-sm">انضاف المبلغ لرصيدك، وتقدر تستخدمه في حملاتك.</p>
            </div>

            <div className="w-full flex flex-col gap-2 p-4 rounded-2xl bg-white/[0.04] border border-white/[0.1] text-xs">
              <div className="flex justify-between">
                <span className="text-white/60">المبلغ</span>
                <span className="font-mono font-bold text-white flex items-center gap-1">
                  {amount.toLocaleString('en-US')} <RiyalSymbol />
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">طريقة الدفع</span>
                <span className="text-white">{paidWith}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">رقم العملية</span>
                <span className="font-mono text-white" dir="ltr">{reference}</span>
              </div>
            </div>

            <button onClick={handleClose} className={`mt-1 ${primaryBtn}`}>
              تم
            </button>
          </div>
        )}

        {/* ============================== 6) فشل الدفع */}
        {step === 'failed' && (
          <div className="flex flex-col items-center text-center gap-4 py-4">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/40 text-red-400 flex items-center justify-center">
              <XCircle className="w-9 h-9" />
            </div>
            <div className="flex flex-col gap-1.5">
              <h2 className="text-xl font-bold text-white font-heading">ما تمت عملية الدفع</h2>
              <p className="text-xs text-[#A3A3A3] max-w-sm">{failReason}</p>
            </div>
            <button
              onClick={() => {
                setOtp(Array(OTP_LENGTH).fill(''));
                setOtpError('');
                setAttempts(0);
                setStep('card');
              }}
              className={`mt-1 ${primaryBtn}`}
            >
              <RotateCcw className="w-4 h-4" />
              حاول مرة ثانية
            </button>
            <button onClick={() => setStep('amount')} className={secondaryBtn}>
              غيّر طريقة الدفع
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FundCampaignModal;