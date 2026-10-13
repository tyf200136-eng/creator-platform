import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import FieldError, { fieldBorder } from '../common/FieldError';
import OtpInput from '../common/OtpInput';
import { normalizeSaudiPhone, phoneError, onlyDigits } from '../../utils/validators';
import { X, Phone, KeyRound, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';

const OTP_LENGTH = 4;
const MAX_ATTEMPTS = 3;
const RESEND_SECONDS = 60;
/** وضع تجريبي: الرمز 0000 غلط، وأي رمز ثاني من 4 أرقام صحيح */
const DEMO_WRONG_OTP = '0000';

/** يعرض الرقم بشكل مرتب: 50 123 4567 */
const prettyPhone = (nine: string) => `${nine.slice(0, 2)} ${nine.slice(2, 5)} ${nine.slice(5)}`;

export const LoginModal: React.FC = () => {
  const { isLoginModalOpen, setIsLoginModalOpen, setIsRoleSelectModalOpen, showToast } = useApp();

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [sending, setSending] = useState(false);

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [otpError, setOtpError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [timer, setTimer] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (step !== 'otp' || timer <= 0) return;
    const t = setTimeout(() => setTimer((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [step, timer]);

  if (!isLoginModalOpen) return null;

  const normalized = normalizeSaudiPhone(phone);
  const pErr = phoneTouched ? phoneError(phone) : undefined;
  const locked = attempts >= MAX_ATTEMPTS;

  const reset = () => {
    setStep('phone');
    setPhone('');
    setPhoneTouched(false);
    setOtp(Array(OTP_LENGTH).fill(''));
    setOtpError('');
    setAttempts(0);
    setTimer(RESEND_SECONDS);
  };

  const close = () => {
    setIsLoginModalOpen(false);
    reset();
  };

  const sendCode = (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneTouched(true);
    if (phoneError(phone)) return;
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setStep('otp');
      setOtp(Array(OTP_LENGTH).fill(''));
      setOtpError('');
      setAttempts(0);
      setTimer(RESEND_SECONDS);
    }, 600);
  };

  const resend = () => {
    setOtp(Array(OTP_LENGTH).fill(''));
    setOtpError('');
    setAttempts(0);
    setTimer(RESEND_SECONDS);
    showToast('أرسلنا رمز جديد');
  };

  const verify = (e: React.FormEvent) => {
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
      setOtpError(
        used >= MAX_ATTEMPTS
          ? 'تجاوزت عدد المحاولات. اطلب رمز جديد'
          : `الرمز غير صحيح. باقي لك ${MAX_ATTEMPTS - used} ${MAX_ATTEMPTS - used === 1 ? 'محاولة' : 'محاولات'}`
      );
      return;
    }
    setIsLoginModalOpen(false);
    reset();
    showToast('تم تسجيل الدخول بنجاح');
    setIsRoleSelectModalOpen(true);
  };

  const primaryBtn =
    'mt-2 w-full py-3 px-6 rounded-full bg-white text-black font-bold text-sm shadow-[0_0_20px_rgba(255,255,255,0.35)] hover:bg-neutral-100 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-[28px] bg-surface border border-white/[0.18] p-7 text-right shadow-[0_24px_70px_rgba(0,0,0,0.9),0_0_40px_rgba(255,255,255,0.08)]">
        <button
          onClick={close}
          aria-label="إغلاق"
          className="absolute top-6 left-6 w-9 h-9 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.12] text-white flex items-center justify-center transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col gap-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.08] border border-white/[0.14] flex items-center justify-center text-white mb-2">
            {step === 'phone' ? <Phone className="w-6 h-6" /> : <KeyRound className="w-6 h-6" />}
          </div>
          <h2 className="text-xl font-bold text-white font-heading">
            {step === 'phone' ? 'تسجيل الدخول برقم الجوال' : 'أدخل رمز التحقق'}
          </h2>
          <p className="text-xs text-muted">
            {step === 'phone' ? (
              'سجّل دخولك أو أنشئ حسابك الجديد'
            ) : (
              <>
                أرسلنا رمز من {OTP_LENGTH} أرقام إلى{' '}
                <span className="font-mono text-white" dir="ltr">
                  +966 {normalized ? prettyPhone(normalized) : phone}
                </span>
              </>
            )}
          </p>
        </div>

        {step === 'phone' ? (
          <form onSubmit={sendCode} className="flex flex-col gap-4" noValidate>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-white/80">رقم الجوال السعودي</label>
              <div className="relative flex items-center" dir="ltr">
                <span className="absolute left-3.5 text-xs font-semibold text-white/60 font-mono">+966</span>
                <input
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  value={phone}
                  onChange={(e) => setPhone(onlyDigits(e.target.value).slice(0, 12))}
                  onBlur={() => phone && setPhoneTouched(true)}
                  placeholder="5X XXX XXXX"
                  className={`w-full h-12 pl-16 pr-4 rounded-xl bg-white/[0.05] border ${fieldBorder(pErr)} text-sm text-white font-mono focus:outline-none focus:border-white/40 focus:bg-white/[0.08] transition-all`}
                />
              </div>
              <FieldError message={pErr} />
            </div>

            <button type="submit" disabled={sending} className={primaryBtn}>
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>إرسال رمز التحقق</span>}
              {!sending && <ArrowLeft className="w-4 h-4" />}
            </button>
          </form>
        ) : (
          <form onSubmit={verify} className="flex flex-col gap-4" noValidate>
            <div className="flex flex-col gap-2 items-center">
              <OtpInput
                value={otp}
                onChange={(v) => {
                  setOtp(v);
                  if (otpError && !locked) setOtpError('');
                }}
                error={otpError}
                disabled={locked}
              />
              <FieldError message={otpError} />
            </div>

            <div className="flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => setStep('phone')}
                className="text-white/60 hover:text-white transition-colors cursor-pointer"
              >
                تغيير رقم الجوال
              </button>
              <span className="text-muted">
                {timer > 0 ? (
                  <>
                    إعادة الإرسال بعد <span className="font-mono">{timer}</span> ثانية
                  </>
                ) : (
                  <button type="button" onClick={resend} className="text-white underline font-semibold cursor-pointer">
                    إعادة إرسال الرمز
                  </button>
                )}
              </span>
            </div>

            <button type="submit" disabled={locked} className={primaryBtn}>
              <span>تحقق ومتابعة</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginModal;