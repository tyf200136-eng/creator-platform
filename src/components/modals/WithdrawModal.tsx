import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import RiyalSymbol from '../RiyalSymbol';
import FieldError, { fieldBorder } from '../common/FieldError';
import { onlyDigits, normalizeIban, formatIban, ibanError } from '../../utils/validators';
import { X, CheckCircle2, ShieldCheck, ArrowRight, ArrowLeft, Loader2, Clock, Pencil, Wallet } from 'lucide-react';

/** أقل مبلغ للسحب */
export const MIN_WITHDRAW = 100;
/** نسبة رسوم المنصة على السحب */
export const WITHDRAW_FEE_RATE = 0.1;
const OTP_LENGTH = 4;
const MAX_OTP_ATTEMPTS = 3;
const RESEND_SECONDS = 60;

/** وضع تجريبي: الرمز 0000 غلط، وأي رمز ثاني من 4 أرقام صحيح */
const DEMO_WRONG_OTP = '0000';

/** البنوك السعودية ورمز كل بنك داخل الآيبان (الخانة 5 و 6) */
const SAUDI_BANKS: { code: string; name: string }[] = [
  { code: '80', name: 'مصرف الراجحي' },
  { code: '10', name: 'البنك الأهلي السعودي' },
  { code: '20', name: 'بنك الرياض' },
  { code: '05', name: 'مصرف الإنماء' },
  { code: '45', name: 'البنك السعودي الأول (ساب)' },
  { code: '55', name: 'البنك السعودي الفرنسي' },
  { code: '30', name: 'البنك العربي الوطني' },
  { code: '15', name: 'بنك البلاد' },
  { code: '60', name: 'بنك الجزيرة' },
  { code: '65', name: 'البنك السعودي للاستثمار' },
];

type Step = 'blocked' | 'verify' | 'details' | 'amount' | 'review' | 'processing' | 'submitted';

const round2 = (n: number) => Math.round(n * 100) / 100;
const money = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

export const WithdrawModal: React.FC = () => {
  const { isWithdrawModalOpen, setIsWithdrawModalOpen, creatorProfile, withdrawFunds } = useApp();
  const balance = creatorProfile.balance;

  const [step, setStep] = useState<Step>('verify');

  // التحقق بالجوال
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [otpError, setOtpError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [resendIn, setResendIn] = useState(RESEND_SECONDS);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // بيانات الحساب البنكي
  const [holderName, setHolderName] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [iban, setIban] = useState('');
  const [accountNumber, setAccountNumber] = useState('');

  // المبلغ
  const [amountText, setAmountText] = useState('');

  const [showErrors, setShowErrors] = useState(false);

  // أول ما تنفتح النافذة: لو الرصيد أقل من الحد الأدنى نوقفه، وغير كذا نبدأ بالتحقق
  useEffect(() => {
    if (!isWithdrawModalOpen) return;
    setStep(balance < MIN_WITHDRAW ? 'blocked' : 'verify');
    setResendIn(RESEND_SECONDS);
  }, [isWithdrawModalOpen]);

  // عداد إعادة إرسال الرمز
  useEffect(() => {
    if (step !== 'verify' || resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [step, resendIn]);

  useEffect(() => {
    if (step === 'verify') otpRefs.current[0]?.focus();
  }, [step]);

  if (!isWithdrawModalOpen) return null;

  // ------------------------------------------------------------------ حسابات
  const amount = Number(onlyDigits(amountText.split('.')[0] ?? '')) || 0;
  const fee = round2(amount * WITHDRAW_FEE_RATE);
  const net = round2(amount - fee);
  const bank = SAUDI_BANKS.find((b) => b.code === bankCode);
  const ibanClean = normalizeIban(iban);
  const maskedPhone = (() => {
    const d = onlyDigits(creatorProfile.phone || '');
    return d.length >= 4 ? `•••• ${d.slice(-4)}` : 'جوالك المسجل';
  })();

  // ------------------------------------------------------------------ أخطاء
  const detailsErrors = (() => {
    const e: Record<string, string | undefined> = {};
    const name = holderName.trim();
    if (!name) e.name = 'اكتب اسم صاحب الحساب كما هو في البنك';
    else if (name.split(/\s+/).length < 2) e.name = 'اكتب الاسم الثلاثي أو الاسم الأول والأخير على الأقل';
    else if (!/^[A-Za-z؀-ۿ .'-]+$/.test(name)) e.name = 'الاسم لازم يكون حروف بس';

    if (!bankCode) e.bank = 'اختر البنك';

    e.iban = ibanError(iban);
    if (!e.iban && bankCode && ibanClean.slice(4, 6) !== bankCode)
      e.iban = `الآيبان هذا مو تابع لـ ${bank?.name}. تأكد من البنك أو الآيبان`;

    const acct = onlyDigits(accountNumber);
    if (!acct) e.account = 'اكتب رقم الحساب';
    else if (acct.length < 8 || acct.length > 18) e.account = 'رقم الحساب لازم يكون من 8 إلى 18 رقم';
    else if (!e.iban && !ibanClean.slice(6).replace(/^0+/, '').endsWith(acct.replace(/^0+/, '')))
      e.account = 'رقم الحساب ما يطابق الآيبان، تأكد منهم';
    return e;
  })();

  const amountError = !amount
    ? 'اكتب المبلغ اللي تبي تسحبه'
    : amount < MIN_WITHDRAW
    ? `أقل مبلغ للسحب ${MIN_WITHDRAW} ريال`
    : amount > balance
    ? `المبلغ أكبر من رصيدك المتاح (${money(balance)} ريال)`
    : undefined;

  const dErr = (k: string) => (showErrors ? detailsErrors[k] : undefined);

  const scrollToError = () =>
    requestAnimationFrame(() =>
      document.querySelector('[data-field-error]')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    );

  // ------------------------------------------------------------------ أفعال
  const resetAll = () => {
    setStep('verify');
    setOtp(Array(OTP_LENGTH).fill(''));
    setOtpError('');
    setAttempts(0);
    setHolderName('');
    setBankCode('');
    setIban('');
    setAccountNumber('');
    setAmountText('');
    setShowErrors(false);
  };

  const handleClose = () => {
    if (step === 'processing') return;
    setIsWithdrawModalOpen(false);
    resetAll();
  };

  const goTo = (s: Step) => {
    setShowErrors(false);
    setStep(s);
  };

  // التحقق
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
    setOtp(Array(OTP_LENGTH).fill('').map((_, i) => d[i] ?? ''));
    otpRefs.current[Math.min(d.length, OTP_LENGTH - 1)]?.focus();
  };
  const resendCode = () => {
    setOtp(Array(OTP_LENGTH).fill(''));
    setOtpError('');
    setAttempts(0);
    setResendIn(RESEND_SECONDS);
    otpRefs.current[0]?.focus();
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
      setOtp(Array(OTP_LENGTH).fill(''));
      otpRefs.current[0]?.focus();
      setOtpError(
        used >= MAX_OTP_ATTEMPTS
          ? 'تجاوزت عدد المحاولات. اطلب رمز جديد'
          : `الرمز غير صحيح. باقي لك ${MAX_OTP_ATTEMPTS - used} ${MAX_OTP_ATTEMPTS - used === 1 ? 'محاولة' : 'محاولات'}`
      );
      return;
    }
    goTo('details');
  };
  const otpLocked = attempts >= MAX_OTP_ATTEMPTS;

  // البيانات
  const onIbanChange = (v: string) => {
    const formatted = formatIban(v);
    setIban(formatted);
    // نختار البنك تلقائياً من الآيبان لو ما اختاره
    const code = normalizeIban(v).slice(4, 6);
    if (!bankCode && SAUDI_BANKS.some((b) => b.code === code)) setBankCode(code);
  };
  const submitDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.values(detailsErrors).some(Boolean)) {
      setShowErrors(true);
      scrollToError();
      return;
    }
    goTo('amount');
  };

  // المبلغ
  const submitAmount = (e: React.FormEvent) => {
    e.preventDefault();
    if (amountError) {
      setShowErrors(true);
      return;
    }
    goTo('review');
  };

  // التأكيد
  const confirmWithdraw = () => {
    setStep('processing');
    setTimeout(() => {
      withdrawFunds(amount, `${bank?.name ?? 'تحويل بنكي'} •••• ${ibanClean.slice(-4)}`);
      setStep('submitted');
    }, 1200);
  };

  // ------------------------------------------------------------------ أجزاء مشتركة
  const inputBase = 'w-full h-11 px-4 rounded-xl bg-white/[0.05] border text-sm text-white';
  const primaryBtn =
    'w-full py-3.5 px-6 rounded-full bg-white text-black font-bold text-sm shadow-[0_0_24px_rgba(255,255,255,0.4)] hover:bg-neutral-100 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed';
  const secondaryBtn =
    'w-full py-3 px-6 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.12] text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer';

  const stepsOrder: Step[] = ['verify', 'details', 'amount', 'review'];
  const stepIndex = stepsOrder.indexOf(step);
  const Progress = () =>
    stepIndex >= 0 ? (
      <div className="flex items-center gap-1.5 ml-12" aria-label={`الخطوة ${stepIndex + 1} من ${stepsOrder.length}`}>
        {stepsOrder.map((s, i) => (
          <span key={s} className={`h-1 flex-1 rounded-full ${i <= stepIndex ? 'bg-white' : 'bg-white/[0.12]'}`} />
        ))}
      </div>
    ) : null;

  const Row = ({ label, children, strong }: { label: string; children: React.ReactNode; strong?: boolean }) => (
    <div className={`flex items-center justify-between gap-3 ${strong ? 'pt-2 mt-1 border-t border-white/[0.1]' : ''}`}>
      <span className={strong ? 'text-white font-bold' : 'text-white/60'}>{label}</span>
      <span className={`text-left ${strong ? 'text-white font-bold text-sm' : 'text-white'}`}>{children}</span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-md max-h-[92vh] overflow-y-auto rounded-[28px] bg-[#121212] border border-white/[0.18] p-7 text-right shadow-[0_24px_70px_rgba(0,0,0,0.9),0_0_40px_rgba(255,255,255,0.08)]">
        {step !== 'processing' && (
          <button
            onClick={handleClose}
            aria-label="إغلاق"
            className="absolute top-6 left-6 w-9 h-9 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.12] text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* ============================== رصيد أقل من الحد الأدنى */}
        {step === 'blocked' && (
          <div className="flex flex-col items-center text-center gap-4 py-4">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.08] border border-white/[0.15] flex items-center justify-center">
              <Wallet className="w-7 h-7 text-white" />
            </div>
            <div className="flex flex-col gap-1.5">
              <h2 className="text-xl font-bold text-white font-heading">رصيدك أقل من الحد الأدنى للسحب</h2>
              <p className="text-xs text-[#A3A3A3] max-w-xs">
                رصيدك المتاح {money(balance)} ريال، وأقل مبلغ للسحب {MIN_WITHDRAW} ريال. كمّل في الحملات وتقدر تسحب أول ما توصل.
              </p>
            </div>
            <button onClick={handleClose} className={`mt-1 ${primaryBtn}`}>
              تمام
            </button>
          </div>
        )}

        {/* ============================== 1) التحقق بالجوال */}
        {step === 'verify' && (
          <form onSubmit={submitOtp} className="flex flex-col gap-5" noValidate>
            <Progress />
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-white/[0.08] border border-white/[0.15] flex items-center justify-center">
                <ShieldCheck className="w-7 h-7 text-white" />
              </div>
              <div className="flex flex-col gap-1">
                <h2 className="text-xl font-bold text-white font-heading">تحقق من هويتك</h2>
                <p className="text-xs text-[#A3A3A3] max-w-xs">
                  لحماية أرباحك، أرسلنا رمز تحقق إلى جوالك{' '}
                  <span className="font-mono text-white" dir="ltr">{maskedPhone}</span>
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 items-center">
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
                    disabled={otpLocked}
                    onChange={(e) => onOtpChange(i, e.target.value)}
                    onKeyDown={(e) => onOtpKeyDown(i, e)}
                    aria-label={`الرقم ${i + 1}`}
                    className={`w-12 h-14 text-center rounded-xl bg-white/[0.05] border ${fieldBorder(otpError)} text-xl font-bold font-mono text-white disabled:opacity-40`}
                  />
                ))}
              </div>
              <FieldError message={otpError} />
              <div className="text-[11px] text-white/50">
                {resendIn > 0 ? (
                  <span>
                    تقدر تطلب رمز جديد بعد <span className="font-mono">{resendIn}</span> ثانية
                  </span>
                ) : (
                  <button type="button" onClick={resendCode} className="text-white underline underline-offset-4 cursor-pointer">
                    أرسل رمز جديد
                  </button>
                )}
              </div>
            </div>

            <button type="submit" disabled={otpLocked} className={primaryBtn}>
              تحقق
            </button>
          </form>
        )}

        {/* ============================== 2) بيانات الحساب البنكي */}
        {step === 'details' && (
          <form onSubmit={submitDetails} className="flex flex-col gap-4" noValidate>
            <Progress />
            <div>
              <span className="text-xs font-semibold text-white/50">سحب الأرباح</span>
              <h2 className="text-xl font-bold text-white font-heading mt-0.5">بيانات الحساب البنكي</h2>
              <p className="text-xs text-[#A3A3A3]">لازم يكون الحساب باسمك أنت</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-white/80">اسم صاحب الحساب</label>
              <input
                type="text"
                autoComplete="name"
                value={holderName}
                onChange={(e) => setHolderName(e.target.value)}
                placeholder="كما هو مكتوب في البنك"
                className={`${inputBase} ${fieldBorder(dErr('name'))}`}
              />
              <FieldError message={dErr('name')} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-white/80">البنك</label>
              <select
                value={bankCode}
                onChange={(e) => setBankCode(e.target.value)}
                className={`${inputBase} ${fieldBorder(dErr('bank'))} ${bankCode ? '' : 'text-white/30'} appearance-none cursor-pointer`}
              >
                <option value="" disabled>
                  اختر البنك
                </option>
                {SAUDI_BANKS.map((b) => (
                  <option key={b.code} value={b.code} className="bg-[#121212] text-white">
                    {b.name}
                  </option>
                ))}
              </select>
              <FieldError message={dErr('bank')} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-white/80">رقم الآيبان (IBAN)</label>
              <input
                type="text"
                dir="ltr"
                autoComplete="off"
                value={iban}
                onChange={(e) => onIbanChange(e.target.value)}
                placeholder="SA00 0000 0000 0000 0000 0000"
                className={`${inputBase} ${fieldBorder(dErr('iban'))} font-mono tracking-wide text-left uppercase`}
              />
              <FieldError message={dErr('iban')} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-white/80">رقم الحساب</label>
              <input
                type="text"
                dir="ltr"
                inputMode="numeric"
                autoComplete="off"
                value={accountNumber}
                onChange={(e) => setAccountNumber(onlyDigits(e.target.value).slice(0, 18))}
                placeholder="رقم الحساب البنكي"
                className={`${inputBase} ${fieldBorder(dErr('account'))} font-mono text-left`}
              />
              <FieldError message={dErr('account')} />
            </div>

            <button type="submit" className={primaryBtn}>
              <span>متابعة</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* ============================== 3) المبلغ */}
        {step === 'amount' && (
          <form onSubmit={submitAmount} className="flex flex-col gap-4" noValidate>
            <Progress />
            <div>
              <span className="text-xs font-semibold text-white/50">سحب الأرباح</span>
              <h2 className="text-xl font-bold text-white font-heading mt-0.5">كم تبي تسحب؟</h2>
              <p className="text-xs text-[#A3A3A3] flex items-center gap-1">
                رصيدك المتاح: <span className="font-mono font-bold text-white">{money(balance)}</span> <RiyalSymbol />
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  dir="ltr"
                  value={amountText}
                  onChange={(e) => setAmountText(onlyDigits(e.target.value).slice(0, 7))}
                  placeholder={`${MIN_WITHDRAW}`}
                  className={`w-full h-14 pl-12 pr-4 rounded-xl bg-white/[0.05] border ${fieldBorder(
                    showErrors ? amountError : undefined
                  )} text-2xl font-bold font-mono text-white text-left`}
                />
                <RiyalSymbol className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70" />
              </div>
              <FieldError message={showErrors ? amountError : undefined} />
              <div className="flex gap-2">
                {[0.25, 0.5, 1].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setAmountText(String(Math.floor(balance * p)))}
                    className="flex-1 h-8 rounded-lg bg-white/[0.05] border border-white/[0.1] text-xs text-white/80 hover:bg-white/[0.1] cursor-pointer"
                  >
                    {p === 1 ? 'الرصيد كامل' : `${p * 100}٪`}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2 p-4 rounded-2xl bg-white/[0.04] border border-white/[0.1] text-xs">
              <Row label="المبلغ المطلوب">
                <span className="font-mono">{money(amount)}</span> <RiyalSymbol />
              </Row>
              <Row label={`رسوم المنصة (${WITHDRAW_FEE_RATE * 100}٪)`}>
                <span className="font-mono">- {money(fee)}</span> <RiyalSymbol />
              </Row>
              <Row label="الصافي اللي بيوصلك" strong>
                <span className="font-mono">{money(net)}</span> <RiyalSymbol />
              </Row>
            </div>

            <button type="submit" className={primaryBtn}>
              <span>مراجعة الطلب</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button type="button" onClick={() => goTo('details')} className={secondaryBtn}>
              <ArrowRight className="w-4 h-4" />
              رجوع
            </button>
          </form>
        )}

        {/* ============================== 4) مراجعة الطلب */}
        {step === 'review' && (
          <div className="flex flex-col gap-4">
            <Progress />
            <div>
              <span className="text-xs font-semibold text-white/50">سحب الأرباح</span>
              <h2 className="text-xl font-bold text-white font-heading mt-0.5">راجع طلبك</h2>
              <p className="text-xs text-[#A3A3A3]">تأكد من البيانات قبل التأكيد، ما تقدر تعدّل الطلب بعد إرساله</p>
            </div>

            <div className="flex flex-col gap-2 p-4 rounded-2xl bg-white/[0.04] border border-white/[0.1] text-xs">
              <Row label="المبلغ المطلوب">
                <span className="font-mono">{money(amount)}</span> <RiyalSymbol />
              </Row>
              <Row label={`رسوم المنصة (${WITHDRAW_FEE_RATE * 100}٪)`}>
                <span className="font-mono">- {money(fee)}</span> <RiyalSymbol />
              </Row>
              <Row label="الصافي اللي بيوصلك" strong>
                <span className="font-mono">{money(net)}</span> <RiyalSymbol />
              </Row>
            </div>

            <div className="flex flex-col gap-2 p-4 rounded-2xl bg-white/[0.04] border border-white/[0.1] text-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-white/80 font-semibold">يتحول إلى</span>
                <button
                  type="button"
                  onClick={() => goTo('details')}
                  className="flex items-center gap-1 text-[11px] text-white/60 hover:text-white cursor-pointer"
                >
                  <Pencil className="w-3 h-3" /> تعديل
                </button>
              </div>
              <Row label="صاحب الحساب">{holderName.trim()}</Row>
              <Row label="البنك">{bank?.name}</Row>
              <Row label="الآيبان">
                <span className="font-mono" dir="ltr">
                  SA•• •••• •••• {ibanClean.slice(-4)}
                </span>
              </Row>
              <Row label="المدة المتوقعة">من 1 إلى 3 أيام عمل</Row>
            </div>

            <button type="button" onClick={confirmWithdraw} className={primaryBtn}>
              تأكيد السحب
            </button>
            <button type="button" onClick={() => goTo('amount')} className={secondaryBtn}>
              <ArrowRight className="w-4 h-4" />
              تعديل المبلغ
            </button>
          </div>
        )}

        {/* ============================== جاري الإرسال */}
        {step === 'processing' && (
          <div className="flex flex-col items-center text-center gap-4 py-10" role="status" aria-live="polite">
            <Loader2 className="w-10 h-10 text-white animate-spin" />
            <h2 className="text-lg font-bold text-white font-heading">جاري إرسال طلب السحب...</h2>
          </div>
        )}

        {/* ============================== تم استلام الطلب */}
        {step === 'submitted' && (
          <div className="flex flex-col items-center text-center gap-4 py-4">
            <div className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.8)]">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div className="flex flex-col gap-1.5">
              <h2 className="text-xl font-bold text-white font-heading">استلمنا طلب السحب</h2>
              <p className="text-xs text-[#A3A3A3] max-w-xs">
                بيوصلك <span className="font-mono text-white">{money(net)}</span> ريال على حسابك في {bank?.name} خلال 1 إلى 3 أيام عمل.
              </p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300">
              <Clock className="w-3 h-3" />
              قيد المعالجة · تقدر تتابع حالته في سجل التحويلات
            </div>
            <button onClick={handleClose} className={`mt-1 ${primaryBtn}`}>
              تم
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WithdrawModal;